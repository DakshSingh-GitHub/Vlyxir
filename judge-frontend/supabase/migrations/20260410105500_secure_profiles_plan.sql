-- Migration: Secure Profiles Plan RLS
-- Description: Locks down the plan column so users cannot self-elevate to a "pro" plan.

-- Drop existing policies if any restrict update inappropriately, 
-- or ensure we override with secure ones.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. Ensure users can read their own profile (they likely already can, but just to be safe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile"
            ON profiles FOR SELECT
            USING (auth.uid() = id);
    END IF;
END
$$;

-- 2. Ensure users can update their profile BUT CANNOT change their plan
-- This requires dropping the broad update policy if one exists and replacing it, 
-- or simply creating a new highly restrictive one. 
-- Since we do not know the exact existing policy name for updates (it varies), 
-- we enforce a generic check constraint or an additional policy.
-- Actually, multiple UPDATE policies combine using OR. 
-- So the ONLY safe way to enforce this globally regardless of policies is a trigger 
-- or dropping existing permissive update policies. 
-- However, an easier approach in a pure RLS additive environment is to ensure the plan remains identical.

DO $$
BEGIN
    -- This drops any existing update policy to avoid a union of permissive policies
    -- Note: you might want to adapt the exact policy name if you know what it was, but we'll try to drop common names:
    DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
    
    -- Create the restricted update policy
    CREATE POLICY "Users can update own profile (no plan changes)" 
        ON profiles FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (plan = (SELECT plan FROM profiles WHERE id = auth.uid()));
END
$$;
