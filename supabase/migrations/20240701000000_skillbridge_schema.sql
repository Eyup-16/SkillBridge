-- Create profiles table for all users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policy for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create worker_profiles table
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  hourly_rate DECIMAL(10, 2),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_categories table
CREATE TABLE service_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create worker_services table (services offered by workers)
CREATE TABLE worker_services (
  id SERIAL PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2),
  is_hourly BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(worker_id, category_id, title)
);

-- Create service_images table
CREATE TABLE service_images (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES worker_services(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES worker_services(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Create forum_categories table
CREATE TABLE forum_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_posts table
CREATE TABLE forum_posts (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_comments table
CREATE TABLE forum_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial service categories
INSERT INTO service_categories (name, description, icon) VALUES
('Carpentry', 'Woodworking and furniture services', 'hammer'),
('Plumbing', 'Water system installation and repair', 'droplet'),
('Electrical', 'Electrical installation and repair', 'zap'),
('Tailoring', 'Clothing alterations and custom designs', 'scissors'),
('Mechanics', 'Vehicle repair and maintenance', 'tool'),
('Painting', 'Interior and exterior painting services', 'paintbrush'),
('Cleaning', 'Home and office cleaning services', 'trash'),
('Gardening', 'Landscaping and plant care', 'flower'),
('Teaching', 'Educational services and tutoring', 'book'),
('Technology', 'Computer and device repair', 'cpu');

-- Insert initial forum categories
INSERT INTO forum_categories (name, description) VALUES
('General Discussion', 'General topics related to skills and services'),
('Service Requests', 'Request for specific services from the community'),
('Skill Sharing', 'Share your knowledge and tips with others'),
('Tools & Equipment', 'Discussions about tools and equipment'),
('Success Stories', 'Share your success stories and experiences');

-- Create RLS policies
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

-- Worker profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON worker_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON worker_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON worker_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Worker services policies
CREATE POLICY "Services are viewable by everyone"
  ON worker_services FOR SELECT
  USING (true);

CREATE POLICY "Workers can insert their own services"
  ON worker_services FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can update their own services"
  ON worker_services FOR UPDATE
  USING (auth.uid() = worker_id);

CREATE POLICY "Workers can delete their own services"
  ON worker_services FOR DELETE
  USING (auth.uid() = worker_id);

-- Service images policies
CREATE POLICY "Service images are viewable by everyone"
  ON service_images FOR SELECT
  USING (true);

CREATE POLICY "Workers can insert images for their services"
  ON service_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM worker_services
      WHERE id = service_id AND worker_id = auth.uid()
    )
  );

CREATE POLICY "Workers can delete images for their services"
  ON service_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM worker_services
      WHERE id = service_id AND worker_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Workers can view bookings for their services"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM worker_services
      WHERE id = service_id AND worker_id = auth.uid()
    ) OR customer_id = auth.uid()
  );

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = customer_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can insert reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id AND customer_id = auth.uid() AND status = 'completed'
    )
  );

-- Forum policies
CREATE POLICY "Forum posts are viewable by everyone"
  ON forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create forum posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forum posts"
  ON forum_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Forum comments are viewable by everyone"
  ON forum_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create forum comments"
  ON forum_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forum comments"
  ON forum_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
