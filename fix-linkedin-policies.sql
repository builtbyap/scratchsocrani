-- Fix LinkedIn Table Policies
-- Run this in your Supabase SQL Editor to fix the conflicting policies

-- First, drop all existing policies for the Linkedin table
DROP POLICY IF EXISTS "Allow authenticated users to read" ON public."Linkedin";
DROP POLICY IF EXISTS "Enable read access for all users" ON public."Linkedin";
DROP POLICY IF EXISTS "Users can view own linkedin connections" ON public."Linkedin";
DROP POLICY IF EXISTS "Users can insert own linkedin connections" ON public."Linkedin";
DROP POLICY IF EXISTS "Users can update own linkedin connections" ON public."Linkedin";
DROP POLICY IF EXISTS "Users can delete own linkedin connections" ON public."Linkedin";

-- Make sure RLS is enabled
ALTER TABLE public."Linkedin" ENABLE ROW LEVEL SECURITY;

-- Create the correct policies for the Linkedin table
CREATE POLICY "Users can view own linkedin connections" ON public."Linkedin"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own linkedin connections" ON public."Linkedin"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own linkedin connections" ON public."Linkedin"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own linkedin connections" ON public."Linkedin"
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public."Linkedin" TO anon, authenticated;

-- Verify the policies were created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'Linkedin'
ORDER BY policyname;

-- Show the final status
SELECT 'LinkedIn table policies have been fixed successfully!' as status; 