import { useEffect, useRef, useState } from 'react'
import { ImageLibraryModal } from '../components/image-library-modal'
import {
  deleteImageAsset,
  fetchImages,
  resolveImageAssetUrl,
  updateImageAsset,
  updateContentDetail,
  uploadImageAsset,
  uploadVideoAssetWithProgress,
} from '../lib/content-api'
import { cn, isRecord } from '../lib/utils'
import type { ImageAsset } from '../types/image'
import type { ContentListItem, JsonValue } from '../types/content'

// ─── Types ────────────────────────────────────────────────────────────────────

type Feature = { title: string; subtitle?: string }
type SaleCard = {
  number: string
  badge: string
  title?: string
  subtitle?: string
  audienceNote?: string
  video?: string
  features: Feature[]
}
type GalleryItem = { id: string; src?: string; video?: string; alt: string }
type Tier = {
  id: string
  name: string
  ctaLabel?: string
  subtitle?: string
  price?: string
  priceNote?: string
  previewImage?: string
  gallery: GalleryItem[]
  cards: SaleCard[]
  summaryBadge?: string
  summaryAudienceNote?: string
  summaryFeatures?: string[]
}
type HeroData = { lines: string[]; description: string; supportText?: string; backgroundImage?: string }
type VideoItem = { id: string; url: string; title?: string }
type ProcessStep = { order: number; title: string; description?: string; link?: string; linkLabel?: string }
type ProcessData = { title?: string; noticeText?: string; stat?: string; steps: ProcessStep[] }
type Package = {
  id: string
  path: string
  title: string
  description: string
  hero: HeroData
  items: string[]
  note?: string
  categoryTag?: string
  videos: VideoItem[]
  saleTiers: Tier[]
  process?: ProcessData
}

// ─── Static defaults (mirrors package-details.ts) ────────────────────────────

