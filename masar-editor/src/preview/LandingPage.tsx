import { assetUrl } from '../core/ipc'
import { Icon, type IconName } from '../components/Icon'
import type { Product, Project } from '../core/types'

const WHY: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: 'sparkles',
    title: 'تصميم مخصص بالكامل',
    desc: 'كل مشروع يتم تصميمه خصيصاً ليناسب احتياجات العميل وأسلوب حياته.'
  },
  {
    icon: 'eye',
    title: 'واقعية عالية في التصور',
    desc: 'تصميمات ثلاثية الأبعاد تساعدك على رؤية مشروعك قبل التنفيذ.'
  },
  {
    icon: 'gem',
    title: 'اهتمام بأدق التفاصيل',
    desc: 'كل خامة وكل لون وكل قطعة أثاث يتم اختيارها بعناية لتحقيق أفضل نتيجة.'
  },
  {
    icon: 'layers',
    title: 'حلول عملية وجمالية',
    desc: 'تصميم يجمع بين الوظيفة والراحة والجمال في كل مساحة.'
  }
]

const SERVICES: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: 'home',
    title: 'التصميم الداخلي',
    desc: 'نصمّم مساحات تعكس أسلوب حياتك وتوازن بين الجمال والوظيفة. كل تفصيلة مدروسة بعناية لتمنحك تجربة معيشية استثنائية تدوم.'
  },
  {
    icon: 'grid',
    title: 'تصميم 2D',
    desc: 'مخططات دقيقة تضع الأساس لكل مشروع ناجح. ندرس توزيع الفراغات وحركة التنقل لنمنحك رؤية واضحة قبل أن تبدأ رحلة التنفيذ.'
  },
  {
    icon: 'layers',
    title: 'التصميم ثلاثي الأبعاد',
    desc: 'نحوّل التصميم إلى صور واقعية تنبض بالحياة. تقنيات إضاءة وخامات دقيقة تتيح لك رؤية مشروعك بأدق تفاصيله قبل التنفيذ.'
  },
  {
    icon: 'file-text',
    title: 'المخططات التنفيذية',
    desc: 'وثائق تنفيذية شاملة تترجم التصميم إلى واقع. رسومات دقيقة تضمن تنفيذاً سلساً ومطابقاً للرؤية بأعلى معايير الجودة.'
  },
  {
    icon: 'palette',
    title: 'اختيار الخامات والألوان',
    desc: 'ننتقي أرقى الخامات العالمية بعناية فائقة. من الرخام الإيطالي إلى الأخشاب الطبيعية، كل خامة تُختار لتروي قصة الفخامة والأناقة.'
  },
  {
    icon: 'armchair',
    title: 'تنسيق الأثاث',
    desc: 'نضفي الروح الأخيرة على مساحتك من خلال تنسيق أثاث متكامل. توازن مدروس بين القطع والإكسسوارات لخلق انسجام بصري آسر.'
  }
]

