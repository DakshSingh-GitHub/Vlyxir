-- Migration: Make submissions viewable by everyone (or authenticated users)
-- Description: The User Profile page needs to fetch recent submissions to calculate stats.
-- If an existing RLS policy restricts SELECT to auth.uid() = user_id, 
-- this additive policy will allow any user to read submission stats for the profile page.

CREATE POLICY "Submissions are viewable by everyone"
    ON submissions FOR SELECT
    USING (true);
