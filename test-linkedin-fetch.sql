-- Test LinkedIn table and RLS policies
-- Run this in Supabase SQL editor to diagnose the issue

-- 1. Check table structure
SELECT 'LinkedIn table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Linkedin' 
ORDER BY ordinal_position;

-- 2. Check if table has data
SELECT 'Total records in LinkedIn table:' as info;
SELECT COUNT(*) as total_records FROM "Linkedin";

-- 3. Show sample data
SELECT 'Sample LinkedIn data:' as info;
SELECT * FROM "Linkedin" LIMIT 5;

-- 4. Check RLS policies
SELECT 'RLS policies on LinkedIn table:' as info;
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

-- 5. Check if RLS is enabled
SELECT 'RLS status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'Linkedin';

-- 6. Test current user access
SELECT 'Current user test:' as info;
SELECT auth.uid() as current_user_id;

-- 7. Test query as authenticated user
SELECT 'Testing query with user filter:' as info;
SELECT COUNT(*) as user_records 
FROM "Linkedin" 
WHERE user_id = auth.uid();

-- 8. Test query without user filter (to see if RLS is blocking)
SELECT 'Testing query without user filter:' as info;
SELECT COUNT(*) as total_records 
FROM "Linkedin"; 