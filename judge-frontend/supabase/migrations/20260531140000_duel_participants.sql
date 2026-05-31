-- Migration: Add duel participant results table
-- Description: Creates table to track player codes, scores, and outcomes for completed duels.

CREATE TABLE IF NOT EXISTS public.duel_participant_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duel_id UUID REFERENCES public.duel_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    passed INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    result VARCHAR NOT NULL CHECK (result IN ('victory', 'defeat', 'draw')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.duel_participant_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view duel participant results"
    ON public.duel_participant_results FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own duel participant results"
    ON public.duel_participant_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);
