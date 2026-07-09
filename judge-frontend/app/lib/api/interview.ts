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
