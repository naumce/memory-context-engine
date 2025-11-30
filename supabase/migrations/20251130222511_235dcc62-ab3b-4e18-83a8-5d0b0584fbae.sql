-- Enable RLS on all tables
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Create public read policies for dashboard access
-- Zones
CREATE POLICY "Allow public read access to zones"
  ON public.zones
  FOR SELECT
  USING (true);

-- Trucks
CREATE POLICY "Allow public read access to trucks"
  ON public.trucks
  FOR SELECT
  USING (true);

-- Drivers
CREATE POLICY "Allow public read access to drivers"
  ON public.drivers
  FOR SELECT
  USING (true);

-- Households
CREATE POLICY "Allow public read access to households"
  ON public.households
  FOR SELECT
  USING (true);

-- Bins
CREATE POLICY "Allow public read access to bins"
  ON public.bins
  FOR SELECT
  USING (true);

-- Collections
CREATE POLICY "Allow public read access to collections"
  ON public.collections
  FOR SELECT
  USING (true);