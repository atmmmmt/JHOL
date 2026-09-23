export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function formatFieldLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeSlugValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

const arabicFieldLabelMap: Record<string, string> = {
  partnerLogos: 'شعارات الشركاء',
  logo: 'الشعار',
  alt: 'النص البديل',
  image: 'الصورة',
  background: 'الخلفية',
  navigation: 'روابط التنقل',
  mobileMenu: 'قائمة الجوال',
  sectionLabel: 'عنوان القسم',
  quickLinksTitle: 'عنوان الروابط السريعة',
  quickLinks: 'الروابط السريعة',
  text: 'النص',
  href: 'الرابط',
  contact: 'بيانات التواصل',
  phone: 'الهاتف',
  email: 'البريد الإلكتروني',
  socials: 'روابط التواصل',
  label: 'العنوان',
  title: 'العنوان الرئيسي',
  description: 'الوصف',
  items: 'العناصر',
  posts: 'المقالات',
  articles: 'المقالات',
  number: 'الرقم',
  chips: 'الوسوم',
  includes: 'يشمل',
  detailsTitle: 'عنوان التفاصيل',
  details: 'تفاصيل الباقة',
  note: 'ملاحظة',
  cta: 'زر الإجراء',
  logos: 'الشعارات',
  lines: 'السطور',
  supportText: 'النص المساند',
  intro: 'المقدمة',
  projects: 'المشاريع',
  slug: 'الرابط المختصر',
  category: 'التصنيف',
  categories: 'التصنيفات',
  categoryIds: 'التصنيفات المختارة',
  publishDate: 'تاريخ النشر',
  comments: 'التعليقات',
  userName: 'اسم المستخدم',
  comment: 'التعليق',
  date: 'التاريخ',
  client: 'العميل',
  listingDescription: 'وصف القائمة',
  overview: 'نبذة',
  coverImage: 'صورة الغلاف',
  previewImage: 'صورة الغلاف',
  storyBlocks: 'مشاهد المشروع',
  previousLabel: 'زر السابق',
  nextLabel: 'زر التالي',
  emptyPreviousLabel: 'رسالة عدم وجود السابق',
  emptyNextLabel: 'رسالة عدم وجود التالي',
  detailsButton: 'زر التفاصيل',
  headline: 'العنوان',
  line1: 'السطر الأول',
  line2: 'السطر الثاني',
  highlight: 'الكلمة البارزة',
  slides: 'الشرائح',
  brand: 'العلامة',
  subtitle: 'العنوان الفرعي',
  meaning: 'المعنى',
  aboutUs: 'من نحن',
  paragraphs: 'الفقرات',
  value: 'القيمة',
  prefix: 'البادئة',
  quote: 'الاقتباس',
  role: 'المنصب',
  company: 'الشركة',
  fields: 'الحقول',
  name: 'الاسم',
  placeholder: 'النص الإرشادي',
  type: 'النوع',
  submitButton: 'زر الإرسال',
  interestTitle: 'عنوان الاهتمامات',
  services: 'الخدمات',
  duration: 'المدة',
  level: 'المستوى',
  summary: 'الملخص',
  outcomes: 'النتائج',
  excerpt: 'المقتطف',
  content: 'المحتوى',
  meta: 'البيانات التعريفية',
  source: 'المصدر',
  statuses: 'حالات التحميل',
  brandCode: 'رمز العلامة',
  initialPreparing: 'التهيئة الأولى',
  initialReady: 'الجاهزية الأولى',
  initialEntering: 'الدخول الأول',
  routePreparing: 'تهيئة الانتقال',
  routeEntering: 'الدخول إلى الصفحة',
  persistentPreparing: 'التهيئة المستمرة',
  lead: 'النص التمهيدي',
  featuredServices: 'الخدمات الأبرز',
  sectionKey: 'مفتاح القسم',
  sectionType: 'نوع القسم',
  tabLabel: 'اسم التبويب',
  sidebarGroup: 'مجموعة الشريط الجانبي',
  to: 'المسار',
  introParagraphs: 'فقرات المقدمة',
  mission: 'الرسالة',
  vision: 'الرؤية',
  startsWith: 'يبدأ من',
  points: 'النقاط',
  closing: 'الخاتمة',
  whyChoose: 'لماذا تختارنا',
  reasons: 'الأسباب',
  resultsTitle: 'عنوان النتائج',
  results: 'النتائج',
  startJourney: 'ابدأ رحلتك',
  servicesOverview: 'نظرة الخدمات',
  includesTitle: 'عنوان القائمة',
  order: 'الترتيب',
  howWeWork: 'آلية العمل',
  steps: 'الخطوات',
  realResults: 'نتائج حقيقية',
  projectDomains: 'مجالات المشاريع',
  successStory: 'قصة النجاح',
  ctaSection: 'قسم الدعوة',
  talkAboutProject: 'لنتحدث عن مشروعك',
  whyContactUs: 'لماذا تتواصل معنا',
  startToday: 'ابدأ اليوم',
  whatYouWillFind: 'ماذا ستجد',
  topics: 'الموضوعات',
  whyWeCreatedBlog: 'سبب إنشاء المدونة',
  practicalContent: 'محتوى عملي',
  helpCta: 'دعوة المساعدة',
  benefits: 'المزايا',
  pointsTitle: 'عنوان النقاط',
  focusAreas: 'محاور التركيز',
  whyChooseServices: 'لماذا تختار خدماتنا',
  service: 'الخدمة',
  options: 'الخيارات',
  ctaLabel: 'نص الزر',
  ctaHref: 'رابط الزر',
  serviceLines: 'سطور الخدمات',
  tickerItems: 'عبارات الشريط المتحرك',
  width: 'عرض الصورة',
  galleryGap: 'المسافة بين الصور (بكسل)',
  ogDescription: 'وصف المشاركة (يظهر عند مشاركة الرابط)',
  video: 'الفيديو',
}

