-- Create user_roles table to store available roles
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO user_roles (name, description) VALUES 
  ('worker', 'Service provider who offers skills and services'),
  ('customer', 'User who books services from workers');

-- Add selected_role to profiles table
ALTER TABLE profiles ADD COLUMN selected_role TEXT;

-- Create user_role_assignments table for many-to-many relationship
CREATE TABLE user_role_assignments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL REFERENCES user_roles(name) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_name)
);

-- Create RLS policies for user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User roles are viewable by everyone"
  ON user_roles FOR SELECT
  USING (true);

-- Create RLS policies for user_role_assignments
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role assignments"
  ON user_role_assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role assignments"
  ON user_role_assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role assignments"
  ON user_role_assignments FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to assign default customer role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_role_assignments (user_id, role_name)
  VALUES (new.id, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.assign_default_role();
