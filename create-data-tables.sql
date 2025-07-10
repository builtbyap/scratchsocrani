-- Create Data Tables for TechFlow Agency Dashboard
-- Run this in your Supabase SQL Editor to create the emails and LinkedIn tables

-- Create emails table
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  position TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create LinkedIn connections table
CREATE TABLE IF NOT EXISTS public.linkedin_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  position TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for emails table
CREATE POLICY "Users can view own emails" ON public.emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails" ON public.emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emails" ON public.emails
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails" ON public.emails
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for LinkedIn connections table
CREATE POLICY "Users can view own LinkedIn connections" ON public.linkedin_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own LinkedIn connections" ON public.linkedin_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own LinkedIn connections" ON public.linkedin_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own LinkedIn connections" ON public.linkedin_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON public.emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_company ON public.emails(company);
CREATE INDEX IF NOT EXISTS idx_linkedin_connections_user_id ON public.linkedin_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_connections_company ON public.linkedin_connections(company);

-- Insert sample data for testing (optional)
-- You can uncomment these lines to add sample data

-- Sample emails
INSERT INTO public.emails (user_id, name, email, company, position) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Sarah Johnson', 'sarah.johnson@techcorp.com', 'TechCorp Inc.', 'Senior Developer'),
  ('00000000-0000-0000-0000-000000000000', 'Michael Chen', 'michael.chen@startupxyz.com', 'StartupXYZ', 'Product Manager'),
  ('00000000-0000-0000-0000-000000000000', 'Emily Rodriguez', 'emily.rodriguez@enterprise.com', 'Enterprise Solutions', 'UX Designer'),
  ('00000000-0000-0000-0000-000000000000', 'David Kim', 'david.kim@innovate.com', 'Innovate Labs', 'Frontend Developer'),
  ('00000000-0000-0000-0000-000000000000', 'Lisa Thompson', 'lisa.thompson@digital.com', 'Digital Dynamics', 'Marketing Director');

-- Sample LinkedIn connections
INSERT INTO public.linkedin_connections (user_id, name, company, position) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Alex Turner', 'TechCorp Inc.', 'Senior Developer'),
  ('00000000-0000-0000-0000-000000000000', 'Maria Garcia', 'StartupXYZ', 'Product Manager'),
  ('00000000-0000-0000-0000-000000000000', 'John Smith', 'Enterprise Solutions', 'UX Designer'),
  ('00000000-0000-0000-0000-000000000000', 'Sophie Lee', 'Innovate Labs', 'Frontend Developer'),
  ('00000000-0000-0000-0000-000000000000', 'Carlos Rodriguez', 'Digital Dynamics', 'Marketing Director');

-- Grant necessary permissions
GRANT ALL ON public.emails TO anon, authenticated;
GRANT ALL ON public.linkedin_connections TO anon, authenticated;

-- Verify the setup
SELECT 'Data tables have been created successfully!' as status; 