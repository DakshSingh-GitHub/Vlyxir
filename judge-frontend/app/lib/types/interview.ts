export type InterviewVerdict = 'Accepted' | 'Rejected' | 'Pending';
export type InterviewStatus = 'Waiting' | 'Active' | 'Completed';

export interface CandidateLog {
  action: string;
  timestamp: string;
}

export interface InterviewSession {
  id: string;
  host_uuid: string;
  participant_uuid: string | null;
  verdict: InterviewVerdict;
  interviewer_notes: string | null;
  candidate_logs: CandidateLog[];
  status: InterviewStatus;
  created_at: string;
  updated_at: string;
}

export interface RealtimeMessage {
  type: 'code_sync' | 'execution_lock' | 'chat_message' | 'participant_joined' | 'admit_candidate' | 'deny_candidate' | 'end_session';
  payload: any;
  sender_uuid: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender_uuid: string;
  timestamp: string;
}
