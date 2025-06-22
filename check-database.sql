-- Check if the users table exists and has the correct structure
-- Run this in your Supabase SQL Editor to verify the setup

-- Check if users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) as table_exists;

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'users';

-- Check if function exists
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'update_updated_at_column');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users'; 