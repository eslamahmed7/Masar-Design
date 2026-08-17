-- ============================================================================
-- MIGRATION 018 — CONTACT MESSAGES + FAQ SYSTEM
-- ============================================================================

-- A — STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('contact-attachments','contact-attachments',true,10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip','application/x-zip-compressed'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read contact attachments" ON storage.objects;
CREATE POLICY "Public can read contact attachments" ON storage.objects FOR SELECT USING (bucket_id = 'contact-attachments');
DROP POLICY IF EXISTS "Public can upload contact attachments" ON storage.objects;
CREATE POLICY "Public can upload contact attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'contact-attachments');
DROP POLICY IF EXISTS "Admins can delete contact attachments" ON storage.objects;
CREATE POLICY "Admins can delete contact attachments" ON storage.objects FOR DELETE USING (bucket_id = 'contact-attachments' AND auth.role() = 'authenticated');

-- B — CONTACT MESSAGE TYPES
CREATE TABLE IF NOT EXISTS contact_message_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_ar TEXT NOT NULL,
  label_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cmt_active ON contact_message_types(is_active);
CREATE INDEX IF NOT EXISTS idx_cmt_sort ON contact_message_types(sort_order);
ALTER TABLE contact_message_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active contact_message_types" ON contact_message_types;
CREATE POLICY "Public can read active contact_message_types" ON contact_message_types FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage contact_message_types" ON contact_message_types;
CREATE POLICY "Admins can manage contact_message_types" ON contact_message_types FOR ALL USING (auth.role() = 'authenticated');
INSERT INTO contact_message_types (label_ar, label_en, sort_order) VALUES
  ('استفسار عام','General Inquiry',1),('طلب مكالمة','Call Request',2),
  ('الإبلاغ عن مشكلة','Report an Issue',3),('اقتراح','Suggestion',4),
  ('شراكة','Partnership',5),('وظيفة','Career',6),
  ('متابعة طلب','Follow Up',7),('أخرى','Other',8) ON CONFLICT DO NOTHING;

-- C — FAQ CATEGORIES
CREATE TABLE IF NOT EXISTS faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL UNIQUE,
  name_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_faq_cats_active ON faq_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_cats_sort ON faq_categories(sort_order);
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active faq_categories" ON faq_categories;
CREATE POLICY "Public can read active faq_categories" ON faq_categories FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage faq_categories" ON faq_categories;
CREATE POLICY "Admins can manage faq_categories" ON faq_categories FOR ALL USING (auth.role() = 'authenticated');
INSERT INTO faq_categories (name_ar, name_en, sort_order) VALUES
  ('التصميم الداخلي','Interior Design',1),('الأسعار','Pricing',2),
  ('مدة التنفيذ','Timeline',3),('التنفيذ','Execution',4),
  ('الدفع','Payment',5),('الاستشارات','Consultations',6),
  ('3D والريندر','3D & Rendering',7),('أخرى','Other',8) ON CONFLICT DO NOTHING;

-- D — FAQS
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_ar TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  category_id UUID REFERENCES faq_categories(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category_id);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_archived ON faqs(is_archived);
CREATE INDEX IF NOT EXISTS idx_faqs_sort ON faqs(sort_order);
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active faqs" ON faqs;
CREATE POLICY "Public can read active faqs" ON faqs FOR SELECT USING (is_active = true AND is_archived = false);
DROP POLICY IF EXISTS "Admins can manage faqs" ON faqs;
CREATE POLICY "Admins can manage faqs" ON faqs FOR ALL USING (auth.role() = 'authenticated');

-- E — CONTACT MESSAGES (3000 char limit)
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message_type_id UUID REFERENCES contact_message_types(id) ON DELETE SET NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 3000),
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  attachment_size INTEGER,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','contacted','closed','trashed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_cm_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_cm_type ON contact_messages(message_type_id);
CREATE INDEX IF NOT EXISTS idx_cm_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cm_number ON contact_messages(message_number);
CREATE INDEX IF NOT EXISTS idx_cm_name_trgm ON contact_messages USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cm_phone_trgm ON contact_messages USING GIN (phone gin_trgm_ops);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert contact_messages" ON contact_messages;
CREATE POLICY "Public can insert contact_messages" ON contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can manage contact_messages" ON contact_messages;
CREATE POLICY "Admins can manage contact_messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');


