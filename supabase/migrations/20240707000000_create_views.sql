-- Create views for common queries

-- View for worker details with ratings and service counts
CREATE OR REPLACE VIEW worker_details AS
SELECT
  wp.id,
  wp.full_name,
  wp.phone_number,
  wp.address,
  wp.city,
  wp.country,
  wp.bio,
  wp.avatar_url,
  wp.hourly_rate,
  wp.is_available,
  wp.years_experience,
  wp.average_rating,
  wp.total_reviews,
  wp.total_completed_jobs,
  wp.verification_status,
  COUNT(DISTINCT ws.id) AS service_count,
  COUNT(DISTINCT wc.id) AS certification_count,
  ARRAY_AGG(DISTINCT sc.name) AS service_categories
FROM
  worker_profiles wp
LEFT JOIN
  worker_services ws ON wp.id = ws.worker_id
LEFT JOIN
  service_categories sc ON ws.category_id = sc.id
LEFT JOIN
  worker_certifications wc ON wp.id = wc.worker_id
GROUP BY
  wp.id;

-- View for customer details with address and payment method counts
CREATE OR REPLACE VIEW customer_details AS
SELECT
  cp.id,
  cp.full_name,
  cp.phone_number,
  cp.total_bookings,
  cp.total_spent,
  COUNT(DISTINCT ca.id) AS address_count,
  COUNT(DISTINCT cpm.id) AS payment_method_count,
  da.address_line1 AS default_address_line1,
  da.city AS default_city,
  da.country AS default_country
FROM
  customer_profiles cp
LEFT JOIN
  customer_addresses ca ON cp.id = ca.customer_id
LEFT JOIN
  customer_payment_methods cpm ON cp.id = cpm.customer_id
LEFT JOIN
  customer_addresses da ON cp.default_address_id = da.id
GROUP BY
  cp.id, da.address_line1, da.city, da.country;

-- View for service listings with worker details
CREATE OR REPLACE VIEW service_listings AS
SELECT
  ws.id,
  ws.title,
  ws.description,
  ws.price,
  ws.is_hourly,
  ws.min_duration,
  ws.max_duration,
  ws.is_featured,
  ws.is_active,
  ws.avg_rating,
  ws.total_bookings,
  sc.name AS category_name,
  sc.description AS category_description,
  sc.icon AS category_icon,
  wp.id AS worker_id,
  wp.full_name AS worker_name,
  wp.avatar_url AS worker_avatar,
  wp.average_rating AS worker_rating,
  wp.verification_status AS worker_verification,
  ARRAY_AGG(DISTINCT sa.city) AS service_cities
FROM
  worker_services ws
JOIN
  worker_profiles wp ON ws.worker_id = wp.id
JOIN
  service_categories sc ON ws.category_id = sc.id
LEFT JOIN
  service_areas sa ON ws.id = sa.service_id
GROUP BY
  ws.id, sc.name, sc.description, sc.icon, wp.id, wp.full_name, wp.avatar_url, wp.average_rating, wp.verification_status;

-- View for booking details with service and customer information
CREATE OR REPLACE VIEW booking_details AS
SELECT
  b.id,
  b.booking_date,
  b.start_time,
  b.end_time,
  b.status,
  b.notes,
  b.price,
  b.payment_status,
  b.payment_method,
  b.transaction_id,
  ws.id AS service_id,
  ws.title AS service_title,
  ws.price AS service_price,
  ws.is_hourly AS service_is_hourly,
  wp.id AS worker_id,
  wp.full_name AS worker_name,
  wp.avatar_url AS worker_avatar,
  cp.id AS customer_id,
  cp.full_name AS customer_name,
  ca.address_line1,
  ca.city,
  ca.country,
  r.id AS review_id,
  r.rating,
  r.comment AS review_comment,
  r.worker_response,
  sc.name AS category_name
FROM
  bookings b
JOIN
  worker_services ws ON b.service_id = ws.id
JOIN
  worker_profiles wp ON ws.worker_id = wp.id
