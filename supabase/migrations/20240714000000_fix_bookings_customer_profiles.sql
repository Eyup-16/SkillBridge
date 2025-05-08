-- First, drop existing foreign key constraint
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_customer_id_fkey;

-- Add new foreign key constraint referencing customer_profiles table
ALTER TABLE bookings
ADD CONSTRAINT bookings_customer_id_fkey
FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE;

-- Ensure all existing bookings have corresponding customer profiles
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