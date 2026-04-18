-- Migration: Make profiles viewable by all authenticated users
-- Description: The previous RLS policy "Users can view own profile" restricted SELECTs on profiles to only the owner. This prevented users from viewing other user's profiles on the /user/[user_id] page.

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);
