import { supabase } from './supabase/client';
import { InterviewSession, CandidateLog, InterviewVerdict, InterviewStatus } from '../types/interview';

export async function createInterviewSession(hostUuid: string): Promise<InterviewSession> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({ host_uuid: hostUuid })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }
  return data as InterviewSession;
}

export async function getSessionDetails(sessionId: string): Promise<InterviewSession | null> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get session: ${error.message}`);
  }
  return data as InterviewSession | null;
}

export async function getHostProfile(userId: string): Promise<{ full_name: string; avatar_url: string; username: string } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, username')
    .eq('id', userId)
    .maybeSingle();
    
  if (error) {
    console.error("Failed to fetch host profile", error);
    return null;
  }
  return data;
}

export async function joinSessionAsParticipant(sessionId: string, participantUuid: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .update({ participant_uuid: participantUuid })
    .eq('id', sessionId)
    .is('participant_uuid', null)
    .select()
    .single();

  if (error) {
    // If it fails to update because someone else is already the participant, or session doesn't exist
    return false;
  }
  return !!data;
}

export async function endSession(
  sessionId: string,
  verdict: InterviewVerdict,
  notes: string,
  logs: CandidateLog[]
): Promise<void> {
  const { error } = await supabase
    .from('interview_sessions')
    .update({
      verdict,
      interviewer_notes: notes,
      candidate_logs: logs,
      status: 'Completed',
    })
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to end session: ${error.message}`);
  }
}

export async function updateSessionStatus(sessionId: string, status: InterviewStatus): Promise<void> {
    const { error } = await supabase
      .from('interview_sessions')
      .update({ status })
      .eq('id', sessionId);
  
    if (error) {
      throw new Error(`Failed to update session status: ${error.message}`);
    }
}

export async function getActiveSessionsForHost(hostUuid: string): Promise<InterviewSession[]> {
    const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('host_uuid', hostUuid)
        .in('status', ['Waiting', 'Active'])
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error("Failed to get active sessions", error);
        return [];
    }
    return data as InterviewSession[];
}

export async function getPastSessionsForHost(hostUuid: string): Promise<InterviewSession[]> {
    const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('host_uuid', hostUuid)
        .eq('status', 'Completed')
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error("Failed to get past sessions", error);
        return [];
    }
    return data as InterviewSession[];
}

export interface InterviewRecord extends InterviewSession {
  participantProfile?: { full_name: string; username: string; avatar_url: string };
  hostProfile?: { full_name: string; username: string; avatar_url: string };
}

export async function getInterviewsTaken(hostUuid: string): Promise<InterviewRecord[]> {
  const { data: sessions, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('host_uuid', hostUuid)
    .order('created_at', { ascending: false });

  if (error || !sessions) {
    console.error("Failed to get interviews taken", error);
    return [];
  }

  // Fetch participant profiles
  const participantIds = Array.from(new Set(sessions.map(s => s.participant_uuid).filter(Boolean))) as string[];
  let profilesMap: Record<string, any> = {};
  
  if (participantIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', participantIds);
      
    if (profiles) {
      profiles.forEach(p => {
        profilesMap[p.id] = p;
      });
    }
  }

  return sessions.map(session => ({
    ...session,
    participantProfile: session.participant_uuid ? profilesMap[session.participant_uuid] : null
  }));
}

export async function getInterviewsAttended(participantUuid: string): Promise<InterviewRecord[]> {
  const { data: sessions, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('participant_uuid', participantUuid)
    .order('created_at', { ascending: false });

  if (error || !sessions) {
    console.error("Failed to get interviews attended", error);
    return [];
  }

  // Fetch host profiles
  const hostIds = Array.from(new Set(sessions.map(s => s.host_uuid).filter(Boolean))) as string[];
  let profilesMap: Record<string, any> = {};
  
  if (hostIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', hostIds);
      
    if (profiles) {
      profiles.forEach(p => {
        profilesMap[p.id] = p;
      });
    }
  }

  return sessions.map(session => ({
    ...session,
    hostProfile: profilesMap[session.host_uuid]
  }));
}

export async function updateInterviewVerdict(sessionId: string, verdict: InterviewVerdict): Promise<void> {
  const { error } = await supabase
    .from('interview_sessions')
    .update({ verdict })
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to update interview verdict: ${error.message}`);
  }
}

