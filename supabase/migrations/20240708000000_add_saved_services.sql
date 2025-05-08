-- Create saved_services table
CREATE TABLE saved_services (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES worker_services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

-- Enable RLS
ALTER TABLE saved_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved services"
  ON saved_services FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved services"
  ON saved_services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved services"
  ON saved_services FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_saved_services_user_id ON saved_services(user_id);
CREATE INDEX idx_saved_services_service_id ON saved_services(service_id); 