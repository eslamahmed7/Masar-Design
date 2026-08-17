-- Services (الخدمات)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  short_description TEXT,
  long_description TEXT,
  cover_image_url TEXT,
  icon TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden')),
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Service Pricing (أسعار الخدمات)
CREATE TABLE IF NOT EXISTS service_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('per_sqm','fixed','custom','quote')),
  price_per_sqm NUMERIC,
  min_area NUMERIC,
  max_area NUMERIC,
  min_order_value NUMERIC,
  fixed_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'SAR',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pricing Options (إضافات الخدمات)
CREATE TABLE IF NOT EXISTS pricing_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  price NUMERIC NOT NULL,
  price_type TEXT NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed','percentage')),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(is_featured);
CREATE INDEX IF NOT EXISTS idx_services_sort ON services(sort_order);
CREATE INDEX IF NOT EXISTS idx_service_pricing_service ON service_pricing(service_id);
CREATE INDEX IF NOT EXISTS idx_pricing_options_service ON pricing_options(service_id);
CREATE INDEX IF NOT EXISTS idx_pricing_options_active ON pricing_options(is_active);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read services"
  ON services FOR SELECT USING (true);
CREATE POLICY "Public can read service_pricing"
  ON service_pricing FOR SELECT USING (true);
CREATE POLICY "Public can read pricing_options"
  ON pricing_options FOR SELECT USING (true);
CREATE POLICY "Admins can manage services"
  ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage service_pricing"
  ON service_pricing FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage pricing_options"
  ON pricing_options FOR ALL USING (auth.role() = 'authenticated');
