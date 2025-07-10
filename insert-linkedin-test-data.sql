-- Insert test LinkedIn data that works with your RLS policies
-- Run this in Supabase SQL editor

-- First, get your user ID
SELECT 'Your user ID:' as info;
SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- Insert test data (replace YOUR-USER-ID with your actual user ID from above)
INSERT INTO "Linkedin" (user_id, name, company, linkedin) VALUES
('YOUR-USER-ID', 'John Smith', 'TechCorp Inc.', 'https://linkedin.com/in/johnsmith'),
('YOUR-USER-ID', 'Sarah Johnson', 'Innovate Solutions', 'https://linkedin.com/in/sarahjohnson'),
('YOUR-USER-ID', 'Mike Davis', 'StartupXYZ', 'https://linkedin.com/in/mikedavis'),
('YOUR-USER-ID', 'Lisa Chen', 'Enterprise Solutions', 'https://linkedin.com/in/lisachen'),
('YOUR-USER-ID', 'David Wilson', 'Growth Labs', 'https://linkedin.com/in/davidwilson'),
('YOUR-USER-ID', 'Emma Brown', 'Creative Agency', 'https://linkedin.com/in/emmabrown'),
('YOUR-USER-ID', 'Alex Turner', 'Data Insights', 'https://linkedin.com/in/alexturner'),
('YOUR-USER-ID', 'Rachel Green', 'Cloud Systems', 'https://linkedin.com/in/rachelgreen');

-- Verify the data was inserted
SELECT 'Verification:' as info;
SELECT COUNT(*) as total_records FROM "Linkedin";
SELECT 'Your LinkedIn connections:' as info;
SELECT * FROM "Linkedin" ORDER BY id DESC; 