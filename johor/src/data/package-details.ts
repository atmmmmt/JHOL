export type PackageDetailStep = {
  order: number;
  title: string;
  description?: string;
  /** Optional link for the per-stage button. When empty, no button is shown. */
  link?: string;
  /** Optional custom label for the per-stage button. */
  linkLabel?: string;
};

export type PackageDetailProcess = {
  label: string;
  stat: string;
  title: string;
  noticeText?: string;
  steps: PackageDetailStep[];
};

export type PackageSaleCardFeature = {
  title: string;
  subtitle?: string;
};

export type PackageSaleCard = {
  number: string;
  badge: string;
  title: string;
  subtitle?: string;
  audienceNote?: string;
  video?: string;
  features: PackageSaleCardFeature[];
};

export type PackageTierGalleryImage = {
  src?: string;
  image?: string;
  alt: string;
};

export type PackageSaleTier = {
  id: string;
  name: string;
  ctaLabel?: string;
  subtitle?: string;
  price?: string;
  priceNote?: string;
  previewImage?: string;
  isFeatured?: boolean;
  gallery?: PackageTierGalleryImage[];
  cards: PackageSaleCard[];
  // Summary card fields (outside view) — independent from inner cards
  summaryBadge?: string;
  summaryAudienceNote?: string;
  summaryFeatures?: string[];
};

export type PackageVideo = {
  id: string;
  url: string;
  title?: string;
};

export type PackageDetail = {
  id: string;
  path: string;
  title: string;
  description: string;
  hero: {
    lines: string[];
    description: string;
    supportText: string;
    accent: "teal" | "coral" | "violet";
    backgroundImage?: string;
  };
  items: string[];
  videos?: PackageVideo[];
  categoryTag?: string;
  note?: string;
  process?: PackageDetailProcess;
  saleCards?: PackageSaleCard[];
  saleTiers?: PackageSaleTier[];
};

