-- Remove automatic role selection
-- This migration modifies the handle_new_user function to not set a default selected_role

-- Update the handle_new_user function to not set a selected_role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_city TEXT := 'New York';
  default_country TEXT := 'USA';
BEGIN
  -- Create the user profile with safe defaults but no selected_role
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      avatar_url,
      account_status
      -- No selected_role field here
    )
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'avatar_url',
      'active'
      -- No selected_role value here
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url)
      -- Keep existing selected_role if any, but don't set a default
      ;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but continue
    RAISE NOTICE 'Error creating profile for user %: %', new.id, SQLERRM;
  END;

  -- Assign the default customer role (keep this to ensure users have the customer role)
  BEGIN
    INSERT INTO public.user_role_assignments (user_id, role_name)
    VALUES (new.id, 'customer')
    ON CONFLICT (user_id, role_name) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but continue
    RAISE NOTICE 'Error assigning customer role to user %: %', new.id, SQLERRM;
  END;

  -- Create customer profile (keep this to ensure users have a customer profile)
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

-- Update the create_customer_profile function to not set a default selected_role
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

      -- Don't automatically set selected_role anymore
      -- The commented out code below shows what was removed
      /*
      UPDATE profiles
      SET selected_role = COALESCE(selected_role, 'customer')
      WHERE id = NEW.user_id;
      */
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue
      RAISE NOTICE 'Error in create_customer_profile for user %: %', NEW.user_id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
