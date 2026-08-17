-- Database Functions (الدوال المخزنة)

-- ── 1. Generate Order Number ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_val TEXT := to_char(now(), 'YYYY');
  seq_val TEXT;
BEGIN
  SELECT LPAD(COALESCE(MAX(SUBSTRING(order_number FROM '\d{5}$')::INTEGER), 0) + 1::TEXT, 5, '0')
  INTO seq_val
  FROM orders
  WHERE order_number LIKE 'MASAR-' || year_val || '-%';

  RETURN 'MASAR-' || year_val || '-' || seq_val;
END;
$$;

-- ── 2. Increment Coupon Usage ──────────────────────────────────────────────
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

-- ── 3. Get Active Public Promotion ─────────────────────────────────────────
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

-- ── 4. Validate Coupon ─────────────────────────────────────────────────────
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

-- ── 5. Calculate Project Stats ─────────────────────────────────────────────
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

-- ── 6. Upsert Settings ─────────────────────────────────────────────────────
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
