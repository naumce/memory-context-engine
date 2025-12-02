-- Create collection_points table for trash islands
CREATE TABLE IF NOT EXISTS public.collection_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  point_type TEXT NOT NULL DEFAULT 'island',
  capacity INTEGER DEFAULT 10,
  current_bins INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collection_points
CREATE POLICY "Allow public read access to collection_points"
  ON public.collection_points FOR SELECT
  USING (true);

CREATE POLICY "Allow public to insert collection_points"
  ON public.collection_points FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update collection_points"
  ON public.collection_points FOR UPDATE
  USING (true);

CREATE POLICY "Allow public to delete collection_points"
  ON public.collection_points FOR DELETE
  USING (true);

-- Add collection_point_id to bins table (bins can belong to either household OR collection point)
ALTER TABLE public.bins 
  ADD COLUMN IF NOT EXISTS collection_point_id UUID REFERENCES public.collection_points(id) ON DELETE SET NULL;

-- Make household_id nullable since bins can belong to collection points instead
ALTER TABLE public.bins 
  ALTER COLUMN household_id DROP NOT NULL;

-- Add check constraint: bin must belong to either household OR collection point, not both
ALTER TABLE public.bins
  ADD CONSTRAINT bins_assignment_check 
  CHECK (
    (household_id IS NOT NULL AND collection_point_id IS NULL) OR
    (household_id IS NULL AND collection_point_id IS NOT NULL)
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_collection_points_zone ON public.collection_points(zone_id);
CREATE INDEX IF NOT EXISTS idx_bins_collection_point ON public.bins(collection_point_id);

-- Add realtime for collection_points
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_points;

-- Create function to auto-generate QR codes for bins
CREATE OR REPLACE FUNCTION generate_bin_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL OR NEW.qr_code = '' THEN
    NEW.qr_code := 'BIN-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating QR codes
DROP TRIGGER IF EXISTS bins_qr_code_trigger ON public.bins;
CREATE TRIGGER bins_qr_code_trigger
  BEFORE INSERT ON public.bins
  FOR EACH ROW
  EXECUTE FUNCTION generate_bin_qr_code();