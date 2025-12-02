-- Add geometry column to zones table for storing zone boundaries
ALTER TABLE zones ADD COLUMN IF NOT EXISTS boundary geometry(Polygon, 4326);

-- Create spatial index for better performance
CREATE INDEX IF NOT EXISTS zones_boundary_idx ON zones USING GIST (boundary);

-- Add area calculation function
CREATE OR REPLACE FUNCTION calculate_zone_area(zone_id uuid)
RETURNS numeric AS $$
DECLARE
  area_sqm numeric;
BEGIN
  SELECT ST_Area(boundary::geography) INTO area_sqm
  FROM zones
  WHERE id = zone_id;
  
  RETURN COALESCE(area_sqm, 0);
END;
$$ LANGUAGE plpgsql;

-- Add function to check if point is in zone
CREATE OR REPLACE FUNCTION point_in_zone(lat numeric, lng numeric, zone_id uuid)
RETURNS boolean AS $$
DECLARE
  is_inside boolean;
BEGIN
  SELECT ST_Contains(
    boundary,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)
  ) INTO is_inside
  FROM zones
  WHERE id = zone_id;
  
  RETURN COALESCE(is_inside, false);
END;
$$ LANGUAGE plpgsql;