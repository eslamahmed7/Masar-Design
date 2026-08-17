-- ============================================================================
-- COMPLETE MASAR DATABASE SCHEMA
-- ============================================================================
-- Run this entire file in the Supabase SQL Editor (top to bottom, one shot).
-- It creates all tables, indexes, RLS policies, functions, triggers, and views.
-- Safe for re-runs (uses IF NOT EXISTS / OR REPLACE / DROP IF EXISTS).
-- ============================================================================

-- ############################################################################
-- 001 — SETTINGS
-- ############################################################################
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

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read settings" ON settings;
CREATE POLICY "Everyone can read settings"
  ON settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON settings;
CREATE POLICY "Admins can update settings"
  ON settings FOR ALL
  USING (auth.role() = 'authenticated');

-- ############################################################################
-- 002 — NOTIFICATIONS
-- ############################################################################
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  message TEXT,
  message_ar TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read notifications" ON notifications;
CREATE POLICY "Admins can read notifications"
  ON notifications FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;
CREATE POLICY "Admins can update notifications"
  ON notifications FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;
CREATE POLICY "Admins can delete notifications"
  ON notifications FOR DELETE
  USING (auth.role() = 'authenticated');

-- ############################################################################
-- 003 — ACTIVITY LOGS
-- ############################################################################
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  admin_name TEXT,
  action TEXT NOT NULL,
  action_label TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target ON activity_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read activity logs" ON activity_logs;
CREATE POLICY "Admins can read activity logs"
  ON activity_logs FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "System can insert activity logs" ON activity_logs;
CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);

-- ############################################################################
-- 004 — ADMIN USERS
-- ############################################################################
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own record" ON admin_users;
CREATE POLICY "Users can read own record"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;
CREATE POLICY "Admins can manage admin_users"
  ON admin_users FOR ALL
  USING (auth.role() = 'authenticated');

-- ############################################################################
-- 005 — STORAGE BUCKET (order-pdfs)
-- ############################################################################
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-pdfs', 'order-pdfs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read PDFs" ON storage.objects;
CREATE POLICY "Public can read PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'order-pdfs');

DROP POLICY IF EXISTS "Admins can upload PDFs" ON storage.objects;
CREATE POLICY "Admins can upload PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-pdfs' AND
    auth.role() = 'authenticated'
  );

-- ############################################################################
-- 006 — CATEGORIES & SUBCATEGORIES
-- ############################################################################
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  icon TEXT,
  description TEXT,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT,
  icon TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read subcategories" ON subcategories;
CREATE POLICY "Public can read subcategories"
  ON subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage subcategories" ON subcategories;
CREATE POLICY "Admins can manage subcategories"
  ON subcategories FOR ALL USING (auth.role() = 'authenticated');

-- ############################################################################
-- 007 — DESIGN STYLES
-- ############################################################################
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

DROP POLICY IF EXISTS "Public can read design_styles" ON design_styles;
CREATE POLICY "Public can read design_styles"
  ON design_styles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage design_styles" ON design_styles;
CREATE POLICY "Admins can manage design_styles"
  ON design_styles FOR ALL USING (auth.role() = 'authenticated');

-- ############################################################################
-- 008 — SERVICES, SERVICE PRICING & PRICING OPTIONS
-- ############################################################################
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

DROP POLICY IF EXISTS "Public can read services" ON services;
CREATE POLICY "Public can read services"
  ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read service_pricing" ON service_pricing;
CREATE POLICY "Public can read service_pricing"
  ON service_pricing FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read pricing_options" ON pricing_options;
CREATE POLICY "Public can read pricing_options"
  ON pricing_options FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Admins can manage services"
  ON services FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage service_pricing" ON service_pricing;
CREATE POLICY "Admins can manage service_pricing"
  ON service_pricing FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage pricing_options" ON pricing_options;
CREATE POLICY "Admins can manage pricing_options"
  ON pricing_options FOR ALL USING (auth.role() = 'authenticated');

