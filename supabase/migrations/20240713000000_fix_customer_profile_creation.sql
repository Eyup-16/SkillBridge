-- Function to ensure customer profile exists
CREATE OR REPLACE FUNCTION ensure_customer_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to create customer profile if it doesn't exist
  INSERT INTO customer_profiles (
    id,
    full_name,
    phone_number,
    total_bookings,
    total_spent
  )
  SELECT
    NEW.customer_id,
    COALESCE(p.full_name, p.email, split_part(p.email, '@', 1)),
    p.phone_number,
    0,
    0
  FROM profiles p
  WHERE p.id = NEW.customer_id
  ON CONFLICT (id) DO NOTHING;

  -- Check if the customer profile was created successfully
  IF NOT EXISTS (SELECT 1 FROM customer_profiles WHERE id = NEW.customer_id) THEN
    RAISE EXCEPTION 'Customer profile not found and could not be created';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure customer profile exists before booking
DROP TRIGGER IF EXISTS ensure_customer_profile_trigger ON bookings;
CREATE TRIGGER ensure_customer_profile_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION ensure_customer_profile();

-- Create missing customer profiles for existing bookings
INSERT INTO customer_profiles (
  id,
  full_name,
  phone_number,
  total_bookings,
  total_spent
)
SELECT DISTINCT
  b.customer_id,
  COALESCE(p.full_name, p.email, split_part(p.email, '@', 1)),
  p.phone_number,
  0,
  0
FROM bookings b
JOIN profiles p ON p.id = b.customer_id
WHERE NOT EXISTS (
  SELECT 1 FROM customer_profiles cp WHERE cp.id = b.customer_id
); 