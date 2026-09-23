import type {
  AboutHeroContent,
  BlogHeroContent,
  BlogPreviewContent,
  BrandStoryContent,
  ContactFormContent,
  ContactHeroContent,
  FeaturedServicesContent,
  HomeServicesRevealContent,
  ServicesHeroContent,
  TrainingCoursesOverviewContent,
  WorksHeroContent,
  WorksProjectsContent,
} from "../../lib/api";

const CAMPAIGN_TITLE = "إطلاق وإدارة الحملات الإعلانية";
const TRADEMARK_TITLE = "تسجيل العلامات التجارية";
const CONTACT_SERVICES = [CAMPAIGN_TITLE, TRADEMARK_TITLE];

const CAMPAIGN_DESCRIPTION =
  "إدارة الإعلانات هي المحرك الأساسي للوصول إلى العملاء وتحقيق نتائج قابلة للقياس، فهي لا تقتصر على إطلاق الإعلان، بل تبدأ من فهم هدفك وجمهورك وتنتهي بتحليل الأداء وتحسين الحملات باستمرار.\n\nفي جهور، ندير حملاتك الإعلانية بشكل متكامل، من التخطيط والاستهداف وإطلاق الحملات، إلى المتابعة والتحسين وتحليل النتائج، بهدف تحقيق أفضل استفادة من ميزانيتك الإعلانية.\n\nتشمل خدمات إدارة الإعلانات:";

const CAMPAIGN_CHIPS = [
  "نخطط للحملة بناءً على هدفك وميزانيتك.",
  "نوصل إعلانك للجمهور الأكثر احتمالاً للشراء.",
  "ندير ميزانيتك ونوزعها حيث تحقق أفضل أداء.",
  "نراقب ونحسن الحملات باستمرار لرفع النتائج.",
  "نقيس النتائج ونوضح لك ما حققته حملتك فعلياً.",
];

const SALES_TICKER = [
  "نجيب لك العملاء",
  "نرفع مبيعاتك",
  "نحسن إعلانك",
  "ونخلي ميزانيتك تشتغل",
];

const ABOUT_INTRO = [
  "في جهور نؤمن أن لكل علامة تجارية صوتاً يستحق أن يُسمع. نحن وكالة سعودية متخصصة في إطلاق وإدارة الحملات الإعلانية الممولة، وبناء استراتيجيات التسويق الرقمي التي تساعد الشركات على النمو والوصول إلى جمهورها الحقيقي.",
  "نحن لا ندير حملات إعلانية عادية، بل نعمل على بناء حضور قوي للعلامات التجارية يجعلها واضحة، مؤثرة، وقادرة على المنافسة في السوق. من خلال خبرة تجمع بين الاستراتيجية والتسويق والأداء، نساعد الشركات ورواد الأعمال على تحويل أهدافهم إلى حملات فعالة ونتائج قابلة للقياس.",
];

