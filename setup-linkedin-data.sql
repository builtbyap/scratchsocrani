-- Comprehensive LinkedIn table setup
-- Run this in Supabase SQL editor to ensure your LinkedIn table is properly configured

-- Step 1: Check if LinkedIn table exists and show its structure
SELECT 'Checking LinkedIn table structure...' as info;

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'Linkedin'
) as table_exists;

-- If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS "Linkedin" (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    linkedin VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Show table structure
SELECT 'LinkedIn table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Linkedin' 
ORDER BY ordinal_position;

-- Step 3: Enable RLS and set up policies
ALTER TABLE "Linkedin" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own linkedin" ON "Linkedin";
DROP POLICY IF EXISTS "Users can insert own linkedin" ON "Linkedin";
DROP POLICY IF EXISTS "Users can update own linkedin" ON "Linkedin";
DROP POLICY IF EXISTS "Users can delete own linkedin" ON "Linkedin";

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own linkedin" ON "Linkedin"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own linkedin" ON "Linkedin"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own linkedin" ON "Linkedin"
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own linkedin" ON "Linkedin"
    FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Get your user ID
SELECT 'Available users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Step 5: Clear existing data for your user (replace YOUR-USER-ID with your actual user ID)
-- DELETE FROM "Linkedin" WHERE user_id = 'YOUR-USER-ID';

-- Step 6: Insert comprehensive sample data (replace YOUR-USER-ID with your actual user ID)
INSERT INTO "Linkedin" (user_id, name, company, linkedin) VALUES
('YOUR-USER-ID', 'Alex Johnson', 'TechCorp Inc.', 'https://linkedin.com/in/alexjohnson'),
('YOUR-USER-ID', 'Sarah Williams', 'Innovate Solutions', 'https://linkedin.com/in/sarahwilliams'),
('YOUR-USER-ID', 'Michael Chen', 'StartupXYZ', 'https://linkedin.com/in/michaelchen'),
('YOUR-USER-ID', 'Emily Davis', 'Enterprise Solutions', 'https://linkedin.com/in/emilydavis'),
('YOUR-USER-ID', 'David Brown', 'Growth Labs', 'https://linkedin.com/in/davidbrown'),
('YOUR-USER-ID', 'Lisa Garcia', 'Creative Agency', 'https://linkedin.com/in/lisagarcia'),
('YOUR-USER-ID', 'Tom Wilson', 'Data Insights', 'https://linkedin.com/in/tomwilson'),
('YOUR-USER-ID', 'Rachel Martinez', 'Cloud Systems', 'https://linkedin.com/in/rachelmartinez'),
('YOUR-USER-ID', 'James Anderson', 'Digital Solutions', 'https://linkedin.com/in/jamesanderson'),
('YOUR-USER-ID', 'Maria Garcia', 'Tech Innovations', 'https://linkedin.com/in/mariagarcia');

-- Step 7: Verify the data
SELECT 'Verification:' as info;
SELECT COUNT(*) as total_linkedin_connections FROM "Linkedin";
SELECT 'Sample LinkedIn connections:' as info;
SELECT id, name, company, linkedin FROM "Linkedin" LIMIT 5;

-- Step 8: Test RLS policies
SELECT 'Testing RLS - should show only user connections:' as info;
SELECT COUNT(*) as connections_for_current_user FROM "Linkedin" WHERE user_id = 'YOUR-USER-ID';

-- Step 9: Show all data for verification
SELECT 'All LinkedIn connections:' as info;
SELECT * FROM "Linkedin" ORDER BY created_at DESC; 