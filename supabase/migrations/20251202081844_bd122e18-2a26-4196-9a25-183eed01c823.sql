-- Create storage buckets for zone operations
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('zone-documents', 'zone-documents', false),
  ('campaign-materials', 'campaign-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for zone documents
CREATE POLICY "Allow authenticated users to upload zone documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'zone-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view zone documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'zone-documents');

CREATE POLICY "Allow authenticated users to delete zone documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'zone-documents');

-- Storage policies for campaign materials
CREATE POLICY "Allow public to view campaign materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-materials');

CREATE POLICY "Allow authenticated users to upload campaign materials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaign-materials' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete campaign materials"
ON storage.objects FOR DELETE
USING (bucket_id = 'campaign-materials');

-- Create zone_campaigns table
CREATE TABLE IF NOT EXISTS zone_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL, -- 'awareness', 'education', 'enforcement', 'incentive'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  budget NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'active', 'completed', 'cancelled'
  materials_urls TEXT[],
  target_households INTEGER,
  reached_households INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create zone_schedules table (collection calendars)
CREATE TABLE IF NOT EXISTS zone_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  collection_type TEXT NOT NULL, -- 'organic', 'recyclable', 'general', 'special'
  time_slot TEXT,
  truck_id UUID REFERENCES trucks(id),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create zone_notifications table (warnings, alerts)
CREATE TABLE IF NOT EXISTS zone_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'warning', 'alert', 'reminder', 'announcement'
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'households', 'drivers', 'admin'
  send_method TEXT[], -- ['app', 'email', 'sms', 'poster']
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'cancelled'
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create zone_reports table
CREATE TABLE IF NOT EXISTS zone_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'annual', 'custom'
  report_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  report_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  total_collections INTEGER,
  total_weight_kg NUMERIC(10, 2),
  participation_rate NUMERIC(5, 2),
  contamination_rate NUMERIC(5, 2),
  households_active INTEGER,
  households_total INTEGER,
  report_data JSONB, -- Detailed metrics and charts data
  generated_by TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  report_url TEXT
);

-- Create zone_documents table
CREATE TABLE IF NOT EXISTS zone_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'map', 'report', 'flyer', 'contract', 'compliance', 'other'
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tags TEXT[]
);

-- Enable RLS
ALTER TABLE zone_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to campaigns"
  ON zone_campaigns FOR SELECT USING (true);

CREATE POLICY "Allow public insert campaigns"
  ON zone_campaigns FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update campaigns"
  ON zone_campaigns FOR UPDATE USING (true);

CREATE POLICY "Allow public delete campaigns"
  ON zone_campaigns FOR DELETE USING (true);

CREATE POLICY "Allow public read access to schedules"
  ON zone_schedules FOR SELECT USING (true);

CREATE POLICY "Allow public insert schedules"
  ON zone_schedules FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update schedules"
  ON zone_schedules FOR UPDATE USING (true);

CREATE POLICY "Allow public delete schedules"
  ON zone_schedules FOR DELETE USING (true);

CREATE POLICY "Allow public read access to notifications"
  ON zone_notifications FOR SELECT USING (true);

CREATE POLICY "Allow public insert notifications"
  ON zone_notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update notifications"
  ON zone_notifications FOR UPDATE USING (true);

CREATE POLICY "Allow public delete notifications"
  ON zone_notifications FOR DELETE USING (true);

CREATE POLICY "Allow public read access to reports"
  ON zone_reports FOR SELECT USING (true);

CREATE POLICY "Allow public insert reports"
  ON zone_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to documents"
  ON zone_documents FOR SELECT USING (true);

CREATE POLICY "Allow public insert documents"
  ON zone_documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete documents"
  ON zone_documents FOR DELETE USING (true);

-- Create indexes
CREATE INDEX idx_campaigns_zone ON zone_campaigns(zone_id);
CREATE INDEX idx_campaigns_status ON zone_campaigns(status);
CREATE INDEX idx_schedules_zone ON zone_schedules(zone_id);
CREATE INDEX idx_schedules_active ON zone_schedules(is_active);
CREATE INDEX idx_notifications_zone ON zone_notifications(zone_id);
CREATE INDEX idx_notifications_status ON zone_notifications(status);
CREATE INDEX idx_reports_zone ON zone_reports(zone_id);
CREATE INDEX idx_documents_zone ON zone_documents(zone_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_zone_operations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON zone_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_zone_operations_updated_at();

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON zone_schedules
    FOR EACH ROW EXECUTE FUNCTION update_zone_operations_updated_at();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON zone_notifications
    FOR EACH ROW EXECUTE FUNCTION update_zone_operations_updated_at();