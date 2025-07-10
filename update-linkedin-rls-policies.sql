-- Update RLS policies for LinkedIn table
-- This script will set up proper RLS policies for the LinkedIn table

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON "Linkedin";
DROP POLICY IF EXISTS "Users can delete own linkedin connections" ON "Linkedin";
DROP POLICY IF EXISTS "Users can insert own linkedin connections" ON "Linkedin";
DROP POLICY IF EXISTS "Users can update own linkedin connections" ON "Linkedin";
DROP POLICY IF EXISTS "Users can view own linkedin connections" ON "Linkedin";

-- Enable RLS on the LinkedIn table
ALTER TABLE "Linkedin" ENABLE ROW LEVEL SECURITY;

-- Create policies for LinkedIn table
-- SELECT policy: Enable read access for all users
CREATE POLICY "Enable read access for all users" ON "Linkedin"
FOR SELECT USING (true);

-- DELETE policy: Users can delete own linkedin connections
CREATE POLICY "Users can delete own linkedin connections" ON "Linkedin"
FOR DELETE USING (auth.uid() = user_id);

-- INSERT policy: Users can insert own linkedin connections
CREATE POLICY "Users can insert own linkedin connections" ON "Linkedin"
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can update own linkedin connections
CREATE POLICY "Users can update own linkedin connections" ON "Linkedin"
FOR UPDATE USING (auth.uid() = user_id);

-- SELECT policy: Users can view own linkedin connections
CREATE POLICY "Users can view own linkedin connections" ON "Linkedin"
FOR SELECT USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'Linkedin'; 