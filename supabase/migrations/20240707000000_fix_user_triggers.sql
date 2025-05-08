-- Fix user creation triggers and functions

-- First, disable all existing triggers to avoid conflicts during user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
DROP TRIGGER IF EXISTS after_customer_role_assignment ON user_role_assignments;
DROP TRIGGER IF EXISTS after_worker_role_assignment ON user_role_assignments;

-- Create a more robust function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_city TEXT := 'New York';
  default_country TEXT := 'USA';
BEGIN
  -- Create the user profile with safe defaults
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      avatar_url,
      account_status,
      selected_role
    )
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'avatar_url',
      'active',
      'customer'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
      selected_role = COALESCE(profiles.selected_role, 'customer');
  EXCEPTION WHEN OTHERS THEN
    -- Log error but continue
    RAISE NOTICE 'Error creating profile for user %: %', new.id, SQLERRM;
  END;

  -- Assign the default customer role
  BEGIN
    INSERT INTO public.user_role_assignments (user_id, role_name)
    VALUES (new.id, 'customer')
    ON CONFLICT (user_id, role_name) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but continue
    RAISE NOTICE 'Error assigning customer role to user %: %', new.id, SQLERRM;
  END;

  -- Create customer profile
  BEGIN
    INSERT INTO customer_profiles (
      id,
      full_name,
      phone_number,
      total_bookings,
      total_spent
    )
    SELECT
      new.id,
      COALESCE(p.full_name, split_part(new.email, '@', 1)),
      p.phone_number,
      0,
      0
    FROM profiles p
    WHERE p.id = new.id
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but continue
    RAISE NOTICE 'Error creating customer profile for user %: %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a single trigger that handles all new user operations
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create more robust role-based profile creation functions with error handling
CREATE OR REPLACE FUNCTION create_customer_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if this is a customer role assignment
  IF NEW.role_name = 'customer' THEN
    BEGIN
      -- Check if a customer profile already exists
      IF NOT EXISTS (SELECT 1 FROM customer_profiles WHERE id = NEW.user_id) THEN
        -- Get user details from profiles table
        INSERT INTO customer_profiles (
          id,
          full_name,
          phone_number,
          total_bookings,
          total_spent
        )
        SELECT
          p.id,
          COALESCE(p.full_name, p.email, split_part(p.email, '@', 1)),
          p.phone_number,
          0,
          0
        FROM profiles p
        WHERE p.id = NEW.user_id
        ON CONFLICT (id) DO NOTHING;
      END IF;

      -- Ensure the profile has the customer role selected
      UPDATE profiles
      SET selected_role = COALESCE(selected_role, 'customer')
      WHERE id = NEW.user_id;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue
      RAISE NOTICE 'Error in create_customer_profile for user %: %', NEW.user_id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a more robust worker profile creation function
CREATE OR REPLACE FUNCTION create_worker_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if this is a worker role assignment
  IF NEW.role_name = 'worker' THEN
    BEGIN
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
          is_available,
          years_experience,
          average_rating,
          total_reviews,
          total_completed_jobs,
          verification_status
        )
        SELECT
          p.id,
          COALESCE(p.full_name, p.email, split_part(p.email, '@', 1)),
          p.phone_number,
          'New York', -- Default city
          'USA',      -- Default country
          p.bio,
          p.avatar_url,
          TRUE,       -- Default availability
          0,          -- Default years experience
          NULL,       -- Default average rating
          0,          -- Default total reviews
          0,          -- Default total completed jobs
          'pending'   -- Default verification status
        FROM profiles p
        WHERE p.id = NEW.user_id
        ON CONFLICT (id) DO NOTHING;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue
      RAISE NOTICE 'Error in create_worker_profile for user %: %', NEW.user_id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create the role assignment triggers
CREATE TRIGGER after_customer_role_assignment
  AFTER INSERT ON user_role_assignments
  FOR EACH ROW EXECUTE PROCEDURE create_customer_profile();

CREATE TRIGGER after_worker_role_assignment
  AFTER INSERT ON user_role_assignments
  FOR EACH ROW EXECUTE PROCEDURE create_worker_profile();
