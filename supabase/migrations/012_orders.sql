-- Orders (الطلبات)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  project_name TEXT,
  project_type TEXT,
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  style_id UUID REFERENCES design_styles(id),
  service_id UUID REFERENCES services(id),
  project_area NUMERIC,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'SA',
  project_notes TEXT,
  price_per_sqm NUMERIC,
  subtotal NUMERIC,
  global_discount_value NUMERIC DEFAULT 0,
  global_discount_pct NUMERIC DEFAULT 0,
  coupon_id UUID,
  coupon_code TEXT,
  coupon_discount_value NUMERIC DEFAULT 0,
  addons_total NUMERIC DEFAULT 0,
  final_total NUMERIC,
  currency TEXT NOT NULL DEFAULT 'SAR',
  selected_addons JSONB DEFAULT '[]',
  uploaded_files JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','under_review','approved','rejected','in_progress','completed','cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','paid','partial','refunded')),
  pdf_url TEXT,
  pdf_public_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items (عناصر الطلب)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  option_id UUID REFERENCES pricing_options(id),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Order Attachments (مرفقات الطلب)
CREATE TABLE IF NOT EXISTS order_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_attachments_order ON order_attachments(order_id);

-- Order Timeline (الجدول الزمني)
CREATE TABLE IF NOT EXISTS order_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  label TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  actor_name TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_timeline_order ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_order_timeline_created ON order_timeline(created_at DESC);

-- Order Notes (ملاحظات الطلب)
CREATE TABLE IF NOT EXISTS order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id),
  admin_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_notes_order ON order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_created ON order_notes(created_at DESC);

-- Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;

-- Public: insert orders (public form), view own order
CREATE POLICY "Public can insert orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view own order"
  ON orders FOR SELECT
  USING (customer_email = current_user OR auth.role() = 'authenticated');

CREATE POLICY "System can insert order_timeline"
  ON order_timeline FOR INSERT WITH CHECK (true);

-- Admins full access
CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage order_items"
  ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage order_attachments"
  ON order_attachments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage order_timeline"
  ON order_timeline FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage order_notes"
  ON order_notes FOR ALL USING (auth.role() = 'authenticated');

-- Foreign Keys (must be after both tables exist)
ALTER TABLE orders ADD CONSTRAINT fk_orders_coupon
  FOREIGN KEY (coupon_id) REFERENCES coupons(id);

ALTER TABLE coupon_usage ADD CONSTRAINT fk_coupon_usage_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
