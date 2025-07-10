-- Insert real LinkedIn test data
-- This script adds sample LinkedIn connections to your table

-- First, let's check if we have any users to work with
SELECT id, email FROM auth.users LIMIT 5;

-- Insert real LinkedIn connections (replace 'your-user-id-here' with an actual user ID from the query above)
INSERT INTO "Linkedin" (name, company, linkedin, user_id) VALUES
('Alex Johnson', 'TechCorp Inc.', 'https://linkedin.com/in/alexjohnson', 'your-user-id-here'),
('Sarah Williams', 'Innovate Solutions', 'https://linkedin.com/in/sarahwilliams', 'your-user-id-here'),
('Michael Chen', 'StartupXYZ', 'https://linkedin.com/in/michaelchen', 'your-user-id-here'),
('Emily Davis', 'Enterprise Solutions', 'https://linkedin.com/in/emilydavis', 'your-user-id-here'),
('David Brown', 'Growth Labs', 'https://linkedin.com/in/davidbrown', 'your-user-id-here'),
('Lisa Garcia', 'Creative Agency', 'https://linkedin.com/in/lisagarcia', 'your-user-id-here'),
('Tom Wilson', 'Data Insights', 'https://linkedin.com/in/tomwilson', 'your-user-id-here'),
('Rachel Martinez', 'Cloud Systems', 'https://linkedin.com/in/rachelmartinez', 'your-user-id-here');

-- Verify the data was inserted
SELECT * FROM "Linkedin" WHERE user_id = 'your-user-id-here';

-- Check RLS policies are working
SELECT * FROM "Linkedin" LIMIT 5; 