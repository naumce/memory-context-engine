-- Enable PostGIS for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Zones table (collection areas)
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pilot', 'inactive')),
  households_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Drivers table (waste collection workers)
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_break')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trucks table (fleet vehicles)
CREATE TABLE public.trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id TEXT NOT NULL UNIQUE,
  license_plate TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'standard' CHECK (type IN ('standard', 'compact', 'heavy')),
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'maintenance', 'charging')),
  battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  current_driver_id UUID REFERENCES public.drivers(id),
  current_zone_id UUID REFERENCES public.zones(id),
  last_location GEOGRAPHY(POINT),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Households table (registered residents)
CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES public.zones(id) NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT),
  contact_name TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  participation_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bins table (waste containers at each household)
CREATE TABLE public.bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES public.households(id) NOT NULL,
  qr_code TEXT NOT NULL UNIQUE,
  bin_type TEXT NOT NULL CHECK (bin_type IN ('recyclable', 'organic', 'general', 'glass', 'plastic', 'paper')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'damaged', 'missing', 'full')),
  fill_level INTEGER DEFAULT 0 CHECK (fill_level >= 0 AND fill_level <= 100),
  last_collection TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Collections table (log every pickup)
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id UUID REFERENCES public.bins(id) NOT NULL,
  truck_id UUID REFERENCES public.trucks(id) NOT NULL,
  driver_id UUID REFERENCES public.drivers(id) NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  weight_kg DECIMAL(10,2),
  photo_url TEXT,
  contamination_level TEXT CHECK (contamination_level IN ('clean', 'minor', 'major', 'rejected')),
  notes TEXT,
  location GEOGRAPHY(POINT),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admins can see everything, drivers can see assigned data)
CREATE POLICY "Allow authenticated users to read zones"
  ON public.zones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read drivers"
  ON public.drivers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow drivers to update their own profile"
  ON public.drivers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow authenticated users to read trucks"
  ON public.trucks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read households"
  ON public.households FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read bins"
  ON public.bins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read collections"
  ON public.collections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create collections"
  ON public.collections FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON public.zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON public.trucks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bins_updated_at BEFORE UPDATE ON public.bins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();