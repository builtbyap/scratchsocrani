-- Remove Test Data from Supabase Tables
-- Run this in your Supabase SQL Editor to clean up test data

-- Remove test emails (those with placeholder user IDs or test data)
DELETE FROM public.emails 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
   OR name IN ('Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Lisa Thompson')
   OR email LIKE '%test%'
   OR email LIKE '%example%'
   OR company IN ('TechCorp Inc.', 'StartupXYZ', 'Enterprise Solutions', 'Innovate Labs', 'Digital Dynamics');

-- Remove test LinkedIn connections (those with placeholder user IDs or test data)
DELETE FROM public.linkedin_connections 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
   OR name IN ('Alex Turner', 'Maria Garcia', 'John Smith', 'Sophie Lee', 'Carlos Rodriguez')
   OR company IN ('TechCorp Inc.', 'StartupXYZ', 'Enterprise Solutions', 'Innovate Labs', 'Digital Dynamics');

-- Also remove from Linkedin table (if it exists)
DELETE FROM public.Linkedin 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
   OR name IN ('Alex Turner', 'Maria Garcia', 'John Smith', 'Sophie Lee', 'Carlos Rodriguez')
   OR company IN ('TechCorp Inc.', 'StartupXYZ', 'Enterprise Solutions', 'Innovate Labs', 'Digital Dynamics');

-- Show remaining data
SELECT 'Remaining emails:' as info;
SELECT COUNT(*) as email_count FROM public.emails;

SELECT 'Remaining LinkedIn connections:' as info;
SELECT COUNT(*) as linkedin_count FROM public.linkedin_connections;

-- Show sample of remaining data
SELECT 'Sample remaining emails:' as info;
SELECT name, email, company FROM public.emails LIMIT 5;

SELECT 'Sample remaining LinkedIn connections:' as info;
SELECT name, company FROM public.linkedin_connections LIMIT 5; 