-- Simple fix for emails table
-- Run this in Supabase SQL editor

-- 1. Create emails table if it doesn't exist
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    position VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies
DROP POLICY IF EXISTS "Users can view own emails" ON emails;
DROP POLICY IF EXISTS "Users can insert own emails" ON emails;
DROP POLICY IF EXISTS "Users can update own emails" ON emails;
DROP POLICY IF EXISTS "Users can delete own emails" ON emails;

-- 4. Create new policies
CREATE POLICY "Users can view own emails" ON emails
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails" ON emails
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emails" ON emails
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails" ON emails
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Show available users
SELECT 'Available users:' as info;
SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- 6. Insert sample data (replace YOUR-USER-ID with your actual user ID)
INSERT INTO emails (user_id, name, email, company, position, phone) VALUES
('YOUR-USER-ID', 'John Smith', 'john.smith@techcorp.com', 'TechCorp Inc.', 'Senior Developer', '+1-555-0123'),
('YOUR-USER-ID', 'Sarah Johnson', 'sarah.j@innovate.com', 'Innovate Solutions', 'Product Manager', '+1-555-0124'),
('YOUR-USER-ID', 'Mike Davis', 'mike.davis@startup.com', 'StartupXYZ', 'CEO', '+1-555-0125'),
('YOUR-USER-ID', 'Lisa Chen', 'lisa.chen@enterprise.com', 'Enterprise Solutions', 'CTO', '+1-555-0126'),
('YOUR-USER-ID', 'David Wilson', 'david.wilson@growth.com', 'Growth Labs', 'Marketing Director', '+1-555-0127');

-- 7. Verify data
SELECT COUNT(*) as total_emails FROM emails;
SELECT * FROM emails LIMIT 3; 