export const PACKAGE_DETAILS: PackageDetail[] = [
  {
    id: "package-1",
    path: "/packages/campaign-packages",
    title: "إطلاق الحملات الإعلانية الممولة",
    description:
      "ندير حملتك بكفاءة من الفكرة حتى التنفيذ، لضمان وصولها إلى جمهورك وتحقيق أفضل النتائج.",
    hero: {
      lines: ["إطلاق الحملات الإعلانية الممولة"],
      description:
        "ندير حملتك بكفاءة من الفكرة حتى التنفيذ، لضمان وصولها إلى جمهورك وتحقيق أفضل النتائج.",
      supportText:
        "مناسبة للمشاريع التي تسعى لزيادة المبيعات أو إطلاق منتج أو خدمة جديدة.",
      accent: "coral",
    },
    items: [
      "دراسة وتحليل الجمهور المستهدف.",
      "إعداد استراتيجية الحملة وتحديد أهدافها بوضوح.",
      "إنشاء وتصميم الإعلانات الجذابة، نصوصًا وتصاميم.",
      "إدارة الحملة على المنصات المناسبة مثل Meta وGoogle وTikTok.",
      "متابعة الأداء وتقديم تقارير دورية مع تحليل النتائج.",
    ],
    note:
      "مناسبة للمشاريع التي تسعى لزيادة المبيعات أو إطلاق منتج أو خدمة جديدة.",
    categoryTag: "إطلاق حملات تمويلية",
    videos: [],
    saleTiers: [
      {
        id: "snapchat",
        name: "حملات السناب شات",
        subtitle: "Snapchat Ads Package",
        cards: [
          {
            number: "01",
            badge: "تهيئة الحسابات الإعلانية",
            title: "إعداد الحملة",
            audienceNote: "مناسبة للأنشطة التي تستهدف جمهورًا نشطًا على سناب شات.",
            features: [
              { title: "إنشاء حساب إعلاني." },
              { title: "إنشاء مدير الإعلانات وربطه." },
              { title: "ضبط هيكلة الحملة بما يتناسب مع هدف النشاط." },
            ],
          },
          {
            number: "02",
            badge: "الإدارة والتحسين اليومي",
            title: "إدارة الأداء",
            features: [
              { title: "عدد لا محدود من الإعلانات." },
              { title: "متابعة يومية وتحسين يومي." },
              { title: "اختبار الشرائح الإعلانية وتحسين النتائج." },
            ],
          },
          {
            number: "03",
            badge: "التقارير وإرشادات المحتوى",
            title: "المخرجات",
            features: [
              { title: "إرشادات المحتوى." },
              { title: "المدة: 30 يوم." },
              { title: "السعر: 1200 SAR (غير شامل تمويل المنصة)." },
            ],
          },
        ],
      },
      {
        id: "meta",
        name: "حملات الإنستغرام والفيسبوك",
        subtitle: "Instagram & Facebook Ads",
        cards: [
          {
            number: "01",
            badge: "تهيئة الحسابات الإعلانية",
            title: "إعداد الحملة",
            audienceNote: "مناسبة للأنشطة التي تحتاج الوصول لجمهور Meta بشكل سريع ومنظم.",
            features: [
              { title: "إنشاء حساب إعلاني." },
              { title: "إنشاء مدير الإعلانات وربطه." },
              { title: "تجهيز إعدادات الجمهور والأهداف التسويقية." },
            ],
          },
          {
            number: "02",
            badge: "الإدارة والتحسين اليومي",
            title: "إدارة الأداء",
            features: [
              { title: "عدد لا محدود من الإعلانات." },
              { title: "متابعة يومية وتحسين يومي." },
              { title: "تعديل الاستهداف وفق نتائج الأداء." },
            ],
          },
          {
            number: "03",
            badge: "التقارير وإرشادات المحتوى",
            title: "المخرجات",
            features: [
              { title: "إرشادات المحتوى." },
              { title: "كتابة بايو للحساب." },
              { title: "المدة: 30 يوم، السعر: 1200 SAR (غير شامل تمويل المنصة)." },
            ],
          },
        ],
      },
      {
        id: "tiktok",
        name: "حملات التيك توك",
        subtitle: "TikTok Ads Package",
        cards: [
          {
            number: "01",
            badge: "تهيئة الحسابات الإعلانية",
            title: "إعداد الحملة",
            audienceNote: "مناسبة للحملات التي تعتمد على محتوى مرئي سريع الانتشار.",
            features: [
              { title: "إنشاء حساب إعلاني." },
              { title: "إنشاء مدير الإعلانات وربطه." },
              { title: "تجهيز الحملة وفق أهداف التحويل أو الزيارات." },
            ],
          },
          {
            number: "02",
            badge: "الإدارة والتحسين اليومي",
            title: "إدارة الأداء",
            features: [
              { title: "عدد لا محدود من الإعلانات." },
              { title: "متابعة يومية وتحسين يومي." },
              { title: "تحسين الجمهور والإعلانات لتحقيق نتائج أفضل." },
            ],
          },
          {
            number: "03",
            badge: "التقارير وإرشادات المحتوى",
            title: "المخرجات",
            features: [
              { title: "إرشادات المحتوى." },
              { title: "كتابة بايو للحساب." },
              { title: "المدة: 30 يوم، السعر: 1200 SAR (غير شامل تمويل المنصة)." },
            ],
          },
        ],
      },
      {
        id: "all-platforms",
        name: "جميع المنصات",
        subtitle: "All Platforms Package",
        cards: [
          {
            number: "01",
            badge: "الإدارة الموحدة متعددة المنصات",
            title: "إعداد وإدارة مشتركة",
            audienceNote: "لمن يحتاج حضورًا موحدًا على أكثر من منصة ضمن خطة تشغيل واحدة.",
            features: [
              { title: "إدارة حملات موحّدة على أكثر من منصة." },
              { title: "تنسيق استراتيجية موحّدة بين القنوات." },
              { title: "توجيه المحتوى بما يناسب كل منصة." },
            ],
          },
          {
            number: "02",
            badge: "المتابعة والتحسين المستمر",
            title: "تحسين الأداء",
            features: [
              { title: "متابعة أداء يومية وتوجيه مستمر للمحتوى." },
              { title: "تحسينات دورية بناءً على نتائج الحملات." },
              { title: "رفع كفاءة الصرف الإعلاني عبر القنوات." },
            ],
          },
          {
            number: "03",
            badge: "السعر والخصم",
            title: "المخرجات",
            features: [
              { title: "تقارير أداء دورية واضحة." },
              { title: "السعر: 3000 SAR." },
              { title: "خصم بمقدار 600 ريال (غير شامل تمويل المنصة)." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "package-2",
    path: "/packages/identity-packages",
    title: "تصميم الشعارات والهوية البصرية",
    description:
      "نقدم لك هوية بصرية متكاملة تعكس شخصية علامتك التجارية وتمنحها تميزًا واضحًا في السوق.",
    hero: {
      lines: ["تصميم الشعارات والهوية البصرية"],
      description:
        "نقدم لك هوية بصرية متكاملة تعكس شخصية علامتك التجارية وتمنحها تميزًا واضحًا في السوق.",
      supportText: "تسليم منظم واحترافي يسهل عليك استخدامها فورًا.",
      accent: "teal",
    },
    items: [
      "تصميم شعار احترافي متعدد الاستخدامات.",
      "دليل الهوية البصرية الكامل Brand Guidelines.",
      "تطبيق الهوية على المواد التسويقية الأساسية.",
      "ملفات عالية الجودة لجميع الاستخدامات، من الطباعة إلى السوشيال ميديا.",
      "تسليم منظم واحترافي يسهل عليك استخدامها فورًا.",
    ],
    categoryTag: "هويات بصرية",
    videos: [],
    process: {
      label: "NOTICE",
      stat: "10 مراحل مهمة",
      title: "آلية العمل مع مثال تفاعلي",
      noticeText:
        "حتى نصل إلى هدفك نعمل في جهور على وضع آلية عمل احترافية ودقيقة استطعنا تحقيق هدف بأكثر من 137 مشروع بنسبة نجاح تصل إلى 94% خلال سنة 2025 وهي مقسمة إلى",
      steps: [
        {
          order: 1,
          title: "جمع التفاصيل الأولية",
          description:
            "نبدأ بتحديد تفاصيل المشروع ومتطلباته لتقدير حجمه وما يحتاجه من تصاميم.",
        },
        {
          order: 2,
          title: "عرض السعر",
          description:
            "نقدم عرض سعر مناسب بناءً على حجم المشروع ومتطلباته من تصاميم.",
        },
        {
          order: 3,
          title: "الاستبيان الموجز (بريف)",
          description:
            "بعد الموافقة على عرض السعر ودفع المبلغ، يتم إرسال استبيان موجز (بريف) يتضمن مجموعة من الأسئلة لفهم المشروع بشكل أعمق.",
        },
        {
          order: 4,
          title: "الاجتماع مع العميل",
          description:
            "نعقد اجتماعًا لمدة 30 دقيقة نتحدث فيه مع العميل عن الاستبيان المقدم ومناقشة الإجابات بشكل مباشر.",
        },
        {
          order: 5,
          title: "مرحلة التحليل",
          description:
            "نقوم بتحليل الجمهور المستهدف، الاتجاه البصري، أهداف العمل، المشكلة والحل، وتحليل المنافسين.",
        },
        {
          order: 6,
          title: "لوحات الإلهام",
          description:
            "بناءً على نتائج التحليل، نقترح 3 لوحات إلهام تضم صورًا فنية، شعارات، ألوان، خطوط ونماذج استرشادية ليتضح الشكل الأفضل.",
        },
        {
          order: 7,
          title: "رسم السكيتشات",
          description:
            "بعد اعتماد لوحة الاستكشافات الأولية، نقوم برسم عدة اسكتشات يدويًا لحل توجّه العميل عبر ثلاث لوحات استكشافية، ويتكون كل تصور أولي من 40 سكتش.",
        },
        {
          order: 8,
          title: "العروض التقديمية",
          description:
            "نختار أفضل 3 أفكار من الاسكتشات ونفصلها على العميل في ملف تقديمي بالأبيض والأسود مع شرح واضح للمفهوم، الفكرة، والعلامة والنص.",
        },
        {
          order: 9,
          title: "الاختبار والاعتماد",
          description:
            "عند اعتماد أحد النماذج، نختار الألوان المناسبة ونبدأ تصميم الهوية البصرية والدليل الإرشادي لتطبيقها وتصميم عرض تقديمي خاص بالعميل.",
        },
        {
          order: 10,
          title: "التسليم النهائي",
          description:
            "في هذه المرحلة يتم تسليم كافة الملفات النهائية للعميل عبر البريد الإلكتروني بشكل رسمي، بملف مشروعه، وجاهزة للاستخدام.",
        },
      ],
    },
    saleTiers: [
      {
        id: "basic",
        name: "الباقة الأساسية",
        subtitle: "Basic Package",
        price: "3847 ر.س",
        cards: [
          {
            number: "01",
            badge: "الشعار (Logo)",
            title: "Basic Package",
            subtitle: "Logo",
            audienceNote:
              "نصمم لك شعارًا احترافيًا يعكس هوية مشروعك ويمنح علامتك حضورًا مميزًا واحترافيًا في السوق، مع مراعاة البساطة وسهولة الاستخدام على جميع المنصات.",
            features: [
              {
                title: "تصميم شعار احترافي مخصص.",
              },
              {
                title: "عرض الشعار بطريقة احترافية (Mockup).",
              },
              {
                title: "تسليم الشعار بصيغ عالية الجودة: AI / EPS / PDF / PNG / JPG.",
              },
              {
                title: "تسليم النسخة النهائية المعتمدة.",
              },
            ],
          },
          {
            number: "02",
            badge: "الهوية البصرية والدليل الإرشادي",
            title: "VISUAL IDENTITY & BRAND GUIDELINE",
            audienceNote:
              "نقوم ببناء هوية بصرية متكاملة تساعد علامتك على الظهور بشكل موحد واحترافي في جميع الاستخدامات.",
            features: [
              { title: "دليل استخدام الهوية البصرية." },
              { title: "شبكة بناء الشعار (Logo Grid)." },
              { title: "نسخ الشعار المختلفة." },
              { title: "الألوان الرسمية للهوية (Color System)." },
              { title: "نظام الخطوط المستخدم (Typography System)." },
              { title: "أسلوب الصور والعناصر البصرية." },
              { title: "الأيقونات والزخارف المساندة." },
              { title: "قواعد الاستخدام الصحيح والخاطئ للشعار." },
              { title: "تطبيقات الهوية ثلاثية الأبعاد والعروض التقديمية." },
            ],
          },
          {
            number: "03",
            badge: "التطبيقات البصرية",
            title: "VISUAL IDENTITY APPS",
            subtitle: "(STATIONERY + MARKETING + DIGITAL)",
            audienceNote:
              "تصميم جميع التطبيقات الأساسية التي تحتاجها العلامة التجارية بشكل احترافي ومتناسق.",
            features: [
              { title: "المطبوعات الرسمية: بطاقة عمل." },
              { title: "المطبوعات الرسمية: ورق مراسلات رسمي." },
              { title: "المطبوعات الرسمية: ظرف رسمي." },
              { title: "المطبوعات الرسمية: ختم." },
              { title: "المطبوعات الرسمية: ملف (Folder)." },
              { title: "التسويق والعلامة التجارية: رول أب (Roll-up Banner)." },
              { title: "التسويق والعلامة التجارية: بطاقة تعريف موظف." },
              { title: "التسويق والعلامة التجارية: دفتر ملاحظات." },
              { title: "التسويق والعلامة التجارية: فاتورة وسند قبض." },
              { title: "التطبيقات الرقمية: تصميم بروفايل احترافي." },
              { title: "التطبيقات الرقمية: تصميم واجهات ومنشورات السوشيال ميديا." },
              { title: "التطبيقات الرقمية: تصميم أغلفة منصات التواصل." },
              { title: "التطبيقات الرقمية: توقيع بريد إلكتروني." },
              { title: "التطبيقات الرقمية: تصميم 9 منشورات إنستقرام احترافية." },
              { title: "التطبيقات الرقمية: تصميم 6 ستوري متناسقة." },
              { title: "العروض التقديمية: تصميم موكابات احترافية." },
              { title: "العروض التقديمية: عرض الهوية على نماذج واقعية تساعد على تصور العلامة بشكل احترافي." },
            ],
          },
          {
            number: "04",
            badge: "مميزات الباقة",
            title: "Package Benefits",
            features: [
              { title: "تصاميم احترافية مخصصة بالكامل." },
              { title: "جودة عالية قابلة للطباعة والاستخدام الرقمي." },
              { title: "توحيد كامل لهوية العلامة التجارية." },
              { title: "دعم ظهور المشروع بشكل احترافي ومميز." },
            ],
          },
        ],
      },
      {
        id: "advanced",
        name: "الباقة الشاملة",
        subtitle: "Comprehensive Package",
        price: "5547 ر.س",
        cards: [
          {
            number: "01",
            badge: "الشعار LOGO",
            title: "الباقة الشاملة",
            subtitle: "Comprehensive Package",
            audienceNote:
              "للعلامات التي تحتاج هوية أعمق مع تطبيقات موسّعة وتفاصيل إضافية.",
            features: [
              { title: "تقديم 3 نماذج احترافية للشعار", subtitle: "(Professional Concepts 3)" },
              { title: "عرض بصري احترافي", subtitle: "(Professional Presentation)" },
              { title: "تطوير الشعار المعتمد", subtitle: "(Final Logo Refinement)" },
              { title: "تسليم الملفات المفتوحة", subtitle: "(AI - EPS - PDF - PNG - JPG)" },
            ],
          },
          {
            number: "02",
            badge: "الهوية البصرية والدليل الإرشادي",
            title: "VISUAL IDENTITY & BRAND GUIDELINE",
            audienceNote: "يشمل عناصر توسّع الهوية مثل الاستراتيجية والتصوير والقوالب الجاهزة.",
            features: [
              { title: "استراتيجية العلامة التجارية", subtitle: "(Brand Strategy)" },
              { title: "التوجه البصري للعلامة", subtitle: "(Visual Direction)" },
              { title: "هيكلة الشعار", subtitle: "(Logo Structure)" },
              { title: "نسخ الشعار", subtitle: "(Logo Variations)" },
              { title: "نظام الألوان ونسب استخدامها", subtitle: "(Color System & Usage)" },
              { title: "نظام الخطوط", subtitle: "(Typography System)" },
              { title: "الأنماط البصرية والشبكية", subtitle: "(Visual Patterns & Grids)" },
              { title: "نمط الصور والتصوير", subtitle: "(Photography Style)" },
              { title: "الأيقونات والأسلوب الرسومي", subtitle: "(Iconography Style)" },
              { title: "الاستخدامات الصحيحة والخاطئة", subtitle: "(Correct & Incorrect Usage)" },
            ],
          },
          {
            number: "03",
            badge: "تطبيقات الهوية البصرية",
            title: "VISUAL IDENTITY APPS",
            subtitle: "(STATIONERY + MARKETING + DIGITAL)",
            features: [
              { title: "بطاقة العمل", subtitle: "(Business Card)" },
              { title: "الورق الرسمي", subtitle: "(Letterhead)" },
              { title: "الأظرف", subtitle: "(Envelope)" },
              { title: "ملف تعريفي للشركة 10 صفحات", subtitle: "(Company Profile 10 pages)" },
              { title: "رول أب", subtitle: "(Roll-up Banner)" },
              { title: "اللوحة الخارجية", subtitle: "(External Signage)" },
              { title: "الزي الموحد", subtitle: "(Uniform)" },
              { title: "هوية منصات التواصل", subtitle: "(Social Media Identity)" },
              { title: "8 هايلايت إنستغرام", subtitle: "(Instagram Highlights 8)" },
              { title: "6 منشورات إنستغرام", subtitle: "(Start Instagram posts 6)" },
            ],
          },
        ],
      },
      {
        id: "cafes-restaurants",
        name: "باقة المقاهي والمطاعم",
        subtitle: "Cafe & Restaurants Package",
        cards: [
          {
            number: "01",
            badge: "الشعار LOGO",
            title: "باقة المقاهي والمطاعم",
            subtitle: "Cafe & Restaurants Package",
            audienceNote: "مخصصة للمطاعم والمقاهي مع تطبيقات خاصة بالتغليف وقوائم الطعام.",
            features: [
              { title: "تقديم 3 نماذج للشعار", subtitle: "(Professional Logo Concepts 3)" },
              { title: "تطوير الشعار المعتمد", subtitle: "(Final Logo Refinement)" },
              { title: "عرض النماذج بصريًا", subtitle: "(Professional Presentation)" },
              { title: "تسليم الملفات المفتوحة", subtitle: "(AI - EPS - PDF - PNG - JPG)" },
            ],
          },
          {
            number: "02",
            badge: "الهوية البصرية والدليل الإرشادي",
            title: "VISUAL IDENTITY & BRAND GUIDELINE",
            features: [
              { title: "استراتيجية العلامة التجارية", subtitle: "(Brand Strategy)" },
              { title: "التوجه البصري للعلامة", subtitle: "(Visual Direction)" },
              { title: "هيكلة الشعار", subtitle: "(Logo Structure)" },
              { title: "نسخ الشعار", subtitle: "(Logo Variations)" },
              { title: "نظام الألوان", subtitle: "(Color System & Usage)" },
              { title: "نظام الخطوط", subtitle: "(Typography System)" },
            ],
          },
          {
            number: "03",
            badge: "تطبيقات الهوية البصرية",
            title: "VISUAL IDENTITY APPS",
            subtitle: "(PACKAGING + MARKETING + DIGITAL)",
            features: [
              { title: "كيس ورقي", subtitle: "(Paper Bag)" },
              { title: "كوب ورقي (مقاسين)", subtitle: "(Paper Cup - 2 Sizes)" },
              { title: "علبة", subtitle: "(Box)" },
              { title: "حامل أكواب", subtitle: "(Cup Holder)" },
              { title: "تغليف ورقي", subtitle: "(Paper Packaging)" },
              { title: "كيس بن", subtitle: "(Coffee Bag)" },
              { title: "منيو (صفحتان)", subtitle: "(Menu - 2 Pages)" },
              { title: "6 منشورات إنستغرام", subtitle: "(Start Instagram posts 6)" },
            ],
          },
        ],
      },
    ],
  },
];

export function getPackageDetailById(packageId: string) {
  return PACKAGE_DETAILS.find((entry) => entry.id === packageId);
}

export function getPackagePathById(packageId: string) {
  return getPackageDetailById(packageId)?.path;
}

export function getPackageSaleTierById(packageId: string, tierId: string) {
  const detail = getPackageDetailById(packageId);
  return detail?.saleTiers?.find((tier) => tier.id === tierId);
}
