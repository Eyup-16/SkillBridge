-- Create customer_profiles table
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  phone_number TEXT,
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  default_address_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON customer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON customer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON customer_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create indexes
CREATE INDEX idx_customer_profiles_phone_number ON customer_profiles(phone_number);
CREATE INDEX idx_customer_profiles_total_bookings ON customer_profiles(total_bookings);
CREATE INDEX idx_customer_profiles_total_spent ON customer_profiles(total_spent);

-- Create a trigger to automatically create a customer profile when a user's role is set to customer
CREATE OR REPLACE FUNCTION public.handle_customer_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.selected_role = 'customer' AND OLD.selected_role != 'customer' THEN
    INSERT INTO public.customer_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_role_change
  AFTER UPDATE OF selected_role ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_customer_profile(); 