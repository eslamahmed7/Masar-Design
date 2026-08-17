/* ============================================================
   masar-viewer — client site app (landing + 360 tour)
   Reads ?project=<slug> and loads <slug>/project.json
   ============================================================ */
(function () {
  'use strict'

  var params = new URLSearchParams(location.search)
  var slug = (params.get('project') || '').trim()
  var BASE = slug ? encodeURIComponent(slug) + '/' : ''

  var ICONS = {
    play: '<path d="M6 4l14 8-14 8V4z"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9.5 15.5h5"/>',
    door: '<path d="M13 4h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6"/><path d="M4 20V4l9 2v14"/><path d="M12 12h.01"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 12h1v5h1"/>',
    cart: '<circle cx="9" cy="21" r="1.5"/><circle cx="19" cy="21" r="1.5"/><path d="M2 3h2.5l2.7 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L22 8H6"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="m1 1 22 22"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6L22 7"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    gem: '<path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M2 9h20"/><path d="m12 21 4-12-4-6-4 6 4 12z"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/>',
    palette: '<path d="M12 22a10 10 0 1 1 10-10c0 2.5-1.5 4-3.5 4H16a2 2 0 0 0-1.5 3.3c.5.6.2 1.7-.8 1.7z"/><circle cx="7.5" cy="11" r="1"/><circle cx="11" cy="7.5" r="1"/><circle cx="15.5" cy="9.5" r="1"/>',
    armchair: '<path d="M5 11V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4"/><path d="M3 11a2 2 0 0 1 2 2v2h14v-2a2 2 0 1 1 4 0v4a2 2 0 0 1-2 2h-1l-1 3"/><path d="M5 19H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2"/>',
    navigate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8"/>',
    navArrow: '<path d="M4 12h16M14 5l7 7-7 7"/>',
    navCircle: '<circle cx="12" cy="12" r="9"/><path d="M7 12h10M13 8l4 4-4 4"/>',
    navDiamond: '<path d="M12 3l7 9-7 9-7-9z"/><path d="M8 12h8"/>',
    navFlag: '<path d="M6 3v18"/><path d="M6 4h11l-2.8 4L17 12H6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>'
  }

  function icon(name, size) {
    var s = size || 14
    return (
      '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || '') +
      '</svg>'
    )
  }

  var WHY = [
    { icon: 'sparkles', title: 'تصميم مخصص بالكامل', desc: 'كل مشروع يتم تصميمه خصيصاً ليناسب احتياجات العميل وأسلوب حياته.' },
    { icon: 'eye', title: 'واقعية عالية في التصور', desc: 'تصميمات ثلاثية الأبعاد تساعدك على رؤية مشروعك قبل التنفيذ.' },
    { icon: 'gem', title: 'اهتمام بأدق التفاصيل', desc: 'كل خامة وكل لون وكل قطعة أثاث يتم اختيارها بعناية لتحقيق أفضل نتيجة.' },
    { icon: 'layers', title: 'حلول عملية وجمالية', desc: 'تصميم يجمع بين الوظيفة والراحة والجمال في كل مساحة.' }
  ]

  var SERVICES = [
    { icon: 'home', title: 'التصميم الداخلي', desc: 'نصمّم مساحات تعكس أسلوب حياتك وتوازن بين الجمال والوظيفة. كل تفصيلة مدروسة بعناية لتمنحك تجربة معيشية استثنائية تدوم.' },
    { icon: 'grid', title: 'تصميم 2D', desc: 'مخططات دقيقة تضع الأساس لكل مشروع ناجح. ندرس توزيع الفراغات وحركة التنقل لنمنحك رؤية واضحة قبل أن تبدأ رحلة التنفيذ.' },
    { icon: 'layers', title: 'التصميم ثلاثي الأبعاد', desc: 'نحوّل التصميم إلى صور واقعية تنبض بالحياة. تقنيات إضاءة وخامات دقيقة تتيح لك رؤية مشروعك بأدق تفاصيله قبل التنفيذ.' },
    { icon: 'fileText', title: 'المخططات التنفيذية', desc: 'وثائق تنفيذية شاملة تترجم التصميم إلى واقع. رسومات دقيقة تضمن تنفيذاً سلساً ومطابقاً للرؤية بأعلى معايير الجودة.' },
    { icon: 'palette', title: 'اختيار الخامات والألوان', desc: 'ننتقي أرقى الخامات العالمية بعناية فائقة. من الرخام الإيطالي إلى الأخشاب الطبيعية، كل خامة تُختار لتروي قصة الفخامة والأناقة.' },
    { icon: 'armchair', title: 'تنسيق الأثاث', desc: 'نضفي الروح الأخيرة على مساحتك من خلال تنسيق أثاث متكامل. توازن مدروس بين القطع والإكسسوارات لخلق انسجام بصري آسر.' }
  ]

  var app = document.getElementById('app')
  var project = null
  var rooms = []
  var viewer = null
  var transitionTimer = null

  var S = {
    phase: 'landing',
    roomId: null,
    night: false,
    showPoints: true,
    visited: {},
    showRooms: false,
    showFloor: false,
    activeInfo: null,
    activeProduct: null
  }

  function asset(rel) {
    return rel ? BASE + rel.replace(/\\/g, '/') : ''
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  /* Screen <-> sphere projection (same math as the editor's panoMath). */
  var D = Math.PI / 180
  function projectPin(yawDeg, pitchDeg, camYawDeg, camPitchDeg, hfovDeg, w, h) {
    var p = pitchDeg * D
    var cp = camPitchDeg * D
    var dy = (yawDeg - camYawDeg) * D
    var f = Math.sin(p)
    var c = Math.cos(p)
    var e = Math.sin(cp)
    var d = Math.cos(cp)
    var g = Math.cos(dy)
    var l = Math.sin(dy)
    var zc = f * e + c * g * d
    if (zc <= 0 || w <= 0 || h <= 0) return { visible: false }
    var k = Math.tan((hfovDeg * D) / 2)
    var x = l * c
    var y = f * d - c * g * e
    return {
      x: w / 2 - (w / (2 * k)) * (x / zc),
      y: h / 2 - (w / (2 * k)) * (y / zc),
      visible: true
    }
  }

  var NAV_GLYPHS = [
    { value: 'compass' },
    { value: 'arrow' },
    { value: 'circle' },
    { value: 'diamond' },
    { value: 'door' },
    { value: 'flag' }
  ]
  function navGlyph(cls) {
    if (cls === 'arrow') return icon('navArrow', 18)
    if (cls === 'circle') return icon('navCircle', 18)
    if (cls === 'diamond') return icon('navDiamond', 18)
    if (cls === 'door') return icon('door', 18)
    if (cls === 'flag') return icon('navFlag', 18)
    return icon('navigate', 18)
  }
  function navStyleOf(h) {
    var cls = 'compass'
    if (h && h.navStyle) {
      var m = NAV_GLYPHS.find(function (g) {
        return g.value === h.navStyle
      })
      if (m) cls = m.value
    }
    return cls
  }

  function currentRoom() {
    return rooms.find(function (r) {
      return r.id === S.roomId
    }) || null
  }

  /* Old exported projects use flat x/y percentages (and floorPlanMarkers).
     Convert to yaw/pitch (and floorPlanPoints) so pins never land at 0,0. */
  function flatToYawPitch(xPct, yPct) {
    return { yaw: (xPct / 100) * 360 - 180, pitch: (0.5 - yPct / 100) * 180 }
  }

  function migrateProject(data) {
    ;(data.rooms || []).forEach(function (r) {
      ;(r.hotspots || []).forEach(function (h) {
        if (typeof h.yaw !== 'number' && typeof h.x === 'number' && typeof h.y === 'number') {
          var conv = flatToYawPitch(h.x, h.y)
          h.yaw = conv.yaw
          h.pitch = conv.pitch
        }
      })
    })
    if (!data.floorPlanPoints && data.floorPlanMarkers && data.floorPlanMarkers.length) {
      data.floorPlanPoints = data.floorPlanMarkers
        .filter(function (m) {
          return m.roomId
        })
        .map(function (m) {
          return { id: m.id, roomId: m.roomId, x: m.x + (m.w || 0) / 2, y: m.y + (m.h || 0) / 2 }
        })
    }
    return data
  }

  /* ================= Status / error ================= */
  function showStatus(title, sub, linkHref, linkText) {
    app.innerHTML =
      '<div class="lp-status">' +
      '<div class="mark">م</div>' +
      '<div class="title">' + esc(title) + '</div>' +
      '<div class="sub">' + esc(sub) + '</div>' +
      (linkHref ? '<a class="link" href="' + linkHref + '">' + esc(linkText || linkHref) + '</a>' : '') +
      '</div>'
  }

  /* ================= Landing ================= */
  function renderLanding() {
    document.title = project.name + ' — مسار | جولة 360°'
    var pdf = project.pdfs && project.pdfs.length ? project.pdfs[0] : null
    var cover = project.coverPath ? project.coverPath : null
    var year = new Date().getFullYear()
    var products = (project.products || []).slice(0, 6)

    var visual =
      '<div class="lp-cover-wrap">' +
      (cover
        ? '<img src="' + asset(cover) + '" alt="المشروع" onerror="this.remove()" />'
        : icon('sparkles', 44)) +
      '</div>'

    var pdfBtn = pdf
      ? '<button class="lp-btn-ghost" data-action="open-pdf">' + icon('pdf', 15) + ' ملف PDF للمشروع</button>'
      : ''

    var productsSection = products.length
      ? '<section id="products" class="lp-section lp-products">' +
        '<div class="lp-section-head">' +
        '<div class="lp-eyebrow">المنتجات</div>' +
        '<h2 class="lp-heading lp-section-title">قطع <span class="lp-gold-text">مميزة</span> من المشروع</h2>' +
        '<p class="lp-body lp-body-center">تعرّف على بعض القطع المستخدمة في هذا المشروع — انقر على أي منتج للتفاصيل.</p>' +
        '</div><div class="lp-products-grid">' +
        products.map(function (p) {
          return (
            '<button class="lp-card lp-product-card" data-action="open-product" data-id="' + p.id + '">' +
            (p.images && p.images.length
              ? '<img class="lp-product-img" src="' + asset(p.images[0]) + '" alt="' + esc(p.name) + '" loading="lazy" />'
              : '<div class="lp-product-img lp-product-img-empty">' + icon('sparkles', 22) + '</div>') +
            '<div class="lp-product-info">' +
            '<div class="lp-product-name">' + esc(p.name) + '</div>' +
            '<div class="lp-product-meta">' + esc([p.category, p.material, p.color].filter(Boolean).join(' • ')) + '</div>' +
            '</div>' +
            '<span class="lp-product-arrow">' + icon('chevronDown', 14) + '</span>' +
            '</button>'
          )
        }).join('') +
        '</div></section>'
      : ''

    var productsNav = products.length ? '<a href="#products">المنتجات</a>' : ''
    var productsFooter = products.length ? '<a class="lp-footer-link" href="#products">المنتجات</a>' : ''

    app.innerHTML =
      '<div class="lp-root" dir="rtl">' +
      '<div class="lp-bg"></div><div class="lp-bg-glow"></div>' +
      '<header class="lp-header">' +
      '<div class="lp-brand"><span class="lp-brand-mark">م</span>' +
      '<div class="lp-brand-text"><span class="lp-brand-name">مسار</span>' +
      '<span class="lp-brand-tag">استوديو التصميم الداخلي</span></div></div>' +
      '<nav class="lp-nav">' +
      '<a href="#home">الرئيسية</a><a href="#about">عن مسار</a>' +
      '<a href="#why">لماذا مسار</a><a href="#services">الخدمات</a>' +
      productsNav +
      '</nav>' +
      '<div class="lp-header-actions">' +
      '<button class="lp-btn-gold lp-btn-sm" data-action="enter-tour">دخول الجولة</button>' +
      '<a class="lp-icon-btn" href="./" title="العودة لمعرض المشاريع">' + icon('x', 15) + '</a>' +
      '</div></header>' +
      '<main>' +
      '<section id="home" class="lp-hero">' +
      '<div class="lp-eyebrow"><span class="lp-eyebrow-line"></span>استوديو التصميم الداخلي — مشروع ' + esc(project.name) + '<span class="lp-eyebrow-line"></span></div>' +
      '<h1 class="lp-heading lp-hero-title">مساحتك تبدأ <span class="lp-gold-text">هنا</span></h1>' +
      '<p class="lp-hero-desc">نحوّل المساحات إلى تجارب معيشية استثنائية تعكس شخصيتك وتُلهم حياتك اليومية.' +
      (project.description ? ' ' + esc(project.description) : '') + '</p>' +
      '<div class="lp-hero-actions">' +
      '<button class="lp-btn-gold" data-action="enter-tour">' + icon('play', 15) + ' دخول الجولة</button>' +
      pdfBtn +
      '</div>' +
      '<div class="lp-stats">' +
      '<div class="lp-stat"><div class="lp-stat-num lp-gold-text">' + rooms.length + '+</div><div class="lp-stat-label">غرف بجولة 360°</div></div>' +
      '<div class="lp-stat"><div class="lp-stat-num lp-gold-text">' + products.length + '+</div><div class="lp-stat-label">منتج مميز</div></div>' +
      '<div class="lp-stat"><div class="lp-stat-num lp-gold-text">100%</div><div class="lp-stat-label">تصميم مخصص</div></div>' +
      '</div></section>' +

      '<section id="about" class="lp-section lp-about">' +
      '<div class="lp-about-visual">' + visual + '<span class="lp-about-glow"></span></div>' +
      '<div class="lp-about-text">' +
      '<div class="lp-eyebrow">عن مسار</div>' +
      '<h2 class="lp-heading lp-section-title">نؤمن أن التصميم ليس شكلاً — <span class="lp-gold-text">بل أسلوب حياة.</span></h2>' +
      '<p class="lp-body">في مسار، لا نصمم المساحات فحسب — بل نصوغ تجارب تُعاش كل يوم. نمزج بين الفخامة الهادئة، والمواد الأصيلة، والضوء المدروس بعناية، لنحوّل كل غرفة إلى انعكاسٍ صادق لهوية من يسكنها.</p>' +
      (project.clientName ? '<div class="lp-client">مشروع ' + esc(project.clientName) + '</div>' : '') +
      '<div class="lp-signature">' + icon('sparkles', 14) + '<span>' + esc(project.companyName || 'MASAR') + ' Interior Design Studio</span></div>' +
      '</div></section>' +

      '<section id="why" class="lp-section lp-why">' +
      '<div class="lp-section-head">' +
      '<div class="lp-eyebrow">لماذا مسار</div>' +
      '<h2 class="lp-heading lp-section-title">لماذا تختار مسار؟</h2>' +
      '<p class="lp-body lp-body-center">خبرة تمتد لسنوات، وتصميمات تُرسم بعناية — لأن مساحتك تستحق الأفضل دائماً.</p>' +
      '</div><div class="lp-why-grid">' +
      WHY.map(function (w, i) {
        return (
          '<div class="lp-card lp-why-card">' +
          '<span class="lp-why-num">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="lp-why-icon">' + icon(w.icon, 20) + '</span>' +
          '<div class="lp-why-title">' + esc(w.title) + '</div>' +
          '<div class="lp-why-desc">' + esc(w.desc) + '</div>' +
          '</div>'
        )
      }).join('') +
      '</div></section>' +

      '<section id="services" class="lp-section lp-services">' +
      '<div class="lp-section-head">' +
      '<div class="lp-eyebrow">الخدمات</div>' +
      '<h2 class="lp-heading lp-section-title">حلول تصميم <span class="lp-gold-text">متكاملة</span></h2>' +
      '<p class="lp-body lp-body-center">نقدم تجربة تصميم داخلي شاملة بدقة عالية وإبداعية متناهية، من المرحلة الأولى للاستشارة حتى التنفيذ الكامل.</p>' +
      '</div><div class="lp-services-grid">' +
      SERVICES.map(function (s) {
        return (
          '<div class="lp-card lp-service-card">' +
          '<span class="lp-service-icon">' + icon(s.icon, 20) + '</span>' +
          '<div class="lp-service-title">' + esc(s.title) + '</div>' +
          '<div class="lp-service-desc">' + esc(s.desc) + '</div>' +
          '</div>'
        )
      }).join('') +
      '</div></section>' +

      productsSection +

      '<section class="lp-cta">' +
      '<div class="lp-eyebrow">استوديو مسار — الخطوة التالية</div>' +
      '<h2 class="lp-heading lp-cta-title">لنبدأ في تصميم <span class="lp-gold-text">مساحتك القادمة</span></h2>' +
      '<p class="lp-body lp-body-center">كل مساحة عظيمة تبدأ بمحادثة واحدة. استكشف هذا المشروع بجولة تفاعلية كاملة.</p>' +
      '<div class="lp-hero-actions">' +
      '<button class="lp-btn-gold lp-btn-lg" data-action="enter-tour">' + icon('play', 16) + ' دخول الجولة</button>' +
      pdfBtn +
      '</div></section></main>' +

      '<footer class="lp-footer">' +
      '<div class="lp-footer-grid">' +
      '<div class="lp-footer-col">' +
      '<div class="lp-brand"><span class="lp-brand-mark">م</span>' +
      '<div class="lp-brand-text"><span class="lp-brand-name">مسار</span>' +
      '<span class="lp-brand-tag">Luxury Interior Design Studio</span></div></div>' +
      '<p class="lp-footer-desc">نؤمن أن التصميم ليس مجرد شكل، بل أسلوب حياة. نحوّل المساحات إلى تجارب خالدة تعكس هوية أصحابها.</p>' +
      '</div>' +
      '<div class="lp-footer-col"><div class="lp-footer-title">روابط سريعة</div>' +
      '<a class="lp-footer-link" href="#home">الرئيسية</a>' +
      '<a class="lp-footer-link" href="#about">عن مسار</a>' +
      '<a class="lp-footer-link" href="#why">لماذا مسار</a>' +
      '<a class="lp-footer-link" href="#services">الخدمات</a>' +
      productsFooter +
      '</div>' +
      '<div class="lp-footer-col"><div class="lp-footer-title">تواصل معنا</div>' +
      '<div class="lp-contact-card"><span class="lp-contact-icon">' + icon('phone', 13) + '</span><div><div class="lp-contact-label">الهاتف</div><div class="lp-contact-value">01275477819</div></div></div>' +
      '<div class="lp-contact-card"><span class="lp-contact-icon">' + icon('mail', 13) + '</span><div><div class="lp-contact-label">البريد الإلكتروني</div><div class="lp-contact-value">masardesign1@gmail.com</div></div></div>' +
      '<div class="lp-contact-card"><span class="lp-contact-icon">' + icon('mapPin', 13) + '</span><div><div class="lp-contact-label">الموقع</div><div class="lp-contact-value">مصر - القاهرة - السلام - منتجع النخيل</div></div></div>' +
      '<div class="lp-contact-card"><span class="lp-contact-icon">' + icon('clock', 13) + '</span><div><div class="lp-contact-label">ساعات العمل</div><div class="lp-contact-value">الأحد – الخميس: ٩ص – ٦م</div></div></div>' +
      '</div></div>' +
      '<div class="lp-footer-bottom">' +
      '<span>© ' + year + ' مسار لاستوديو التصميم الداخلي. جميع الحقوق محفوظة.</span>' +
      '<span class="lp-footer-project">مشروع ' + esc(project.name) + '</span>' +
      '</div></footer>' +
      '<div id="modal-root"></div>' +
      '</div>'
  }

  /* ================= Tour ================= */
  function buildScenes() {
    var map = {}
    rooms.forEach(function (r) {
      if (!r.panorama) return
      map[r.id] = {
        type: 'equirectangular',
        panorama: asset(S.night ? r.lighting || r.panorama : r.panorama),
        hotSpots: (r.hotspots || [])
          .filter(function (h) {
            return h.visible && h.type !== 'navigate'
          })
          .map(function (h) {
            return {
              id: h.id,
              pitch: h.pitch || 0,
              yaw: h.yaw || 0,
              type: 'custom',
              cssClass: 'pt-pin pt-pin-' + h.type,
              text: h.label,
              clickHandlerArgs: { hid: h.id },
              clickHandlerFunc: function (ev, arg) {
                handleHotspotById(arg && arg.hid)
              }
            }
          })
      }
    })
    return map
  }

  function renderTour() {
    app.innerHTML =
      '<div class="preview-tour ' + (S.showPoints ? '' : 'pt-hide-hotspots') + '" dir="rtl" id="tour-root">' +
      '<div class="pt-viewer" id="pano"></div>' +
      '<div class="pt-transition" id="transition"></div>' +
      '<div class="pt-swoosh" id="swoosh"></div>' +
      '<div class="pt-nav-layer" id="nav-layer"></div>' +
      '<div class="pt-topbar">' +
      '<div class="pt-top-right">' +
      '<button class="pt-btn" data-action="exit-tour">' + icon('x', 13) + ' <span>خروج</span></button>' +
      '<div class="pt-project-info"><div class="pt-project-name">' + esc(project.name) + '</div>' +
      '<div class="pt-room-name" id="room-name"></div></div>' +
      '</div>' +
      '<div class="pt-top-left">' +
      '<button class="pt-btn" data-action="toggle-night" id="night-btn" title="تبديل الإضاءة">' + icon('moon', 15) + '</button>' +
      '<button class="pt-btn" data-action="toggle-points" id="points-btn" title="إظهار / إخفاء النقاط">' + icon('eye', 15) + '</button>' +
      '</div></div>' +
      '<div class="pt-hud">' +
      '<button class="pt-hud-btn pt-hud-btn-floor" data-action="toggle-floor">' + (project.floorPlanImage ? '<img class="pt-hud-floor-thumb" src="' + asset(project.floorPlanImage) + '" alt="مخطط الطابق" />' : icon('map', 14)) + ' <span>المخطط</span></button>' +
      '<button class="pt-hud-btn" data-action="toggle-rooms">' + icon('door', 14) + ' الغرف (<span id="visited-count">0</span>/' + rooms.length + ')</button>' +
      '</div>' +
      '<div class="pt-panel pt-panel-rooms" id="rooms-panel" style="display:none"></div>' +
      '<div class="pt-floor-modal" id="floor-modal" style="display:none" data-action="close-floor">' +
      '<button class="pt-floor-close" data-action="close-floor">' + icon('x', 15) + '</button>' +
      '<div id="floor-content"></div>' +
      '</div>' +
      '<div class="pt-label-bar">' +
      '<div><div class="pt-label-current">الغرفة الحالية</div><div class="pt-label-name" id="label-name"></div></div>' +
      '<div class="pt-label-desc" id="label-desc"></div>' +
      '<span class="pt-label-count" id="label-count"></span>' +
      '</div>' +
      '<div id="modal-root"></div>' +
      '</div>'

    S.phase = 'tour'
    var first = rooms.find(function (r) { return r.panorama }) || rooms[0]
    if (first) {
      S.roomId = first.id
      S.visited = {}
      S.visited[first.id] = true
      buildViewer()
    } else {
      app.innerHTML = ''
    }
  }

  function destroyViewer() {
    if (pinRaf) {
      cancelAnimationFrame(pinRaf)
      pinRaf = 0
    }
    if (viewer) {
      try {
        viewer.destroy()
      } catch (e) {
        /* noop */
      }
      viewer = null
    }
  }

  var pinRaf = 0
  function tickPins() {
    pinRaf = requestAnimationFrame(tickPins)
    positionNavPins()
  }

  function buildViewer() {
    var el = document.getElementById('pano')
    if (!el) return
    var transition = document.getElementById('transition')
    if (transition) transition.style.display = 'block'

    destroyViewer()
    updateChrome()

    try {
      var firstSceneId = rooms.find(function (r) { return r.panorama }) || rooms[0]
      viewer = window.pannellum.viewer(el, {
        scenes: buildScenes(),
        firstScene: firstSceneId ? firstSceneId.id : undefined,
        sceneFadeDuration: 150,
        autoLoad: true,
        showControls: false,
        compass: false,
        hotSpotDebug: false,
        hfov: 75,
        minHfov: 25,
        maxHfov: 110,
        yaw: 0,
        pitch: 0,
        mouseZoom: true,
        keyboardZoom: true,
        doubleClickZoom: false,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        draggable: true,
        autoRotate: 0,
        preventDefaultTouch: false
      })
      viewer.on('load', function () {
        if (transition) transition.style.display = 'none'
        if (typeof pinRaf === 'number' && !pinRaf) tickPins()
        var sceneMap = buildScenes()
        Object.keys(sceneMap).forEach(function (id) {
          var img = new Image()
          img.src = sceneMap[id].panorama
        })
      })
      viewer.on('error', function (msg) {
        console.error('pannellum error:', msg)
        if (transition) transition.style.display = 'none'
      })
      viewer.on('scenechange', function (id) {
        S.roomId = id
        S.visited[id] = true
        updateChrome()
        triggerSwoosh()
      })
    } catch (e) {
      console.error('buildViewer:', e)
      if (transition) transition.style.display = 'none'
    }
  }

  function gotoRoom(id) {
    var room = rooms.find(function (r) { return r.id === id })
    if (!room || !room.panorama || !viewer) return
    try {
      viewer.loadScene(id)
      S.roomId = id
      S.visited[id] = true
      updateChrome()
      triggerSwoosh()
    } catch (e) {
      /* noop */
    }
    S.showRooms = false
    S.showFloor = false
    refreshPanels()
  }

  function triggerSwoosh() {
    var el = document.getElementById('swoosh')
    if (!el) return
    el.classList.remove('pt-swoosh-anim')
    void el.offsetWidth
    el.classList.add('pt-swoosh-anim')
  }

  function navLayerItems() {
    var room = currentRoom()
    if (!room) return []
    return (room.hotspots || [])
      .filter(function (h) {
        return h.visible && h.type === 'navigate' && h.targetRoomId
      })
      .map(function (h) {
        var target = rooms.find(function (x) {
          return x.id === h.targetRoomId
        })
        return target && target.panorama ? { h: h, target: target } : null
      })
      .filter(Boolean)
  }

  function renderNavPins() {
    var el = document.getElementById('nav-layer')
    if (!el) return
    var items = navLayerItems()
    el.innerHTML = items
      .map(function (it) {
        var style = navStyleOf(it.h)
        var label = esc(String(it.h.label || it.target.name)).replace(/\n/g, '<br/>')
        return (
          '<button type="button" class="pt-navpin pt-navpin-' + style + '" data-navpin="' + it.h.id + '" data-action="goto-room" data-id="' + it.target.id + '">' +
          '<span class="pt-navpin-glyph">' + navGlyph(style) + '</span>' +
          '<span class="pt-navpin-label">' + label + '</span>' +
          '</button>'
        )
      })
      .join('')
  }

  function positionNavPins() {
    var layer = document.getElementById('nav-layer')
    if (!layer || !viewer) return
    var box = document.getElementById('pano')
    var rect = box ? box.getBoundingClientRect() : null
    if (!rect || rect.width <= 0 || rect.height <= 0) return
    var yaw, pitch, hfov
    try {
      yaw = viewer.getYaw()
      pitch = viewer.getPitch()
      hfov = viewer.getHfov()
    } catch (e) {
      return
    }
    var items = navLayerItems()
    layer.querySelectorAll('[data-navpin]').forEach(function (b) {
      var item = items.find(function (x) {
        return x.h.id === b.getAttribute('data-navpin')
      })
      if (!item) {
        b.style.display = 'none'
        return
      }
      var pr = projectPin(item.h.yaw || 0, item.h.pitch || 0, yaw, pitch, hfov, rect.width, rect.height)
      if (!pr.visible) {
        b.style.display = 'none'
        return
      }
      b.style.display = ''
      var w = b.offsetWidth || 120
      var h = b.offsetHeight || 48
      b.style.transform = 'translate(' + Math.round(pr.x - w / 2) + 'px,' + Math.round(pr.y - h / 2) + 'px)'
    })
  }

  function handleHotspotById(id) {
    var room = currentRoom()
    var h = room ? (room.hotspots || []).find(function (x) { return x.id === id }) : null
    if (!h) return
    if (h.type === 'info' && h.infoCardId) {
      var card = (room.infoCards || []).find(function (c) { return c.id === h.infoCardId })
      openInfoModal(card, h.label)
    } else if (h.type === 'product' && h.productId) {
      var p = (project.products || []).find(function (x) { return x.id === h.productId })
      if (p) openProductModal(p)
    } else if (h.type === 'external' && h.url) {
      window.open(h.url, '_blank')
    } else if (h.type === 'pdf' && h.pdfId) {
      var pdf = (project.pdfs || []).find(function (x) { return x.id === h.pdfId })
      if (pdf) window.open(asset(pdf.path), '_blank')
    }
  }

  function updateChrome() {
    var room = currentRoom()
    var nameEl = document.getElementById('room-name')
    var labelName = document.getElementById('label-name')
    var labelDesc = document.getElementById('label-desc')
    var labelCount = document.getElementById('label-count')
    var visitedEl = document.getElementById('visited-count')
    var nightBtn = document.getElementById('night-btn')
    var pointsBtn = document.getElementById('points-btn')
    if (nameEl) nameEl.textContent = room ? room.name : ''
    if (labelName) labelName.textContent = room ? room.name : ''
    if (labelDesc) labelDesc.textContent = room && room.description ? room.description : ''
    if (labelCount) {
      var idx = room ? rooms.findIndex(function (r) {
        return r.id === room.id
      }) : -1
      labelCount.textContent = (idx + 1) + '/' + rooms.length
    }
    if (visitedEl) visitedEl.textContent = Object.keys(S.visited).length
    if (nightBtn) {
      nightBtn.innerHTML = S.night ? icon('sun', 15) : icon('moon', 15)
      nightBtn.classList.toggle('pt-night', S.night)
    }
    if (pointsBtn) {
      pointsBtn.innerHTML = S.showPoints ? icon('eye', 15) : icon('eyeOff', 15)
      pointsBtn.classList.toggle('active', !S.showPoints)
    }
    renderNavPins()
  }

  function renderRoomsPanel() {
    var el = document.getElementById('rooms-panel')
    if (!el) return
    el.innerHTML =
      '<div class="pt-room-strip">' +
      rooms
        .map(function (r) {
          var thumb = r.thumbnail || r.panorama
          var disabled = !r.panorama ? ' disabled' : ''
          return (
            '<button class="pt-room-card-mini ' + (r.id === S.roomId ? 'active' : '') + '" data-action="goto-room" data-id="' + r.id + '"' + disabled + '>' +
            (thumb
              ? '<img src="' + asset(thumb) + '" alt="" loading="lazy" />'
              : '<div class="pt-noimg">' + icon('door', 16) + '</div>') +
            '<span>' + esc(r.name) + '</span>' +
            '</button>'
          )
        })
        .join('') +
      '</div>'
  }

  function renderFloorModal() {
    var content = document.getElementById('floor-content')
    if (!content) return
    if (!project.floorPlanImage) {
      content.innerHTML = '<div class="pt-floor-none">' + icon('map', 30) + '<div>لا يوجد مخطط طابق لهذا المشروع</div></div>'
      return
    }
    var points = (project.floorPlanPoints || [])
      .map(function (pt) {
        var r = rooms.find(function (x) { return x.id === pt.roomId })
        return r ? { pt: pt, room: r } : null
      })
      .filter(Boolean)
      .map(function (x) {
        return (
          '<button class="pt-floor-point ' + (x.room.id === S.roomId ? 'active' : '') + (x.room.panorama ? '' : ' disabled') + '" data-action="goto-room" data-id="' + x.room.id + '" style="left:' + x.pt.x + '%;top:' + x.pt.y + '%" title="الانتقال إلى ' + esc(x.room.name) + '"' + (x.room.panorama ? '' : ' disabled') + '>' +
          '<span class="pt-floor-dot"></span>' +
          '<span class="pt-floor-tag">' + esc(x.room.name) + '</span>' +
          '</button>'
        )
      })
      .join('')
    content.innerHTML =
      '<div class="pt-floor-wrap" data-stop="1"><img src="' + asset(project.floorPlanImage) + '" alt="مخطط الطابق" />' + points + '</div>'
  }

  /* ================= Modals ================= */
  function kvRows(rows) {
    return rows
      .filter(function (row) {
        return row[1]
      })
      .map(function (row) {
        return '<div class="pt-kv"><span>' + esc(row[0]) + '</span><span>' + esc(row[1]) + '</span></div>'
      })
      .join('')
  }

  function openInfoModal(card, label) {
    if (!card) return
    var html = '<div class="pt-modal">' +
      '<div class="pt-modal-head"><div>' +
      '<div class="pt-modal-label">تفاصيل</div>' +
      '<div class="pt-modal-title">' + esc(card.title || label) + '</div></div>' +
      '<button class="pt-modal-x" data-action="close-modal">' + icon('x', 14) + '</button></div>' +
      '<div class="pt-modal-body">'

    if (card.description) html += '<div class="pt-modal-desc">' + esc(card.description) + '</div>'
    if (card.images && card.images.length) {
      html += '<div class="pt-modal-images">' + card.images.map(function (img) {
        return '<img src="' + asset(img) + '" alt="" loading="lazy" />'
      }).join('') + '</div>'
    }
    if (card.dimensions && card.dimensions.length) {
      html += '<div class="pt-modal-section"><div class="pt-modal-subtitle">المقاسات</div>' + kvRows(card.dimensions.map(function (d) { return [d.key, d.value] })) + '</div>'
    }
    if (card.specifications && card.specifications.length) {
      html += '<div class="pt-modal-section"><div class="pt-modal-subtitle">المواصفات</div>' + kvRows(card.specifications.map(function (d) { return [d.key, d.value] })) + '</div>'
    }
    if (card.notes && card.notes.length) {
      html += '<div class="pt-modal-section"><div class="pt-modal-subtitle">ملاحظات</div>' + card.notes.map(function (n) {
        return '<div class="pt-note">• ' + esc(n) + '</div>'
      }).join('') + '</div>'
    }
    if (card.videos && card.videos.length) {
      html += '<div class="pt-modal-section"><div class="pt-modal-subtitle">فيديو</div>' + card.videos.map(function (v) {
        return '<button class="btn" data-action="open-url" data-url="' + asset(v) + '">' + icon('play', 12) + ' تشغيل ' + esc(String(v).split('/').pop()) + '</button>'
      }).join('') + '</div>'
    }
    if (card.downloads && card.downloads.length) {
      html += '<div class="pt-modal-section"><div class="pt-modal-subtitle">التحميلات</div>' + card.downloads.map(function (d) {
        return '<button class="btn" data-action="open-url" data-url="' + asset(d.path) + '">' + icon('download', 12) + ' ' + esc(d.name) + '</button>'
      }).join('') + '</div>'
    }
    if (card.links && card.links.length) {
      html += '<div class="pt-modal-section"><div class="pt-modal-subtitle">روابط</div>' + card.links.map(function (l) {
        return '<button class="btn" data-action="open-url" data-url="' + esc(l.url) + '">' + icon('link', 12) + ' ' + esc(l.label || l.url) + '</button>'
      }).join('') + '</div>'
    }
    html += '</div></div>'
    showModal(html)
  }

  function openProductModal(product) {
    var html = '<div class="pt-modal">' +
      '<div class="pt-modal-head"><div>' +
      '<div class="pt-modal-label">منتج</div>' +
      '<div class="pt-modal-title">' + esc(product.name) + '</div></div>' +
      '<button class="pt-modal-x" data-action="close-modal">' + icon('x', 14) + '</button></div>' +
      '<div class="pt-modal-body">'
    if (product.images && product.images.length) {
      html += '<div class="pt-modal-images">' + product.images.map(function (img) {
        return '<img src="' + asset(img) + '" alt="" loading="lazy" />'
      }).join('') + '</div>'
    }
    if (product.description) html += '<div class="pt-modal-desc">' + esc(product.description) + '</div>'
    html += '<div class="pt-modal-section">' + kvRows([
      ['التصنيف', product.category],
      ['المقاسات', product.dimensions],
      ['الخامة', product.material],
      ['اللون', product.color]
    ]) + '</div>'
    if (product.buyUrl) {
      html += '<button class="btn btn-primary" style="width:100%" data-action="open-url" data-url="' + esc(product.buyUrl) + '">' + icon('cart', 14) + ' رابط الشراء</button>'
    }
    html += '</div></div>'
    showModal(html)
  }

  function showModal(inner) {
    var root = document.getElementById('modal-root')
    if (root) root.innerHTML = '<div class="pt-modal-backdrop" data-action="close-modal">' + inner + '</div>'
  }

  function closeModal() {
    var root = document.getElementById('modal-root')
    if (root) root.innerHTML = ''
  }

  /* ================= Actions ================= */
  function exitTour() {
    try {
      if (window.self !== window.top) {
        parent.postMessage({ type: 'masar:exit-tour' }, '*')
        return
      }
    } catch (e) {
      /* noop */
    }
    window.location.href = './'
  }

  function enterTour() {
    if (rooms.length === 0) {
      showStatus('لا توجد غرف بعد', 'هذا المشروع لا يحتوي على غرف بجولة 360° بعد.', './', 'العودة للمعرض')
      return
    }
    S.roomId = null
    S.night = false
    S.showPoints = true
    S.visited = {}
    S.showRooms = false
    S.showFloor = false
    renderTour()
  }

  function refreshPanels() {
    var roomsPanel = document.getElementById('rooms-panel')
    var floorModal = document.getElementById('floor-modal')
    var roomsBtn = null
    var floorBtn = null
    document.querySelectorAll('.pt-hud-btn').forEach(function (b) {
      if (b.getAttribute('data-action') === 'toggle-rooms') roomsBtn = b
      if (b.getAttribute('data-action') === 'toggle-floor') floorBtn = b
    })
    if (roomsPanel) roomsPanel.style.display = S.showRooms ? 'block' : 'none'
    if (floorModal) floorModal.style.display = S.showFloor ? 'flex' : 'none'
    if (roomsBtn) roomsBtn.classList.toggle('active', S.showRooms)
    if (floorBtn) floorBtn.classList.toggle('active', S.showFloor)
    if (S.showRooms) renderRoomsPanel()
    if (S.showFloor) renderFloorModal()
  }

  app.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-action]') : null
    if (!el || !app.contains(el)) return
    var action = el.getAttribute('data-action')

    if (action === 'enter-tour') enterTour()
    else if (action === 'exit-tour') {
      exitTour()
    } else if (action === 'open-pdf') {
      var pdf = project && project.pdfs && project.pdfs.length ? project.pdfs[0] : null
      if (pdf) window.open(asset(pdf.path), '_blank')
    } else if (action === 'open-product') {
      var prod = (project.products || []).find(function (x) { return x.id === el.getAttribute('data-id') })
      if (prod) openProductModal(prod)
    } else if (action === 'goto-room') {
      gotoRoom(el.getAttribute('data-id'))
    } else if (action === 'toggle-night') {
      S.night = !S.night
      buildViewer()
    } else if (action === 'toggle-points') {
      S.showPoints = !S.showPoints
      var root = document.getElementById('tour-root')
      if (root) root.classList.toggle('pt-hide-hotspots', !S.showPoints)
      updateChrome()
    } else if (action === 'toggle-rooms') {
      S.showRooms = !S.showRooms
      S.showFloor = false
      refreshPanels()
    } else if (action === 'toggle-floor') {
      S.showFloor = !S.showFloor
      S.showRooms = false
      refreshPanels()
    } else if (action === 'close-floor') {
      S.showFloor = false
      refreshPanels()
    } else if (action === 'close-modal') {
      if (e.target.closest('.pt-floor-wrap')) return
      closeModal()
    } else if (action === 'open-url') {
      var url = el.getAttribute('data-url')
      if (url) window.open(url, '_blank')
    }
  })

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || S.phase !== 'tour') return
    var root = document.getElementById('modal-root')
    if (root && root.innerHTML) {
      closeModal()
    } else if (S.showFloor) {
      S.showFloor = false
      refreshPanels()
    } else {
      exitTour()
    }
  })

  /* ================= Boot ================= */
  if (!slug) {
    showStatus('رابط خاطئ', 'أضف اسم المشروع إلى الرابط: ?project=اسم-المشروع', './', 'العودة لمعرض المشاريع')
    return
  }

  fetch(BASE + 'project.json')
    .then(function (r) {
      if (!r.ok) throw new Error('not found')
      return r.json()
    })
    .then(function (data) {
      data = migrateProject(data)
      project = data
      rooms = (data.rooms || []).filter(function (r) {
        return !r.hidden
      })
      if (typeof window.pannellum !== 'undefined') {
        renderLanding()
      } else {
        showStatus('جاري التحميل…', 'يتم تجهيز مشغل الجولة، برجاء الانتظار لحظات.')
      }
    })
    .catch(function () {
      showStatus('المشروع غير موجود', 'لم نتمكن من العثور على المشروع المطلوب. تأكد من صحة الرابط أو عد لمعرض المشاريع.', './', 'العودة لمعرض المشاريع')
    })
})()
