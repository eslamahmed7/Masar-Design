import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Step 1 — Basic Info
export const projectBasicSchema = z.object({
  name: z.string().min(2, 'اسم المشروع مطلوب'),
  slug: z.string().regex(/^[\w\u0600-\u06FF\-]*$/, 'يجب أن يحتوي على حروف أو أرقام أو شرطات فقط').optional().or(z.literal('')),
  location: z.string().optional(),
  area: z.coerce.number().nonnegative().optional().or(z.literal('')),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  style: z.string().optional(),
  completion_year: z.coerce.number().int().min(2000).max(2030).optional().or(z.literal('')),
  client_type: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived', 'hidden']).default('draft'),
  is_featured: z.boolean().default(false),
  has_360: z.boolean().default(false),
})

// Step 2 — Descriptions
export const projectDescriptionSchema = z.object({
  short_description: z.string().optional(),
  full_description: z.string().optional(),
  highlights: z.string().optional(),   // comma-separated → split to array
  materials: z.string().optional(),
  lighting: z.string().optional(),
  furniture: z.string().optional(),
  design_notes: z.string().optional(),
})

// Step 3 — Media (Cloudinary URLs stored after upload)
export const projectMediaSchema = z.object({
  cover_image_url: z.string().url().optional().or(z.literal('')),
  cover_image_public_id: z.string().optional(),
  video_url: z.string().url().optional().or(z.literal('')),
  video_public_id: z.string().optional(),
})

// Step 4 — Page settings
export const projectSettingsSchema = z.object({
  show_in_portfolio: z.boolean().default(true),
  show_on_home: z.boolean().default(false),
  enable_likes: z.boolean().default(true),
  enable_gallery: z.boolean().default(true),
  enable_video: z.boolean().default(true),
  enable_360: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
})

// Step 5 — SEO
export const projectSeoSchema = z.object({
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),   // comma-separated
  og_image_url: z.string().optional(),
  canonical_url: z.string().optional(),
})

export const fullProjectSchema = projectBasicSchema
  .merge(projectDescriptionSchema)
  .merge(projectMediaSchema)
  .merge(projectSettingsSchema)
  .merge(projectSeoSchema)

export type FullProjectFormData = z.infer<typeof fullProjectSchema>
