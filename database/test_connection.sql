-- Test script to verify database connection and PostGIS setup
-- Run this after setting up the database to verify everything works

-- Test 1: Check PostGIS extension
SELECT PostGIS_version();

-- Test 2: Check if quotes table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'quotes';

-- Test 3: Test distance calculation with sample coordinates
-- Toronto, ON (approximately)
SELECT ST_SetSRID(ST_MakePoint(-79.3832, 43.6532), 4326)::geography AS toronto_coord;

-- Vancouver, BC (approximately)
SELECT ST_SetSRID(ST_MakePoint(-123.1216, 49.2827), 4326)::geography AS vancouver_coord;

-- Test 4: Calculate distance between Toronto and Vancouver
SELECT 
    ST_Distance(
        ST_SetSRID(ST_MakePoint(-79.3832, 43.6532), 4326)::geography,
        ST_SetSRID(ST_MakePoint(-123.1216, 49.2827), 4326)::geography
    ) / 1000.0 AS distance_km,
    (ST_Distance(
        ST_SetSRID(ST_MakePoint(-79.3832, 43.6532), 4326)::geography,
        ST_SetSRID(ST_MakePoint(-123.1216, 49.2827), 4326)::geography
    ) / 1000.0) * 0.621371 AS distance_miles;

-- Test 5: Insert a sample quote (if table exists)
INSERT INTO quotes (
    origin_city,
    origin_postal_code,
    origin_state_province,
    origin_country,
    origin_coordinates,
    destination_city,
    destination_postal_code,
    destination_state_province,
    destination_country,
    destination_coordinates,
    equipment_type,
    total_weight,
    pickup_date,
    distance_kilometers,
    distance_miles,
    quote_amount
) VALUES (
    'Toronto',
    'M5H 2N2',
    'ON',
    'CA',
    ST_SetSRID(ST_MakePoint(-79.3832, 43.6532), 4326)::geography,
    'Vancouver',
    'V6B 1A1',
    'BC',
    'CA',
    ST_SetSRID(ST_MakePoint(-123.1216, 49.2827), 4326)::geography,
    'dry van',
    10000.00,
    '2024-03-15',
    3362.00,
    2089.00,
    2500.00
);

-- Test 6: Query the sample quote
SELECT * FROM quotes WHERE origin_city = 'Toronto' AND destination_city = 'Vancouver';

-- Test 7: Check if lane was auto-generated
SELECT lane FROM quotes WHERE origin_city = 'Toronto';

-- Clean up test data (optional)
-- DELETE FROM quotes WHERE origin_city = 'Toronto' AND destination_city = 'Vancouver';

