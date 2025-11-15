-- Shipment Quote Calculator Database Schema
-- PostgreSQL with PostGIS extension

-- Enable PostGIS extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    
    -- Origin location
    origin_city VARCHAR(100) NOT NULL,
    origin_postal_code VARCHAR(20), -- OPTIONAL but recommended for accurate distance calculation
    -- Note: Postal codes improve accuracy, especially in large cities (e.g., NYC has 100+ ZIP codes)
    -- When postal code is provided: geocoding uses specific postal code location (more accurate)
    -- When postal code is NOT provided: geocoding uses city center (approximate quote)
    -- Both options are valid - use postal code for precise quotes, skip for quick estimates
    origin_state_province VARCHAR(50),
    origin_country VARCHAR(2) NOT NULL, -- US, CA, MX
    origin_coordinates GEOGRAPHY(POINT, 4326), -- PostGIS geography type for lat/lng
    -- Coordinates are geocoded from postal code (if provided) or city center (fallback for approximate quotes)
    -- Distance calculation uses these coordinates - postal code = more accurate, city center = approximate
    
    -- Destination location
    destination_city VARCHAR(100) NOT NULL,
    destination_postal_code VARCHAR(20), -- OPTIONAL but recommended for accurate distance calculation
    -- Note: Postal codes improve accuracy, especially in large cities (e.g., NYC has 100+ ZIP codes)
    -- When postal code is provided: geocoding uses specific postal code location (more accurate)
    -- When postal code is NOT provided: geocoding uses city center (approximate quote)
    -- Both options are valid - use postal code for precise quotes, skip for quick estimates
    destination_state_province VARCHAR(50),
    destination_country VARCHAR(2) NOT NULL, -- US, CA, MX
    destination_coordinates GEOGRAPHY(POINT, 4326), -- PostGIS geography type for lat/lng
    -- Coordinates are geocoded from postal code (if provided) or city center (fallback for approximate quotes)
    -- Distance calculation uses these coordinates - postal code = more accurate, city center = approximate
    
    -- Lane (computed field - can be generated from origin + destination)
    lane VARCHAR(255), -- e.g., "Toronto, ON → Vancouver, BC"
    
    -- Shipment details
    equipment_type VARCHAR(20) NOT NULL CHECK (equipment_type IN ('dry_van', 'reefer', 'flatbed', 'step_deck', 'hotshot', 'straight_truck')),
    total_weight DECIMAL(10, 2), -- in pounds or kilograms
    pickup_date DATE,
    
    -- Calculated fields
    distance_miles DECIMAL(10, 2), -- distance in miles
    distance_kilometers DECIMAL(10, 2), -- distance in kilometers
    quote_amount DECIMAL(10, 2) NOT NULL, -- calculated quote price
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quotes_origin_city ON quotes(origin_city);
CREATE INDEX IF NOT EXISTS idx_quotes_destination_city ON quotes(destination_city);
CREATE INDEX IF NOT EXISTS idx_quotes_origin_postal_code ON quotes(origin_postal_code);
CREATE INDEX IF NOT EXISTS idx_quotes_destination_postal_code ON quotes(destination_postal_code);
CREATE INDEX IF NOT EXISTS idx_quotes_equipment_type ON quotes(equipment_type);
CREATE INDEX IF NOT EXISTS idx_quotes_pickup_date ON quotes(pickup_date);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_lane ON quotes(lane);

-- Spatial indexes for PostGIS geography columns (for distance queries)
CREATE INDEX IF NOT EXISTS idx_quotes_origin_coordinates ON quotes USING GIST(origin_coordinates);
CREATE INDEX IF NOT EXISTS idx_quotes_destination_coordinates ON quotes USING GIST(destination_coordinates);

-- Function to automatically update the lane field
CREATE OR REPLACE FUNCTION update_lane()
RETURNS TRIGGER AS $$
BEGIN
    NEW.lane := NEW.origin_city || ', ' || COALESCE(NEW.origin_state_province, '') || 
                ' → ' || 
                NEW.destination_city || ', ' || COALESCE(NEW.destination_state_province, '');
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update lane and updated_at
CREATE TRIGGER trigger_update_lane
    BEFORE INSERT OR UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_lane();

-- Function to calculate distance between two points (in kilometers)
CREATE OR REPLACE FUNCTION calculate_distance(
    origin_coord GEOGRAPHY,
    dest_coord GEOGRAPHY
)
RETURNS DECIMAL AS $$
BEGIN
    IF origin_coord IS NULL OR dest_coord IS NULL THEN
        RETURN NULL;
    END IF;
    -- ST_Distance returns distance in meters, convert to kilometers
    RETURN ST_Distance(origin_coord, dest_coord) / 1000.0;
END;
$$ LANGUAGE plpgsql;

-- View for quotes with calculated distance (if coordinates are available)
CREATE OR REPLACE VIEW quotes_with_distance AS
SELECT 
    q.*,
    CASE 
        WHEN q.origin_coordinates IS NOT NULL AND q.destination_coordinates IS NOT NULL 
        THEN ST_Distance(q.origin_coordinates, q.destination_coordinates) / 1000.0
        ELSE NULL
    END AS calculated_distance_km,
    CASE 
        WHEN q.origin_coordinates IS NOT NULL AND q.destination_coordinates IS NOT NULL 
        THEN (ST_Distance(q.origin_coordinates, q.destination_coordinates) / 1000.0) * 0.621371
        ELSE NULL
    END AS calculated_distance_miles
FROM quotes q;

-- Comments for documentation
COMMENT ON TABLE quotes IS 'Stores shipment quote requests and calculations';
COMMENT ON COLUMN quotes.origin_postal_code IS 'Postal/ZIP code - OPTIONAL. When provided, geocoding uses specific postal code location for accurate distance calculation. When omitted, uses city center for approximate quote. Both options are valid depending on user needs.';
COMMENT ON COLUMN quotes.destination_postal_code IS 'Postal/ZIP code - OPTIONAL. When provided, geocoding uses specific postal code location for accurate distance calculation. When omitted, uses city center for approximate quote. Both options are valid depending on user needs.';
COMMENT ON COLUMN quotes.origin_coordinates IS 'PostGIS geography point for origin location (lat/lng). Geocoded from postal code (if provided, more accurate) or city center (if omitted, approximate). Supports both precise and approximate quote calculations.';
COMMENT ON COLUMN quotes.destination_coordinates IS 'PostGIS geography point for destination location (lat/lng). Geocoded from postal code (if provided, more accurate) or city center (if omitted, approximate). Supports both precise and approximate quote calculations.';
COMMENT ON COLUMN quotes.lane IS 'Computed field: origin → destination route';
COMMENT ON COLUMN quotes.distance_miles IS 'Calculated distance in miles using PostGIS ST_Distance between origin_coordinates and destination_coordinates';
COMMENT ON COLUMN quotes.distance_kilometers IS 'Calculated distance in kilometers using PostGIS ST_Distance between origin_coordinates and destination_coordinates';
COMMENT ON COLUMN quotes.equipment_type IS 'Type of equipment: dry van, reefer, or flatbed';

