-- PDF Records (سجل الفواتير المُنشأة)
CREATE TABLE IF NOT EXISTS pdf_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ DEFAULT now(),
  is_regenerated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_pdf_records_order ON pdf_records(order_id);
CREATE INDEX IF NOT EXISTS idx_pdf_records_generated ON pdf_records(generated_at DESC);

ALTER TABLE pdf_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pdf_records"
  ON pdf_records FOR ALL USING (auth.role() = 'authenticated');
