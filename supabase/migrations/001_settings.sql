-- Settings (إعدادات الموقع)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT,
  company_name_ar TEXT,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  address_ar TEXT,
  google_maps_url TEXT,
  working_hours TEXT,
  working_hours_ar TEXT,
  social_links JSONB DEFAULT '{}',
  default_currency TEXT DEFAULT 'SAR',
  price_unit TEXT,
  terms_conditions TEXT,
  terms_conditions_ar TEXT,
  privacy_policy TEXT,
  privacy_policy_ar TEXT,
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Everyone can read settings"
  ON settings FOR SELECT
  USING (true);

-- Allow authenticated admins to update
CREATE POLICY "Admins can update settings"
  ON settings FOR ALL
  USING (auth.role() = 'authenticated');
