-- Seed data for SkillBridge Marketplace

-- 1. Create test users (using Supabase Auth)
-- Note: In a real environment, you would create these users through the Supabase Auth API
-- For this migration, we'll assume these UUIDs represent users that exist in auth.users

-- Define UUIDs for our test users
DO $$
DECLARE
  worker_ids UUID[] := ARRAY[
    '11111111-1111-1111-1111-111111111101',
    '11111111-1111-1111-1111-111111111102',
    '11111111-1111-1111-1111-111111111103',
    '11111111-1111-1111-1111-111111111104',
    '11111111-1111-1111-1111-111111111105',
    '11111111-1111-1111-1111-111111111106',
    '11111111-1111-1111-1111-111111111107',
    '11111111-1111-1111-1111-111111111108',
    '11111111-1111-1111-1111-111111111109',
    '11111111-1111-1111-1111-111111111110'
  ];
  
  customer_ids UUID[] := ARRAY[
    '22222222-2222-2222-2222-222222222201',
    '22222222-2222-2222-2222-222222222202',
    '22222222-2222-2222-2222-222222222203',
    '22222222-2222-2222-2222-222222222204',
    '22222222-2222-2222-2222-222222222205'
  ];
  
  dual_role_ids UUID[] := ARRAY[
    '33333333-3333-3333-3333-333333333301',
    '33333333-3333-3333-3333-333333333302',
    '33333333-3333-3333-3333-333333333303'
  ];
  
  all_user_ids UUID[];
  user_id UUID;
  i INTEGER;
  category_id INTEGER;
  service_id INTEGER;
  address_id INTEGER;
  payment_method_id INTEGER;
  booking_id INTEGER;
  
