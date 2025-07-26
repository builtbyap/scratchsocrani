-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id), -- Link to Supabase auth.users table
  email TEXT UNIQUE NOT NULL,
  subscription_status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'trial', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to view and update their own data
CREATE POLICY "Users can view their own profile." ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON users
  FOR UPDATE USING (auth.uid() = id);

-- Optional: Policy for inserting new users (e.g., via a trigger or function)
-- If you're using a Supabase function to create user profiles on auth.users insert,
-- you might not need a direct INSERT policy for authenticated users.
-- For manual inserts or if you want to allow users to create their own profile:
CREATE POLICY "Allow authenticated users to insert their own profile." ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Optional: Function to create a user profile on new auth.users signup
-- This function automatically creates an entry in your 'users' table
-- whenever a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists to avoid errors on re-creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to call the function after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set ownership of the function to the postgres role
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Grant usage on the function to the service_role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
