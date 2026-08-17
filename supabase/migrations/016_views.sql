-- Views (العروض المُخزنة)

-- ── 1. Dashboard Stats ──────────────────────────────────────────────────────
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

-- ── 2. Monthly Analytics ────────────────────────────────────────────────────
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

-- ── 3. Order Details (مع أسماء العلاقات) ────────────────────────────────────
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

-- ── 4. Active Promotions ────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_active_promotions AS
SELECT *
FROM global_promotions
WHERE is_active = true
  AND (start_date IS NULL OR start_date <= now())
  AND (end_date IS NULL OR end_date >= now())
ORDER BY priority DESC;

-- ── 5. Projects Portfolio (المشاريع المنشورة) ───────────────────────────────
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

-- ── 6. Notifications Unread Count ───────────────────────────────────────────
CREATE OR REPLACE VIEW v_unread_notifications AS
SELECT
  COUNT(*) AS unread_count
FROM notifications
WHERE is_read = false;