-- G — updated_at TRIGGERS
DROP TRIGGER IF EXISTS trg_faq_categories_updated_at ON faq_categories;
CREATE TRIGGER trg_faq_categories_updated_at BEFORE UPDATE ON faq_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_faqs_updated_at ON faqs;
CREATE TRIGGER trg_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER trg_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- H — MESSAGE NUMBER GENERATOR: MASAR-CM-YYYY-00001
CREATE OR REPLACE FUNCTION generate_contact_message_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  year_val TEXT := to_char(now(), 'YYYY');
  seq_val TEXT;
BEGIN
  SELECT LPAD((COALESCE(MAX(SUBSTRING(message_number FROM '\d{5}$')::INTEGER),0)+1)::TEXT,5,'0')
  INTO seq_val FROM contact_messages WHERE message_number LIKE 'MASAR-CM-' || year_val || '-%';
  RETURN 'MASAR-CM-' || year_val || '-' || seq_val;
END;
$$;

-- I — AUTO-ASSIGN message_number BEFORE INSERT
CREATE OR REPLACE FUNCTION assign_contact_message_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.message_number IS NULL OR NEW.message_number = '' THEN
    NEW.message_number := generate_contact_message_number();
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_contact_messages_number ON contact_messages;
CREATE TRIGGER trg_contact_messages_number BEFORE INSERT ON contact_messages FOR EACH ROW EXECUTE FUNCTION assign_contact_message_number();

-- J — AUTO NOTIFICATION + ACTIVITY LOG on new contact message
CREATE OR REPLACE FUNCTION notify_new_contact_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_type_label TEXT;
BEGIN
  SELECT COALESCE(label_ar,'استفسار') INTO v_type_label FROM contact_message_types WHERE id = NEW.message_type_id;
  INSERT INTO notifications (user_id,type,title,title_ar,message,message_ar,link,is_read)
  SELECT id,'contact_message',
    'New Contact Message — ' || COALESCE(v_type_label,'General'),
    'رسالة تواصل جديدة — ' || COALESCE(v_type_label,'استفسار'),
    NEW.name || ': ' || LEFT(NEW.message,80),
    'رسالة من ' || NEW.name || ': ' || LEFT(NEW.message,80),
    '/admin/contact-messages',false FROM admin_users LIMIT 1;
  INSERT INTO activity_logs (admin_id,admin_name,action,action_label,target_type,target_id,metadata)
  VALUES (NULL,NEW.name,'contact_message_received','رسالة تواصل جديدة: ' || NEW.message_number,
    'contact_message',NEW.id::TEXT,
    jsonb_build_object('name',NEW.name,'phone',NEW.phone,'email',COALESCE(NEW.email,''),
      'message_number',NEW.message_number,'type',COALESCE(v_type_label,'غير محدد')));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_contact_messages_notify ON contact_messages;
CREATE TRIGGER trg_contact_messages_notify AFTER INSERT ON contact_messages FOR EACH ROW EXECUTE FUNCTION notify_new_contact_message();



-- L — VIEW: unread contact messages count
CREATE OR REPLACE VIEW v_unread_contact_messages AS
SELECT COUNT(*) AS unread_count FROM contact_messages WHERE status = 'new';

-- M — FULL TEXT SEARCH
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
CREATE OR REPLACE FUNCTION contact_messages_search_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple',coalesce(NEW.message_number,'')),'A') ||
    setweight(to_tsvector('simple',coalesce(NEW.name,'')),'A') ||
    setweight(to_tsvector('simple',coalesce(NEW.phone,'')),'B') ||
    setweight(to_tsvector('simple',coalesce(NEW.email,'')),'B') ||
    setweight(to_tsvector('simple',coalesce(NEW.message,'')),'C');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_contact_messages_search ON contact_messages;
CREATE TRIGGER trg_contact_messages_search BEFORE INSERT OR UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION contact_messages_search_update();
CREATE INDEX IF NOT EXISTS idx_cm_search ON contact_messages USING GIN(search_vector);
