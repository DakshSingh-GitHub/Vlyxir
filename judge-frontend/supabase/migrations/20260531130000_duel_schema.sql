-- Migration: Add duel sessions table
-- Description: Creates database tables to track completed duel records.

CREATE TABLE IF NOT EXISTS public.duel_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id VARCHAR NOT NULL,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    opponent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.duel_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view duel sessions"
    ON public.duel_sessions FOR SELECT
    USING (true);

CREATE POLICY "Users can insert duel sessions"
    ON public.duel_sessions FOR INSERT
    WITH CHECK (auth.uid() = creator_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can update their duel sessions"
    ON public.duel_sessions FOR UPDATE
    USING (auth.uid() = creator_id OR auth.uid() = opponent_id);
