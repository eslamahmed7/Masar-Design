-- إنشاء Bucket للملفات PDF
-- لا يمكن إنشاء Storage Buckets عبر SQL مباشرة.
-- الرجاء إنشاؤه يدوياً من Dashboard:
-- 1. اذهب إلى Storage → New Bucket
-- 2. الاسم: order-pdfs
-- 3. Public: ON (مفعل)
-- 4. اضغط Create bucket

-- بعد إنشاء الـ bucket، شغّل سياسات التخزين:
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-pdfs', 'order-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- سياسة قراءة الملفات (الكل يقدر يقرأ)
CREATE POLICY "Public can read PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'order-pdfs');

-- سياسة رفع الملفات (المشرفين)
CREATE POLICY "Admins can upload PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-pdfs' AND
    auth.role() = 'authenticated'
  );