-- ############################################################################
-- 009 — PROJECTS & PROJECT GALLERY
-- ############################################################################
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  location TEXT,
  area NUMERIC,
  category TEXT,
  subcategory TEXT,
  style TEXT,
  completion_year INTEGER,
  client_type TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived','hidden')),
  is_featured BOOLEAN DEFAULT false,
  has_360 BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  short_description TEXT,
  full_description TEXT,
  highlights TEXT[] DEFAULT '{}',
  materials TEXT[] DEFAULT '{}',
  lighting TEXT[] DEFAULT '{}',
  furniture TEXT[] DEFAULT '{}',
  design_notes TEXT,
  cover_image_url TEXT,
  cover_image_public_id TEXT,
  video_url TEXT,
  video_public_id TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  og_image_url TEXT,
  canonical_url TEXT,
  show_in_portfolio BOOLEAN DEFAULT true,
  show_on_home BOOLEAN DEFAULT false,
  enable_likes BOOLEAN DEFAULT true,
  enable_gallery BOOLEAN DEFAULT true,
  enable_video BOOLEAN DEFAULT false,
  enable_360 BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  tour360 JSONB,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS project_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  public_id TEXT,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  format TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_show_home ON projects(show_on_home);
CREATE INDEX IF NOT EXISTS idx_projects_show_portfolio ON projects(show_in_portfolio);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_360 ON projects(has_360);
CREATE INDEX IF NOT EXISTS idx_project_gallery_project ON project_gallery(project_id);
CREATE INDEX IF NOT EXISTS idx_project_gallery_sort ON project_gallery(sort_order);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published projects" ON projects;
CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Public can read project_gallery" ON project_gallery;
CREATE POLICY "Public can read project_gallery"
  ON project_gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
CREATE POLICY "Admins can manage projects"
  ON projects FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage project_gallery" ON project_gallery;
CREATE POLICY "Admins can manage project_gallery"
  ON project_gallery FOR ALL USING (auth.role() = 'authenticated');

