-- Admin Users (المشرفين)
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

-- Allow users to read their own record
CREATE POLICY "Users can read own record"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

-- Allow admins full access
CREATE POLICY "Admins can manage admin_users"
  ON admin_users FOR ALL
  USING (auth.role() = 'authenticated');
