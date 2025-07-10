-- Simple script to add test data to both tables
-- This will add data for the current authenticated user

-- Add LinkedIn test data (only columns: name, company, linkedin, user_id)
INSERT INTO "Linkedin" (name, company, linkedin, user_id) VALUES
('Alex Johnson', 'TechCorp Inc.', 'https://linkedin.com/in/alexjohnson', auth.uid()),
('Sarah Williams', 'Innovate Solutions', 'https://linkedin.com/in/sarahwilliams', auth.uid()),
('Michael Chen', 'StartupXYZ', 'https://linkedin.com/in/michaelchen', auth.uid()),
('Emily Davis', 'Enterprise Solutions', 'https://linkedin.com/in/emilydavis', auth.uid()),
('David Brown', 'Growth Labs', 'https://linkedin.com/in/davidbrown', auth.uid()),
('Lisa Garcia', 'Creative Agency', 'https://linkedin.com/in/lisagarcia', auth.uid()),
('Tom Wilson', 'Data Insights', 'https://linkedin.com/in/tomwilson', auth.uid()),
('Rachel Martinez', 'Cloud Systems', 'https://linkedin.com/in/rachelmartinez', auth.uid());

-- Add email test data (only columns: name, email, company, user_id)
INSERT INTO emails (name, email, company, user_id) VALUES
('John Smith', 'john.smith@techcorp.com', 'TechCorp Inc.', auth.uid()),
('Sarah Johnson', 'sarah.j@innovate.com', 'Innovate Solutions', auth.uid()),
('Mike Davis', 'mike.davis@startup.com', 'StartupXYZ', auth.uid()),
('Lisa Chen', 'lisa.chen@enterprise.com', 'Enterprise Solutions', auth.uid()),
('David Wilson', 'david.wilson@growth.com', 'Growth Labs', auth.uid()),
('Emma Thompson', 'emma.thompson@creative.com', 'Creative Agency', auth.uid()),
('James Rodriguez', 'james.rodriguez@data.com', 'Data Insights', auth.uid()),
('Maria Garcia', 'maria.garcia@cloud.com', 'Cloud Systems', auth.uid());

-- Verify the data was inserted
SELECT 'LinkedIn connections:' as info, COUNT(*) as count FROM "Linkedin" WHERE user_id = auth.uid()
UNION ALL
SELECT 'Email contacts:' as info, COUNT(*) as count FROM emails WHERE user_id = auth.uid(); 