-- Insert real email test data
-- This script adds sample email contacts to your table

-- First, let's check if we have any users to work with
SELECT id, email FROM auth.users LIMIT 5;

-- Insert real email contacts (replace 'your-user-id-here' with an actual user ID from the query above)
INSERT INTO emails (name, email, company, position, phone, user_id) VALUES
('John Smith', 'john.smith@techcorp.com', 'TechCorp Inc.', 'Senior Developer', '+1-555-0123', 'your-user-id-here'),
('Sarah Johnson', 'sarah.j@innovate.com', 'Innovate Solutions', 'Product Manager', '+1-555-0124', 'your-user-id-here'),
('Mike Davis', 'mike.davis@startup.com', 'StartupXYZ', 'CEO', '+1-555-0125', 'your-user-id-here'),
('Lisa Chen', 'lisa.chen@enterprise.com', 'Enterprise Solutions', 'CTO', '+1-555-0126', 'your-user-id-here'),
('David Wilson', 'david.wilson@growth.com', 'Growth Labs', 'Marketing Director', '+1-555-0127', 'your-user-id-here'),
('Emma Thompson', 'emma.thompson@creative.com', 'Creative Agency', 'Design Lead', '+1-555-0128', 'your-user-id-here'),
('James Rodriguez', 'james.rodriguez@data.com', 'Data Insights', 'Data Scientist', '+1-555-0129', 'your-user-id-here'),
('Maria Garcia', 'maria.garcia@cloud.com', 'Cloud Systems', 'DevOps Engineer', '+1-555-0130', 'your-user-id-here');

-- Verify the data was inserted
SELECT * FROM emails WHERE user_id = 'your-user-id-here';

-- Check RLS policies are working
SELECT * FROM emails LIMIT 5; 