function normalized(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function isCampaignText(value: unknown) {
  const text = normalized(value);
  return (
    (text.includes("حمل") && (text.includes("إعلان") || text.includes("تسويق"))) ||
    text.toLowerCase().includes("campaign")
  );
}

function isTrademarkText(value: unknown) {
  const text = normalized(value);
  return (
    (text.includes("تسجيل") && text.includes("علام")) ||
    text.includes("العلامات التجارية") ||
    text.toLowerCase().includes("trademark")
  );
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function reviseBrandStory(content: BrandStoryContent): BrandStoryContent {
  return {
    ...content,
    meaning: [
      "في اللغة، الجهور يعني الصوت العالي الواضح، وهذا ما نسعى لتحقيقه لعملائنا: أن تصل علامتهم إلى الجمهور المناسب برسالة واضحة، واستراتيجية مدروسة، وحملات تحقق نتائج قابلة للقياس.",
    ],
    aboutUs: {
      ...content.aboutUs,
      title: "من نحن؟",
      paragraphs: [
        "نحن وكالة سعودية متخصصة في إطلاق وإدارة الحملات الإعلانية الممولة، وبناء استراتيجيات التسويق الرقمي التي تساعد الشركات على النمو والوصول إلى جمهورها الحقيقي.",
        "نعمل على بناء حضور قوي ومؤثر للعلامات التجارية، وتحويل الأهداف إلى حملات فعالة ونتائج قابلة للقياس.",
      ],
    },
  };
}

function reviseFeaturedServices(
  content: FeaturedServicesContent,
): FeaturedServicesContent {
  const resolvedItems = content.items
    .filter((item) => {
      const label = `${item.title} ${item.description}`;
      return isCampaignText(label) || isTrademarkText(label);
    })
    .map((item, index) => {
      const label = `${item.title} ${item.description}`;

      if (isCampaignText(label)) {
        return {
          ...item,
          number: String(index + 1).padStart(2, "0"),
          title: CAMPAIGN_TITLE,
          description: CAMPAIGN_DESCRIPTION,
          chips: [...CAMPAIGN_CHIPS],
        };
      }

      return {
        ...item,
        number: String(index + 1).padStart(2, "0"),
        title: TRADEMARK_TITLE,
      };
    });

  return {
    ...content,
    description:
      "نركز في جهور على خدمات تسويقية تساعدك على الوصول إلى العميل المناسب، تحسين أداء إعلانك، وتحويل ميزانيتك إلى نتائج قابلة للقياس.",
    items: resolvedItems,
  };
}

function reviseHomeServicesReveal(
  content: HomeServicesRevealContent,
): HomeServicesRevealContent {
  const serviceLines = content.serviceLines
    .filter((line) => {
      const label = `${line.id} ${line.prefix} ${line.suffix} ${(line.tickerItems ?? []).join(" ")}`;
      return isCampaignText(label) || isTrademarkText(label);
    })
    .map((line) => {
      const label = `${line.id} ${line.prefix} ${line.suffix}`;

      if (isCampaignText(label)) {
        return {
          ...line,
          prefix: "إطلاق وإدارة",
          suffix: "الحملات الإعلانية",
          tickerItems: [...SALES_TICKER],
        };
      }

      return {
        ...line,
        prefix: "تسجيل العلامات",
        suffix: "التجارية",
        tickerItems: [...SALES_TICKER],
      };
    });

  return {
    ...content,
    headline: "نخلي تسويقك يشتغل على هدف واضح ونتائج قابلة للقياس",
    description:
      "من الاستراتيجية إلى إدارة الحملات وتحسينها، نركز على الوصول للعميل المناسب وتحويل الإنفاق الإعلاني إلى فرص نمو.",
    ctaLabel: "ابدأ حملتك مع جهور",
    ctaHref: "/contact",
    serviceLines,
  };
}

function reviseAboutHero(content: AboutHeroContent): AboutHeroContent {
  const reasons = (content.whyChoose?.reasons ?? []).map((reason, index) => {
    if (reason.title.includes("فريق") || index === 1) {
      return {
        ...reason,
        title: "فريق يجمع الخبرة والدقة",
        description: "مهووسين ببناء نظام يبيع باستمرار",
      };
    }

    if (reason.title.includes("حلول") || index === 2) {
      return {
        ...reason,
        title: "حلول متكاملة",
        description: "خدمات تسويقية كاملة، نعرف كيف يبيع الإعلان",
      };
    }

    return reason;
  });

  return {
    ...content,
    lines: ["من نحن – وكالة جهور", "للتسويق الرقمي", "وإدارة الحملات الإعلانية"],
    description: ABOUT_INTRO[0],
    supportText: ABOUT_INTRO[1],
    introParagraphs: [],
    mission: {
      ...content.mission,
      title: content.mission?.title || "رسالتنا",
      description:
        "مهمتنا في جهور هي مساعدة الشركات ورواد الأعمال على الوصول إلى جمهورهم، وتحقيق أهدافهم، وتحويل التسويق إلى أداة حقيقية للنمو.",
      startsWith: "نحن نؤمن أن نجاح أي مشروع يبدأ من:",
      points: [
        "هدف واضح",
        "رسالة تسويقية مؤثرة",
        "استراتيجية وصول فعالة",
        "حملات إعلانية مدروسة",
        "قياس مستمر للأداء والنتائج",
      ],
      closing:
        "نعمل على تقديم حلول تسويقية وإعلانية متكاملة تجمع بين الاستراتيجية والتنفيذ وتحليل الأداء، لنساعد أعمالك على الوصول إلى العملاء المناسبين وتحقيق نتائج حقيقية قابلة للقياس.",
    },
    vision: {
      ...content.vision,
      title: content.vision?.title || "رؤيتنا",
      description:
        "أن تصبح جهور واحدة من أبرز وكالات التسويق الرقمي والإعلانات في المنطقة، وأن تكون الشريك الذي تعتمد عليه الشركات لتحقيق النمو والوصول إلى جمهورها المستهدف.",
      startsWith: "نسعى إلى أن نكون الخيار الأول لكل شركة تبحث عن:",
      points: [
        "استراتيجية تسويقية واضحة",
        "حملات إعلانية تحقق نتائج",
        "وصول أدق إلى جمهورها المستهدف",
        "نمو مستدام وقابل للقياس",
        "قرارات تسويقية مبنية على البيانات",
      ],
    },
    whyChoose: content.whyChoose
      ? {
          ...content.whyChoose,
          reasons,
          results: uniqueStrings([
            ...(content.whyChoose.results ?? []),
            "نظام مبيعات متكامل",
          ]),
        }
      : content.whyChoose,
    startJourney: content.startJourney
      ? {
          ...content.startJourney,
          title: "جاهز تخلي إعلانك يشتغل؟",
          intro: "ابدأ معنا بخطة واضحة، استهداف أدق، وحملة مبنية على نتائج.",
          points: [
            "نفهم هدفك وميزانيتك",
            "نحدد الجمهور الأنسب",
            "نطلق الحملة ونحسنها باستمرار",
          ],
          closing: "خلنا نحول ميزانيتك الإعلانية إلى فرصة نمو حقيقية.",
          cta: "ابدأ حملتك الآن",
        }
      : content.startJourney,
  };
}

function reviseServicesHero(content: ServicesHeroContent): ServicesHeroContent {
  return {
    ...content,
    lines: ["خدمات جهور", "تسويق رقمي", "وحملات تحقق نتائج"],
    description:
      "نساعدك على الوصول إلى العميل المناسب من خلال حملات إعلانية مدروسة وإدارة مستمرة للأداء والميزانية.",
    supportText:
      "من التخطيط والاستهداف إلى الإطلاق والتحسين وتحليل النتائج، نعمل على تحويل التسويق إلى أداة نمو قابلة للقياس.",
    introParagraphs: [],
    whyChooseServices: content.whyChooseServices
      ? {
          ...content.whyChooseServices,
          description:
            "اختيارك لجهور يعني أنك تعمل مع فريق يربط التخطيط والاستهداف والتنفيذ والتحسين المستمر حتى تعمل ميزانيتك بذكاء.",
          points: [
            "استراتيجية مبنية على هدف وميزانية واضحين",
            "استهداف أدق للجمهور المناسب",
            "إدارة أفضل للميزانية الإعلانية",
            "تحسين مستمر وقياس واضح للنتائج",
          ],
          closing:
            "كل خطوة نعمل عليها هدفها رفع كفاءة الحملة وتحويل الإنفاق الإعلاني إلى نتائج أوضح.",
        }
      : content.whyChooseServices,
    ctaSection: {
      ...(content.ctaSection ?? {
        title: "",
        intro: "",
        points: [],
        closing: "",
        cta: "",
      }),
      title: "خلنا نبدأ بحملتك",
      intro: "إذا كنت تبحث عن شريك يساعدك على:",
      points: [
        "الوصول إلى الجمهور المناسب",
        "رفع كفاءة ميزانيتك الإعلانية",
        "تحسين الحملات وقياس نتائجها",
      ],
      closing: "فريق جهور جاهز يحول هدفك وميزانيتك إلى حملة تعمل بذكاء.",
      cta: "ابدأ حملتك الآن",
    },
  };
}

function reviseWorksHero(content: WorksHeroContent): WorksHeroContent {
  return {
    ...content,
    introParagraphs: [
      "في جهور، نؤمن أن أفضل طريقة للتعريف بقدراتنا هي من خلال الحملات الإعلانية التي نفذناها والنتائج التي حققناها لعملائنا.",
      "كل حملة نعمل عليها هي فرصة لفهم الجمهور، وصناعة الرسالة المناسبة، والوصول إلى العملاء المحتملين عبر القنوات الإعلانية الأكثر ملاءمة.",
      "في هذه الصفحة، نستعرض مجموعة من أبرز الحملات الإعلانية التي أدارها فريق جهور، وما حققته من نتائج وأثر على أعمال عملائنا.",
    ],
    ctaSection: {
      ...(content.ctaSection ?? {
        title: "",
        intro: "",
        points: [],
        closing: "",
        cta: "",
      }),
      title: "خلنا نبدأ بحملتك",
      intro: "لديك منتج، هدف، وميزانية.",
      points: [],
      closing: "نحولها إلى حملة إعلانية تصل إلى العميل المناسب.",
      cta: "ابدأ حملتك الآن",
    },
  };
}

function reviseWorksProjects(
  content: WorksProjectsContent,
): WorksProjectsContent {
  return {
    ...content,
    label: "حملاتنا",
    title: "حملات تُرى وتُسمع وتبيع",
    description:
      "مجموعة مختارة من حملاتنا الإعلانية التي تحولت من مجرد إنفاق إلى نتائج. استراتيجيات مدروسة، استهداف دقيق، وتحسين مستمر للحملات بهدف الوصول إلى الجمهور المناسب وتحقيق المزيد من المبيعات والعملاء والنمو.",
  };
}

function reviseBlogHero(content: BlogHeroContent): BlogHeroContent {
  return {
    ...content,
    lines: ["مدونة جهور", "مقالات في التسويق الرقمي", "وإدارة الحملات الإعلانية"],
    description:
      "في مدونة جهور نشارك خبرتنا في مجالات التسويق الرقمي وإدارة الحملات الإعلانية لمساعدة الشركات ورواد الأعمال على الوصول إلى عملائهم، تنمية أعمالهم، وتحقيق نتائج أفضل في السوق.",
    supportText:
      "نقدم في المدونة مقالات تعليمية وتحليلية تساعدك على فهم أفضل ممارسات التسويق الرقمي والإعلانات، بالإضافة إلى نصائح عملية يمكن تطبيقها لتطوير استراتيجيتك التسويقية وتحسين أداء حملاتك.",
    introParagraphs: [
      "سواء كنت صاحب مشروع، مسوقاً رقمياً، أو مهتماً بتنمية أعمالك، ستجد في مدونة جهور محتوى قيماً يساعدك على اتخاذ قرارات تسويقية أفضل وتحقيق أقصى استفادة من ميزانيتك الإعلانية.",
    ],
    whatYouWillFind: {
      title: "ماذا ستجد في مدونة جهور؟",
      intro:
        "محتوى عملي يساعدك على فهم التسويق الرقمي، إدارة الحملات، وتحسين الأداء للوصول إلى نتائج أفضل.",
      topics: [
        {
          title: "إدارة الحملات الإعلانية",
          description:
            "مقالات عن التخطيط والاستهداف وإدارة الميزانيات وقراءة نتائج الحملات الإعلانية.",
        },
        {
          title: "تحسين الأداء الإعلاني",
          description:
            "أساليب عملية لتحسين الإعلانات، اختبار الرسائل، وخفض الهدر في الميزانية.",
        },
        {
          title: "استراتيجيات التسويق الرقمي",
          description:
            "أفكار واستراتيجيات تساعد الشركات ورواد الأعمال على الوصول إلى الجمهور المناسب وتنمية المبيعات.",
        },
      ],
    },
    whyWeCreatedBlog: content.whyWeCreatedBlog
      ? {
          ...content.whyWeCreatedBlog,
          intro: "نؤمن في جهور أن المعرفة والبيانات أساس القرارات التسويقية الأفضل.",
          pointsTitle: "لهذا نشارك خبرتنا في مجالات:",
          points: [
            "التسويق الرقمي",
            "إدارة الحملات الإعلانية",
            "الاستهداف وتحليل الجمهور",
            "تحسين الأداء وقياس النتائج",
          ],
          closing:
            "هدفنا مساعدة أصحاب المشاريع والمسوقين على اتخاذ قرارات أذكى وتحقيق استفادة أكبر من ميزانياتهم الإعلانية.",
        }
      : content.whyWeCreatedBlog,
    practicalContent: content.practicalContent
      ? {
          ...content.practicalContent,
          intro:
            "المقالات التي ننشرها مبنية على خبرة عملية في التسويق وإدارة الحملات وقراءة الأداء، وليست مجرد معلومات نظرية.",
          points: [
            "تجارب واقعية من حملات ومشاريع حقيقية",
            "أفضل الممارسات في إدارة الإعلانات",
            "نصائح عملية لتحسين التسويق الرقمي",
            "أدوات واستراتيجيات يستخدمها المختصون",
          ],
        }
      : content.practicalContent,
    helpCta: {
      ...(content.helpCta ?? {
        title: "",
        intro: "",
        points: [],
        closing: "",
        cta: "",
      }),
      title: "هل لديك مشروع وتحتاج إلى حملة أقوى؟",
      intro: "إذا كنت تبحث عن فريق يساعدك على:",
      points: [
        "الوصول إلى العميل المناسب",
        "إدارة حملاتك وميزانيتك بكفاءة",
        "تحسين النتائج بشكل مستمر",
      ],
      closing: "فريق جهور جاهز للعمل معك.",
      cta: "تواصل معنا الآن وابدأ نخلي إعلانك يشتغل",
    },
  };
}

function reviseBlogPreview(content: BlogPreviewContent): BlogPreviewContent {
  return {
    ...content,
    description:
      "في هذا القسم ستجد أحدث المقالات التي نشرناها في مدونة جهور، والتي تغطي موضوعات مختلفة في التسويق الرقمي وإدارة الحملات الإعلانية. نحرص على تحديث المدونة بشكل مستمر بمقالات جديدة تساعدك على مواكبة أحدث الاتجاهات في عالم التسويق والإعلانات وتحقيق نتائج أفضل لأعمالك.",
  };
}

function reviseTrainingOverview(
  content: TrainingCoursesOverviewContent,
): TrainingCoursesOverviewContent {
  return {
    ...content,
    items: content.items.map((item) => {
      const title = normalized(item.title);
      const isIdentityCourse =
        title.includes("أساسيات") &&
        (title.includes("الهوية") || title.includes("هوية"));

      if (!isIdentityCourse) return item;

      return {
        ...item,
        title: "تنفيذ إعلانات على مواقع الذكاء الاصطناعي",
        summary:
          "تعلّم كيف تستخدم أدوات ومواقع الذكاء الاصطناعي لتجهيز إعلانات أسرع وأكثر تنوعاً، من الفكرة والنص إلى الصورة والفيديو، ثم تهيئتها للاستخدام في حملاتك الإعلانية.",
        outcomes: [
          "اختيار أدوات الذكاء الاصطناعي المناسبة للإعلانات",
          "كتابة أفكار ونصوص إعلانية بمساعدة الذكاء الاصطناعي",
          "إنشاء صور وفيديوهات إعلانية قابلة للاستخدام",
          "تجهيز أكثر من نسخة للإعلان للاختبار والتحسين",
        ],
      };
    }),
  };
}

function reviseContactForm(content: ContactFormContent): ContactFormContent {
  return {
    ...content,
    description:
      "شاركنا هدفك وميزانيتك، وفريق جهور يتواصل معك لمناقشة أفضل طريقة لإطلاق حملتك أو تسجيل علامتك التجارية.",
    services: [...CONTACT_SERVICES],
  };
}

function reviseContactHero(content: ContactHeroContent): ContactHeroContent {
  return {
    ...content,
    description:
      "إذا كان هدفك الوصول إلى عملاء أكثر وتحقيق نتائج أفضل من ميزانيتك الإعلانية، خلنا نتكلم عن حملتك.",
    supportText:
      "شاركنا هدفك وميزانيتك، وسنساعدك بخطة واضحة للوصول إلى الجمهور المناسب وقياس النتائج.",
    talkAboutProject: {
      ...(content.talkAboutProject ?? { title: "", intro: "", services: [] }),
      title: "دعنا نتحدث عن هدفك التسويقي",
      intro:
        "سواء كنت تستعد لإطلاق حملة جديدة أو تريد تحسين حملاتك الحالية، يمكن لفريق جهور مساعدتك في:",
      services: [...CONTACT_SERVICES],
      closing:
        "أرسل طلبك وسيتواصل معك فريقنا لمناقشة الهدف والجمهور والميزانية والخطوة الأنسب للبدء.",
    },
    whyContactUs: content.whyContactUs
      ? {
          ...content.whyContactUs,
          intro:
            "نحرص في جهور على تقديم تجربة عمل واضحة ومبنية على هدف وبيانات ونتائج قابلة للقياس.",
          benefits: [
            "استشارة مبدئية حول هدفك التسويقي",
            "فهم جمهورك والفرص المتاحة",
            "اقتراح استراتيجية إعلانية مناسبة",
            "خطة واضحة لإطلاق الحملة وقياسها",
          ],
          closing:
            "هدفنا أن تعمل ميزانيتك الإعلانية بذكاء وتصل إلى الجمهور الأكثر احتمالاً للتحول إلى عميل.",
        }
      : content.whyContactUs,
    startToday: {
      ...(content.startToday ?? { title: "", intro: "", points: [] }),
      title: "ابدأ حملتك اليوم",
      intro: "إذا كنت تبحث عن فريق يساعدك على:",
      points: [
        "الوصول إلى الجمهور المناسب",
        "إطلاق حملات تسويقية مدروسة",
        "تحسين الأداء ورفع كفاءة الميزانية",
      ],
      closing: "فريق جهور جاهز للعمل معك وتحويل هدفك إلى حملة قابلة للقياس.",
      cta: "تواصل معنا الآن وابدأ نخلي إعلانك يشتغل",
    },
  };
}

export function reviseContentSection<T>(sectionKey: string, content: T): T {
  switch (sectionKey) {
    case "brand_story":
      return reviseBrandStory(content as BrandStoryContent) as T;
    case "featured_services":
      return reviseFeaturedServices(content as FeaturedServicesContent) as T;
    case "home_services_reveal":
      return reviseHomeServicesReveal(content as HomeServicesRevealContent) as T;
    case "about_hero":
      return reviseAboutHero(content as AboutHeroContent) as T;
    case "services_hero":
      return reviseServicesHero(content as ServicesHeroContent) as T;
    case "works_hero":
      return reviseWorksHero(content as WorksHeroContent) as T;
    case "works_projects":
      return reviseWorksProjects(content as WorksProjectsContent) as T;
    case "blog_hero":
      return reviseBlogHero(content as BlogHeroContent) as T;
    case "blog_preview":
      return reviseBlogPreview(content as BlogPreviewContent) as T;
    case "training_courses_overview":
      return reviseTrainingOverview(content as TrainingCoursesOverviewContent) as T;
    case "contact_form":
      return reviseContactForm(content as ContactFormContent) as T;
    case "contact_hero":
      return reviseContactHero(content as ContactHeroContent) as T;
    default:
      return content;
  }
}

export const CLIENT_REVISION_SECTIONS = [
  "brand_story",
  "featured_services",
  "home_services_reveal",
  "about_hero",
  "services_hero",
  "works_hero",
  "works_projects",
  "blog_hero",
  "blog_preview",
  "training_courses_overview",
  "contact_form",
  "contact_hero",
] as const;
