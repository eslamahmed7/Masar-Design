-- Design Styles (الأنماط التصميمية)
CREATE TABLE IF NOT EXISTS design_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  icon TEXT,
  description TEXT,
  preview_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_design_styles_status ON design_styles(status);
CREATE INDEX IF NOT EXISTS idx_design_styles_sort ON design_styles(sort_order);

ALTER TABLE design_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read design_styles"
  ON design_styles FOR SELECT USING (true);
CREATE POLICY "Admins can manage design_styles"
  ON design_styles FOR ALL USING (auth.role() = 'authenticated');
