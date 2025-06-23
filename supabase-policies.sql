-- Supabase RLS Policies Setup
-- Run this in your Supabase SQL Editor

-- Enable RLS on users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
DROP POLICY IF EXISTS "Server can update subscription status" ON public.users;
DROP POLICY IF EXISTS "Server can insert user profiles" ON public.users;
DROP POLICY IF EXISTS "Server can view user profiles" ON public.users;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- CRITICAL: Allow server-side operations for webhook processing
-- This policy allows updates when there's no authenticated user (server-side operations)
CREATE POLICY "Server can update subscription status" ON public.users
  FOR UPDATE USING (
    -- Allow updates when no user is authenticated (server-side operations)
    auth.uid() IS NULL
    OR 
    -- Also allow authenticated users to update their own profile
    auth.uid() = id
  );

-- Allow server to insert user profiles (for webhook user creation)
CREATE POLICY "Server can insert user profiles" ON public.users
  FOR INSERT WITH CHECK (
    -- Allow inserts when no user is authenticated (server-side operations)
    auth.uid() IS NULL
    OR 
    -- Also allow authenticated users to insert their own profile
    auth.uid() = id
  );

-- Allow server to view user profiles (for webhook user lookup)
CREATE POLICY "Server can view user profiles" ON public.users
  FOR SELECT USING (
    -- Allow selects when no user is authenticated (server-side operations)
    auth.uid() IS NULL
    OR 
    -- Also allow authenticated users to view their own profile
    auth.uid() = id
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;

-- Verify policies were created
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname; 