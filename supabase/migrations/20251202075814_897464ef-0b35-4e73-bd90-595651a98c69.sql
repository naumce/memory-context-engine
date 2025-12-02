-- Fix function search paths
DROP FUNCTION IF EXISTS calculate_zone_area(uuid);
CREATE OR REPLACE FUNCTION calculate_zone_area(zone_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  area_sqm numeric;
BEGIN
  SELECT ST_Area(boundary::geography) INTO area_sqm
  FROM zones
  WHERE id = zone_id;
  
  RETURN COALESCE(area_sqm, 0);
END;
$$;

DROP FUNCTION IF EXISTS point_in_zone(numeric, numeric, uuid);
CREATE OR REPLACE FUNCTION point_in_zone(lat numeric, lng numeric, zone_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Add RLS policies for zones table CRUD operations
CREATE POLICY "Allow public to insert zones"
  ON zones FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update zones"
  ON zones FOR UPDATE
  USING (true);

CREATE POLICY "Allow public to delete zones"
  ON zones FOR DELETE
  USING (true);

-- Add RLS policies for other tables that need INSERT/UPDATE/DELETE
CREATE POLICY "Allow public to insert bins"
  ON bins FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update bins"
  ON bins FOR UPDATE
  USING (true);

CREATE POLICY "Allow public to delete bins"
  ON bins FOR DELETE
  USING (true);

CREATE POLICY "Allow public to insert households"
  ON households FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update households"
  ON households FOR UPDATE
  USING (true);

CREATE POLICY "Allow public to delete households"
  ON households FOR DELETE
  USING (true);

CREATE POLICY "Allow public to update collections"
  ON collections FOR UPDATE
  USING (true);

CREATE POLICY "Allow public to delete collections"
  ON collections FOR DELETE
  USING (true);

CREATE POLICY "Allow public to insert trucks"
  ON trucks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update trucks"
  ON trucks FOR UPDATE
  USING (true);

CREATE POLICY "Allow public to delete trucks"
  ON trucks FOR DELETE
  USING (true);

CREATE POLICY "Allow public to insert drivers"
  ON drivers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to delete drivers"
  ON drivers FOR DELETE
  USING (true);