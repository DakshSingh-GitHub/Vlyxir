-- Migration: Create daily questions table
-- Description: Creates table to store daily questions persistently with date mapping and unique constraint on problem_id.

CREATE TABLE IF NOT EXISTS public.daily_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id VARCHAR(255) NOT NULL UNIQUE,
    date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view daily questions"
    ON public.daily_questions FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert daily questions"
    ON public.daily_questions FOR INSERT
    WITH CHECK (true);

-- Seed Daily Questions for 20 consecutive days starting from 2026-06-01 to 2026-06-20
INSERT INTO public.daily_questions (problem_id, date) VALUES
('add_binary', '2026-06-01'),
('add_digits', '2026-06-02'),
('add_strings', '2026-06-03'),
('add_two_numbers', '2026-06-04'),
('binary_search', '2026-06-05'),
('climbing_stairs', '2026-06-06'),
('coin_change', '2026-06-07'),
('contains_duplicate', '2026-06-08'),
('count_primes', '2026-06-09'),
('fibonacci_sequence', '2026-06-10'),
('fizz_buzz', '2026-06-11'),
('house_robber', '2026-06-12'),
('invert_binary_tree', '2026-06-13'),
('is_anagram', '2026-06-14'),
('jump_game', '2026-06-15'),
('longest_common_prefix', '2026-06-16'),
('majority_element', '2026-06-17'),
('missing_number', '2026-06-18'),
('palindrome_number', '2026-06-19'),
('maximum_subarray', '2026-06-20')
ON CONFLICT (problem_id) DO NOTHING;

