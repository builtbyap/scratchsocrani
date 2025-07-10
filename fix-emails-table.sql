-- Comprehensive fix for emails table
-- This script will ensure the emails table exists and has data

-- Step 1: Check if emails table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emails') THEN
        RAISE NOTICE 'Creating emails table...';
        
        CREATE TABLE emails (
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
        
        -- Create indexes
        CREATE INDEX idx_emails_user_id ON emails(user_id);
        CREATE INDEX idx_emails_company ON emails(company);
        CREATE INDEX idx_emails_created_at ON emails(created_at);
        
        RAISE NOTICE 'Emails table created successfully';
    ELSE
        RAISE NOTICE 'Emails table already exists';
    END IF;
END $$;

-- Step 2: Enable RLS and set up policies
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own emails" ON emails;
DROP POLICY IF EXISTS "Users can insert own emails" ON emails;
DROP POLICY IF EXISTS "Users can update own emails" ON emails;
DROP POLICY IF EXISTS "Users can delete own emails" ON emails;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON emails;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON emails;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON emails;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON emails;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own emails" ON emails
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails" ON emails
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emails" ON emails
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails" ON emails
    FOR DELETE USING (auth.uid() = user_id);

-- Step 3: Get current user ID (you'll need to replace this with your actual user ID)
-- First, let's see all users to help identify yours
SELECT 'Available users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Step 4: Insert sample data for testing
-- Replace 'YOUR-USER-ID-HERE' with your actual user ID from the query above
-- You can copy your user ID from the query results above

-- Clear existing data for the user (if any)
DELETE FROM emails WHERE user_id = 'YOUR-USER-ID-HERE';

-- Insert comprehensive sample data
INSERT INTO emails (user_id, name, email, company, position, phone) VALUES
('YOUR-USER-ID-HERE', 'John Smith', 'john.smith@techcorp.com', 'TechCorp Inc.', 'Senior Developer', '+1-555-0123'),
('YOUR-USER-ID-HERE', 'Sarah Johnson', 'sarah.j@innovate.com', 'Innovate Solutions', 'Product Manager', '+1-555-0124'),
('YOUR-USER-ID-HERE', 'Mike Davis', 'mike.davis@startup.com', 'StartupXYZ', 'CEO', '+1-555-0125'),
('YOUR-USER-ID-HERE', 'Lisa Chen', 'lisa.chen@enterprise.com', 'Enterprise Solutions', 'CTO', '+1-555-0126'),
('YOUR-USER-ID-HERE', 'David Wilson', 'david.wilson@growth.com', 'Growth Labs', 'Marketing Director', '+1-555-0127'),
('YOUR-USER-ID-HERE', 'Emma Brown', 'emma.brown@creative.com', 'Creative Agency', 'Design Lead', '+1-555-0128'),
('YOUR-USER-ID-HERE', 'Alex Turner', 'alex.turner@data.com', 'Data Insights', 'Data Scientist', '+1-555-0129'),
('YOUR-USER-ID-HERE', 'Rachel Green', 'rachel.green@cloud.com', 'Cloud Systems', 'DevOps Engineer', '+1-555-0130'),
('YOUR-USER-ID-HERE', 'Tom Anderson', 'tom.anderson@digital.com', 'Digital Solutions', 'UX Designer', '+1-555-0131'),
('YOUR-USER-ID-HERE', 'Maria Garcia', 'maria.garcia@tech.com', 'Tech Innovations', 'Software Engineer', '+1-555-0132');

-- Step 5: Verify the data
SELECT 'Verification:' as info;
SELECT COUNT(*) as total_emails FROM emails;
SELECT 'Sample emails:' as info;
SELECT id, name, email, company, position FROM emails LIMIT 5;

-- Step 6: Test RLS policies
SELECT 'Testing RLS - should show only user emails:' as info;
SELECT COUNT(*) as emails_for_current_user FROM emails WHERE user_id = 'YOUR-USER-ID-HERE'; 