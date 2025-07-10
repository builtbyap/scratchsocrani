-- RLS Policies for TechFlow Agency Dashboard
-- Run this in your Supabase SQL Editor to set up proper security policies

-- First, make sure RLS is enabled on both tables
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own emails" ON public.emails;
DROP POLICY IF EXISTS "Users can insert own emails" ON public.emails;
DROP POLICY IF EXISTS "Users can update own emails" ON public.emails;
DROP POLICY IF EXISTS "Users can delete own emails" ON public.emails;

DROP POLICY IF EXISTS "Users can view own LinkedIn connections" ON public.linkedin_connections;
DROP POLICY IF EXISTS "Users can insert own LinkedIn connections" ON public.linkedin_connections;
DROP POLICY IF EXISTS "Users can update own LinkedIn connections" ON public.linkedin_connections;
DROP POLICY IF EXISTS "Users can delete own LinkedIn connections" ON public.linkedin_connections;

-- Create RLS policies for emails table
CREATE POLICY "Users can view own emails" ON public.emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails" ON public.emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emails" ON public.emails
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails" ON public.emails
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for LinkedIn connections table
CREATE POLICY "Users can view own LinkedIn connections" ON public.linkedin_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own LinkedIn connections" ON public.linkedin_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own LinkedIn connections" ON public.linkedin_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own LinkedIn connections" ON public.linkedin_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.emails TO anon, authenticated;
GRANT ALL ON public.linkedin_connections TO anon, authenticated;

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('emails', 'linkedin_connections')
ORDER BY tablename, policyname;

-- Test the policies (optional - for debugging)
-- This will show you what policies exist
SELECT 'RLS policies have been set up successfully!' as status; 