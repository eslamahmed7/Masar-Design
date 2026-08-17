-- 360 Tour Projects (جولات 360 - كجداول مستقلة)
-- ملاحظة: البيانات موجودة أيضاً كـ JSONB في projects.tour360
-- الجداول أدناه توفر وصولاً علائقياً للاستعلامات المتقدمة

-- 360 Config (إعدادات الجولة لكل مشروع)
CREATE TABLE IF NOT EXISTS tour_360_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 360 Rooms (غرف الجولة)
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

-- 360 Floor Plan Rooms (غرف المخطط الأرضي)
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

-- 360 Hotspots (النقاط التفاعلية)
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

-- Row Level Security
ALTER TABLE tour_360_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plan_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_hotspots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read tour_360_projects"
  ON tour_360_projects FOR SELECT USING (true);
CREATE POLICY "Public can read tour_rooms"
  ON tour_rooms FOR SELECT USING (true);
CREATE POLICY "Public can read floor_plan_rooms"
  ON floor_plan_rooms FOR SELECT USING (true);
CREATE POLICY "Public can read tour_hotspots"
  ON tour_hotspots FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour_360_projects"
  ON tour_360_projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage tour_rooms"
  ON tour_rooms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage floor_plan_rooms"
  ON floor_plan_rooms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage tour_hotspots"
  ON tour_hotspots FOR ALL USING (auth.role() = 'authenticated');
