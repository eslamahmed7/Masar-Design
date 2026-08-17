# masar-viewer — رفع مشاريع العملاء

هذا الموقع يستضيف معارض مشاريع العملاء (صفحة هبوط + جولة 360°) على Cloudflare Pages.
كل مشروع ينشر في مجلد باسم المشروع، والرابط يصبح باسم المشروع:

```
https://masar-viewer.pages.dev/اسم-المشروع/
```

## طريقة النشر

### 1) تصدير المشروع من برنامج Masar Editor
- داخل البرنامج: **ملف ← تصدير المشروع…** (أو Ctrl+E)
- احفظ الملف بصيغة `.msar`

### 2) إضافة المشروع لهذا الموقع
من مجلد المشروع (حيث يوجد `tools/`):

```bash
node tools/prepare.mjs "C:\المسار\إلى\المشروع.msar"
```

أو إذا كان التصدير مجلداً مستخرجاً:

```bash
node tools/prepare.mjs "C:\المسار\إلى\مجلد-التصدير"
```

يمكن تحديد اسم رابط مخصص:

```bash
node tools/prepare.mjs "C:\المسار\فيلا.msar" --slug=villa-nakheel
```

حذف مشروع:

```bash
node tools/prepare.mjs --remove اسم-المشروع
```

إعادة بناء فهرس المشاريع فقط (بعد حذف مجلد يدوياً):

```bash
node tools/prepare.mjs
```

### 3) الرفع إلى Cloudflare Pages

**الطريقة الأولى — أداة Wrangler (موصى بها):**

```bash
npm install -g wrangler
npx wrangler pages deploy . --project-name masar-viewer
```

**الطريقة الثانية — لوحة Cloudflare:**
1. ادخل إلى https://dash.cloudflare.com
2. Workers & Pages ← Create ← Pages ← Upload assets
3. ارفع محتويات مجلد `masar-viewer` كاملاً (مع الاحتفاظ بالترتيب).
4. بعد أول نشر، الربط: Project settings ← Builds & deployments ← Continuous deployment ← Connect Git repository (أو أعد رفع الملفات عند كل تحديث).
5. اسم المشروع `masar-viewer` يعطيك الرابط الأساسي:

```
https://masar-viewer.pages.dev/
```

> **ملاحظة**: أي إصدار من موقع Cloudflare Pages المجاني يكفي لعدد غير محدود من مشاريع العملاء — كل مشروع مجرد مجلد داخل نفس الموقع.

### 4) إعطاء العميل الرابط

الرابط النهائي لكل عميل باسم مشروعه:

```
https://masar-viewer.pages.dev/اسم-المشروع/
```

- هذا الرابط يفتح مباشرة على **صفحة هبوط** بمظهر موقع مسار (من نحن / لماذا مسار / الخدمات) + زر **"دخول الجولة"** وزر **"ملف PDF للمشروع"** (إن وُجد PDF في المشروع).
- زر دخول الجولة ينقل العميل إلى جولة 360° تفاعلية (نقاط معلومات، منتجات، مخطط الطابق، وضع الليل).

### ربط دومين مخصص (اختياري)

في لوحة Cloudflare: Pages ← masar-viewer ← Custom domains ← أضف دوميناً مثل `viewer.masar-design.com`، واتبع تعليمات DNS.
