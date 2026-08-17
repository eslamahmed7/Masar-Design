-- ═══════════════════════════════════════════════════
-- 019: hero_settings — standalone table for Hero CMS
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hero_settings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Media
  image_url        TEXT,
  image_public_id  TEXT,
  video_url        TEXT,
  video_public_id  TEXT,

  -- Copy
  headline_ar      TEXT DEFAULT 'مساحتك تبدأ هنا',
  subtitle_ar      TEXT DEFAULT 'استوديو التصميم الداخلي',
  description_ar   TEXT DEFAULT 'نحوّل المساحات إلى تجارب معيشية استثنائية تعكس شخصيتك وتُلهم حياتك اليومية.',

  -- CTAs
  cta_primary_text TEXT DEFAULT 'استكشف مشاريعنا',
  cta_primary_href TEXT DEFAULT '#projects',
  cta_video_text   TEXT DEFAULT 'شاهد الفيديو التعريفي',

  -- Appearance
  overlay_opacity  NUMERIC(3,2) DEFAULT 0.55,   -- 0.0–1.0
  brightness       NUMERIC(3,2) DEFAULT 1.00,   -- 0.5–1.5
  blur             NUMERIC(4,1) DEFAULT 0.0,    -- px, 0–20
  hero_height      TEXT DEFAULT '100vh',        -- 80vh | 90vh | 100vh

  -- Meta
  is_active        BOOLEAN DEFAULT true,
  updated_at       TIMESTAMPTZ DEFAULT now(),
  updated_by       UUID REFERENCES auth.users(id)
);

-- ── RLS ─────────────────────────────────────────────
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read hero_settings"
  ON hero_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage hero_settings"
  ON hero_settings FOR ALL
  USING (auth.role() = 'authenticated');

-- ── Seed one default row ─────────────────────────────
INSERT INTO hero_settings (
  headline_ar, subtitle_ar, description_ar,
  cta_primary_text, cta_primary_href, cta_video_text,
  overlay_opacity, brightness, blur, hero_height
) VALUES (
  'مساحتك تبدأ هنا',
  'استوديو التصميم الداخلي',
  'نحوّل المساحات إلى تجارب معيشية استثنائية تعكس شخصيتك وتُلهم حياتك اليومية.',
  'استكشف مشاريعنا',
  '#projects',
  'شاهد الفيديو التعريفي',
  0.55, 1.00, 0.0, '100vh'
) ON CONFLICT DO NOTHING;
