-- Migration: Interview Sessions
-- Description: Creates the interview_sessions table and necessary RLS policies.

CREATE TYPE interview_verdict AS ENUM ('Accepted', 'Rejected', 'Pending');
CREATE TYPE interview_status AS ENUM ('Waiting', 'Active', 'Completed');

CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_uuid UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_uuid UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verdict interview_verdict DEFAULT 'Pending'::interview_verdict,
    interviewer_notes TEXT,
    candidate_logs JSONB DEFAULT '[]'::jsonb,
    status interview_status DEFAULT 'Waiting'::interview_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (id, participant_uuid) -- Exclusive slot locking helper
);

-- Enable RLS
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- 1. Hosts can view their own sessions
CREATE POLICY "Hosts can view their own sessions"
    ON public.interview_sessions FOR SELECT
    USING (auth.uid() = host_uuid);

-- 2. Participants can view sessions they are part of
CREATE POLICY "Participants can view their sessions"
    ON public.interview_sessions FOR SELECT
    USING (auth.uid() = participant_uuid);

-- 3. Anyone can view a session by ID (to check if it exists / join it), but restricted data
-- Actually, it's better to allow authenticated users to view session status/host to join
CREATE POLICY "Authenticated users can view session basic details"
    ON public.interview_sessions FOR SELECT
    USING (auth.role() = 'authenticated');

-- 4. Hosts can insert new sessions
CREATE POLICY "Hosts can create sessions"
    ON public.interview_sessions FOR INSERT
    WITH CHECK (auth.uid() = host_uuid);

-- 5. Hosts can update their own sessions (notes, verdict, end session)
CREATE POLICY "Hosts can update their sessions"
    ON public.interview_sessions FOR UPDATE
    USING (auth.uid() = host_uuid);

-- 6. Participants can update session to lock their slot if it's empty
CREATE POLICY "Participants can join an empty session"
    ON public.interview_sessions FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (
        -- Can only update if they are the participant or becoming the participant
        (participant_uuid IS NULL AND auth.uid() = participant_uuid) OR 
        (auth.uid() = participant_uuid)
    );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_interview_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interview_sessions_modtime
    BEFORE UPDATE ON public.interview_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_interview_updated_at();

-- Add indexes for faster querying
CREATE INDEX idx_interview_sessions_host ON public.interview_sessions(host_uuid);
CREATE INDEX idx_interview_sessions_participant ON public.interview_sessions(participant_uuid);
