import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../api/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ChatMessage, CandidateLog, RealtimeMessage } from '../types/interview';

interface UseInterviewRealtimeProps {
  sessionId: string;
  userId: string;
  isHost: boolean;
  userName?: string;
  userAvatar?: string;
  isSessionActive?: boolean;
  onCodeChange?: (code: string) => void;
  onExecutionLockToggle?: (isLocked: boolean) => void;
  onCandidateAdmitted?: () => void;
  onCandidateDenied?: () => void;
  onSessionEnded?: () => void;
}

export function useInterviewRealtime({
  sessionId,
  userId,
  isHost,
  userName,
  userAvatar,
  isSessionActive,
  onCodeChange,
  onExecutionLockToggle,
  onCandidateAdmitted,
  onCandidateDenied,
  onSessionEnded
}: UseInterviewRealtimeProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [candidateLogs, setCandidateLogs] = useState<CandidateLog[]>([]);
  const [isExecutionLocked, setIsExecutionLocked] = useState(false);
  
  // Track participants in the room
  const [participants, setParticipants] = useState<{
    uuid: string;
    status: 'online' | 'offline';
    isAdmitted?: boolean;
    name?: string;
    avatarUrl?: string;
  }[]>([]);
  const [candidateAdmitted, setCandidateAdmitted] = useState(false);

  // Capture latest callbacks in refs to prevent render loops
  const onCodeChangeRef = useRef(onCodeChange);
  const onExecutionLockToggleRef = useRef(onExecutionLockToggle);
  const onCandidateAdmittedRef = useRef(onCandidateAdmitted);
  const onCandidateDeniedRef = useRef(onCandidateDenied);
  const onSessionEndedRef = useRef(onSessionEnded);

  useEffect(() => {
    onCodeChangeRef.current = onCodeChange;
    onExecutionLockToggleRef.current = onExecutionLockToggle;
    onCandidateAdmittedRef.current = onCandidateAdmitted;
    onCandidateDeniedRef.current = onCandidateDenied;
    onSessionEndedRef.current = onSessionEnded;
  });

  const appendLog = useCallback((action: string) => {
    setCandidateLogs(prev => [...prev, {
      action,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }]);
  }, []);

  // Store channel in a ref so sendBroadcast never has a stale closure
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId || !userId) return;

    // Create a unique channel for this session
    const roomChannel = supabase.channel(`interview_${sessionId}`, {
      config: {
        broadcast: { ack: false },
        presence: { key: userId },
      },
    });

    channelRef.current = roomChannel;

    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = roomChannel.presenceState();
        const activeParticipants = Object.keys(newState).map(uuid => {
          const presences = newState[uuid] as any[];
          const metadata = presences[0] || {};
          return {
            uuid,
            status: 'online' as const,
            isAdmitted: metadata.isAdmitted ?? false,
            name: metadata.userName || '',
            avatarUrl: metadata.userAvatar || ''
          };
        });
        setParticipants(activeParticipants);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (isHost && key !== userId) {
            appendLog(`Candidate (${key.substring(0, 8)}...) connected`);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (isHost && key !== userId) {
            appendLog(`Candidate (${key.substring(0, 8)}...) disconnected`);
        }
      })
      .on('broadcast', { event: 'interview_events' }, (payload) => {
        const message = payload.payload as RealtimeMessage;
        
        // Ignore our own messages unless it's a specific scenario
        if (message.sender_uuid === userId) return;

        switch (message.type) {
          case 'code_sync':
            if (onCodeChangeRef.current) onCodeChangeRef.current(message.payload.code);
            break;
          case 'execution_lock':
            setIsExecutionLocked(message.payload.isLocked);
            if (onExecutionLockToggleRef.current) onExecutionLockToggleRef.current(message.payload.isLocked);
            break;
          case 'chat_message':
            setChatMessages(prev => [...prev, message.payload.chatMessage]);
            break;
          case 'admit_candidate':
            setCandidateAdmitted(true);
            if (!isHost && onCandidateAdmittedRef.current) onCandidateAdmittedRef.current();
            break;
          case 'deny_candidate':
            if (!isHost && onCandidateDeniedRef.current) onCandidateDeniedRef.current();
            break;
          case 'end_session':
            if (!isHost && onSessionEndedRef.current) onSessionEndedRef.current();
            break;
          default:
            console.warn("Unknown message type received", message);
        }
      })
      .subscribe((status) => {
        const connected = status === 'SUBSCRIBED';
        setIsConnected(connected);
        if (connected) {
          // Track presence as soon as we're subscribed
          roomChannel.track({
            userId,
            userName: userName || '',
            userAvatar: userAvatar || '',
            isAdmitted: isHost || false,
            onlineAt: new Date().toISOString()
          });
        }
      });

    // Candidate-side DB polling: Subscribe to session status changes so
    // admission works even if the broadcast is missed (race condition fallback)
    let dbChannel: RealtimeChannel | null = null;
    if (!isHost) {
      dbChannel = supabase
        .channel(`session_status_${sessionId}`)
        .on(
          'postgres_changes' as any,
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'interview_sessions',
            filter: `id=eq.${sessionId}`
          },
          (payload: any) => {
            const updated = payload.new;
            if (updated?.status === 'Active' && onCandidateAdmittedRef.current) {
              setCandidateAdmitted(true);
              onCandidateAdmittedRef.current();
            } else if (updated?.status === 'Completed' && onSessionEndedRef.current) {
              onSessionEndedRef.current();
            }
          }
        )
        .subscribe();
    }

    return () => {
      roomChannel.unsubscribe();
      channelRef.current = null;
      if (dbChannel) dbChannel.unsubscribe();
    };
  }, [sessionId, userId, isHost, appendLog, userName, userAvatar]);

  // Keep presence metadata in sync when admission state changes
  useEffect(() => {
    if (channelRef.current && candidateAdmitted) {
      channelRef.current.track({
        userId,
        userName: userName || '',
        userAvatar: userAvatar || '',
        isAdmitted: true,
        onlineAt: new Date().toISOString()
      });
    }
  }, [candidateAdmitted, userId, userName, userAvatar]);

  const sendBroadcast = useCallback((type: RealtimeMessage['type'], payload: any) => {
    // Use channelRef to avoid stale closure issues
    const ch = channelRef.current;
    if (ch) {
      ch.send({
        type: 'broadcast',
        event: 'interview_events',
        payload: {
          type,
          payload,
          sender_uuid: userId,
        } as RealtimeMessage,
      });
    }
  }, [userId]);

  const syncCode = useCallback((code: string) => {
    sendBroadcast('code_sync', { code });
  }, [sendBroadcast]);

  const sendChatMessage = useCallback((text: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      text,
      sender_uuid: userId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMessage]);
    sendBroadcast('chat_message', { chatMessage: newMessage });
  }, [sendBroadcast, userId]);

  const toggleExecutionLock = useCallback((isLocked: boolean) => {
    if (!isHost) return;
    setIsExecutionLocked(isLocked);
    sendBroadcast('execution_lock', { isLocked });
    appendLog(isLocked ? 'Host locked execution' : 'Host unlocked execution');
  }, [sendBroadcast, isHost, appendLog]);

  const admitCandidate = useCallback(async () => {
    if (!isHost) return;
    // 1. Send broadcast immediately for fast path
    sendBroadcast('admit_candidate', {});
    appendLog('Candidate admitted to workspace');
    // 2. Also update DB status to 'Active' so the candidate's postgres_changes
    //    subscription catches it even if they missed the broadcast
    try {
      await supabase
        .from('interview_sessions')
        .update({ status: 'Active' })
        .eq('id', sessionId);
    } catch (err) {
      console.error('Failed to update session status on admit:', err);
    }
  }, [sendBroadcast, isHost, appendLog, sessionId]);
  
  const denyCandidate = useCallback(() => {
      if (!isHost) return;
      sendBroadcast('deny_candidate', {});
      appendLog('Candidate denied access');
  }, [sendBroadcast, isHost, appendLog]);

  const notifySessionEnd = useCallback(() => {
    if (!isHost) return;
    sendBroadcast('end_session', {});
    appendLog('Host ended session');
  }, [sendBroadcast, isHost, appendLog]);

  return {
    isConnected,
    participants,
    chatMessages,
    candidateLogs,
    isExecutionLocked,
    appendLog,
    syncCode,
    sendChatMessage,
    toggleExecutionLock,
    admitCandidate,
    denyCandidate,
    notifySessionEnd,
  };
}
