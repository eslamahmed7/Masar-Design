export type ProjectStatus = 'draft' | 'published' | 'archived' | 'hidden'
export type ProjectCategory = 'Residential' | 'Commercial' | 'Administrative'
export type ProjectStyle = 'Modern' | 'Classic' | 'Luxury' | 'Minimal' | 'Contemporary'

export type OrderStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_super_admin: boolean
  created_at: string
  updated_at: string
}

export interface DBProject {
  id: string
  name: string
  slug: string
  location: string | null
  area: number | null
  category: string | null
  subcategory: string | null
  style: string | null
  completion_year: number | null
  client_type: string | null
  status: ProjectStatus
  is_featured: boolean
  has_360: boolean
  sort_order: number
  short_description: string | null
  full_description: string | null
  highlights: string[] | null
  materials: string[] | null
  lighting: string[] | null
  furniture: string[] | null
  design_notes: string | null
  cover_image_url: string | null
  cover_image_public_id: string | null
  video_url: string | null
  video_public_id: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string[] | null
  og_image_url: string | null
  canonical_url: string | null
  show_in_portfolio: boolean
  show_on_home: boolean
  enable_likes: boolean
  enable_gallery: boolean
  enable_video: boolean
  enable_360: boolean
  likes_count: number
  views_count: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface GalleryImage {
  id: string
  project_id: string
  url: string
  public_id: string | null
  alt_text: string | null
  sort_order: number
  width: number | null
  height: number | null
  format: string | null
  created_at: string
}

export interface DashboardStats {
  total_projects: number
  published_projects: number
  draft_projects: number
  total_views: number
  total_likes: number
  featured_projects: number
  projects_with_360: number
  total_orders: number
  pending_orders: number
  total_revenue: number
  completed_orders?: number
  cancelled_orders?: number
  avg_order_value?: number
  avg_project_area?: number
}

// ── Categories ────────────────────────────────────────────────────────────────
export interface DBCategory {
  id: string
  name: string
  name_ar: string | null
  icon: string | null
  description: string | null
  cover_image_url: string | null
  status: 'active' | 'hidden'
  sort_order: number
  created_at: string
  updated_at: string
  subcategories?: DBSubcategory[]
}

export interface DBSubcategory {
  id: string
  category_id: string
  name: string
  name_ar: string | null
  icon: string | null
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DBDesignStyle {
  id: string
  name: string
  name_ar: string | null
  icon: string | null
  description: string | null
  preview_image_url: string | null
  status: 'active' | 'hidden'
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Services & Pricing ────────────────────────────────────────────────────────
export interface DBService {
  id: string
  name: string
  name_ar: string | null
  short_description: string | null
  long_description: string | null
  cover_image_url: string | null
  icon: string | null
  status: 'active' | 'hidden'
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  pricing?: DBServicePricing | null
  options?: DBPricingOption[]
}

export interface DBServicePricing {
  id: string
  service_id: string
  pricing_type: 'per_sqm' | 'fixed' | 'custom' | 'quote'
  price_per_sqm: number | null
  min_area: number | null
  max_area: number | null
  min_order_value: number | null
  fixed_price: number | null
  currency: string
  created_at: string
  updated_at: string
}

export interface DBPricingOption {
  id: string
  service_id: string
  name: string
  name_ar: string | null
  description: string | null
  price: number
  price_type: 'fixed' | 'percentage'
  is_active: boolean
  sort_order: number
  created_at: string
}

// ── Orders ────────────────────────────────────────────────────────────────────
export interface DBOrder {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string
  project_name: string | null
  project_type: string | null
  category_id: string | null
  subcategory_id: string | null
  style_id: string | null
  service_id: string | null
  project_area: number | null
  city: string | null
  country: string
  project_notes: string | null
  price_per_sqm: number | null
  subtotal: number | null
  global_discount_value: number
  global_discount_pct: number
  coupon_id: string | null
  coupon_code: string | null
  coupon_discount_value: number
  addons_total: number
  final_total: number | null
  currency: string
  selected_addons: Array<{ id: string; name: string; price: number }> | null
  uploaded_files: Array<{ url: string; name: string }> | null
  status: OrderStatus
  payment_status: string
  pdf_url: string | null
  pdf_public_id: string | null
  created_at: string
  updated_at: string
  // joined
  categories?: { name: string; name_ar: string | null } | null
  subcategories?: { name: string; name_ar: string | null } | null
  design_styles?: { name: string; name_ar: string | null } | null
  services?: { name: string; name_ar: string | null } | null
  coupons?: { code: string } | null
}

export interface DBOrderNote {
  id: string
  order_id: string
  admin_id: string | null
  admin_name: string | null
  content: string
  created_at: string
}

export interface DBOrderTimeline {
  id: string
  order_id: string
  action: string
  label: string
  actor_id: string | null
  actor_name: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// ── Settings ───────────────────────────────────────────────────────────────────
export interface DBSettings {
  id: string
  company_name: string | null
  company_name_ar: string | null
  logo_url: string | null
  phone: string | null
  email: string | null
  address: string | null
  address_ar: string | null
  google_maps_url: string | null
  working_hours: string | null
  working_hours_ar: string | null
  social_links: Record<string, string> | null
  default_currency: string
  price_unit: string | null
  terms_conditions: string | null
  terms_conditions_ar: string | null
  privacy_policy: string | null
  privacy_policy_ar: string | null
  seo_title: string | null
  seo_description: string | null
  og_image_url: string | null
  updated_at: string
  updated_by: string | null
}

// ── Notifications ──────────────────────────────────────────────────────────────
export interface DBNotification {
  id: string
  user_id: string | null
  type: string
  title: string
  title_ar: string
  message: string | null
  message_ar: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

// ── Activity Logs ──────────────────────────────────────────────────────────────
export interface DBActivityLog {
  id: string
  admin_id: string | null
  admin_name: string | null
  action: string
  action_label: string
  target_type: string
  target_id: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

// ── Coupons ────────────────────────────────────────────────────────────────────
export interface DBCoupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_discount: number | null
  min_order_value: number | null
  valid_from: string | null
  valid_until: string | null
  max_uses: number | null
  current_uses: number
  applicable_services: string[] | null
  applicable_categories: string[] | null
  status: 'active' | 'inactive' | 'expired'
  created_at: string
  updated_at: string
}

// ── Global Promotions ──────────────────────────────────────────────────────────
export interface DBGlobalPromotion {
  id: string
  title: string
  title_ar: string | null
  description: string | null
  discount_value: number
  discount_type: 'percentage' | 'fixed'
  applicable_to: 'all' | 'category' | 'service'
  applicable_ids: string[] | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  show_banner: boolean
  banner_text: string | null
  banner_color: string
  enable_countdown: boolean
  priority: number
  created_at: string
  updated_at: string
}

// ── Contact Message Types ──────────────────────────────────────────────────────
export interface DBContactMessageType {
  id: string
  label_ar: string
  label_en: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

// ── FAQ Categories ─────────────────────────────────────────────────────────────
export interface DBFaqCategory {
  id: string
  name_ar: string
  name_en: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── FAQs ───────────────────────────────────────────────────────────────────────
export interface DBFaq {
  id: string
  question_ar: string
  answer_ar: string
  category_id: string | null
  sort_order: number
  is_active: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  // joined
  faq_categories?: { name_ar: string; name_en: string | null } | null
}

// ── Contact Messages ───────────────────────────────────────────────────────────
export type ContactMessageStatus = 'new' | 'in_progress' | 'contacted' | 'closed' | 'trashed'

export interface DBContactMessage {
  id: string
  message_number: string
  name: string
  phone: string
  email: string | null
  message_type_id: string | null
  message: string
  attachment_url: string | null
  attachment_name: string | null
  attachment_type: 'image' | 'document' | null
  attachment_size: number | null
  status: ContactMessageStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
  // joined
  contact_message_types?: { label_ar: string; label_en: string | null } | null
}

// ── Hero Settings ─────────────────────────────────────────────────────────────
export interface DBHeroSettings {
  id: string
  image_url: string | null
  image_public_id: string | null
  video_url: string | null
  video_public_id: string | null
  headline_ar: string | null
  subtitle_ar: string | null
  description_ar: string | null
  cta_primary_text: string | null
  cta_primary_href: string | null
  cta_video_text: string | null
  overlay_opacity: number | null
  brightness: number | null
  blur: number | null
  hero_height: string | null
  is_active: boolean
  updated_at: string
  updated_by: string | null
}