-- ############################################################################
-- 010 — 360 TOUR (rooms, floor plan, hotspots)
-- ############################################################################
CREATE TABLE IF NOT EXISTS tour_360_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tour_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tour_360_projects(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  thumbnail TEXT,
  panorama TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_rooms_tour ON tour_rooms(tour_id);

CREATE TABLE IF NOT EXISTS floor_plan_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tour_360_projects(id) ON DELETE CASCADE,
  room_id UUID REFERENCES tour_rooms(id) ON DELETE SET NULL,
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  w NUMERIC NOT NULL,
  h NUMERIC NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_floor_plan_tour ON floor_plan_rooms(tour_id);

CREATE TABLE IF NOT EXISTS tour_hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES tour_rooms(id) ON DELETE CASCADE,
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('navigate','info')),
  target_room_id UUID REFERENCES tour_rooms(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_hotspots_room ON tour_hotspots(room_id);

ALTER TABLE tour_360_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plan_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_hotspots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read tour_360_projects" ON tour_360_projects;
CREATE POLICY "Public can read tour_360_projects"
  ON tour_360_projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read tour_rooms" ON tour_rooms;
CREATE POLICY "Public can read tour_rooms"
  ON tour_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read floor_plan_rooms" ON floor_plan_rooms;
CREATE POLICY "Public can read floor_plan_rooms"
  ON floor_plan_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read tour_hotspots" ON tour_hotspots;
CREATE POLICY "Public can read tour_hotspots"
  ON tour_hotspots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage tour_360_projects" ON tour_360_projects;
CREATE POLICY "Admins can manage tour_360_projects"
  ON tour_360_projects FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage tour_rooms" ON tour_rooms;
CREATE POLICY "Admins can manage tour_rooms"
  ON tour_rooms FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage floor_plan_rooms" ON floor_plan_rooms;
CREATE POLICY "Admins can manage floor_plan_rooms"
  ON floor_plan_rooms FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage tour_hotspots" ON tour_hotspots;
CREATE POLICY "Admins can manage tour_hotspots"
  ON tour_hotspots FOR ALL USING (auth.role() = 'authenticated');

-- ############################################################################
-- 011 — COUPONS, COUPON USAGE & GLOBAL PROMOTIONS
-- ############################################################################
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

DROP POLICY IF EXISTS "Public can read active global_promotions" ON global_promotions;
CREATE POLICY "Public can read active global_promotions"
  ON global_promotions FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage coupon_usage" ON coupon_usage;
CREATE POLICY "Admins can manage coupon_usage"
  ON coupon_usage FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage global_promotions" ON global_promotions;
CREATE POLICY "Admins can manage global_promotions"
  ON global_promotions FOR ALL USING (auth.role() = 'authenticated');

-- ############################################################################
-- 012 — ORDERS, ORDER ITEMS, ATTACHMENTS, TIMELINE, NOTES
-- ############################################################################
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

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  option_id UUID REFERENCES pricing_options(id),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

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

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert orders" ON orders;
CREATE POLICY "Public can insert orders"
  ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view own order" ON orders;
CREATE POLICY "Public can view own order"
  ON orders FOR SELECT
  USING (customer_email = current_user OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "System can insert order_timeline" ON order_timeline;
CREATE POLICY "System can insert order_timeline"
  ON order_timeline FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage order_items" ON order_items;
CREATE POLICY "Admins can manage order_items"
  ON order_items FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage order_attachments" ON order_attachments;
CREATE POLICY "Admins can manage order_attachments"
  ON order_attachments FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage order_timeline" ON order_timeline;
CREATE POLICY "Admins can manage order_timeline"
  ON order_timeline FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage order_notes" ON order_notes;
CREATE POLICY "Admins can manage order_notes"
  ON order_notes FOR ALL USING (auth.role() = 'authenticated');

-- Foreign keys that depend on tables created above (coupons, orders)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_coupon;
ALTER TABLE orders ADD CONSTRAINT fk_orders_coupon
  FOREIGN KEY (coupon_id) REFERENCES coupons(id);

ALTER TABLE coupon_usage DROP CONSTRAINT IF EXISTS fk_coupon_usage_order;
ALTER TABLE coupon_usage ADD CONSTRAINT fk_coupon_usage_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- ############################################################################
-- 013 — PDF RECORDS
-- ############################################################################
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

DROP POLICY IF EXISTS "Admins can manage pdf_records" ON pdf_records;
CREATE POLICY "Admins can manage pdf_records"
  ON pdf_records FOR ALL USING (auth.role() = 'authenticated');

-- ############################################################################
-- 014 — FULL-TEXT SEARCH
-- ############################################################################
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION projects_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.full_description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_search ON projects;
CREATE TRIGGER trg_projects_search
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION projects_search_update();

ALTER TABLE services ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION services_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.short_description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_services_search ON services;
CREATE TRIGGER trg_services_search
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION services_search_update();

ALTER TABLE orders ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION orders_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.order_number, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.customer_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.customer_email, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.project_name, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_search ON orders;
CREATE TRIGGER trg_orders_search
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION orders_search_update();

CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_services_search ON services USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_orders_search ON orders USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_projects_name_trgm ON projects USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_name_trgm ON services USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name_trgm ON orders USING GIN (customer_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_number_trgm ON orders USING GIN (order_number gin_trgm_ops);

-- ############################################################################
-- 015 — TRIGGERS
-- ############################################################################

-- 1. updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'settings','categories','subcategories','design_styles',
    'services','service_pricing','projects','project_gallery',
    'orders','coupons','global_promotions','admin_users',
    'tour_360_projects','tour_rooms'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %s;', tbl, tbl
    );
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at();', tbl, tbl
    );
  END LOOP;
END;
$$;

-- 2. Auto-create admin_user when auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Auto-create coupon_usage when order uses coupon
CREATE OR REPLACE FUNCTION log_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coupon_id IS NOT NULL AND (OLD IS NULL OR OLD.coupon_id IS DISTINCT FROM NEW.coupon_id) THEN
    INSERT INTO coupon_usage (coupon_id, coupon_code, order_id, customer_email, discount_value, order_total)
    VALUES (NEW.coupon_id, NEW.coupon_code, NEW.id, NEW.customer_email,
            NEW.coupon_discount_value, NEW.final_total);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_coupon_usage ON orders;
CREATE TRIGGER trg_orders_coupon_usage
  AFTER INSERT OR UPDATE OF coupon_id ON orders
  FOR EACH ROW EXECUTE FUNCTION log_coupon_usage();

-- 4. Auto-create order_timeline entry on status change
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD IS NULL OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO order_timeline (order_id, action, label, metadata)
    VALUES (
      NEW.id,
      'status_change',
      CASE NEW.status
        WHEN 'pending'      THEN 'New Order'
        WHEN 'under_review' THEN 'Under Review'
        WHEN 'approved'     THEN 'Approved'
        WHEN 'rejected'     THEN 'Rejected'
        WHEN 'in_progress'  THEN 'In Progress'
        WHEN 'completed'    THEN 'Completed'
        WHEN 'cancelled'    THEN 'Cancelled'
        ELSE NEW.status
      END,
      jsonb_build_object('from', OLD.status, 'to', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_status_change ON orders;
CREATE TRIGGER trg_orders_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ############################################################################
-- 016 — VIEWS
-- ############################################################################

CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM projects) AS total_projects,
  (SELECT COUNT(*) FROM projects WHERE status = 'published') AS published_projects,
  (SELECT COUNT(*) FROM projects WHERE status = 'draft') AS draft_projects,
  (SELECT COALESCE(SUM(views_count), 0) FROM projects) AS total_views,
  (SELECT COALESCE(SUM(likes_count), 0) FROM projects) AS total_likes,
  (SELECT COUNT(*) FROM projects WHERE is_featured = true) AS featured_projects,
  (SELECT COUNT(*) FROM projects WHERE has_360 = true) AS projects_with_360,
  (SELECT COUNT(*) FROM orders) AS total_orders,
  (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pending_orders,
  (SELECT COALESCE(SUM(final_total), 0) FROM orders WHERE status NOT IN ('cancelled','rejected')) AS total_revenue,
  (SELECT COUNT(*) FROM orders WHERE status = 'completed') AS completed_orders,
  (SELECT COUNT(*) FROM orders WHERE status = 'cancelled') AS cancelled_orders,
  (SELECT COALESCE(AVG(final_total), 0) FROM orders WHERE status = 'completed') AS avg_order_value,
  (SELECT COALESCE(AVG(project_area), 0) FROM orders WHERE project_area IS NOT NULL) AS avg_project_area,
  (SELECT COUNT(*) FROM orders WHERE created_at >= now() - interval '30 days') AS orders_last_30d;

CREATE OR REPLACE VIEW v_monthly_analytics AS
SELECT
  to_char(created_at, 'YYYY-MM') AS month,
  COUNT(*) AS orders_count,
  COALESCE(SUM(final_total), 0) AS revenue,
  COALESCE(AVG(final_total), 0) AS avg_order_value,
  COALESCE(AVG(project_area), 0) AS avg_area
FROM orders
WHERE status NOT IN ('cancelled','rejected')
GROUP BY month
ORDER BY month DESC;

CREATE OR REPLACE VIEW v_order_details AS
SELECT
  o.*,
  c.name AS category_name,
  c.name_ar AS category_name_ar,
  sc.name AS subcategory_name,
  sc.name_ar AS subcategory_name_ar,
  ds.name AS style_name,
  ds.name_ar AS style_name_ar,
  s.name AS service_name,
  s.name_ar AS service_name_ar,
  cp.code AS coupon_display_code
FROM orders o
LEFT JOIN categories c ON o.category_id = c.id
LEFT JOIN subcategories sc ON o.subcategory_id = sc.id
LEFT JOIN design_styles ds ON o.style_id = ds.id
LEFT JOIN services s ON o.service_id = s.id
LEFT JOIN coupons cp ON o.coupon_id = cp.id;

CREATE OR REPLACE VIEW v_active_promotions AS
SELECT *
FROM global_promotions
WHERE is_active = true
  AND (start_date IS NULL OR start_date <= now())
  AND (end_date IS NULL OR end_date >= now())
ORDER BY priority DESC;

CREATE OR REPLACE VIEW v_portfolio_projects AS
SELECT
  id, name, slug, short_description, cover_image_url,
  category, subcategory, style, area, completion_year,
  has_360, likes_count, views_count, sort_order,
  created_at
FROM projects
WHERE status = 'published'
  AND show_in_portfolio = true
  AND deleted_at IS NULL
ORDER BY sort_order ASC, created_at DESC;

CREATE OR REPLACE VIEW v_unread_notifications AS
SELECT
  COUNT(*) AS unread_count
FROM notifications
WHERE is_read = false;

-- ############################################################################
-- 017 — DATABASE FUNCTIONS
-- ############################################################################

-- 1. Generate Order Number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_val TEXT := to_char(now(), 'YYYY');
  seq_val TEXT;
BEGIN
  SELECT LPAD((COALESCE(MAX(SUBSTRING(order_number FROM '\d{5}$')::INTEGER), 0) + 1)::TEXT, 5, '0')
  INTO seq_val
  FROM orders
  WHERE order_number LIKE 'MASAR-' || year_val || '-%';

  RETURN 'MASAR-' || year_val || '-' || seq_val;
END;
$$;

-- 2. Increment Coupon Usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE coupons
  SET current_uses = current_uses + 1
  WHERE id = p_coupon_id;
END;
$$;

-- 3. Get Active Public Promotion
CREATE OR REPLACE FUNCTION get_active_public_promotion()
RETURNS SETOF global_promotions
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM global_promotions
  WHERE is_active = true
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  ORDER BY priority DESC
  LIMIT 1;
END;
$$;

-- 4. Validate Coupon
CREATE OR REPLACE FUNCTION validate_coupon(p_code TEXT, p_order_total NUMERIC DEFAULT NULL)
RETURNS TABLE(
  valid BOOLEAN,
  coupon_id UUID,
  code TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  max_discount NUMERIC,
  message TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
BEGIN
  SELECT * INTO v_coupon FROM coupons WHERE code = UPPER(TRIM(p_code));

  IF v_coupon.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, 'Coupon not found'::TEXT;
    RETURN;
  END IF;

  IF v_coupon.status != 'active' THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, 'Coupon is not active'::TEXT;
    RETURN;
  END IF;

  IF v_coupon.valid_from IS NOT NULL AND v_coupon.valid_from > now() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, 'Coupon is not yet valid'::TEXT;
    RETURN;
  END IF;

  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < now() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, 'Coupon has expired'::TEXT;
    RETURN;
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, 'Coupon usage limit reached'::TEXT;
    RETURN;
  END IF;

  IF p_order_total IS NOT NULL AND v_coupon.min_order_value IS NOT NULL AND p_order_total < v_coupon.min_order_value THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC,
      format('Minimum order value of %s required', v_coupon.min_order_value);
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_coupon.id, v_coupon.code, v_coupon.discount_type, v_coupon.discount_value, v_coupon.max_discount, 'Coupon is valid'::TEXT;
END;
$$;

-- 5. Calculate Project Stats
CREATE OR REPLACE FUNCTION calculate_project_stats()
RETURNS TABLE(
  total BIGINT,
  published BIGINT,
  draft BIGINT,
  archived BIGINT,
  hidden BIGINT,
  featured BIGINT,
  with_360 BIGINT,
  total_views BIGINT,
  total_likes BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'published')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'draft')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'archived')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'hidden')::BIGINT,
    COUNT(*) FILTER (WHERE is_featured = true)::BIGINT,
    COUNT(*) FILTER (WHERE has_360 = true)::BIGINT,
    COALESCE(SUM(views_count), 0)::BIGINT,
    COALESCE(SUM(likes_count), 0)::BIGINT
  FROM projects
  WHERE deleted_at IS NULL;
END;
$$;

-- 6. Upsert Settings (singleton pattern)
CREATE OR REPLACE FUNCTION upsert_settings(p_id UUID, p_data JSONB)
RETURNS SETOF settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO settings (id, company_name, company_name_ar, logo_url, phone, email, address, address_ar,
    google_maps_url, working_hours, working_hours_ar, social_links, default_currency, price_unit,
    terms_conditions, terms_conditions_ar, privacy_policy, privacy_policy_ar,
    seo_title, seo_description, og_image_url, updated_by)
  VALUES (
    p_id,
    p_data->>'company_name',
    p_data->>'company_name_ar',
    p_data->>'logo_url',
    p_data->>'phone',
    p_data->>'email',
    p_data->>'address',
    p_data->>'address_ar',
    p_data->>'google_maps_url',
    p_data->>'working_hours',
    p_data->>'working_hours_ar',
    (p_data->'social_links')::JSONB,
    COALESCE(p_data->>'default_currency', 'SAR'),
    p_data->>'price_unit',
    p_data->>'terms_conditions',
    p_data->>'terms_conditions_ar',
    p_data->>'privacy_policy',
    p_data->>'privacy_policy_ar',
    p_data->>'seo_title',
    p_data->>'seo_description',
    p_data->>'og_image_url',
    (p_data->>'updated_by')::UUID
  )
  ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    company_name_ar = EXCLUDED.company_name_ar,
    logo_url = EXCLUDED.logo_url,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    address_ar = EXCLUDED.address_ar,
    google_maps_url = EXCLUDED.google_maps_url,
    working_hours = EXCLUDED.working_hours,
    working_hours_ar = EXCLUDED.working_hours_ar,
    social_links = EXCLUDED.social_links,
    default_currency = EXCLUDED.default_currency,
    price_unit = EXCLUDED.price_unit,
    terms_conditions = EXCLUDED.terms_conditions,
    terms_conditions_ar = EXCLUDED.terms_conditions_ar,
    privacy_policy = EXCLUDED.privacy_policy,
    privacy_policy_ar = EXCLUDED.privacy_policy_ar,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    og_image_url = EXCLUDED.og_image_url,
    updated_by = EXCLUDED.updated_by,
    updated_at = now()
  RETURNING *;
END;
$$;

-- ##############################################################################
-- PUBLIC COUPON VALIDATION (bypasses RLS for unauthenticated visitors)
-- ##############################################################################
CREATE OR REPLACE FUNCTION public.validate_coupon_code(code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec coupons%ROWTYPE;
BEGIN
  SELECT * INTO rec FROM coupons
  WHERE status = 'active'
    AND UPPER(coupons.code) = UPPER(code)
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_until IS NULL OR valid_until >= now())
    AND (max_uses IS NULL OR current_uses < max_uses)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'كود الخصم غير صالح.');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'discount_type', rec.discount_type,
    'discount_value', rec.discount_value,
    'max_discount', rec.max_discount,
    'min_order_value', rec.min_order_value,
    'code', rec.code,
    'currency', rec.currency
  );
END;
$$;

-- ##############################################################################
-- 020 — NEWSLETTER SUBSCRIBERS
-- ##############################################################################
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can view subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can update subscribers"
  ON newsletter_subscribers FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can delete subscribers"
  ON newsletter_subscribers FOR DELETE
  USING (auth.role() = 'authenticated');
