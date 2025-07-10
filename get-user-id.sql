-- Get your user ID from the auth.users table
-- Run this in Supabase SQL editor to find your user ID

-- List all users (you can identify yourself by email)
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- Or if you know your email, you can filter:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com'; 