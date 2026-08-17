# PERFORMANCE REPORT — Masar Design (Phase 3)

**التاريخ:** 16 أغسطس 2026
**المنهج:** Production build (`next build` + `next start` على 3001)، قياس via Playwright/Chrome + CDP (CPU×4) — **موبايل 390×844** (ذات سيناريو baseline المنشور في `PERFORMANCE_BASELINE.md`). الأرقام After = **وسيط 3 أشواط** (لتقليل التقلب)، Before = قياس single-run مسجل مسبقاً.

## 1) BEFORE / AFTER (Mobile 390 — CPU×4)

| الصفحة | FCP قبل/بعد | LCP قبل/بعد | TBT قبل/بعد | إجمالي KB قبل/بعد | Requests قبل/بعد |
|--------|-----------|-----------|-----------|-----------------|-----------------|
| Home | 1676 → **1104** (−34%) | 4420 → **3836** (−13%) | 451 → **366** (−19%) | 899 → **755** (−16%) | 47 → 43 |
| Projects | 1064 → 1132 (±noise) | 1120 → 1132 (±noise) | 317 → **218** (−31%) | 852 → **709** (−17%) | 46 → 42 |
| Project Details | 2824 → **2452** (−13%) | 3404 → **3036** (−11%) | 107 → 112 (noise) | 727\* → 865 | 39 → 43 |
| Services | 1496 → **796** (−47%) | 4552 → **3808** (−16%) | 385 → **264** (−31%) | 1049 → **909** (−13%) | 55 → 52 |
| About | 2248 → **1948** (−13%) | 4368 → **4048** (−7%) | 501 → 494 (noise) | 857 → **714** (−17%) | 45 → 41 |
| Contact | 1376 → **1320** | 4500 → **4212** (−6%) | 527 → **415** (−21%) | 876 → **733** (−16%) | 39 → 39 |

\* **توضيح أساسي (Project Details):** رقم الـBefore المنشور (727KB) لم يلتقط صور المعرض (lazy خلف الشاشة لحظة القياس). القياس الواقعي المباشر للأصول قبل التحسين: **غلاف PNG خام 2167KB** + صور معرض خام 2752×1536 (عدة ملفات) + شعار 85KB → بعد التحسين: **غلاف 140KB + كل صورة معرض ~13KB + شعار 11KB = ~204KB إجمالي** وتحويل الصور الكامل يعمل (f_auto→JPG/WebP).

## 2) IMAGE OPTIMIZATION (التفصيل)

| الصورة | قبل | بعد | المعالجة |
|--------|-----|-----|----------|
| غلاف المشروع (Cloudinary) | **2167KB** PNG خام 1294×1216 | **140.5KB** | `f_auto,q_auto,w_1200` + عرض 1600→1200 |
| صور معرض المشروع | خام 2752×1536 لكل صورة (MBs) | **11–16KB لكل صورة** | `f_auto,q_auto,w_500` + `loading=lazy` |
| شعار `masar-logo.png` | 85.3KB (356×413) على كل صفحة | **10.9KB** (192×223، نفس البكسلات) | إعادة تحجيم sharp + palette |
| صفحات Home/About/Contact/Projects (بدون مشروع) | 86–95KB صور | **11–21KB** | أثر الشعار فقط |
| Services (why-masar/فونيتشر) | 201KB | **127KB** | quality 92/90 → 75 |
| About gallery | `sizes=100vw` (كان يجلب 1080px للصور 120px) | `66vw` موبايل | −30-50% بايت |
| Panorama 360 (tour360) | أصول ضخمة | `w_2048` | كافي للعرض، دون تدهور |

## 3) FONTS (كل صفحة)
- 15 ملف woff2 (~236KB) → **11 ملف (169KB)** — إزالة: Tajawal 300/600/800 (غير مدعوم/غير مستعمل) وCormorant 300/500/600 (يُستعمل 400 فقط n+i).
- El Messiri 400–700 وGeist Mono (variable) كما هما — المنظومة البصرية بلا تغيير.

## 4) DATA
- `getProjects`/`getProjectById` (revalidate 30s) + `getServices`/`getServiceById`/`getServiceShowcases` (60s) عبر `React cache() + unstable_cache` — إلغاء تكرار الاستعلامات ضمن الطلب وعبر RSC prefetches، وتقليل ضغط Supabase أثناء «عواصف» الـprefetch (الملحوظة سابقاً: 12 fetch على Services → انخفضت إلى 4).

## 5) FILES MODIFIED
- `app/layout.tsx` — تقليص أوزان الخطوط المعلنة فقط.
- `lib/image-url.ts` — **جديد**: تحويل/إعادة كتابة عرض URLs Cloudinary (`f_auto,q_auto,w_`).
- `lib/projects.ts` — تحويل جميع صور المشاريع + panoramas؛ `unstable_cache` 30s.
- `lib/services.ts` — تحويل الغلافات؛ `unstable_cache` 60s.
- `lib/services-page-data.ts` — `unstable_cache` 60s.
- `components/project-details-client.tsx` — الغلاف w_1200، المعرض w_500 + lazy، المرتبط lazy.
- `components/about/about-gallery.tsx` — sizes 66vw (موبايل).
- `components/services/why-masar.tsx` — quality 75.
- `components/services/services-final-cta.tsx` — quality 75.
- `public/masar-logo.png` — 85.3→10.9KB (الأصل محفوظ: `masar-logo.orig.png` للتراجع).

**بلا تغيير:** تصميم، محتوى، Routes، مخطط DB، أي ميزة. (إصلاحات البناء السابقة — `pannellum?: any` + استبعاد `masar-editor` من tsconfig — كانت شرطاً مسبقاً لإتاحة البناء production، وقد أُدرجت في `PERFORMANCE_BASELINE.md`).

## 6) REGRESSION — **PASS**
- **72 فحصاً** (9 مسارات × 4 أوضاع ar/en × dark/light × viewports 390/1440): 0 صور مكسورة، 0 أخطاء JavaScript.
- الاستثناء الوحيد: فشل `/_vercel/insights/script.js` (بيكن Analytics لا يصل من localhost — **قائم سابقاً وغير مرتبط**).
- الصفحات الست + `/start` + `/admin/login` + `/projects/[id]/360` تُصيَّر في كل الأوضاع.

## 7) لم يُنفَّذ (مدروس)
- تقسيم gsap/lenis (49KB على كل صفحة): بنية تصميمية مقصودة (intro/transitions عابرة للمسارات) — التقسيم يتطلب تغيير سلوك/بنية خارج النطاق ومخاطرة أعلى من الفائدة المرصودة (LCP النصي انخفض فعلياً من توفر main thread الأفضل).
- خفض إضافي للخطوط عبر منع preload — يمسّ swap المرئي لأوزان العناوين.