BEGIN
  -- Combine all user IDs
  all_user_ids := worker_ids || customer_ids || dual_role_ids;
  
  -- 2. Create profiles for all users
  FOREACH user_id IN ARRAY all_user_ids
  LOOP
    INSERT INTO profiles (id, full_name, email, avatar_url, phone_number, account_status, bio)
    VALUES (
      user_id,
      'User ' || user_id,
      'user' || user_id || '@example.com',
      'https://randomuser.me/api/portraits/' || (CASE WHEN random() > 0.5 THEN 'men' ELSE 'women' END) || '/' || (floor(random() * 100)::int) || '.jpg',
      '+1' || (floor(random() * 900) + 100)::text || (floor(random() * 900) + 100)::text || (floor(random() * 9000) + 1000)::text,
      'active',
      'This is a bio for user ' || user_id
    );
    
    -- Assign roles to users
    IF user_id = ANY(worker_ids) THEN
      INSERT INTO user_role_assignments (user_id, role_name) VALUES (user_id, 'worker');
      UPDATE profiles SET selected_role = 'worker' WHERE id = user_id;
    ELSIF user_id = ANY(customer_ids) THEN
      INSERT INTO user_role_assignments (user_id, role_name) VALUES (user_id, 'customer');
      UPDATE profiles SET selected_role = 'customer' WHERE id = user_id;
    ELSE
      -- Dual role users
      INSERT INTO user_role_assignments (user_id, role_name) VALUES (user_id, 'worker');
      INSERT INTO user_role_assignments (user_id, role_name) VALUES (user_id, 'customer');
      -- Randomly select initial role
      UPDATE profiles SET selected_role = (CASE WHEN random() > 0.5 THEN 'worker' ELSE 'customer' END) WHERE id = user_id;
    END IF;
  END LOOP;
  
  -- 3. Create worker profiles
  FOREACH user_id IN ARRAY (worker_ids || dual_role_ids)
  LOOP
    INSERT INTO worker_profiles (
      id, 
      full_name, 
      phone_number, 
      address, 
      city, 
      country, 
      bio, 
      avatar_url, 
      hourly_rate, 
      is_available,
      years_experience,
      average_rating,
      total_reviews,
      total_completed_jobs,
      verification_status
    )
    VALUES (
      user_id,
      'Worker ' || user_id,
      '+1' || (floor(random() * 900) + 100)::text || (floor(random() * 900) + 100)::text || (floor(random() * 9000) + 1000)::text,
      (floor(random() * 9000) + 1000)::text || ' Main St',
      (CASE floor(random() * 5)::int
        WHEN 0 THEN 'New York'
        WHEN 1 THEN 'Los Angeles'
        WHEN 2 THEN 'Chicago'
        WHEN 3 THEN 'Houston'
        WHEN 4 THEN 'Phoenix'
      END),
      'USA',
      'Professional with ' || (floor(random() * 20) + 1)::text || ' years of experience.',
      'https://randomuser.me/api/portraits/' || (CASE WHEN random() > 0.5 THEN 'men' ELSE 'women' END) || '/' || (floor(random() * 100)::int) || '.jpg',
      (floor(random() * 100) + 20)::numeric,
      TRUE,
      floor(random() * 20) + 1,
      3.5 + random() * 1.5, -- Rating between 3.5 and 5.0
      floor(random() * 100),
      floor(random() * 200),
      (CASE WHEN random() > 0.2 THEN 'verified' ELSE 'pending' END)
    );
    
    -- 4. Create worker certifications (1-3 per worker)
    FOR i IN 1..floor(random() * 3) + 1 LOOP
      INSERT INTO worker_certifications (
        worker_id,
        certification_name,
        issuing_organization,
        issue_date,
        expiry_date,
        certification_url,
        verification_status
      )
      VALUES (
        user_id,
        (CASE floor(random() * 5)::int
          WHEN 0 THEN 'Professional Certification'
          WHEN 1 THEN 'Master Craftsman'
          WHEN 2 THEN 'Licensed Professional'
          WHEN 3 THEN 'Expert Certification'
          WHEN 4 THEN 'Specialized Training'
        END) || ' Level ' || (floor(random() * 3) + 1)::text,
        (CASE floor(random() * 5)::int
          WHEN 0 THEN 'National Association'
          WHEN 1 THEN 'Professional Institute'
          WHEN 2 THEN 'Industry Board'
          WHEN 3 THEN 'Trade School'
          WHEN 4 THEN 'University Program'
        END),
        (current_date - (floor(random() * 1000) + 365)::int),
        (CASE WHEN random() > 0.3 THEN current_date + (floor(random() * 1000) + 365)::int ELSE NULL END),
        'https://example.com/cert/' || user_id || '/' || i,
        (CASE WHEN random() > 0.2 THEN 'verified' ELSE 'pending' END)
      );
    END LOOP;
    
    -- 5. Create worker availability (for each day of the week)
    FOR i IN 0..6 LOOP
      -- 70% chance of being available on any given day
      IF random() < 0.7 THEN
        INSERT INTO worker_availability (
          worker_id,
          day_of_week,
          start_time,
          end_time,
          is_available
        )
        VALUES (
          user_id,
          i,
          '08:00:00'::time + (floor(random() * 4) * interval '1 hour'),
          '17:00:00'::time + (floor(random() * 4) * interval '1 hour'),
          TRUE
        );
      END IF;
    END LOOP;
    
    -- 6. Create worker services (2-4 per worker)
    FOR i IN 1..floor(random() * 3) + 2 LOOP
      -- Select a random category
      SELECT id INTO category_id FROM service_categories ORDER BY random() LIMIT 1;
      
      INSERT INTO worker_services (
        worker_id,
        category_id,
        title,
        description,
        price,
        is_hourly,
        min_duration,
        max_duration,
        is_featured,
        is_active,
        avg_rating,
        total_bookings
      )
      VALUES (
        user_id,
        category_id,
        (
          CASE floor(random() * 5)::int
            WHEN 0 THEN 'Professional'
            WHEN 1 THEN 'Expert'
            WHEN 2 THEN 'Premium'
            WHEN 3 THEN 'Standard'
            WHEN 4 THEN 'Basic'
          END
        ) || ' ' || (SELECT name FROM service_categories WHERE id = category_id) || ' Service',
        'Detailed description of this ' || (SELECT name FROM service_categories WHERE id = category_id) || ' service. Providing high-quality work with attention to detail.',
        (floor(random() * 100) + 20)::numeric,
        random() > 0.3, -- 70% chance of hourly rate
        60 * (floor(random() * 3) + 1), -- 1-3 hours in minutes
        60 * (floor(random() * 5) + 4), -- 4-8 hours in minutes
        random() < 0.2, -- 20% chance of being featured
        TRUE,
        3.5 + random() * 1.5, -- Rating between 3.5 and 5.0
        floor(random() * 50)
      )
      RETURNING id INTO service_id;
      
      -- 7. Create service areas (1-3 per service)
      FOR j IN 1..floor(random() * 3) + 1 LOOP
        INSERT INTO service_areas (
          service_id,
          city,
          state,
          country,
          postal_code,
          radius_km
        )
        VALUES (
          service_id,
          (CASE floor(random() * 5)::int
            WHEN 0 THEN 'New York'
            WHEN 1 THEN 'Los Angeles'
            WHEN 2 THEN 'Chicago'
            WHEN 3 THEN 'Houston'
            WHEN 4 THEN 'Phoenix'
          END),
          (CASE floor(random() * 5)::int
            WHEN 0 THEN 'NY'
            WHEN 1 THEN 'CA'
            WHEN 2 THEN 'IL'
            WHEN 3 THEN 'TX'
            WHEN 4 THEN 'AZ'
          END),
          'USA',
          (floor(random() * 90000) + 10000)::text,
          (floor(random() * 50) + 5)::numeric
        );
      END LOOP;
    END LOOP;
  END LOOP;
  
  -- 8. Create customer profiles
  FOREACH user_id IN ARRAY (customer_ids || dual_role_ids)
  LOOP
    INSERT INTO customer_profiles (
      id,
      full_name,
      phone_number,
      total_bookings,
      total_spent
    )
    VALUES (
      user_id,
      'Customer ' || user_id,
      '+1' || (floor(random() * 900) + 100)::text || (floor(random() * 900) + 100)::text || (floor(random() * 9000) + 1000)::text,
      floor(random() * 20),
      (floor(random() * 5000) + 100)::numeric
    )
    RETURNING id INTO user_id;
    
    -- 9. Create customer addresses (1-3 per customer)
    FOR i IN 1..floor(random() * 3) + 1 LOOP
      INSERT INTO customer_addresses (
        customer_id,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_default,
        address_type,
        latitude,
        longitude
      )
      VALUES (
        user_id,
        (floor(random() * 9000) + 1000)::text || ' ' || 
        (CASE floor(random() * 5)::int
          WHEN 0 THEN 'Main'
          WHEN 1 THEN 'Oak'
          WHEN 2 THEN 'Maple'
          WHEN 3 THEN 'Washington'
          WHEN 4 THEN 'Park'
        END) || ' ' ||
        (CASE floor(random() * 3)::int
          WHEN 0 THEN 'St'
          WHEN 1 THEN 'Ave'
          WHEN 2 THEN 'Blvd'
        END),
        (CASE WHEN random() > 0.7 THEN 'Apt ' || (floor(random() * 100) + 1)::text ELSE NULL END),
        (CASE floor(random() * 5)::int
          WHEN 0 THEN 'New York'
          WHEN 1 THEN 'Los Angeles'
          WHEN 2 THEN 'Chicago'
          WHEN 3 THEN 'Houston'
          WHEN 4 THEN 'Phoenix'
        END),
        (CASE floor(random() * 5)::int
          WHEN 0 THEN 'NY'
          WHEN 1 THEN 'CA'
          WHEN 2 THEN 'IL'
          WHEN 3 THEN 'TX'
          WHEN 4 THEN 'AZ'
        END),
        (floor(random() * 90000) + 10000)::text,
        'USA',
        i = 1, -- First address is default
        (CASE floor(random() * 3)::int
          WHEN 0 THEN 'home'
          WHEN 1 THEN 'work'
          WHEN 2 THEN 'other'
        END),
        (random() * 180) - 90, -- Random latitude
        (random() * 360) - 180  -- Random longitude
      )
      RETURNING id INTO address_id;
      
      -- Update customer profile with default address if this is the first address
      IF i = 1 THEN
        UPDATE customer_profiles SET default_address_id = address_id WHERE id = user_id;
      END IF;
    END LOOP;
    
    -- 10. Create customer payment methods (1-2 per customer)
    FOR i IN 1..floor(random() * 2) + 1 LOOP
      INSERT INTO customer_payment_methods (
        customer_id,
        payment_type,
        provider,
        account_number,
        expiry_date,
        is_default
      )
      VALUES (
        user_id,
        (CASE floor(random() * 5)::int
          WHEN 0 THEN 'credit_card'
          WHEN 1 THEN 'debit_card'
          WHEN 2 THEN 'bank_transfer'
          WHEN 3 THEN 'mobile_payment'
          WHEN 4 THEN 'cash'
        END),
        (CASE floor(random() * 5)::int
          WHEN 0 THEN 'Visa'
          WHEN 1 THEN 'Mastercard'
          WHEN 2 THEN 'PayPal'
          WHEN 3 THEN 'Apple Pay'
          WHEN 4 THEN 'Google Pay'
        END),
        'XXXX-XXXX-XXXX-' || (floor(random() * 9000) + 1000)::text,
        (CASE WHEN random() > 0.5 THEN
          (date_part('year', current_date) + floor(random() * 5) + 1)::text || '/' || 
          (floor(random() * 12) + 1)::text
        ELSE NULL END),
        i = 1 -- First payment method is default
      )
      RETURNING id INTO payment_method_id;
      
      -- Update customer profile with default payment method if this is the first payment method
      IF i = 1 THEN
        UPDATE customer_profiles SET preferred_payment_method_id = payment_method_id WHERE id = user_id;
      END IF;
    END LOOP;
  END LOOP;
  
  -- 11. Create bookings (multiple per customer with different statuses)
  FOREACH user_id IN ARRAY (customer_ids || dual_role_ids)
  LOOP
    -- Create 3-8 bookings per customer
    FOR i IN 1..floor(random() * 6) + 3 LOOP
      -- Select a random service
      SELECT ws.id INTO service_id 
      FROM worker_services ws
      JOIN worker_profiles wp ON ws.worker_id = wp.id
      WHERE wp.id != user_id -- Ensure customers don't book their own services
      ORDER BY random() 
      LIMIT 1;
      
      -- Select a random address for this customer
      SELECT id INTO address_id 
      FROM customer_addresses 
      WHERE customer_id = user_id 
      ORDER BY random() 
      LIMIT 1;
      
      -- Select a random payment method for this customer
      SELECT id INTO payment_method_id 
      FROM customer_payment_methods 
      WHERE customer_id = user_id 
      ORDER BY random() 
      LIMIT 1;
      
      INSERT INTO bookings (
        service_id,
        customer_id,
        booking_date,
        start_time,
        end_time,
        status,
        notes,
        price,
        payment_status,
        payment_method,
        transaction_id,
        address_id
      )
      VALUES (
        service_id,
        user_id,
        current_date - (floor(random() * 60) - 30)::int, -- Dates from 30 days ago to 30 days in future
        '08:00:00'::time + (floor(random() * 8) * interval '1 hour'), -- Start time between 8am and 4pm
        '10:00:00'::time + (floor(random() * 8) * interval '1 hour'), -- End time between 10am and 6pm
        (CASE 
          WHEN random() < 0.3 THEN 'pending'
          WHEN random() < 0.6 THEN 'confirmed'
          WHEN random() < 0.9 THEN 'completed'
          ELSE 'cancelled'
        END),
        (CASE WHEN random() > 0.7 THEN 'Special instructions for this booking.' ELSE NULL END),
        (floor(random() * 200) + 50)::numeric,
        (CASE 
          WHEN random() < 0.7 THEN 'paid'
          WHEN random() < 0.9 THEN 'pending'
          ELSE 'failed'
        END),
        (CASE floor(random() * 5)::int
          WHEN 0 THEN 'credit_card'
          WHEN 1 THEN 'debit_card'
          WHEN 2 THEN 'bank_transfer'
          WHEN 3 THEN 'mobile_payment'
          WHEN 4 THEN 'cash'
        END),
        (CASE WHEN random() > 0.3 THEN 'TXN-' || (floor(random() * 1000000) + 100000)::text ELSE NULL END),
        address_id
      )
      RETURNING id INTO booking_id;
      
      -- 12. Create booking payments for paid bookings
      IF random() < 0.7 THEN -- 70% chance of having a payment
        INSERT INTO booking_payments (
          booking_id,
          amount,
          payment_method,
          transaction_id,
          status,
          payment_date
        )
        VALUES (
          booking_id,
          (floor(random() * 200) + 50)::numeric,
          (CASE floor(random() * 5)::int
            WHEN 0 THEN 'credit_card'
            WHEN 1 THEN 'debit_card'
            WHEN 2 THEN 'bank_transfer'
            WHEN 3 THEN 'mobile_payment'
            WHEN 4 THEN 'cash'
          END),
          'TXN-' || (floor(random() * 1000000) + 100000)::text,
          (CASE 
            WHEN random() < 0.8 THEN 'completed'
            WHEN random() < 0.9 THEN 'pending'
            ELSE 'failed'
          END),
          current_timestamp - (floor(random() * 30) * interval '1 day')
        );
      END IF;
      
      -- 13. Create reviews for completed bookings
      IF random() < 0.8 THEN -- 80% chance of having a review for completed bookings
        INSERT INTO reviews (
          booking_id,
          rating,
          comment,
          worker_response,
          worker_response_at,
          is_featured
        )
        VALUES (
          booking_id,
          floor(random() * 5) + 1, -- Rating between 1 and 5
          (CASE 
            WHEN random() < 0.2 THEN 'Excellent service, highly recommended!'
            WHEN random() < 0.4 THEN 'Very professional and efficient.'
            WHEN random() < 0.6 THEN 'Good service, would use again.'
            WHEN random() < 0.8 THEN 'Satisfactory experience overall.'
            ELSE 'Could have been better, but got the job done.'
          END),
          (CASE WHEN random() > 0.6 THEN 'Thank you for your feedback! We appreciate your business.' ELSE NULL END),
          (CASE WHEN random() > 0.6 THEN current_timestamp - (floor(random() * 10) * interval '1 day') ELSE NULL END),
          random() < 0.1 -- 10% chance of being featured
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;
