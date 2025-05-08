-- Add indexes for query optimization

-- Profiles table indexes
CREATE INDEX idx_profiles_selected_role ON profiles(selected_role);
CREATE INDEX idx_profiles_account_status ON profiles(account_status);

-- Worker profiles indexes
CREATE INDEX idx_worker_profiles_city ON worker_profiles(city);
CREATE INDEX idx_worker_profiles_country ON worker_profiles(country);
CREATE INDEX idx_worker_profiles_is_available ON worker_profiles(is_available);
CREATE INDEX idx_worker_profiles_hourly_rate ON worker_profiles(hourly_rate);
CREATE INDEX idx_worker_profiles_average_rating ON worker_profiles(average_rating);
CREATE INDEX idx_worker_profiles_verification_status ON worker_profiles(verification_status);

-- Customer profiles indexes
CREATE INDEX idx_customer_profiles_default_address_id ON customer_profiles(default_address_id);
CREATE INDEX idx_customer_profiles_preferred_payment_method_id ON customer_profiles(preferred_payment_method_id);

-- Customer addresses indexes
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_city ON customer_addresses(city);
CREATE INDEX idx_customer_addresses_country ON customer_addresses(country);
CREATE INDEX idx_customer_addresses_is_default ON customer_addresses(is_default);
CREATE INDEX idx_customer_addresses_address_type ON customer_addresses(address_type);

-- Customer payment methods indexes
CREATE INDEX idx_customer_payment_methods_customer_id ON customer_payment_methods(customer_id);
CREATE INDEX idx_customer_payment_methods_payment_type ON customer_payment_methods(payment_type);
CREATE INDEX idx_customer_payment_methods_is_default ON customer_payment_methods(is_default);

-- Worker certifications indexes
CREATE INDEX idx_worker_certifications_worker_id ON worker_certifications(worker_id);
CREATE INDEX idx_worker_certifications_verification_status ON worker_certifications(verification_status);

-- Worker availability indexes
CREATE INDEX idx_worker_availability_worker_id ON worker_availability(worker_id);
CREATE INDEX idx_worker_availability_day_of_week ON worker_availability(day_of_week);
CREATE INDEX idx_worker_availability_is_available ON worker_availability(is_available);

-- Service categories indexes
CREATE INDEX idx_service_categories_parent_id ON service_categories(parent_id);
CREATE INDEX idx_service_categories_is_active ON service_categories(is_active);

-- Worker services indexes
CREATE INDEX idx_worker_services_worker_id ON worker_services(worker_id);
CREATE INDEX idx_worker_services_category_id ON worker_services(category_id);
CREATE INDEX idx_worker_services_price ON worker_services(price);
CREATE INDEX idx_worker_services_is_hourly ON worker_services(is_hourly);
CREATE INDEX idx_worker_services_is_featured ON worker_services(is_featured);
CREATE INDEX idx_worker_services_is_active ON worker_services(is_active);
CREATE INDEX idx_worker_services_avg_rating ON worker_services(avg_rating);

-- Service areas indexes
CREATE INDEX idx_service_areas_service_id ON service_areas(service_id);
CREATE INDEX idx_service_areas_city ON service_areas(city);
CREATE INDEX idx_service_areas_country ON service_areas(country);
CREATE INDEX idx_service_areas_postal_code ON service_areas(postal_code);

-- Bookings indexes
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_address_id ON bookings(address_id);

-- Reviews indexes
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_is_featured ON reviews(is_featured);

-- Booking payments indexes
CREATE INDEX idx_booking_payments_booking_id ON booking_payments(booking_id);
CREATE INDEX idx_booking_payments_status ON booking_payments(status);

-- User role assignments indexes
CREATE INDEX idx_user_role_assignments_user_id ON user_role_assignments(user_id);
CREATE INDEX idx_user_role_assignments_role_name ON user_role_assignments(role_name);

-- Create GIN indexes for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text search on worker profiles
CREATE INDEX idx_worker_profiles_full_name_trgm ON worker_profiles USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_worker_profiles_bio_trgm ON worker_profiles USING GIN (bio gin_trgm_ops);

-- Full-text search on worker services
CREATE INDEX idx_worker_services_title_trgm ON worker_services USING GIN (title gin_trgm_ops);
CREATE INDEX idx_worker_services_description_trgm ON worker_services USING GIN (description gin_trgm_ops);

-- Full-text search on service categories
CREATE INDEX idx_service_categories_name_trgm ON service_categories USING GIN (name gin_trgm_ops);
CREATE INDEX idx_service_categories_description_trgm ON service_categories USING GIN (description gin_trgm_ops);

-- Full-text search on reviews
CREATE INDEX idx_reviews_comment_trgm ON reviews USING GIN (comment gin_trgm_ops);
