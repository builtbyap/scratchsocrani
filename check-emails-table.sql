-- Check if emails table exists and create it if needed
-- This script will help ensure the emails table is properly set up

-- First, let's check if the table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'emails'
) as table_exists;

-- If the table doesn't exist, create it
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_company ON emails(company);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);

-- Enable Row Level Security
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own emails" ON emails;
DROP POLICY IF EXISTS "Users can insert own emails" ON emails;
DROP POLICY IF EXISTS "Users can update own emails" ON emails;
DROP POLICY IF EXISTS "Users can delete own emails" ON emails;

-- Create RLS policies
CREATE POLICY "Users can view own emails" ON emails
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails" ON emails
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emails" ON emails
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails" ON emails
    FOR DELETE USING (auth.uid() = user_id);

-- Insert sample data for testing (replace 'your-user-id' with actual user ID)
-- You can get your user ID from the auth.users table or from the browser console
INSERT INTO emails (user_id, name, email, company, position, phone) VALUES
('your-user-id', 'John Smith', 'john.smith@techcorp.com', 'TechCorp Inc.', 'Senior Developer', '+1-555-0123'),
('your-user-id', 'Sarah Johnson', 'sarah.j@innovate.com', 'Innovate Solutions', 'Product Manager', '+1-555-0124'),
('your-user-id', 'Mike Davis', 'mike.davis@startup.com', 'StartupXYZ', 'CEO', '+1-555-0125'),
('your-user-id', 'Lisa Chen', 'lisa.chen@enterprise.com', 'Enterprise Solutions', 'CTO', '+1-555-0126'),
('your-user-id', 'David Wilson', 'david.wilson@growth.com', 'Growth Labs', 'Marketing Director', '+1-555-0127'),
('your-user-id', 'Emma Brown', 'emma.brown@creative.com', 'Creative Agency', 'Design Lead', '+1-555-0128'),
('your-user-id', 'Alex Turner', 'alex.turner@data.com', 'Data Insights', 'Data Scientist', '+1-555-0129'),
('your-user-id', 'Rachel Green', 'rachel.green@cloud.com', 'Cloud Systems', 'DevOps Engineer', '+1-555-0130');

-- Check the data
SELECT COUNT(*) as total_emails FROM emails;
SELECT * FROM emails LIMIT 5; 