export default function LandingPage({
  project,
  onEnterTour,
  onClose,
  onProductClick
}: {
  project: Project
  onEnterTour: () => void
  onClose: () => void
  onProductClick?: (p: Product) => void
}) {
  const pdf = project.pdfs[0] ?? null
  const roomShots = project.rooms.filter((r) => r.thumbnail || r.panorama).slice(0, 4)
  const year = new Date().getFullYear()
  const products = project.products.slice(0, 6)

  return (
    <div className="lp-root">
      <div className="lp-bg" />
      <div className="lp-bg-glow" />

      <header className="lp-header">
        <div className="lp-brand">
          <span className="lp-brand-mark">م</span>
          <div className="lp-brand-text">
            <span className="lp-brand-name">مسار</span>
            <span className="lp-brand-tag">استوديو التصميم الداخلي</span>
          </div>
        </div>
        <nav className="lp-nav">
          <a href="#home">الرئيسية</a>
          <a href="#about">عن مسار</a>
          <a href="#why">لماذا مسار</a>
          <a href="#services">الخدمات</a>
          {products.length > 0 && <a href="#products">المنتجات</a>}
        </nav>
        <div className="lp-header-actions">
          <button className="lp-btn-gold lp-btn-sm" onClick={onEnterTour}>
            دخول الجولة
          </button>
          <button className="lp-icon-btn" onClick={onClose} title="خروج من المعاينة">
            <Icon name="x" size={15} />
          </button>
        </div>
      </header>

      <main>
        {/* ============ Hero ============ */}
        <section id="home" className="lp-hero">
          <div className="lp-eyebrow">
            <span className="lp-eyebrow-line" />
            استوديو التصميم الداخلي — مشروع {project.name}
            <span className="lp-eyebrow-line" />
          </div>
          <h1 className="lp-heading lp-hero-title">
            مساحتك تبدأ <span className="lp-gold-text">هنا</span>
          </h1>
          <p className="lp-hero-desc">
            نحوّل المساحات إلى تجارب معيشية استثنائية تعكس شخصيتك وتُلهم حياتك اليومية.
            {project.description ? ` ${project.description}` : ''}
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn-gold" onClick={onEnterTour}>
              <Icon name="play" size={15} /> دخول الجولة
            </button>
            {pdf && (
              <button
                className="lp-btn-ghost"
                onClick={() => window.masar.dialogs.openPath(pdf.path)}
              >
                <Icon name="pdf" size={15} /> ملف PDF للمشروع
              </button>
            )}
          </div>
          <div className="lp-stats">
            <div className="lp-stat">
              <div className="lp-stat-num lp-gold-text">{project.rooms.length}+</div>
              <div className="lp-stat-label">غرف بجولة 360°</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-num lp-gold-text">{project.products.length}+</div>
              <div className="lp-stat-label">منتج مميز</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-num lp-gold-text">100%</div>
              <div className="lp-stat-label">تصميم مخصص</div>
            </div>
          </div>
        </section>

        {/* ============ About ============ */}
        <section id="about" className="lp-section lp-about">
          <div className="lp-about-visual">
            {project.coverPath ? (
              <img src={assetUrl(project.id, project.coverPath)} alt="المشروع" className="lp-cover" />
            ) : roomShots.length > 0 ? (
              <div className="lp-shots">
                {roomShots.map((r) => (
                  <img
                    key={r.id}
                    src={assetUrl(project.id, r.thumbnail || r.panorama!)}
                    alt={r.name}
                  />
                ))}
              </div>
            ) : (
              <div className="lp-cover lp-cover-fallback">
                <Icon name="sparkles" size={44} />
              </div>
            )}
            <span className="lp-about-glow" />
          </div>
          <div className="lp-about-text">
            <div className="lp-eyebrow">عن مسار</div>
            <h2 className="lp-heading lp-section-title">
              نؤمن أن التصميم ليس شكلاً — <span className="lp-gold-text">بل أسلوب حياة.</span>
            </h2>
            <p className="lp-body">
              في مسار، لا نصمم المساحات فحسب — بل نصوغ تجارب تُعاش كل يوم. نمزج بين الفخامة
              الهادئة، والمواد الأصيلة، والضوء المدروس بعناية، لنحوّل كل غرفة إلى انعكاسٍ صادق
              لهوية من يسكنها.
            </p>
            {project.clientName && (
              <div className="lp-client">مشروع {project.clientName}</div>
            )}
            <div className="lp-signature">
              <Icon name="sparkles" size={14} />
              <span>
                {project.companyName || 'MASAR'} Interior Design Studio
              </span>
            </div>
          </div>
        </section>

        {/* ============ Why us ============ */}
        <section id="why" className="lp-section lp-why">
          <div className="lp-section-head">
            <div className="lp-eyebrow">لماذا مسار</div>
            <h2 className="lp-heading lp-section-title">لماذا تختار مسار؟</h2>
            <p className="lp-body lp-body-center">
              خبرة تمتد لسنوات، وتصميمات تُرسم بعناية — لأن مساحتك تستحق الأفضل دائماً.
            </p>
          </div>
          <div className="lp-why-grid">
            {WHY.map((w, i) => (
              <div key={i} className="lp-card lp-why-card">
                <span className="lp-why-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="lp-why-icon">
                  <Icon name={w.icon} size={20} />
                </span>
                <div className="lp-why-title">{w.title}</div>
                <div className="lp-why-desc">{w.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ Services ============ */}
        <section id="services" className="lp-section lp-services">
          <div className="lp-section-head">
            <div className="lp-eyebrow">الخدمات</div>
            <h2 className="lp-heading lp-section-title">
              حلول تصميم <span className="lp-gold-text">متكاملة</span>
            </h2>
            <p className="lp-body lp-body-center">
              نقدم تجربة تصميم داخلي شاملة بدقة عالية وإبداعية متناهية، من المرحلة الأولى
              للاستشارة حتى التنفيذ الكامل.
            </p>
          </div>
          <div className="lp-services-grid">
            {SERVICES.map((s, i) => (
              <div key={i} className="lp-card lp-service-card">
                <span className="lp-service-icon">
                  <Icon name={s.icon} size={20} />
                </span>
                <div className="lp-service-title">{s.title}</div>
                <div className="lp-service-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ Products ============ */}
        {products.length > 0 && (
          <section id="products" className="lp-section lp-products">
            <div className="lp-section-head">
              <div className="lp-eyebrow">المنتجات</div>
              <h2 className="lp-heading lp-section-title">
                قطع <span className="lp-gold-text">مميزة</span> من المشروع
              </h2>
              <p className="lp-body lp-body-center">
                تعرّف على بعض القطع المستخدمة في هذا المشروع — انقر على أي منتج للتفاصيل.
              </p>
            </div>
            <div className="lp-products-grid">
              {products.map((p) => (
                <button
                  key={p.id}
                  className="lp-card lp-product-card"
                  onClick={() => onProductClick?.(p)}
                >
                  {p.images.length > 0 ? (
                    <img className="lp-product-img" src={assetUrl(project.id, p.images[0])} alt={p.name} />
                  ) : (
                    <div className="lp-product-img lp-product-img-empty">
                      <Icon name="sparkles" size={22} />
                    </div>
                  )}
                  <div className="lp-product-info">
                    <div className="lp-product-name">{p.name}</div>
                    <div className="lp-product-meta">
                      {[p.category, p.material, p.color].filter(Boolean).join(' • ')}
                    </div>
                  </div>
                  <span className="lp-product-arrow"><Icon name="chevron-right" size={14} /></span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ============ CTA ============ */}
        <section className="lp-cta">
          <div className="lp-eyebrow">استوديو مسار — الخطوة التالية</div>
          <h2 className="lp-heading lp-cta-title">
            لنبدأ في تصميم <span className="lp-gold-text">مساحتك القادمة</span>
          </h2>
          <p className="lp-body lp-body-center">
            كل مساحة عظيمة تبدأ بمحادثة واحدة. استكشف هذا المشروع بجولة تفاعلية كاملة.
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn-gold lp-btn-lg" onClick={onEnterTour}>
              <Icon name="play" size={16} /> دخول الجولة
            </button>
            {pdf && (
              <button
                className="lp-btn-ghost"
                onClick={() => window.masar.dialogs.openPath(pdf.path)}
              >
                <Icon name="pdf" size={15} /> ملف PDF للمشروع
              </button>
            )}
          </div>
        </section>
      </main>

      {/* ============ Footer ============ */}
      <footer className="lp-footer">
        <div className="lp-footer-grid">
          <div className="lp-footer-col">
            <div className="lp-brand">
              <span className="lp-brand-mark">م</span>
              <div className="lp-brand-text">
                <span className="lp-brand-name">مسار</span>
                <span className="lp-brand-tag">Luxury Interior Design Studio</span>
              </div>
            </div>
            <p className="lp-footer-desc">
              نؤمن أن التصميم ليس مجرد شكل، بل أسلوب حياة. نحوّل المساحات إلى تجارب خالدة
              تعكس هوية أصحابها.
            </p>
          </div>
          <div className="lp-footer-col">
            <div className="lp-footer-title">روابط سريعة</div>
            <a href="#home" className="lp-footer-link">الرئيسية</a>
            <a href="#about" className="lp-footer-link">عن مسار</a>
            <a href="#why" className="lp-footer-link">لماذا مسار</a>
            <a href="#services" className="lp-footer-link">الخدمات</a>
            {products.length > 0 && <a href="#products" className="lp-footer-link">المنتجات</a>}
          </div>
          <div className="lp-footer-col">
            <div className="lp-footer-title">تواصل معنا</div>
            <div className="lp-contact-card">
              <span className="lp-contact-icon"><Icon name="phone" size={13} /></span>
              <div>
                <div className="lp-contact-label">الهاتف</div>
                <div className="lp-contact-value">01275477819</div>
              </div>
            </div>
            <div className="lp-contact-card">
              <span className="lp-contact-icon"><Icon name="mail" size={13} /></span>
              <div>
                <div className="lp-contact-label">البريد الإلكتروني</div>
                <div className="lp-contact-value">masardesign1@gmail.com</div>
              </div>
            </div>
            <div className="lp-contact-card">
              <span className="lp-contact-icon"><Icon name="map-pin" size={13} /></span>
              <div>
                <div className="lp-contact-label">الموقع</div>
                <div className="lp-contact-value">مصر - القاهرة - السلام - منتجع النخيل</div>
              </div>
            </div>
            <div className="lp-contact-card">
              <span className="lp-contact-icon"><Icon name="clock" size={13} /></span>
              <div>
                <div className="lp-contact-label">ساعات العمل</div>
                <div className="lp-contact-value">الأحد – الخميس: ٩ص – ٦م</div>
              </div>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© {year} مسار لاستوديو التصميم الداخلي. جميع الحقوق محفوظة.</span>
          <span className="lp-footer-project">مشروع {project.name}</span>
        </div>
      </footer>
    </div>
  )
}
