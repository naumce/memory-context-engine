-- Create function to update zone boundary from GeoJSON
CREATE OR REPLACE FUNCTION public.update_zone_boundary(
  zone_id UUID,
  boundary_geojson TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE zones
  SET boundary = ST_GeomFromGeoJSON(boundary_geojson)
  WHERE id = zone_id;
END;
$$;