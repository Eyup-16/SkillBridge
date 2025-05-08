-- First, drop existing foreign key constraint
ALTER TABLE bookings
DROP CONSTRAINT bookings_customer_id_fkey;

-- Add new foreign key constraint referencing customer_profiles table
ALTER TABLE bookings
ADD CONSTRAINT bookings_customer_id_fkey
FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE;

-- Recreate the RLS policies to ensure they work with the new constraint
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = customer_id OR
    EXISTS (
      SELECT 1 FROM worker_services ws
      WHERE ws.id = service_id AND ws.worker_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = customer_id); 