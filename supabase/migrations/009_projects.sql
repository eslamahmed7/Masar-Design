-- Projects (المشاريع)
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

-- Project Gallery (معرض المشاريع)
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

CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read project_gallery"
  ON project_gallery FOR SELECT USING (true);

CREATE POLICY "Admins can manage projects"
  ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage project_gallery"
  ON project_gallery FOR ALL USING (auth.role() = 'authenticated');
