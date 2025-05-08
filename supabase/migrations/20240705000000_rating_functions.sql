-- Functions to calculate and update ratings

-- Function to update worker average rating
CREATE OR REPLACE FUNCTION update_worker_rating()
RETURNS TRIGGER AS $$
DECLARE
  worker_id UUID;
BEGIN
  -- Get the worker_id from the booking
  SELECT ws.worker_id INTO worker_id
  FROM bookings b
  JOIN worker_services ws ON b.service_id = ws.id
  WHERE b.id = NEW.booking_id;
  
  -- Update the worker's average rating and total reviews
  UPDATE worker_profiles
  SET 
    average_rating = (
      SELECT AVG(r.rating)
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      JOIN worker_services ws ON b.service_id = ws.id
      WHERE ws.worker_id = worker_id
    ),
    total_reviews = (
      SELECT COUNT(r.id)
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      JOIN worker_services ws ON b.service_id = ws.id
      WHERE ws.worker_id = worker_id
    )
  WHERE id = worker_id;
  
  -- Update the service's average rating
  UPDATE worker_services
  SET 
    avg_rating = (
      SELECT AVG(r.rating)
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      WHERE b.service_id = (
        SELECT service_id FROM bookings WHERE id = NEW.booking_id
      )
    )
  WHERE id = (SELECT service_id FROM bookings WHERE id = NEW.booking_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings when a review is added or updated
CREATE TRIGGER after_review_insert_or_update
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_worker_rating();

-- Function to update booking counts
CREATE OR REPLACE FUNCTION update_booking_counts()
RETURNS TRIGGER AS $$
DECLARE
  worker_id UUID;
BEGIN
  -- Only process completed bookings
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get the worker_id from the booking
    SELECT ws.worker_id INTO worker_id
    FROM worker_services ws
    WHERE ws.id = NEW.service_id;
    
    -- Update the worker's total completed jobs
    UPDATE worker_profiles
    SET total_completed_jobs = total_completed_jobs + 1
    WHERE id = worker_id;
    
    -- Update the service's total bookings
    UPDATE worker_services
    SET total_bookings = total_bookings + 1
    WHERE id = NEW.service_id;
    
    -- Update the customer's total bookings and total spent
    UPDATE customer_profiles
    SET 
      total_bookings = total_bookings + 1,
      total_spent = total_spent + COALESCE(NEW.price, 0)
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update booking counts when a booking status changes
CREATE TRIGGER after_booking_status_change
  AFTER INSERT OR UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE PROCEDURE update_booking_counts();

-- Function to set default address as default when it's the first address
CREATE OR REPLACE FUNCTION set_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first address for the customer, set it as default
  IF NOT EXISTS (
    SELECT 1 FROM customer_addresses
    WHERE customer_id = NEW.customer_id AND id != NEW.id
  ) THEN
    NEW.is_default := TRUE;
    
    -- Update the customer profile with this address as default
    UPDATE customer_profiles
    SET default_address_id = NEW.id
    WHERE id = NEW.customer_id;
  END IF;
  
  -- If this address is marked as default, unmark other addresses
  IF NEW.is_default THEN
    UPDATE customer_addresses
    SET is_default = FALSE
    WHERE customer_id = NEW.customer_id AND id != NEW.id;
    
    -- Update the customer profile with this address as default
    UPDATE customer_profiles
    SET default_address_id = NEW.id
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to manage default addresses
CREATE TRIGGER manage_default_address
  BEFORE INSERT OR UPDATE OF is_default ON customer_addresses
  FOR EACH ROW
  EXECUTE PROCEDURE set_default_address();

-- Function to set default payment method as default when it's the first payment method
CREATE OR REPLACE FUNCTION set_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first payment method for the customer, set it as default
  IF NOT EXISTS (
    SELECT 1 FROM customer_payment_methods
    WHERE customer_id = NEW.customer_id AND id != NEW.id
  ) THEN
    NEW.is_default := TRUE;
    
    -- Update the customer profile with this payment method as default
    UPDATE customer_profiles
    SET preferred_payment_method_id = NEW.id
    WHERE id = NEW.customer_id;
  END IF;
  
  -- If this payment method is marked as default, unmark other payment methods
  IF NEW.is_default THEN
    UPDATE customer_payment_methods
    SET is_default = FALSE
    WHERE customer_id = NEW.customer_id AND id != NEW.id;
    
    -- Update the customer profile with this payment method as default
    UPDATE customer_profiles
    SET preferred_payment_method_id = NEW.id
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to manage default payment methods
CREATE TRIGGER manage_default_payment_method
  BEFORE INSERT OR UPDATE OF is_default ON customer_payment_methods
  FOR EACH ROW
  EXECUTE PROCEDURE set_default_payment_method();

-- Function to create a customer profile when a user is assigned the customer role
CREATE OR REPLACE FUNCTION create_customer_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if this is a customer role assignment
  IF NEW.role_name = 'customer' THEN
    -- Check if a customer profile already exists
    IF NOT EXISTS (SELECT 1 FROM customer_profiles WHERE id = NEW.user_id) THEN
      -- Get user details from profiles table
      INSERT INTO customer_profiles (
        id,
        full_name,
        phone_number
      )
      SELECT
        p.id,
        p.full_name,
        p.phone_number
      FROM profiles p
      WHERE p.id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create customer profile when customer role is assigned
CREATE TRIGGER after_customer_role_assignment
  AFTER INSERT ON user_role_assignments
  FOR EACH ROW
  EXECUTE PROCEDURE create_customer_profile();

-- Function to automatically create a worker profile when a user is assigned the worker role
CREATE OR REPLACE FUNCTION create_worker_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if this is a worker role assignment
  IF NEW.role_name = 'worker' THEN
    -- Check if a worker profile already exists
    IF NOT EXISTS (SELECT 1 FROM worker_profiles WHERE id = NEW.user_id) THEN
      -- Get user details from profiles table
      INSERT INTO worker_profiles (
        id,
        full_name,
        phone_number,
        city,
        country,
        bio,
        avatar_url,
        is_available
      )
      SELECT
        p.id,
        p.full_name,
        p.phone_number,
        'New York', -- Default city
        'USA',      -- Default country
        p.bio,
        p.avatar_url,
        TRUE        -- Default availability
      FROM profiles p
      WHERE p.id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create worker profile when worker role is assigned
CREATE TRIGGER after_worker_role_assignment
  AFTER INSERT ON user_role_assignments
  FOR EACH ROW
  EXECUTE PROCEDURE create_worker_profile();
