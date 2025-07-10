-- Fix LinkedIn table setup
-- Run this in Supabase SQL editor

-- 1. Create LinkedIn table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Linkedin" (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    position VARCHAR(255),
    phone VARCHAR(50),
    linkedin VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE "Linkedin" ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies
DROP POLICY IF EXISTS "Users can view own linkedin" ON "Linkedin";
DROP POLICY IF EXISTS "Users can insert own linkedin" ON "Linkedin";
DROP POLICY IF EXISTS "Users can update own linkedin" ON "Linkedin";
DROP POLICY IF EXISTS "Users can delete own linkedin" ON "Linkedin";

-- 4. Create new policies
CREATE POLICY "Users can view own linkedin" ON "Linkedin"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own linkedin" ON "Linkedin"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own linkedin" ON "Linkedin"
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own linkedin" ON "Linkedin"
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Show available users
SELECT 'Available users:' as info;
SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- 6. Insert sample data (replace YOUR-USER-ID with your actual user ID)
INSERT INTO "Linkedin" (user_id, name, email, company, position, phone, linkedin) VALUES
('YOUR-USER-ID', 'Alex Johnson', 'alex.johnson@techcorp.com', 'TechCorp Inc.', 'Senior Developer', '+1-555-0101', 'https://linkedin.com/in/alexjohnson'),
('YOUR-USER-ID', 'Sarah Williams', 'sarah.w@innovate.com', 'Innovate Solutions', 'Product Manager', '+1-555-0102', 'https://linkedin.com/in/sarahwilliams'),
('YOUR-USER-ID', 'Michael Chen', 'michael.chen@startup.com', 'StartupXYZ', 'CEO', '+1-555-0103', 'https://linkedin.com/in/michaelchen'),
('YOUR-USER-ID', 'Emily Davis', 'emily.davis@enterprise.com', 'Enterprise Solutions', 'CTO', '+1-555-0104', 'https://linkedin.com/in/emilydavis'),
('YOUR-USER-ID', 'David Brown', 'david.brown@growth.com', 'Growth Labs', 'Marketing Director', '+1-555-0105', 'https://linkedin.com/in/davidbrown'),
('YOUR-USER-ID', 'Lisa Garcia', 'lisa.garcia@creative.com', 'Creative Agency', 'Design Lead', '+1-555-0106', 'https://linkedin.com/in/lisagarcia'),
('YOUR-USER-ID', 'Tom Wilson', 'tom.wilson@data.com', 'Data Insights', 'Data Scientist', '+1-555-0107', 'https://linkedin.com/in/tomwilson'),
('YOUR-USER-ID', 'Rachel Martinez', 'rachel.martinez@cloud.com', 'Cloud Systems', 'DevOps Engineer', '+1-555-0108', 'https://linkedin.com/in/rachelmartinez');

-- 7. Verify data
SELECT COUNT(*) as total_linkedin_connections FROM "Linkedin";
SELECT * FROM "Linkedin" LIMIT 3; 