JOIN
  customer_profiles cp ON b.customer_id = cp.id
JOIN
  service_categories sc ON ws.category_id = sc.id
LEFT JOIN
  customer_addresses ca ON b.address_id = ca.id
LEFT JOIN
  reviews r ON b.id = r.booking_id;

-- View for top-rated workers by category
CREATE OR REPLACE VIEW top_rated_workers AS
SELECT
  sc.id AS category_id,
  sc.name AS category_name,
  wp.id AS worker_id,
  wp.full_name AS worker_name,
  wp.avatar_url AS worker_avatar,
  wp.average_rating,
  wp.total_reviews,
  wp.city,
  wp.country,
  COUNT(DISTINCT ws.id) AS service_count
FROM
  worker_profiles wp
JOIN
  worker_services ws ON wp.id = ws.worker_id
JOIN
  service_categories sc ON ws.category_id = sc.id
WHERE
  wp.average_rating IS NOT NULL
  AND wp.is_available = TRUE
GROUP BY
  sc.id, sc.name, wp.id, wp.full_name, wp.avatar_url, wp.average_rating, wp.total_reviews, wp.city, wp.country
ORDER BY
  sc.name, wp.average_rating DESC, wp.total_reviews DESC;

-- View for featured services
CREATE OR REPLACE VIEW featured_services AS
SELECT
  ws.id,
  ws.title,
  ws.description,
  ws.price,
  ws.is_hourly,
  ws.avg_rating,
  sc.name AS category_name,
  sc.icon AS category_icon,
  wp.id AS worker_id,
  wp.full_name AS worker_name,
  wp.avatar_url AS worker_avatar,
  wp.average_rating AS worker_rating,
  ARRAY_AGG(DISTINCT sa.city) AS service_cities
FROM
  worker_services ws
JOIN
  worker_profiles wp ON ws.worker_id = wp.id
JOIN
  service_categories sc ON ws.category_id = sc.id
LEFT JOIN
  service_areas sa ON ws.id = sa.service_id
WHERE
  ws.is_featured = TRUE
  AND ws.is_active = TRUE
  AND wp.is_available = TRUE
GROUP BY
  ws.id, sc.name, sc.icon, wp.id, wp.full_name, wp.avatar_url, wp.average_rating
ORDER BY
  ws.avg_rating DESC NULLS LAST, wp.average_rating DESC NULLS LAST;

-- View for recent reviews
CREATE OR REPLACE VIEW recent_reviews AS
SELECT
  r.id,
  r.rating,
  r.comment,
  r.worker_response,
  r.created_at,
  b.id AS booking_id,
  ws.id AS service_id,
  ws.title AS service_title,
  wp.id AS worker_id,
  wp.full_name AS worker_name,
  wp.avatar_url AS worker_avatar,
  cp.id AS customer_id,
  cp.full_name AS customer_name,
  sc.name AS category_name
FROM
  reviews r
JOIN
  bookings b ON r.booking_id = b.id
JOIN
  worker_services ws ON b.service_id = ws.id
JOIN
  worker_profiles wp ON ws.worker_id = wp.id
JOIN
  customer_profiles cp ON b.customer_id = cp.id
JOIN
  service_categories sc ON ws.category_id = sc.id
ORDER BY
  r.created_at DESC;

-- View for service availability by day and time
CREATE OR REPLACE VIEW service_availability AS
SELECT
  ws.id AS service_id,
  ws.title AS service_title,
  wp.id AS worker_id,
  wp.full_name AS worker_name,
  wa.day_of_week,
  wa.start_time,
  wa.end_time,
  wa.is_available,
  sc.name AS category_name
FROM
  worker_services ws
JOIN
  worker_profiles wp ON ws.worker_id = wp.id
JOIN
  worker_availability wa ON wp.id = wa.worker_id
JOIN
  service_categories sc ON ws.category_id = sc.id
WHERE
  ws.is_active = TRUE
  AND wp.is_available = TRUE
ORDER BY
  ws.id, wa.day_of_week, wa.start_time;
