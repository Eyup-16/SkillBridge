-- Enhanced Schema for SkillBridge Marketplace

-- 1. Enhance profiles table with additional user information
ALTER TABLE profiles 
ADD COLUMN phone_number TEXT,
ADD COLUMN account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended')),
ADD COLUMN bio TEXT,
ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;

-- 2. Enhance worker_profiles table with additional professional details
ALTER TABLE worker_profiles
ADD COLUMN years_experience INTEGER,
ADD COLUMN average_rating DECIMAL(3, 2),
ADD COLUMN total_reviews INTEGER DEFAULT 0,
ADD COLUMN total_completed_jobs INTEGER DEFAULT 0,
ADD COLUMN verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- 3. Create customer_profiles table
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  default_address_id INTEGER,
  preferred_payment_method_id INTEGER,
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create customer_addresses table
CREATE TABLE customer_addresses (
  id SERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  address_type TEXT DEFAULT 'home' CHECK (address_type IN ('home', 'work', 'other')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create customer_payment_methods table
CREATE TABLE customer_payment_methods (
  id SERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('credit_card', 'debit_card', 'bank_transfer', 'mobile_payment', 'cash')),
  provider TEXT,
  account_number TEXT,
  expiry_date TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create worker_certifications table
CREATE TABLE worker_certifications (
  id SERIAL PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  certification_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create worker_availability table
CREATE TABLE worker_availability (
  id SERIAL PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(worker_id, day_of_week)
);

-- 8. Enhance service_categories to support hierarchical categorization
ALTER TABLE service_categories
ADD COLUMN parent_id INTEGER REFERENCES service_categories(id),
ADD COLUMN level INTEGER DEFAULT 1,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- 9. Create service_areas table
CREATE TABLE service_areas (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES worker_services(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  postal_code TEXT,
  radius_km DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Enhance worker_services with additional fields
ALTER TABLE worker_services
ADD COLUMN min_duration INTEGER, -- in minutes
ADD COLUMN max_duration INTEGER, -- in minutes
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN avg_rating DECIMAL(3, 2),
ADD COLUMN total_bookings INTEGER DEFAULT 0;

-- 11. Enhance bookings table with payment details
ALTER TABLE bookings
ADD COLUMN price DECIMAL(10, 2),
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
ADD COLUMN payment_method TEXT,
ADD COLUMN transaction_id TEXT,
ADD COLUMN address_id INTEGER REFERENCES customer_addresses(id),
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN cancelled_by TEXT;

-- 12. Enhance reviews table with worker response
ALTER TABLE reviews
ADD COLUMN worker_response TEXT,
ADD COLUMN worker_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

-- 13. Create booking_payments table
CREATE TABLE booking_payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Create RLS policies for new tables
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;

-- Customer profiles policies
CREATE POLICY "Public customer profiles are viewable by everyone"
  ON customer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own customer profile"
  ON customer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own customer profile"
  ON customer_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Customer addresses policies
CREATE POLICY "Users can view their own addresses"
  ON customer_addresses FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert their own addresses"
  ON customer_addresses FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own addresses"
  ON customer_addresses FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own addresses"
  ON customer_addresses FOR DELETE
  USING (auth.uid() = customer_id);

-- Customer payment methods policies
CREATE POLICY "Users can view their own payment methods"
  ON customer_payment_methods FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert their own payment methods"
  ON customer_payment_methods FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own payment methods"
  ON customer_payment_methods FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own payment methods"
  ON customer_payment_methods FOR DELETE
  USING (auth.uid() = customer_id);

-- Worker certifications policies
CREATE POLICY "Public certifications are viewable by everyone"
  ON worker_certifications FOR SELECT
  USING (true);

CREATE POLICY "Workers can insert their own certifications"
  ON worker_certifications FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can update their own certifications"
  ON worker_certifications FOR UPDATE
  USING (auth.uid() = worker_id);

CREATE POLICY "Workers can delete their own certifications"
  ON worker_certifications FOR DELETE
  USING (auth.uid() = worker_id);

-- Worker availability policies
CREATE POLICY "Public availability is viewable by everyone"
  ON worker_availability FOR SELECT
  USING (true);

CREATE POLICY "Workers can insert their own availability"
  ON worker_availability FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can update their own availability"
  ON worker_availability FOR UPDATE
  USING (auth.uid() = worker_id);

CREATE POLICY "Workers can delete their own availability"
  ON worker_availability FOR DELETE
  USING (auth.uid() = worker_id);

-- Service areas policies
CREATE POLICY "Service areas are viewable by everyone"
  ON service_areas FOR SELECT
  USING (true);

CREATE POLICY "Workers can insert service areas for their services"
  ON service_areas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM worker_services
      WHERE id = service_id AND worker_id = auth.uid()
    )
  );

CREATE POLICY "Workers can update service areas for their services"
  ON service_areas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM worker_services
      WHERE id = service_id AND worker_id = auth.uid()
    )
  );

CREATE POLICY "Workers can delete service areas for their services"
  ON service_areas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM worker_services
      WHERE id = service_id AND worker_id = auth.uid()
    )
  );

-- Booking payments policies
CREATE POLICY "Users can view their own booking payments"
  ON booking_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id AND customer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN worker_services ws ON b.service_id = ws.id
      WHERE b.id = booking_id AND ws.worker_id = auth.uid()
    )
  );
