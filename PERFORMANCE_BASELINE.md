# PERFORMANCE BASELINE — Masar Design (Phase 3 Start)

**التاريخ:** 15 أغسطس 2026 — **قبل أي تعديل أداء.**
**الطريقة:** Production build (`next build` ثم `next start` على 3001) + Playwright/Chrome headless + CDP throttling (CPU ×4، شبكة 4G سريعة latency 60ms) — قياس Web Vitals حقيقي عبر PerformanceObserver + `performance.getEntriesByType('resource')`.

> ملاحظة: تم في بداية المرحلة إصلاحان مكّنا تشغيل البناء production (سابقاً كان مكسوراً منذ زمن):
> 1. تضارب إعلان `pannellum` (TS2687) في `tour-viewer-client.tsx` ↔ `PanoramaViewer.tsx` → توحيده إلى `pannellum?: any`
> 2. استبعاد `masar-editor` من tsconfig الجذر (تطبيق مستقل له build خاص) → **الآن `tsc --noEmit` يمر بـ 0 أخطاء والبناء ناجح**

## 1) الوضع الحالي (Mobile 390 — CPU×4، 4G-fast)

| الصفحة | FCP (ms) | LCP (ms) | TBT (ms) | JS KB | CSS KB | صور KB | Total KB | Requests |
|--------|--------:|--------:|--------:|------:|-------:|-------:|---------:|---------:|
| Home | 1676 | 4420 | 451 | 392 | 29 | 86 | 899 | 47 |
| Projects | 1064 | 1120 | 317 | 365 | 29 | 95 | 852 | 46 |
| Project Details | 2824 | 3404 | 107 | 360 | 29 | 86* | 727* | 39 |
| Services | 1496 | 4552 | 385 | 404 | 29 | 201 | 1049 | 55 |
| About | 2248 | 4368 | 501 | 373 | 29 | 86 | 857 | 45 |
| Contact | 1376 | 4500 | 527 | 374 | 29 | 86 | 876 | 43 |

\* تشغيلات باكرة في dev أظهرت **9,840KB صور** على Project Details (المعرض كاملاً بأحجامه الأصلية).

## 2) الـBottlenecks المكتشفة (مرتبة بالأثر)

### CRITICAL-1: الخطوط — 236KB / 15 طلباً على كل صفحة
- `next/font` تُحمّل **15 ملف woff2** (≈236KB) على **كل** صفحة: Tajawal (300/400/500/700/800)، El Messiri (400/500/600/700)، Cormorant Garamond (300/400/500/600 + italic لكل منها)، Geist Mono (100-900).
- التدقيق الحي (`document.fonts` + CSS المستعمل) يُظهر أن **الأوزان المستعملة فعلياً**: Tajawal 400/500/600/700، El Messiri 400/500/600/700، Cormorant 400 italic (ومتفرقات)، Geist Mono 400/700.
- أثر مباشر على FCP/LCP للنصوص (الـLCP في أغلب الصفحات نص/خط هيدينغ).

### CRITICAL-2: صور مشروع + معرضه — حتى ~10MB بأحجام أصلية
- غلاف المشروع: عارض 390×591 لكن الخام **1294×1216 PNG** (بلا أي transform).
- صور المعرض: عارض 173×173 لكن الخام **2752×1536 JPG** (وبلا lazy).
- المسار المباشر `res.cloudinary.com/.../upload/v.../masar/projects/...` — **غير ممر عبر next/image ولا يحمل f_auto/q_auto/w_**.

### HIGH-3: عناصر عائمة (floating objects) في Home تُطلب بعرض 1920
- `objects/{chair,vase,lamp,plant,marble,wood}.png` بـ `w=1920&q=75` بينما عرض العرض الفعلي **14-23px** (وفوق 6 تكرارات). تُطلب حتى الآن بـ lazy لكن بالعرض الأقصى.

### HIGH-4: تكرار استعلامات Supabase على كل صفحة + RSC prefetch متضخم
- كل صفحة تطلق 3 استعلامات عامة متطابقة: `global_promotions` + `projects` (قائمة) + `services` (قائمة) — من عدة مكونات، بلا خطة مشاركة/cache.
- Services شهدت **12 طلب fetch** (3 Supabase + ~9 RSC `?_rsc=` لمسارات `/، /projects، /start` مكررة بنسخ مختلفة).
- بلا cache على مستوى الخادم: كل RSC prefetch يعيد تنفيذ الاستعلامات على الـDB.

### MEDIUM-5: صور gallery المحلية بصفحات About/Services بعرض 1920
- `about/gallery-*.png` و `why-masar.png` و `furniture-styling.png` تُطلب بـ `w=1920&q=80-92` بينما عرض العرض 100-230px (lazy لكن بالحد الأقصى عند الجلب).

### LOW-6: JS المنطقة المقبولة لكن قابلة للاستهلاك
- ~365-404KB لكل صفحة (أكبرها قطعة 70KB؛ تشمل gsap/motion/supabase). لا تحمل 360 بعرض عارض زائد (لا قِسم ثقيل في التحميل الأولي — يُفحص لاحقاً).

## 3) سجلات فنية إضافية
- CLS شبه صفر في القياسات (سمة reduceMotion + البنية مستقرة). يُسجل رقمياً في القياس النهائي.
- عدد الطلبات مقسم: link 18-22 (أغلبها preload خطوط) + script 15-17 + fetch 4-12 + img 1-4.
- عنصر LCP يُحدَّد بهويته في القياسات النهائية (نص هيدينغ في Home/Services/About/Contact).

## 4) خطة التحسين المقترحة (كل تغيير = قياس → تعديل → اختبار → مقارنة)
1. **الخطوط:** حذف الأوزان غير المستعملة فقط (بدون تغيير أي عائلة أو وزن ظاهر).
2. **صور المشاريع/المعرض:** تمرير عبر next/image بحجوم العرض الفعلي + f_auto/q_auto عبر Cloudinary transforms أو الـoptimizer، مع lazy للمعرض.
3. **العناصر العائمة:** حد أقصى واقعي للعرض (≈96px).
4. **البيانات:** `React cache()` + `unstable_cache` للبيانات قليلة التغير (services/promotions/categories) + إزالة التكرار في نفس الـrender.
5. **صور About/Services المحلية:** تقييد العروض بالحجم الفعلي.
6. **JS:** مراجعة gsap/360 dynamic import بعد الخطوات أعلاه إن بقي أثر.