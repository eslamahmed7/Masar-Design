-- Coupons (كوبونات الخصم)
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC NOT NULL,
  max_discount NUMERIC,
  min_order_value NUMERIC,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  applicable_services TEXT[] DEFAULT '{}',
  applicable_categories TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coupon Usage History (سجل استخدام الكوبونات)
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL,
  order_id UUID,
  customer_email TEXT,
  discount_value NUMERIC NOT NULL,
  order_total NUMERIC,
  used_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order ON coupon_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_date ON coupon_usage(used_at DESC);

-- Global Promotions (العروض العامة)
CREATE TABLE IF NOT EXISTS global_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  discount_value NUMERIC NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  applicable_to TEXT NOT NULL DEFAULT 'all' CHECK (applicable_to IN ('all','category','service')),
  applicable_ids TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  show_banner BOOLEAN DEFAULT false,
  banner_text TEXT,
  banner_color TEXT NOT NULL DEFAULT '#C8A97E',
  enable_countdown BOOLEAN DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_global_promotions_active ON global_promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_global_promotions_dates ON global_promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_global_promotions_priority ON global_promotions(priority DESC);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_promotions ENABLE ROW LEVEL SECURITY;

-- Public can read active promotions
CREATE POLICY "Public can read active global_promotions"
  ON global_promotions FOR SELECT
  USING (is_active = true);

-- Admins full access
CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage coupon_usage"
  ON coupon_usage FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage global_promotions"
  ON global_promotions FOR ALL USING (auth.role() = 'authenticated');
