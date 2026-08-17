-- Triggers (المحفزات)

-- ── 1. updated_at auto-update ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
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

-- ── 2. Auto-create admin_user when auth user signs up ───────────────────────
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

-- ── 3. Auto-create coupon_usage when order uses coupon ─────────────────────
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

-- ── 4. Auto-create order_timeline entry on status change ───────────────────
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
