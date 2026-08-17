/**
 * MASAR — Global site configuration.
 * Update contact details, social links, and navigation here.
 * The UI reads from this object — no component edits required.
 */

export const SITE_CONFIG = {
  brand: {
    nameAr: 'مسار',
    nameEn: 'MASAR',
    taglineAr: 'استوديو التصميم الداخلي الفاخر',
    taglineEn: 'Luxury Interior Design Studio',
    descriptionAr:
      'نؤمن أن التصميم ليس مجرد شكل، بل أسلوب حياة. نحوّل المساحات إلى تجارب خالدة تعكس هوية أصحابها.',
    descriptionEn:
      'We believe design is not just a form, it is a lifestyle. We transform spaces into timeless experiences that reflect their owners\' identity.',
  },

  nav: [
    { labelAr: 'الرئيسية', labelEn: 'Home', href: '/' },
    { labelAr: 'أعمالنا', labelEn: 'Projects', href: '/projects' },
    { labelAr: 'الخدمات', labelEn: 'Services', href: '/services' },
    { labelAr: 'عن مسار', labelEn: 'About', href: '/about' },
    { labelAr: 'تواصل معنا', labelEn: 'Contact Us', href: '/contact' },
  ],

  contact: {
    phone: '01275477819',
    phoneHref: 'tel:01275477819',
    whatsappHref: 'https://wa.me/201275477819',
    email: 'masardesign1@gmail.com',
    emailHref: 'mailto:masardesign1@gmail.com',
    address: 'مصر - القاهرة - السلام - منتجع النخيل جمعية 6 اكتوبر',
    addressEn: 'Egypt - Cairo - El Salam - Palm Resort, 6 October Association',
    hours: 'الأحد – الخميس: ٩ص – ٦م',
    hoursEn: 'Sunday – Thursday: 9am – 6pm',
  },

  social: [
    { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
    { label: 'Facebook', href: 'https://facebook.com/', icon: 'facebook' },
    { label: 'LinkedIn', href: 'https://linkedin.com/', icon: 'linkedin' },
    { label: 'Behance', href: 'https://behance.net/', icon: 'behance' },
  ],

  services: [
    { titleAr: 'تصميم داخلي متكامل', titleEn: 'Complete Interior Design', href: '#services' },
    { titleAr: 'المخططات الثنائية', titleEn: '2D Floor Plans', href: '#services' },
    { titleAr: 'الريندر الواقعي', titleEn: 'Photorealistic Renders', href: '#services' },
    { titleAr: 'الرسومات التنفيذية', titleEn: 'Execution Drawings', href: '#services' },
    { titleAr: 'رسومات المصنع', titleEn: 'Shop Drawings', href: '#services' },
  ],
} as const
