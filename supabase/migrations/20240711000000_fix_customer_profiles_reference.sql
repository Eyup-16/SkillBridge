-- First, drop existing foreign key constraint
ALTER TABLE customer_profiles
DROP CONSTRAINT customer_profiles_id_fkey;

-- Add new foreign key constraint referencing profiles table
ALTER TABLE customer_profiles
ADD CONSTRAINT customer_profiles_id_fkey
FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Recreate the RLS policies to ensure they work with the new constraint
DROP POLICY IF EXISTS "Public customer profiles are viewable by everyone" ON customer_profiles;
DROP POLICY IF EXISTS "Users can insert their own customer profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update their own customer profile" ON customer_profiles;

CREATE POLICY "Public customer profiles are viewable by everyone"
  ON customer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own customer profile"
  ON customer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own customer profile"
  ON customer_profiles FOR UPDATE
  USING (auth.uid() = id); 