export function titleizeFieldLabel(value: string) {
  if (arabicFieldLabelMap[value]) {
    return arabicFieldLabelMap[value]
  }

  const formatted = formatFieldLabel(value)

  if (!formatted) {
    return 'بدون عنوان'
  }

  return formatted
}

export function truncateText(value: string, maxLength = 34) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1)}…`
}

export function formatTimestamp(value: string | null) {
  if (!value) {
    return 'لم يتم التحديث بعد'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function getApiHostLabel(value: string) {
  try {
    return new URL(value).host
  } catch {
    return value
  }
}

export function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const arabicPageLabelMap: Record<string, string> = {
  all: 'كل الصفحات',
  home: 'الرئيسية',
  about: 'من نحن',
  services: 'الخدمات',
  works: 'الأعمال',
  'work-details': 'تفاصيل الأعمال',
  packages: 'الباقات',
  'training-courses': 'الدورات التدريبية',
  blog: 'المدونة',
  contact: 'التواصل',
  'campaign-terms': 'شروط الحملات',
  'identity-terms': 'شروط الهويات',
  'privacy-policy': 'سياسة الخصوصية',
  system: 'النظام',
}

export function translatePageKey(value: string) {
  return arabicPageLabelMap[value] ?? value
}

const arabicSectionTypeMap: Record<string, string> = {
  global: 'عام',
  hero: 'واجهة رئيسية',
  content: 'محتوى',
  listing: 'قائمة',
  gallery: 'معرض',
  logos: 'شعارات',
  statistics: 'إحصاءات',
  testimonials: 'آراء العملاء',
  form: 'نموذج',
  projects: 'مشاريع',
  navigation: 'تنقل',
  system: 'نظام',
}

export function translateSectionType(value: string) {
  return arabicSectionTypeMap[value] ?? value
}