const DEFAULT_PACKAGES: Package[] = [
  {
    id: 'package-1',
    path: '/packages/campaign-packages',
    title: 'إطلاق الحملات الإعلانية الممولة',
    description: 'ندير حملتك بكفاءة من الفكرة حتى التنفيذ، لضمان وصولها إلى جمهورك وتحقيق أفضل النتائج.',
    hero: { lines: ['إطلاق الحملات الإعلانية الممولة'], description: 'ندير حملتك بكفاءة من الفكرة حتى التنفيذ، لضمان وصولها إلى جمهورك وتحقيق أفضل النتائج.', supportText: 'مناسبة للمشاريع التي تسعى لزيادة المبيعات أو إطلاق منتج أو خدمة جديدة.' },
    items: ['دراسة وتحليل الجمهور المستهدف.', 'إعداد استراتيجية الحملة وتحديد أهدافها بوضوح.', 'إنشاء وتصميم الإعلانات الجذابة، نصوصًا وتصاميم.', 'إدارة الحملة على المنصات المناسبة مثل Meta وGoogle وTikTok.', 'متابعة الأداء وتقديم تقارير دورية مع تحليل النتائج.'],
    note: 'مناسبة للمشاريع التي تسعى لزيادة المبيعات أو إطلاق منتج أو خدمة جديدة.',
    categoryTag: 'إطلاق حملات تمويلية',
    videos: [],
    saleTiers: [
      { id: 'snapchat', name: 'حملات السناب شات', subtitle: 'Snapchat Ads Package', price: '', priceNote: '', previewImage: '', gallery: [], cards: [{ number: '01', badge: 'تهيئة الحسابات الإعلانية', title: 'إعداد الحملة', audienceNote: 'مناسبة للأنشطة التي تستهدف جمهورًا نشطًا على سناب شات.', features: [{ title: 'إنشاء حساب إعلاني.' }, { title: 'إنشاء مدير الإعلانات وربطه.' }, { title: 'ضبط هيكلة الحملة بما يتناسب مع هدف النشاط.' }] }, { number: '02', badge: 'الإدارة والتحسين اليومي', title: 'إدارة الأداء', features: [{ title: 'عدد لا محدود من الإعلانات.' }, { title: 'متابعة يومية وتحسين يومي.' }, { title: 'اختبار الشرائح الإعلانية وتحسين النتائج.' }] }, { number: '03', badge: 'التقارير وإرشادات المحتوى', title: 'المخرجات', features: [{ title: 'إرشادات المحتوى.' }, { title: 'المدة: 30 يوم.' }, { title: 'السعر: 1200 SAR (غير شامل تمويل المنصة).' }] }] },
      { id: 'meta', name: 'حملات الإنستغرام والفيسبوك', subtitle: 'Instagram & Facebook Ads', price: '', priceNote: '', previewImage: '', gallery: [], cards: [{ number: '01', badge: 'تهيئة الحسابات الإعلانية', title: 'إعداد الحملة', audienceNote: 'مناسبة للأنشطة التي تحتاج الوصول لجمهور Meta بشكل سريع ومنظم.', features: [{ title: 'إنشاء حساب إعلاني.' }, { title: 'إنشاء مدير الإعلانات وربطه.' }, { title: 'تجهيز إعدادات الجمهور والأهداف التسويقية.' }] }, { number: '02', badge: 'الإدارة والتحسين اليومي', title: 'إدارة الأداء', features: [{ title: 'عدد لا محدود من الإعلانات.' }, { title: 'متابعة يومية وتحسين يومي.' }, { title: 'تعديل الاستهداف وفق نتائج الأداء.' }] }, { number: '03', badge: 'التقارير وإرشادات المحتوى', title: 'المخرجات', features: [{ title: 'إرشادات المحتوى.' }, { title: 'كتابة بايو للحساب.' }, { title: 'المدة: 30 يوم، السعر: 1200 SAR (غير شامل تمويل المنصة).' }] }] },
      { id: 'tiktok', name: 'حملات التيك توك', subtitle: 'TikTok Ads Package', price: '', priceNote: '', previewImage: '', gallery: [], cards: [{ number: '01', badge: 'تهيئة الحسابات الإعلانية', title: 'إعداد الحملة', audienceNote: 'مناسبة للحملات التي تعتمد على محتوى مرئي سريع الانتشار.', features: [{ title: 'إنشاء حساب إعلاني.' }, { title: 'إنشاء مدير الإعلانات وربطه.' }, { title: 'تجهيز الحملة وفق أهداف التحويل أو الزيارات.' }] }, { number: '02', badge: 'الإدارة والتحسين اليومي', title: 'إدارة الأداء', features: [{ title: 'عدد لا محدود من الإعلانات.' }, { title: 'متابعة يومية وتحسين يومي.' }, { title: 'تحسين الجمهور والإعلانات لتحقيق نتائج أفضل.' }] }, { number: '03', badge: 'التقارير وإرشادات المحتوى', title: 'المخرجات', features: [{ title: 'إرشادات المحتوى.' }, { title: 'كتابة بايو للحساب.' }, { title: 'المدة: 30 يوم، السعر: 1200 SAR (غير شامل تمويل المنصة).' }] }] },
      { id: 'all-platforms', name: 'جميع المنصات', subtitle: 'All Platforms Package', price: '', priceNote: '', previewImage: '', gallery: [], cards: [{ number: '01', badge: 'الإدارة الموحدة متعددة المنصات', title: 'إعداد وإدارة مشتركة', audienceNote: 'لمن يحتاج حضورًا موحدًا على أكثر من منصة ضمن خطة تشغيل واحدة.', features: [{ title: 'إدارة حملات موحّدة على أكثر من منصة.' }, { title: 'تنسيق استراتيجية موحّدة بين القنوات.' }, { title: 'توجيه المحتوى بما يناسب كل منصة.' }] }, { number: '02', badge: 'المتابعة والتحسين المستمر', title: 'تحسين الأداء', features: [{ title: 'متابعة أداء يومية وتوجيه مستمر للمحتوى.' }, { title: 'تحسينات دورية بناءً على نتائج الحملات.' }, { title: 'رفع كفاءة الصرف الإعلاني عبر القنوات.' }] }, { number: '03', badge: 'السعر والخصم', title: 'المخرجات', features: [{ title: 'تقارير أداء دورية واضحة.' }, { title: 'السعر: 3000 SAR.' }, { title: 'خصم بمقدار 600 ريال (غير شامل تمويل المنصة).' }] }] },
    ],
  },
  {
    id: 'package-2',
    path: '/packages/identity-packages',
    title: 'تصميم الشعارات والهوية البصرية',
    description: 'نقدم لك هوية بصرية متكاملة تعكس شخصية علامتك التجارية وتمنحها تميزًا واضحًا في السوق.',
    hero: { lines: ['تصميم الشعارات والهوية البصرية'], description: 'نقدم لك هوية بصرية متكاملة تعكس شخصية علامتك التجارية وتمنحها تميزًا واضحًا في السوق.', supportText: 'تسليم منظم واحترافي يسهل عليك استخدامها فورًا.' },
    items: ['تصميم شعار احترافي متعدد الاستخدامات.', 'دليل الهوية البصرية الكامل Brand Guidelines.', 'تطبيق الهوية على المواد التسويقية الأساسية.', 'ملفات عالية الجودة لجميع الاستخدامات، من الطباعة إلى السوشيال ميديا.', 'تسليم منظم واحترافي يسهل عليك استخدامها فورًا.'],
    note: '',
    categoryTag: 'هويات بصرية',
    videos: [],
    saleTiers: [
      { id: 'basic', name: 'الباقة الأساسية', subtitle: 'Basic Package', price: '3847 ر.س', priceNote: '', previewImage: '', gallery: [], cards: [{ number: '01', badge: 'الشعار (Logo)', title: 'Basic Package', subtitle: 'Logo', audienceNote: 'نصمم لك شعارًا احترافيًا يعكس هوية مشروعك ويمنح علامتك حضورًا مميزًا واحترافيًا في السوق.', features: [{ title: 'تصميم شعار احترافي مخصص.' }, { title: 'عرض الشعار بطريقة احترافية (Mockup).' }, { title: 'تسليم الشعار بصيغ عالية الجودة: AI / EPS / PDF / PNG / JPG.' }, { title: 'تسليم النسخة النهائية المعتمدة.' }] }, { number: '02', badge: 'الهوية البصرية والدليل الإرشادي', title: 'VISUAL IDENTITY & BRAND GUIDELINE', features: [{ title: 'دليل استخدام الهوية البصرية.' }, { title: 'شبكة بناء الشعار (Logo Grid).' }, { title: 'نسخ الشعار المختلفة.' }, { title: 'الألوان الرسمية للهوية (Color System).' }, { title: 'نظام الخطوط المستخدم (Typography System).' }] }, { number: '03', badge: 'التطبيقات البصرية', title: 'VISUAL IDENTITY APPS', features: [{ title: 'المطبوعات الرسمية: بطاقة عمل.' }, { title: 'المطبوعات الرسمية: ورق مراسلات رسمي.' }, { title: 'التطبيقات الرقمية: تصميم بروفايل احترافي.' }, { title: 'التطبيقات الرقمية: تصميم واجهات ومنشورات السوشيال ميديا.' }] }] },
      { id: 'advanced', name: 'الباقة الشاملة', subtitle: 'Comprehensive Package', price: '5547 ر.س', priceNote: '', previewImage: '', gallery: [], cards: [{ number: '01', badge: 'الشعار LOGO', title: 'الباقة الشاملة', subtitle: 'Comprehensive Package', audienceNote: 'للعلامات التي تحتاج هوية أعمق مع تطبيقات موسّعة وتفاصيل إضافية.', features: [{ title: 'تقديم 3 نماذج احترافية للشعار', subtitle: '(Professional Concepts 3)' }, { title: 'عرض بصري احترافي', subtitle: '(Professional Presentation)' }] }, { number: '02', badge: 'الهوية البصرية والدليل الإرشادي', title: 'VISUAL IDENTITY & BRAND GUIDELINE', features: [{ title: 'استراتيجية العلامة التجارية', subtitle: '(Brand Strategy)' }, { title: 'التوجه البصري للعلامة', subtitle: '(Visual Direction)' }] }] },
      { id: 'cafes-restaurants', name: 'باقة المقاهي والمطاعم', subtitle: 'Cafe & Restaurants Package', price: '', priceNote: '', previewImage: '', gallery: [], cards: [{ number: '01', badge: 'الشعار LOGO', title: 'باقة المقاهي والمطاعم', subtitle: 'Cafe & Restaurants Package', audienceNote: 'مخصصة للمطاعم والمقاهي مع تطبيقات خاصة بالتغليف وقوائم الطعام.', features: [{ title: 'تقديم 3 نماذج للشعار', subtitle: '(Professional Logo Concepts 3)' }, { title: 'تطوير الشعار المعتمد', subtitle: '(Final Logo Refinement)' }] }] },
    ],
    process: {
      title: 'آلية العمل مع مثال تفاعلي',
      noticeText: 'حتى نصل إلى هدفك نعمل في جهور على وضع آلية عمل احترافية ودقيقة استطعنا تحقيق هدف بأكثر من 137 مشروع بنسبة نجاح تصل إلى 94% خلال سنة 2025 وهي مقسمة إلى',
      stat: '10 مراحل مهمة',
      steps: [
        { order: 1, title: 'جمع التفاصيل الأولية', description: 'نبدأ بتحديد تفاصيل المشروع ومتطلباته لتقدير حجمه وما يحتاجه من تصاميم.', link: '', linkLabel: '' },
        { order: 2, title: 'عرض السعر', description: 'نقدم عرض سعر مناسب بناءً على حجم المشروع ومتطلباته من تصاميم.', link: '', linkLabel: '' },
        { order: 3, title: 'الاستبيان الموجز (بريف)', description: 'بعد الموافقة على عرض السعر ودفع المبلغ، يتم إرسال استبيان موجز (بريف) يتضمن مجموعة من الأسئلة لفهم المشروع بشكل أعمق.', link: '', linkLabel: '' },
        { order: 4, title: 'الاجتماع مع العميل', description: 'نعقد اجتماعًا لمدة 30 دقيقة نتحدث فيه مع العميل عن الاستبيان المقدم ومناقشة الإجابات بشكل مباشر.', link: '', linkLabel: '' },
        { order: 5, title: 'مرحلة التحليل', description: 'نقوم بتحليل الجمهور المستهدف، الاتجاه البصري، أهداف العمل، المشكلة والحل، وتحليل المنافسين.', link: '', linkLabel: '' },
        { order: 6, title: 'لوحات الإلهام', description: 'بناءً على نتائج التحليل، نقترح 3 لوحات إلهام تضم صورًا فنية، شعارات، ألوان، خطوط ونماذج استرشادية ليتضح الشكل الأفضل.', link: '', linkLabel: '' },
        { order: 7, title: 'رسم السكيتشات', description: 'بعد اعتماد لوحة الاستكشافات الأولية، نقوم برسم عدة اسكتشات يدويًا لحل توجّه العميل عبر ثلاث لوحات استكشافية، ويتكون كل تصور أولي من 40 سكتش.', link: '', linkLabel: '' },
        { order: 8, title: 'العروض التقديمية', description: 'نختار أفضل 3 أفكار من الاسكتشات ونفصلها على العميل في ملف تقديمي بالأبيض والأسود مع شرح واضح للمفهوم، الفكرة، والعلامة والنص.', link: '', linkLabel: '' },
        { order: 9, title: 'الاختبار والاعتماد', description: 'عند اعتماد أحد النماذج، نختار الألوان المناسبة ونبدأ تصميم الهوية البصرية والدليل الإرشادي لتطبيقها وتصميم عرض تقديمي خاص بالعميل.', link: '', linkLabel: '' },
        { order: 10, title: 'التسليم النهائي', description: 'في هذه المرحلة يتم تسليم كافة الملفات النهائية للعميل عبر البريد الإلكتروني بشكل رسمي، بملف مشروعه، وجاهزة للاستخدام.', link: '', linkLabel: '' },
      ],
    },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 10)}`
}

function isRichPackageItem(e: unknown): boolean {
  if (!isRecord(e)) return false
  return typeof e.id === 'string' || typeof e.path === 'string' || Array.isArray(e.saleTiers)
}

function parsePackages(raw: unknown): Package[] {
  // packageDetails holds the full rich data (tiers/cards/gallery)
  // items may be the old simple format (title/description/includes only)
  // Prefer packageDetails, fall back to items only if it looks like rich data
  const packageDetails = Array.isArray((raw as Record<string, unknown>)?.packageDetails)
    ? (raw as Record<string, unknown[]>).packageDetails
    : []
  const rawItems = Array.isArray((raw as Record<string, unknown>)?.items)
    ? (raw as Record<string, unknown[]>).items
    : []

  const richItems = packageDetails.length > 0
    ? packageDetails
    : rawItems.some(isRichPackageItem) ? rawItems : []

  return DEFAULT_PACKAGES.map((def, idx) => {
    const live = richItems.find((e) =>
      isRecord(e) && (
        e.id === def.id ||
        (e as Record<string, unknown>).path === def.path ||
        (e as Record<string, unknown>).path === `/packages/${def.id}` ||
        String((e as Record<string, unknown>).path ?? '').endsWith(def.id)
      )
    ) ?? richItems[idx]
    if (!live || !isRecord(live)) return def

    const parseTiers = (rawTiers: unknown): Tier[] => {
      if (!Array.isArray(rawTiers)) return def.saleTiers
      return def.saleTiers.map((defTier, defTierIdx) => {
        // Match by ID first, then by position as fallback
        const lt = (rawTiers as unknown[]).find((t) => isRecord(t) && (t as Record<string, unknown>).id === defTier.id)
          ?? (rawTiers as unknown[])[defTierIdx]
        if (!lt || !isRecord(lt)) return defTier
        const liveCards = Array.isArray(lt.cards) && (lt.cards as unknown[]).length > 0 ? lt.cards as unknown[] : null
        const parseCards = (rawCards: unknown[] | null): SaleCard[] => {
          if (!rawCards) return defTier.cards
          return rawCards.flatMap((c, ci) => {
            if (!isRecord(c)) return []
            const defCard = defTier.cards[ci]
            const parseFeatures = (rf: unknown): Feature[] => {
              if (!Array.isArray(rf)) return defCard?.features ?? []
              return rf.flatMap((f) => {
                if (typeof f === 'string') return [{ title: f }]
                if (isRecord(f)) return [{ title: String(f.title ?? ''), subtitle: typeof f.subtitle === 'string' ? f.subtitle : undefined }]
                return []
              })
            }
            return [{
              number: typeof c.number === 'string' ? c.number : defCard?.number ?? String(ci + 1).padStart(2, '0'),
              badge: typeof c.badge === 'string' ? c.badge : defCard?.badge ?? '',
              title: typeof c.title === 'string' ? c.title : defCard?.title,
              subtitle: typeof c.subtitle === 'string' ? c.subtitle : defCard?.subtitle,
              audienceNote: typeof c.audienceNote === 'string' ? c.audienceNote : defCard?.audienceNote,
              video: typeof c.video === 'string' ? c.video : defCard?.video,
              features: parseFeatures(c.features),
            }]
          })
        }
        const parseGallery = (rg: unknown): GalleryItem[] => {
          if (!Array.isArray(rg)) return defTier.gallery
          return (rg as unknown[]).flatMap((g, gi) => {
            if (!isRecord(g)) return []
            return [{ id: typeof g.id === 'string' ? g.id : generateId(), src: typeof g.src === 'string' ? g.src : typeof g.image === 'string' ? g.image : '', video: typeof g.video === 'string' ? g.video : undefined, alt: typeof g.alt === 'string' ? g.alt : `صورة ${gi + 1}` }]
          })
        }
        return {
          ...defTier,
          name: typeof lt.name === 'string' && lt.name ? lt.name : defTier.name,
          subtitle: typeof lt.subtitle === 'string' ? lt.subtitle : defTier.subtitle,
          price: typeof lt.price === 'string' ? lt.price : defTier.price,
          priceNote: typeof lt.priceNote === 'string' ? lt.priceNote : defTier.priceNote,
          previewImage: typeof lt.previewImage === 'string' ? lt.previewImage : defTier.previewImage,
          ctaLabel: typeof lt.ctaLabel === 'string' ? lt.ctaLabel : defTier.ctaLabel,
          gallery: parseGallery(lt.gallery),
          cards: parseCards(liveCards),
          summaryBadge: typeof lt.summaryBadge === 'string' ? lt.summaryBadge : defTier.summaryBadge,
          summaryAudienceNote: typeof lt.summaryAudienceNote === 'string' ? lt.summaryAudienceNote : defTier.summaryAudienceNote,
          summaryFeatures: Array.isArray(lt.summaryFeatures) ? (lt.summaryFeatures as string[]) : defTier.summaryFeatures,
        }
      })
    }

    const parseVideos = (rv: unknown): VideoItem[] => {
      if (!Array.isArray(rv)) return def.videos
      return (rv as unknown[]).flatMap((v, vi) => {
        if (!isRecord(v)) return []
        return [{ id: typeof v.id === 'string' ? v.id : generateId(), url: typeof v.url === 'string' ? v.url : '', title: typeof v.title === 'string' ? v.title : `فيديو ${vi + 1}` }]
      })
    }

    const parseProcess = (rp: unknown): ProcessData | undefined => {
      if (!isRecord(rp)) return def.process
      const rawSteps = Array.isArray(rp.steps) ? rp.steps as unknown[] : []
      const steps: ProcessStep[] = rawSteps.flatMap((s) => {
        if (!isRecord(s)) return []
        return [{
          order: typeof s.order === 'number' ? s.order : 0,
          title: typeof s.title === 'string' ? s.title : '',
          description: typeof s.description === 'string' ? s.description : undefined,
          link: typeof s.link === 'string' ? s.link : undefined,
          linkLabel: typeof s.linkLabel === 'string' ? s.linkLabel : undefined,
        }]
      })
      return {
        title: typeof rp.title === 'string' ? rp.title : def.process?.title,
        noticeText: typeof rp.noticeText === 'string' ? rp.noticeText : def.process?.noticeText,
        stat: typeof rp.stat === 'string' ? rp.stat : def.process?.stat,
        steps: steps.length > 0 ? steps : (def.process?.steps ?? []),
      }
    }

    return {
      ...def,
      title: typeof live.title === 'string' && live.title ? live.title : def.title,
      description: typeof live.description === 'string' && live.description ? live.description : def.description,
      hero: isRecord(live.hero) ? { lines: Array.isArray((live.hero as Record<string, unknown>).lines) ? ((live.hero as Record<string, unknown[]>).lines as string[]) : def.hero.lines, description: typeof (live.hero as Record<string, unknown>).description === 'string' ? (live.hero as Record<string, string>).description : def.hero.description, supportText: typeof (live.hero as Record<string, unknown>).supportText === 'string' ? (live.hero as Record<string, string>).supportText : def.hero.supportText, backgroundImage: typeof (live.hero as Record<string, unknown>).backgroundImage === 'string' ? (live.hero as Record<string, string>).backgroundImage : def.hero.backgroundImage } : def.hero,
      items: Array.isArray(live.items) ? (live.items as string[]) : Array.isArray(live.details) ? (live.details as string[]) : def.items,
      note: typeof live.note === 'string' ? live.note : def.note,
      categoryTag: typeof live.categoryTag === 'string' ? live.categoryTag : def.categoryTag,
      videos: parseVideos(live.videos),
      saleTiers: parseTiers(live.saleTiers),
      process: isRecord(live.process) ? parseProcess(live.process) : def.process,
    }
  })
}

function serializePackages(packages: Package[], originalBody: Record<string, JsonValue>): Record<string, JsonValue> {
  const richPackages = packages.map((pkg) => ({
    id: pkg.id,
    path: pkg.path,
    title: pkg.title,
    description: pkg.description,
    hero: { lines: pkg.hero.lines, description: pkg.hero.description, supportText: pkg.hero.supportText ?? '', backgroundImage: pkg.hero.backgroundImage ?? '' } as unknown as JsonValue,
    items: pkg.items as unknown as JsonValue,
    details: pkg.items as unknown as JsonValue,
    note: pkg.note ?? '',
    categoryTag: pkg.categoryTag ?? '',
    videos: pkg.videos as unknown as JsonValue,
    process: pkg.process ? {
      title: pkg.process.title ?? '',
      noticeText: pkg.process.noticeText ?? '',
      stat: pkg.process.stat ?? '',
      steps: pkg.process.steps.map((s) => ({
        order: s.order,
        title: s.title,
        description: s.description ?? '',
        link: s.link ?? '',
        linkLabel: s.linkLabel ?? '',
      })),
    } as unknown as JsonValue : undefined,
    saleTiers: pkg.saleTiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      ctaLabel: tier.ctaLabel ?? '',
      subtitle: tier.subtitle ?? '',
      price: tier.price ?? '',
      priceNote: tier.priceNote ?? '',
      previewImage: tier.previewImage ?? '',
      gallery: tier.gallery as unknown as JsonValue,
      cards: tier.cards as unknown as JsonValue,
      summaryBadge: tier.summaryBadge ?? '',
      summaryAudienceNote: tier.summaryAudienceNote ?? '',
      summaryFeatures: (tier.summaryFeatures ?? []) as unknown as JsonValue,
    })) as unknown as JsonValue,
  }))

  // Rebuild items in PackageItem format (used by home page: title/description/includes/note/cta)
  // Preserve original cta from each item if available
  const originalItems = Array.isArray(originalBody.items) ? originalBody.items as unknown[] : []
  const simpleItems = packages.map((pkg, idx) => {
    const orig = isRecord(originalItems[idx]) ? originalItems[idx] as Record<string, unknown> : {}
    const origCta = typeof orig.cta === 'string' ? orig.cta : 'شاهد الباقات'
    return {
      title: pkg.title,
      description: pkg.description,
      includes: pkg.items,
      note: pkg.note ?? '',
      cta: origCta,
    }
  })

  return {
    ...originalBody,
    // items: PackageItem[] format for home page (title/description/includes/note/cta)
    items: simpleItems as unknown as JsonValue,
    // packageDetails: full rich format for build-time resolver and client useLiveSection
    packageDetails: richPackages as unknown as JsonValue,
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: string }) {
  return <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--brand-subtle)]">{children}</p>
}

function TextInput({ value, onChange, placeholder, dir = 'rtl' }: { value: string; onChange: (v: string) => void; placeholder?: string; dir?: 'rtl' | 'ltr' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      className="w-full rounded-[14px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
    />
  )
}

function TextArea({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      dir="rtl"
      className="w-full rounded-[14px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm leading-7 text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
    />
  )
}

function ImageField({ label, value, onChange, onOpenLibrary }: { label: string; value: string; onChange: (v: string) => void; onOpenLibrary: () => void }) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenLibrary}
          className="rounded-[14px] border border-[rgba(29,171,137,0.32)] bg-[rgba(29,171,137,0.1)] px-3 py-2 text-xs font-medium text-[var(--brand-teal)] transition hover:bg-[rgba(29,171,137,0.16)]"
        >
          {value ? 'تغيير الصورة' : 'اختيار صورة'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-[14px] border border-[rgba(238,32,77,0.3)] bg-[rgba(238,32,77,0.08)] px-3 py-2 text-xs font-medium text-[var(--brand-coral)] transition"
          >
            إزالة
          </button>
        )}
      </div>
      {value && (
        <div className="overflow-hidden rounded-[14px] border border-[color:var(--brand-border)]">
          <img src={value} alt={label} className="h-28 w-full object-cover" />
        </div>
      )}
    </div>
  )
}

function SectionCard({ children, title, accent = false }: { children: React.ReactNode; title?: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-[20px] border p-4', accent ? 'border-[rgba(160,149,208,0.3)] bg-[rgba(160,149,208,0.06)]' : 'border-[color:var(--brand-border)] bg-[rgba(255,255,255,0.025)]')}>
      {title && <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-violet)]">{title}</p>}
      {children}
    </div>
  )
}

// ─── Card Editor ─────────────────────────────────────────────────────────────

function CardEditor({
  card,
  cardIndex,
  onChange,
  onOpenVideoLibrary,
}: {
  card: SaleCard
  cardIndex: number
  onChange: (card: SaleCard) => void
  onOpenVideoLibrary: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-[18px] border border-[color:var(--brand-border)] bg-[rgba(255,255,255,0.02)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-right"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand-violet)]/20 text-xs font-bold text-[var(--brand-violet)]">{card.number}</span>
          <span className="text-sm font-medium text-[var(--brand-text)]">{card.badge || `كارت ${cardIndex + 1}`}</span>
        </div>
        <span className="text-[var(--brand-muted)]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-[color:var(--brand-border)] px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>الرقم</FieldLabel>
              <TextInput value={card.number} onChange={(v) => onChange({ ...card, number: v })} placeholder="01" dir="ltr" />
            </div>
            <div>
              <FieldLabel>الشارة (Badge)</FieldLabel>
              <TextInput value={card.badge} onChange={(v) => onChange({ ...card, badge: v })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>العنوان</FieldLabel>
              <TextInput value={card.title ?? ''} onChange={(v) => onChange({ ...card, title: v })} />
            </div>
            <div>
              <FieldLabel>العنوان الفرعي</FieldLabel>
              <TextInput value={card.subtitle ?? ''} onChange={(v) => onChange({ ...card, subtitle: v })} dir="ltr" />
            </div>
          </div>

          <div>
            <FieldLabel>ملاحظة الجمهور</FieldLabel>
            <TextArea value={card.audienceNote ?? ''} onChange={(v) => onChange({ ...card, audienceNote: v })} rows={2} />
          </div>

          <div>
            <FieldLabel>فيديو الكارت (رابط)</FieldLabel>
            <div className="flex gap-2">
              <TextInput value={card.video ?? ''} onChange={(v) => onChange({ ...card, video: v })} placeholder="https://youtube.com/..." dir="ltr" />
              <button
                type="button"
                onClick={onOpenVideoLibrary}
                className="shrink-0 rounded-[14px] border border-[rgba(160,149,208,0.32)] bg-[rgba(160,149,208,0.1)] px-3 py-2 text-xs font-medium text-[var(--brand-violet)] transition hover:bg-[rgba(160,149,208,0.16)]"
              >
                مكتبة
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <FieldLabel>المميزات</FieldLabel>
              <button
                type="button"
                onClick={() => onChange({ ...card, features: [...card.features, { title: '' }] })}
                className="rounded-full border border-[rgba(29,171,137,0.3)] px-2 py-0.5 text-[10px] font-medium text-[var(--brand-teal)]"
              >
                + إضافة
              </button>
            </div>
            <div className="space-y-2">
              {card.features.map((feature, fi) => (
                <div key={fi} className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <TextInput value={feature.title} onChange={(v) => onChange({ ...card, features: card.features.map((f, i) => i === fi ? { ...f, title: v } : f) })} placeholder="نص الميزة" />
                    <TextInput value={feature.subtitle ?? ''} onChange={(v) => onChange({ ...card, features: card.features.map((f, i) => i === fi ? { ...f, subtitle: v || undefined } : f) })} placeholder="نص فرعي اختياري" dir="ltr" />
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ ...card, features: card.features.filter((_, i) => i !== fi) })}
                    className="mt-1 self-start text-[var(--brand-coral)] transition hover:opacity-80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tier Editor ──────────────────────────────────────────────────────────────

type ImageLibraryTarget = { type: 'tier-preview'; pkgIdx: number; tierIdx: number } | { type: 'gallery'; pkgIdx: number; tierIdx: number } | { type: 'pkg-hero'; pkgIdx: number } | { type: 'card-video'; pkgIdx: number; tierIdx: number; cardIdx: number }

function TierEditor({
  tier,
  tierIndex,
  pkgIndex,
  onChange,
  onOpenLibrary,
}: {
  tier: Tier
  tierIndex: number
  pkgIndex: number
  onChange: (tier: Tier) => void
  onOpenLibrary: (target: ImageLibraryTarget, galleryItemIdx?: number) => void
}) {
  const [open, setOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const addGalleryItem = () => {
    onChange({ ...tier, gallery: [...tier.gallery, { id: generateId(), src: '', alt: `صورة ${tier.gallery.length + 1}` }] })
  }

  const updateGalleryItem = (gi: number, partial: Partial<GalleryItem>) => {
    onChange({ ...tier, gallery: tier.gallery.map((g, i) => i === gi ? { ...g, ...partial } : g) })
  }

  const removeGalleryItem = (gi: number) => {
    onChange({ ...tier, gallery: tier.gallery.filter((_, i) => i !== gi) })
  }

  const updateCard = (ci: number, card: SaleCard) => {
    onChange({ ...tier, cards: tier.cards.map((c, i) => i === ci ? card : c) })
  }

  const addCard = () => {
    const nextNum = String(tier.cards.length + 1).padStart(2, '0')
    onChange({ ...tier, cards: [...tier.cards, { number: nextNum, badge: '', features: [] }] })
  }

  const removeCard = (ci: number) => {
    onChange({ ...tier, cards: tier.cards.filter((_, i) => i !== ci) })
  }

  const handleVideoUpload = async (file: File) => {
    const MAX = 50 * 1024 * 1024
    if (file.size > MAX) { alert('حجم الفيديو يتجاوز 50 ميغابايت.'); return }
    try {
      const url = await uploadVideoAssetWithProgress(file, () => {})
      if (url) onChange({ ...tier, cards: tier.cards.map((c, ci) => ci === 0 ? { ...c, video: url } : c) })
    } catch { /* ignore */ }
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-[color:var(--brand-border)] bg-[rgba(255,255,255,0.025)] shadow-[0_4px_24px_rgba(5,5,19,0.3)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-right transition hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[rgba(160,149,208,0.18)] text-sm font-bold text-[var(--brand-violet)]">
            {tierIndex + 1}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[var(--brand-text)]">{tier.name}</p>
            {tier.price && <p className="text-xs text-[var(--brand-teal)]">{tier.price}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {tier.previewImage && <span className="text-[10px] text-[var(--brand-teal)]">✓ صورة</span>}
          {tier.gallery.length > 0 && <span className="text-[10px] text-[var(--brand-subtle)]">{tier.gallery.length} معرض</span>}
          <span className="text-[var(--brand-muted)]">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="space-y-6 border-t border-[color:var(--brand-border)] px-5 py-5">
          {/* 1. صورة الغلاف — أول شي يظهر في كارت الباقة بالفرونت */}
          <SectionCard title="① صورة الغلاف">
            <ImageField
              label="صورة الغلاف الرئيسية"
              value={tier.previewImage ?? ''}
              onChange={(v) => onChange({ ...tier, previewImage: v })}
              onOpenLibrary={() => onOpenLibrary({ type: 'tier-preview', pkgIdx: pkgIndex, tierIdx: tierIndex })}
            />
          </SectionCard>

          {/* 2. ملخص الكارت من برا — مستقل عن الكارتات الداخلية */}
          <SectionCard title="② ملخص الكارت (برا) — مستقل">
            <p className="mb-3 text-[11px] leading-[1.7] text-[var(--brand-subtle)]">
              هذي الحقول تظهر فقط في كارت الملخص الخارجي. إذا تركتها فارغة يرجع الفرونت لبيانات الكارت 01.
            </p>
            <div className="space-y-3">
              <div>
                <FieldLabel>الشارة (Badge) — برا</FieldLabel>
                <TextInput
                  value={tier.summaryBadge ?? ''}
                  onChange={(v) => onChange({ ...tier, summaryBadge: v })}
                  placeholder="مثال: تهيئة الحسابات الإعلانية"
                />
              </div>
              <div>
                <FieldLabel>ملاحظة الجمهور — برا</FieldLabel>
                <TextArea
                  value={tier.summaryAudienceNote ?? ''}
                  onChange={(v) => onChange({ ...tier, summaryAudienceNote: v })}
                  rows={2}
                  placeholder="النص الظاهر تحت اسم الباقة في الكارت الخارجي"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <FieldLabel>قائمة المميزات — برا</FieldLabel>
                  <button
                    type="button"
                    onClick={() => onChange({ ...tier, summaryFeatures: [...(tier.summaryFeatures ?? []), ''] })}
                    className="rounded-full border border-[rgba(29,171,137,0.3)] px-2 py-0.5 text-[10px] font-medium text-[var(--brand-teal)]"
                  >
                    + إضافة
                  </button>
                </div>
                {(tier.summaryFeatures ?? []).length === 0 && (
                  <p className="text-[11px] text-[var(--brand-muted)]">فارغة — سيستخدم الفرونت مميزات الكارتات الداخلية</p>
                )}
                <div className="space-y-2">
                  {(tier.summaryFeatures ?? []).map((f, fi) => (
                    <div key={fi} className="flex gap-2">
                      <TextInput
                        value={f}
                        onChange={(v) => onChange({ ...tier, summaryFeatures: (tier.summaryFeatures ?? []).map((x, i) => i === fi ? v : x) })}
                        placeholder="نص الميزة"
                      />
                      <button
                        type="button"
                        onClick={() => onChange({ ...tier, summaryFeatures: (tier.summaryFeatures ?? []).filter((_, i) => i !== fi) })}
                        className="shrink-0 text-[var(--brand-coral)]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 3. اسم الباقة والسعر — يظهر تحت الصورة مباشرة */}
          <SectionCard title="③ اسم الباقة والسعر">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>اسم الباقة</FieldLabel>
                <TextInput value={tier.name} onChange={(v) => onChange({ ...tier, name: v })} />
              </div>
              <div>
                <FieldLabel>الاسم الفرعي</FieldLabel>
                <TextInput value={tier.subtitle ?? ''} onChange={(v) => onChange({ ...tier, subtitle: v })} dir="ltr" />
              </div>
              <div>
                <FieldLabel>السعر</FieldLabel>
                <TextInput value={tier.price ?? ''} onChange={(v) => onChange({ ...tier, price: v })} placeholder="مثال: 1200 ر.س" />
              </div>
              <div>
                <FieldLabel>ملاحظة السعر</FieldLabel>
                <TextInput value={tier.priceNote ?? ''} onChange={(v) => onChange({ ...tier, priceNote: v })} placeholder="مثال: غير شامل الضريبة" />
              </div>
              <div>
                <FieldLabel>نص زر اختيار الباقة</FieldLabel>
                <TextInput value={tier.ctaLabel ?? ''} onChange={(v) => onChange({ ...tier, ctaLabel: v })} placeholder="مثال: اختر الخطة" />
              </div>
            </div>
          </SectionCard>

          {/* 4. الكارتات (01, 02, 03) — المحتوى الرئيسي في صفحة التفاصيل */}
          <SectionCard title="④ الكارتات — جوا (صفحة التفاصيل)">
            <p className="mb-3 text-[11px] text-[var(--brand-subtle)]">
              الكارت 01: الشارة وملاحظة الجمهور والمميزات تظهر في ملخص الباقة · الكارتات 01–03 تظهر كاملة في صفحة التفاصيل
            </p>
            <div className="space-y-3">
              {tier.cards.map((card, ci) => (
                <div key={ci} className="relative">
                  <CardEditor
                    card={card}
                    cardIndex={ci}
                    onChange={(c) => updateCard(ci, c)}
                    onOpenVideoLibrary={() => onOpenLibrary({ type: 'card-video', pkgIdx: pkgIndex, tierIdx: tierIndex, cardIdx: ci })}
                  />
                  <button
                    type="button"
                    onClick={() => removeCard(ci)}
                    className="absolute -top-1.5 left-0 flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(238,32,77,0.15)] text-[10px] text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.25)]"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCard}
                className="w-full rounded-[14px] border border-dashed border-[rgba(160,149,208,0.3)] py-2.5 text-sm text-[var(--brand-subtle)] transition hover:border-[rgba(160,149,208,0.5)] hover:text-[var(--brand-text)]"
              >
                + إضافة كارت
              </button>
            </div>
          </SectionCard>

          {/* 5. معرض الصور — يظهر في صفحة التفاصيل (يسار) */}
          <SectionCard title="⑤ معرض الصور (صفحة التفاصيل)">
            <div className="space-y-3">
              {tier.gallery.map((g, gi) => (
                <div key={g.id} className="flex gap-2 rounded-[14px] border border-[color:var(--brand-border)] p-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenLibrary({ type: 'gallery', pkgIdx: pkgIndex, tierIdx: tierIndex }, gi)}
                        className="rounded-[10px] border border-[rgba(29,171,137,0.3)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--brand-teal)]"
                      >
                        {(g.src || g.video) ? 'تغيير' : 'اختيار'}
                      </button>
                      {(g.video || g.src) && <span className="self-center truncate text-[11px] text-[var(--brand-subtle)]">{(g.video || g.src)?.split('/').pop()}</span>}
                    </div>
                    <TextInput value={g.alt} onChange={(v) => updateGalleryItem(gi, { alt: v })} placeholder="وصف الصورة (alt)" />
                  </div>
                  {g.video
                    ? <video src={g.video} className="h-14 w-14 shrink-0 rounded-[10px] object-cover" muted preload="metadata" playsInline />
                    : g.src
                    ? <img src={g.src} alt={g.alt} className="h-14 w-14 shrink-0 rounded-[10px] object-cover" />
                    : null}
                  <button type="button" onClick={() => removeGalleryItem(gi)} className="self-start text-[var(--brand-coral)]">×</button>
                </div>
              ))}
              <button
                type="button"
                onClick={addGalleryItem}
                className="w-full rounded-[14px] border border-dashed border-[rgba(160,149,208,0.3)] py-2.5 text-sm text-[var(--brand-subtle)] transition hover:border-[rgba(160,149,208,0.5)] hover:text-[var(--brand-text)]"
              >
                + إضافة صورة للمعرض
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleVideoUpload(f); e.target.value = '' }} />
    </div>
  )
}

// ─── Videos Section ──────────────────────────────────────────────────────────

function VideosSection({ videos, onChange }: { videos: VideoItem[]; onChange: (v: VideoItem[]) => void }) {
  const [uploadPct, setUploadPct] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const updateVideo = (idx: number, partial: Partial<VideoItem>) =>
    onChange(videos.map((v, i) => i === idx ? { ...v, ...partial } : v))

  const removeVideo = (idx: number) => onChange(videos.filter((_, i) => i !== idx))

  const addVideo = () => onChange([...videos, { id: generateId(), url: '', title: '' }])

  const handleUpload = async (file: File) => {
    const MAX = 50 * 1024 * 1024
    if (file.size > MAX) { alert('حجم الفيديو يتجاوز 50 ميغابايت.'); return }
    setUploadPct(0)
    try {
      const url = await uploadVideoAssetWithProgress(file, (p) => setUploadPct(p))
      if (url) onChange([...videos, { id: generateId(), url, title: file.name.replace(/\.[^.]+$/, '') }])
    } catch { /* ignore */ }
    finally { setUploadPct(null) }
  }

  return (
    <SectionCard title="فيديوهات الباقة">
      <div className="space-y-3">
        {videos.length === 0 && (
          <p className="py-2 text-center text-sm text-[var(--brand-muted)]">لا توجد فيديوهات حتى الآن</p>
        )}
        {videos.map((video, idx) => (
          <div key={video.id} className="rounded-[16px] border border-[color:var(--brand-border)] bg-[rgba(255,255,255,0.02)] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--brand-subtle)]">فيديو {idx + 1}</span>
              <button type="button" onClick={() => removeVideo(idx)} className="text-xs text-[var(--brand-coral)] hover:opacity-80">حذف ×</button>
            </div>
            <div>
              <FieldLabel>الرابط</FieldLabel>
              <TextInput value={video.url} onChange={(v) => updateVideo(idx, { url: v })} placeholder="https://youtube.com/... أو رابط ملف .mp4" dir="ltr" />
            </div>
            <div>
              <FieldLabel>العنوان (اختياري)</FieldLabel>
              <TextInput value={video.title ?? ''} onChange={(v) => updateVideo(idx, { title: v })} placeholder="عنوان الفيديو" />
            </div>
            {video.url && (
              <div className="overflow-hidden rounded-[12px] border border-[color:var(--brand-border)] bg-black/20">
                {/youtube|youtu\.be|vimeo/.test(video.url) ? (
                  <iframe
                    src={video.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="aspect-video w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : /\.(mp4|webm|ogg)/i.test(video.url) ? (
                  <video src={video.url} controls preload="metadata" className="aspect-video w-full bg-black" />
                ) : (
                  <p className="p-3 text-xs text-[var(--brand-subtle)]">معاينة غير متاحة لهذا الرابط</p>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={addVideo}
            className="flex-1 rounded-[14px] border border-dashed border-[rgba(160,149,208,0.3)] py-2.5 text-sm text-[var(--brand-subtle)] transition hover:border-[rgba(160,149,208,0.5)] hover:text-[var(--brand-text)]"
          >
            + إضافة رابط فيديو
          </button>
          <label className={cn(
            'cursor-pointer rounded-[14px] border px-4 py-2.5 text-sm font-medium transition',
            uploadPct !== null
              ? 'border-[rgba(29,171,137,0.2)] bg-[rgba(29,171,137,0.06)] text-[var(--brand-teal)]/50 cursor-not-allowed'
              : 'border-[rgba(29,171,137,0.32)] bg-[rgba(29,171,137,0.1)] text-[var(--brand-teal)] hover:bg-[rgba(29,171,137,0.16)]',
          )}>
            {uploadPct !== null ? `جاري الرفع ${uploadPct}%` : 'رفع فيديو'}
            <input ref={fileRef} type="file" accept="video/*" className="hidden" disabled={uploadPct !== null}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUpload(f); e.target.value = '' }} />
          </label>
        </div>

        {uploadPct !== null && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(160,149,208,0.15)]">
            <div className="h-full rounded-full bg-[var(--brand-teal)] transition-all duration-200" style={{ width: `${uploadPct}%` }} />
          </div>
        )}
      </div>
    </SectionCard>
  )
}

// ─── Process Editor ──────────────────────────────────────────────────────────

function ProcessEditor({ process, onChange }: { process: ProcessData; onChange: (p: ProcessData) => void }) {
  const updateStep = (idx: number, step: ProcessStep) =>
    onChange({ ...process, steps: process.steps.map((s, i) => i === idx ? step : s) })

  return (
    <div className="space-y-4">
      <SectionCard title="إعدادات قسم المراحل" accent>
        <div className="space-y-3">
          <div>
            <FieldLabel>العنوان الرئيسي</FieldLabel>
            <TextInput value={process.title ?? ''} onChange={(v) => onChange({ ...process, title: v })} placeholder="آلية العمل مع مثال تفاعلي" />
          </div>
          <div>
            <FieldLabel>النص التوضيحي</FieldLabel>
            <TextArea value={process.noticeText ?? ''} onChange={(v) => onChange({ ...process, noticeText: v })} rows={3} />
          </div>
          <div>
            <FieldLabel>الإحصائية (مثال: 10 مراحل مهمة)</FieldLabel>
            <TextInput value={process.stat ?? ''} onChange={(v) => onChange({ ...process, stat: v })} placeholder="10 مراحل مهمة" />
          </div>
        </div>
      </SectionCard>

      {process.steps.map((step, idx) => (
        <SectionCard key={step.order} title={`المرحلة ${step.order.toString().padStart(2, '0')} — ${step.title || '...'}`}>
          <div className="space-y-3">
            <div>
              <FieldLabel>عنوان المرحلة</FieldLabel>
              <TextInput value={step.title} onChange={(v) => updateStep(idx, { ...step, title: v })} />
            </div>
            <div>
              <FieldLabel>وصف المرحلة</FieldLabel>
              <TextArea value={step.description ?? ''} onChange={(v) => updateStep(idx, { ...step, description: v })} rows={2} />
            </div>
            <div>
              <FieldLabel>رابط الزر (اختياري — اتركه فارغاً لإخفاء الزر)</FieldLabel>
              <TextInput value={step.link ?? ''} onChange={(v) => updateStep(idx, { ...step, link: v })} placeholder="https://..." />
            </div>
            {step.link?.trim() ? (
              <div>
                <FieldLabel>نص الزر</FieldLabel>
                <TextInput value={step.linkLabel ?? ''} onChange={(v) => updateStep(idx, { ...step, linkLabel: v })} placeholder="اعرف أكثر" />
              </div>
            ) : null}
          </div>
        </SectionCard>
      ))}
    </div>
  )
}

// ─── Package Editor ───────────────────────────────────────────────────────────

function PackageEditorSection({
  pkg,
  pkgIndex,
  onChange,
  onOpenLibrary,
}: {
  pkg: Package
  pkgIndex: number
  onChange: (pkg: Package) => void
  onOpenLibrary: (target: ImageLibraryTarget) => void
}) {
  const hasProcess = !!pkg.process
  const [tab, setTab] = useState<'info' | 'tiers' | 'videos' | 'process'>('tiers')

  const updateTier = (ti: number, tier: Tier) => {
    onChange({ ...pkg, saleTiers: pkg.saleTiers.map((t, i) => i === ti ? tier : t) })
  }

  const updateItem = (ii: number, value: string) => {
    onChange({ ...pkg, items: pkg.items.map((it, i) => i === ii ? value : it) })
  }

  const addItem = () => onChange({ ...pkg, items: [...pkg.items, ''] })
  const removeItem = (ii: number) => onChange({ ...pkg, items: pkg.items.filter((_, i) => i !== ii) })

  return (
    <div className="mt-4 space-y-4">
      <div className="flex gap-1 rounded-[16px] border border-[color:var(--brand-border)] bg-[rgba(5,5,19,0.4)] p-1" dir="rtl">
        {([
          ['tiers', `الباقات الفرعية (${pkg.saleTiers.length})`],
          ['videos', `الفيديوهات (${pkg.videos.length})`],
          ['info', 'معلومات الباقة'],
          ...(hasProcess ? [['process', 'المراحل']] : []),
        ] as [string, string][]).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t as typeof tab)}
            className={cn('flex-1 rounded-[12px] py-2 text-sm font-medium transition', tab === t ? 'bg-[rgba(160,149,208,0.2)] text-[var(--brand-text)]' : 'text-[var(--brand-muted)] hover:text-[var(--brand-subtle)]')}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="space-y-5">
          <SectionCard title="معلومات الصفحة" accent>
            <div className="space-y-3">
              <div>
                <FieldLabel>رابط الصفحة (Path)</FieldLabel>
                <TextInput value={pkg.path} onChange={(v) => onChange({ ...pkg, path: v })} placeholder="/packages/identity-packages" dir="ltr" />
              </div>
              <div>
                <FieldLabel>عنوان الباقة</FieldLabel>
                <TextInput value={pkg.title} onChange={(v) => onChange({ ...pkg, title: v })} />
              </div>
              <div>
                <FieldLabel>وصف الباقة</FieldLabel>
                <TextArea value={pkg.description} onChange={(v) => onChange({ ...pkg, description: v })} />
              </div>
              <div>
                <FieldLabel>تصنيف الباقة</FieldLabel>
                <TextInput value={pkg.categoryTag ?? ''} onChange={(v) => onChange({ ...pkg, categoryTag: v })} />
              </div>
              <div>
                <FieldLabel>ملاحظة (Note)</FieldLabel>
                <TextArea value={pkg.note ?? ''} onChange={(v) => onChange({ ...pkg, note: v })} rows={2} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="نصوص الهيرو">
            <div className="space-y-3">
              <div>
                <FieldLabel>السطر الأول</FieldLabel>
                <TextInput value={pkg.hero.lines[0] ?? ''} onChange={(v) => onChange({ ...pkg, hero: { ...pkg.hero, lines: [v, ...pkg.hero.lines.slice(1)] } })} />
              </div>
              <div>
                <FieldLabel>السطر الثاني (اختياري)</FieldLabel>
                <TextInput value={pkg.hero.lines[1] ?? ''} onChange={(v) => onChange({ ...pkg, hero: { ...pkg.hero, lines: [pkg.hero.lines[0] ?? '', v].filter((_, i, a) => i === 0 || a[i] !== '') } })} />
              </div>
              <div>
                <FieldLabel>وصف الهيرو</FieldLabel>
                <TextArea value={pkg.hero.description} onChange={(v) => onChange({ ...pkg, hero: { ...pkg.hero, description: v } })} />
              </div>
              <div>
                <FieldLabel>النص الداعم (Support Text)</FieldLabel>
                <TextInput value={pkg.hero.supportText ?? ''} onChange={(v) => onChange({ ...pkg, hero: { ...pkg.hero, supportText: v } })} />
              </div>
              <ImageField
                label="صورة خلفية الهيرو"
                value={pkg.hero.backgroundImage ?? ''}
                onChange={(v) => onChange({ ...pkg, hero: { ...pkg.hero, backgroundImage: v } })}
                onOpenLibrary={() => onOpenLibrary({ type: 'pkg-hero', pkgIdx: pkgIndex })}
              />
            </div>
          </SectionCard>

          <SectionCard title="نقاط ما تشمله الباقة">
            <div className="space-y-2">
              {pkg.items.map((item, ii) => (
                <div key={ii} className="flex gap-2">
                  <TextInput value={item} onChange={(v) => updateItem(ii, v)} placeholder={`النقطة ${ii + 1}`} />
                  <button type="button" onClick={() => removeItem(ii)} className="text-[var(--brand-coral)]">×</button>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="w-full rounded-[14px] border border-dashed border-[rgba(160,149,208,0.3)] py-2 text-sm text-[var(--brand-subtle)] hover:text-[var(--brand-text)]"
              >
                + إضافة نقطة
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === 'tiers' && (
        <div className="space-y-4">
          {pkg.saleTiers.map((tier, ti) => (
            <TierEditor
              key={tier.id}
              tier={tier}
              tierIndex={ti}
              pkgIndex={pkgIndex}
              onChange={(t) => updateTier(ti, t)}
              onOpenLibrary={onOpenLibrary}
            />
          ))}
        </div>
      )}

      {tab === 'videos' && (
        <VideosSection
          videos={pkg.videos}
          onChange={(videos) => onChange({ ...pkg, videos })}
        />
      )}

      {tab === 'process' && pkg.process && (
        <ProcessEditor
          process={pkg.process}
          onChange={(p) => onChange({ ...pkg, process: p })}
        />
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface PackagesEditorPageProps {
  packagesShowcaseItem: ContentListItem | null
  onCatalogUpdate: (updated: ContentListItem) => void
}

export function PackagesEditorPage({ packagesShowcaseItem, onCatalogUpdate }: PackagesEditorPageProps) {
  const [packages, setPackages] = useState<Package[]>(DEFAULT_PACKAGES)
  const [activePkgIdx, setActivePkgIdx] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null)

  // Image library state
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [libraryImages, setLibraryImages] = useState<ImageAsset[]>([])
  const [libraryStatus, setLibraryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [libraryError, setLibraryError] = useState<string | null>(null)
  const [libraryActionStatus, setLibraryActionStatus] = useState<'idle' | 'uploading' | 'saving' | 'deleting' | 'success' | 'error'>('idle')
  const [libraryActionMessage, setLibraryActionMessage] = useState<string | null>(null)
  const [libraryActionImageId, setLibraryActionImageId] = useState<string | null>(null)
  const pendingLibraryTarget = useRef<ImageLibraryTarget | null>(null)
  const pendingGalleryItem = useRef<number | null>(null)

  useEffect(() => {
    if (!packagesShowcaseItem) return
    setPackages(parsePackages(packagesShowcaseItem.body))
  }, [packagesShowcaseItem])

  const openLibrary = (target: ImageLibraryTarget, galleryItemIdx?: number) => {
    pendingLibraryTarget.current = target
    pendingGalleryItem.current = galleryItemIdx ?? null
    setLibraryOpen(true)
    if (libraryStatus !== 'success') {
      setLibraryStatus('loading')
      setLibraryError(null)
      fetchImages()
        .then((imgs) => { setLibraryImages(imgs); setLibraryStatus('success') })
        .catch((err) => { setLibraryError(err instanceof Error ? err.message : 'خطأ في تحميل الصور'); setLibraryStatus('error') })
    }
  }

  const handleLibrarySelect = (asset: ImageAsset) => {
    const url = resolveImageAssetUrl(asset)
    const target = pendingLibraryTarget.current
    if (!target) return

    setPackages((prev) => prev.map((pkg, pi) => {
      if (pi !== target.pkgIdx) return pkg
      if (target.type === 'pkg-hero') return { ...pkg, hero: { ...pkg.hero, backgroundImage: url } }
      if (target.type === 'tier-preview') {
        return { ...pkg, saleTiers: pkg.saleTiers.map((t, ti) => ti === target.tierIdx ? { ...t, previewImage: url } : t) }
      }
      if (target.type === 'gallery') {
        const gi = pendingGalleryItem.current
        const isVideo = asset.contentType?.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(url)
        const galleryPatch: Partial<GalleryItem> = isVideo
          ? { video: url, src: '' }
          : { src: url, video: undefined }
        return {
          ...pkg, saleTiers: pkg.saleTiers.map((t, ti) => {
            if (ti !== target.tierIdx) return t
            const newGallery = gi !== null
              ? t.gallery.map((g, i) => i === gi ? { ...g, ...galleryPatch } : g)
              : [...t.gallery, { id: generateId(), alt: asset.originalFileName ?? '', ...galleryPatch }]
            return { ...t, gallery: newGallery }
          })
        }
      }
      if (target.type === 'card-video') {
        return { ...pkg, saleTiers: pkg.saleTiers.map((t, ti) => ti !== target.tierIdx ? t : { ...t, cards: t.cards.map((c, ci) => ci !== target.cardIdx ? c : { ...c, video: url }) }) }
      }
      return pkg
    }))
    setLibraryOpen(false)
  }

  const handleSave = async () => {
    if (!packagesShowcaseItem) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const nextBody = serializePackages(packages, packagesShowcaseItem.body as Record<string, JsonValue>)
      const updated = await updateContentDetail(packagesShowcaseItem.id, {
        contentType: packagesShowcaseItem.contentType,
        body: nextBody as unknown as import('../types/content').ContentBody,
      })
      onCatalogUpdate(updated)
      setSaveMsg({ text: 'تم حفظ الباقات بنجاح ✓', ok: true })
    } catch (err) {
      setSaveMsg({ text: err instanceof Error ? err.message : 'تعذر الحفظ.', ok: false })
    } finally {
      setSaving(false)
    }
  }

  const PKG_LABELS = [
    { accent: 'text-[var(--brand-coral)]', icon: '📣' },
    { accent: 'text-[var(--brand-teal)]', icon: '🎨' },
  ]

  return (
    <div className="dashboard-scroll h-full overflow-y-auto overscroll-contain" dir="rtl">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--brand-text)]">الباقات</h1>
            <p className="mt-1 text-sm text-[var(--brand-muted)]">تعديل محتوى صفحة الباقات بالكامل — من الباقات الكبيرة حتى التفاصيل الداخلية</p>
          </div>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !packagesShowcaseItem}
            className={cn(
              'rounded-[16px] px-5 py-2.5 text-sm font-semibold transition',
              saving
                ? 'cursor-not-allowed bg-[rgba(29,171,137,0.15)] text-[var(--brand-teal)]/50'
                : 'bg-[rgba(29,171,137,0.18)] text-[var(--brand-teal)] hover:bg-[rgba(29,171,137,0.28)]',
            )}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>

        {saveMsg && (
          <div className={cn('rounded-[16px] px-4 py-3 text-sm font-medium', saveMsg.ok ? 'bg-[rgba(29,171,137,0.12)] text-[var(--brand-teal)]' : 'bg-[rgba(238,32,77,0.1)] text-[var(--brand-coral)]')}>
            {saveMsg.text}
          </div>
        )}

        {!packagesShowcaseItem && (
          <div className="rounded-[20px] border border-[rgba(238,32,77,0.3)] bg-[rgba(238,32,77,0.06)] p-5 text-sm text-[var(--brand-coral)]">
            لم يتم تحميل بيانات الباقات من الـ API. تأكد من أن قسم packages_showcase موجود.
          </div>
        )}

        {/* Package selector */}
        <div className="grid grid-cols-2 gap-3">
          {packages.map((pkg, pi) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setActivePkgIdx(pi)}
              className={cn(
                'rounded-[22px] border p-4 text-right transition',
                activePkgIdx === pi
                  ? 'border-[rgba(160,149,208,0.4)] bg-[rgba(160,149,208,0.12)] shadow-[0_0_0_1px_rgba(160,149,208,0.2)]'
                  : 'border-[color:var(--brand-border)] bg-[rgba(255,255,255,0.025)] hover:bg-[rgba(255,255,255,0.04)]',
              )}
            >
              <div className="mb-2 text-2xl">{PKG_LABELS[pi]?.icon}</div>
              <p className={cn('text-sm font-semibold', activePkgIdx === pi ? PKG_LABELS[pi]?.accent : 'text-[var(--brand-text)]')}>
                {pkg.title}
              </p>
              <p className="mt-1 text-[11px] text-[var(--brand-muted)]">{pkg.saleTiers.length} باقات فرعية</p>
            </button>
          ))}
        </div>

        {/* Active package editor */}
        <PackageEditorSection
          pkg={packages[activePkgIdx]!}
          pkgIndex={activePkgIdx}
          onChange={(pkg) => setPackages((prev) => prev.map((p, i) => i === activePkgIdx ? pkg : p))}
          onOpenLibrary={openLibrary}
        />
      </div>

      {libraryOpen && (
        <ImageLibraryModal
          isOpen={libraryOpen}
          fieldLabel="اختيار صورة"
          selectedImageValue={null}
          images={libraryImages}
          status={libraryStatus}
          error={libraryError}
          actionStatus={libraryActionStatus}
          actionMessage={libraryActionMessage}
          actionImageId={libraryActionImageId}
          onClose={() => setLibraryOpen(false)}
          onClearSelection={() => setLibraryOpen(false)}
          onSelect={handleLibrarySelect}
          onUpload={async (file) => {
            setLibraryActionStatus('uploading')
            setLibraryActionMessage(null)
            setLibraryActionImageId(null)
            try {
              const asset = await uploadImageAsset(file)
              setLibraryImages((prev) => [asset, ...prev])
              setLibraryActionStatus('idle')
            } catch { setLibraryActionStatus('error') }
          }}
          onDelete={async (asset) => {
            setLibraryActionStatus('deleting')
            setLibraryActionImageId(asset.id)
            try {
              await deleteImageAsset(asset.id)
              setLibraryImages((prev) => prev.filter((img) => img.id !== asset.id))
              setLibraryActionStatus('idle')
              setLibraryActionImageId(null)
            } catch { setLibraryActionStatus('error') }
          }}
          onRename={async (imageId, fileName) => {
            setLibraryActionStatus('saving')
            setLibraryActionImageId(imageId)
            try {
              const updated = await updateImageAsset(imageId, fileName)
              setLibraryImages((prev) => prev.map((img) => img.id === updated.id ? updated : img))
              setLibraryActionStatus('idle')
              setLibraryActionImageId(null)
            } catch { setLibraryActionStatus('error') }
          }}
          onRetry={() => {
            setLibraryStatus('loading')
            setLibraryError(null)
            fetchImages()
              .then((imgs) => { setLibraryImages(imgs); setLibraryStatus('success') })
              .catch((err) => { setLibraryError(err instanceof Error ? err.message : 'خطأ'); setLibraryStatus('error') })
          }}
        />
      )}
    </div>
  )
}
