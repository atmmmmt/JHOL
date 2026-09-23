const API_BASE = (process.env.JHOR_API_BASE_URL || 'https://johor-back.euphoria-motiva.com').replace(/\/$/, '')
const AUTH_TOKEN = process.env.JHOR_AUTH_TOKEN?.trim()
const DRY_RUN = process.argv.includes('--dry-run')

if (!AUTH_TOKEN) {
  console.error('Missing JHOR_AUTH_TOKEN. Export an admin bearer token before running this migration.')
  process.exit(1)
}

const CAMPAIGN_TITLE = 'إطلاق وإدارة الحملات الإعلانية'
const TRADEMARK_TITLE = 'تسجيل العلامات التجارية'
const CAMPAIGN_DESCRIPTION = `إدارة الإعلانات هي المحرك الأساسي للوصول إلى العملاء وتحقيق نتائج قابلة للقياس، فهي لا تقتصر على إطلاق الإعلان، بل تبدأ من فهم هدفك وجمهورك وتنتهي بتحليل الأداء وتحسين الحملات باستمرار.

في جهور، ندير حملاتك الإعلانية بشكل متكامل، من التخطيط والاستهداف وإطلاق الحملات، إلى المتابعة والتحسين وتحليل النتائج، بهدف تحقيق أفضل استفادة من ميزانيتك الإعلانية.

تشمل خدمات إدارة الإعلانات:`
const CAMPAIGN_CHIPS = [
  'نخطط للحملة بناءً على هدفك وميزانيتك.',
  'نوصل إعلانك للجمهور الأكثر احتمالاً للشراء.',
  'ندير ميزانيتك ونوزعها حيث تحقق أفضل أداء.',
  'نراقب ونحسن الحملات باستمرار لرفع النتائج.',
  'نقيس النتائج ونوضح لك ما حققته حملتك فعلياً.',
]
const SALES_TICKER = [
  'نجيب لك العملاء',
  'نرفع مبيعاتك',
  'نحسن إعلانك',
  'ونخلي ميزانيتك تشتغل',
]
const CONTACT_SERVICES = [CAMPAIGN_TITLE, TRADEMARK_TITLE]

function normalize(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function isCampaignText(value) {
  const text = normalize(value)
  return text.includes('حمل') && text.includes('إعلان')
}

function isTrademarkText(value) {
  const text = normalize(value)
  return (text.includes('تسجيل') && text.includes('علام')) || text.includes('العلامات التجارية')
}

function uniqueStrings(values) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))]
}

function reviseBrandStory(body) {
  return {
    ...body,
    meaning: [
      'في اللغة، الجهور يعني الصوت العالي الواضح، وهذا ما نسعى لتحقيقه لعملائنا: أن تصل علامتهم إلى الجمهور المناسب برسالة واضحة، واستراتيجية مدروسة، وحملات تحقق نتائج قابلة للقياس.',
    ],
    aboutUs: {
      ...(body.aboutUs || {}),
      title: 'من نحن؟',
      paragraphs: [
        'نحن وكالة سعودية متخصصة في إطلاق وإدارة الحملات الإعلانية الممولة، وبناء استراتيجيات التسويق الرقمي التي تساعد الشركات على النمو والوصول إلى جمهورها الحقيقي.',
        'نعمل على بناء حضور قوي ومؤثر للعلامات التجارية، وتحويل الأهداف إلى حملات فعالة ونتائج قابلة للقياس.',
      ],
    },
  }
}

function reviseFeaturedServices(body) {
  const items = Array.isArray(body.items) ? body.items : []
  const keptItems = items
    .filter((item) => {
      const label = `${item?.title || ''} ${item?.description || ''}`
      return isCampaignText(label) || isTrademarkText(label)
    })
    .map((item, index) => {
      const label = `${item?.title || ''} ${item?.description || ''}`
      if (isCampaignText(label)) {
        return {
          ...item,
          number: String(index + 1).padStart(2, '0'),
          title: CAMPAIGN_TITLE,
          description: CAMPAIGN_DESCRIPTION,
          chips: [...CAMPAIGN_CHIPS],
        }
      }
      return {
        ...item,
        number: String(index + 1).padStart(2, '0'),
        title: TRADEMARK_TITLE,
      }
    })

  return {
    ...body,
    description: 'نركز في جهور على خدمات تسويقية تساعدك على الوصول إلى العميل المناسب، تحسين أداء إعلانك، وتحويل ميزانيتك إلى نتائج قابلة للقياس.',
    items: keptItems,
  }
}

function reviseHomeServicesReveal(body) {
  const lines = Array.isArray(body.serviceLines) ? body.serviceLines : []
  const serviceLines = lines
    .filter((line) => {
      const label = `${line?.id || ''} ${line?.prefix || ''} ${line?.suffix || ''} ${(line?.tickerItems || []).join(' ')}`
      return isCampaignText(label) || isTrademarkText(label)
    })
    .map((line) => {
      const label = `${line?.id || ''} ${line?.prefix || ''} ${line?.suffix || ''}`
      return isCampaignText(label)
        ? {
            ...line,
            prefix: 'إطلاق وإدارة',
            suffix: 'الحملات الإعلانية',
            tickerItems: [...SALES_TICKER],
          }
        : {
            ...line,
            prefix: 'تسجيل العلامات',
            suffix: 'التجارية',
            tickerItems: [...SALES_TICKER],
          }
    })

  return { ...body, serviceLines }
}

function reviseAboutHero(body) {
  const reasons = Array.isArray(body.whyChoose?.reasons)
    ? body.whyChoose.reasons.map((reason, index) => {
        if (String(reason?.title || '').includes('فريق') || index === 1) {
          return {
            ...reason,
            title: 'فريق يجمع الخبرة والدقة',
            description: 'مهووسين ببناء نظام يبيع باستمرار',
          }
        }
        if (String(reason?.title || '').includes('حلول') || index === 2) {
          return {
            ...reason,
            title: 'حلول متكاملة',
            description: 'خدمات تسويقية كاملة، نعرف كيف يبيع الإعلان',
          }
        }
        return reason
      })
    : []

  return {
    ...body,
    introParagraphs: [
      'في جهور نؤمن أن لكل علامة تجارية صوتاً يستحق أن يُسمع. نحن وكالة سعودية متخصصة في إطلاق وإدارة الحملات الإعلانية الممولة، وبناء استراتيجيات التسويق الرقمي التي تساعد الشركات على النمو والوصول إلى جمهورها الحقيقي.',
      'نحن لا ندير حملات إعلانية عادية، بل نعمل على بناء حضور قوي للعلامات التجارية يجعلها واضحة، مؤثرة، وقادرة على المنافسة في السوق. من خلال خبرة تجمع بين الاستراتيجية والتسويق والأداء، نساعد الشركات ورواد الأعمال على تحويل أهدافهم إلى حملات فعالة ونتائج قابلة للقياس.',
    ],
    mission: {
      ...(body.mission || {}),
      title: body.mission?.title || 'رسالتنا',
      description: 'مهمتنا في جهور هي مساعدة الشركات ورواد الأعمال على الوصول إلى جمهورهم، وتحقيق أهدافهم، وتحويل التسويق إلى أداة حقيقية للنمو.',
      startsWith: 'نحن نؤمن أن نجاح أي مشروع يبدأ من:',
      points: [
        'هدف واضح',
        'رسالة تسويقية مؤثرة',
        'استراتيجية وصول فعالة',
        'حملات إعلانية مدروسة',
        'قياس مستمر للأداء والنتائج',
      ],
      closing: 'نعمل على تقديم حلول تسويقية وإعلانية متكاملة تجمع بين الاستراتيجية والتنفيذ وتحليل الأداء، لنساعد أعمالك على الوصول إلى العملاء المناسبين وتحقيق نتائج حقيقية قابلة للقياس.',
    },
    vision: {
      ...(body.vision || {}),
      title: body.vision?.title || 'رؤيتنا',
      description: 'أن تصبح جهور واحدة من أبرز وكالات التسويق الرقمي والإعلانات في المنطقة، وأن تكون الشريك الذي تعتمد عليه الشركات لتحقيق النمو والوصول إلى جمهورها المستهدف.',
      startsWith: 'نسعى إلى أن نكون الخيار الأول لكل شركة تبحث عن:',
      points: [
        'استراتيجية تسويقية واضحة',
        'حملات إعلانية تحقق نتائج',
        'وصول أدق إلى جمهورها المستهدف',
        'نمو مستدام وقابل للقياس',
        'قرارات تسويقية مبنية على البيانات',
      ],
    },
    whyChoose: body.whyChoose
      ? {
          ...body.whyChoose,
          reasons,
          results: uniqueStrings([...(body.whyChoose.results || []), 'نظام مبيعات متكامل']),
        }
      : body.whyChoose,
  }
}

function reviseServicesHero(body) {
  return {
    ...body,
    introParagraphs: [
      'نركز في جهور على التسويق الذي يتحول إلى نتائج حقيقية، من بناء الاستراتيجية إلى إطلاق الحملات وإدارتها وتحسينها باستمرار.',
      'هدفنا أن تصل ميزانيتك إلى الجمهور المناسب، وتتحول حملاتك إلى فرص ومبيعات ونمو قابل للقياس.',
    ],
    whyChooseServices: body.whyChooseServices
      ? {
          ...body.whyChooseServices,
          description: 'نربط التخطيط والاستهداف والتنفيذ والتحسين المستمر حتى تعمل ميزانيتك بذكاء وتصل إلى العميل الأكثر احتمالاً للشراء.',
          points: [
            'استراتيجية مبنية على هدف وميزانية واضحين',
            'استهداف أدق للجمهور المناسب',
            'إدارة أفضل للميزانية الإعلانية',
            'تحسين مستمر وقياس واضح للنتائج',
          ],
        }
      : body.whyChooseServices,
  }
}

function reviseWorksHero(body) {
  return {
    ...body,
    introParagraphs: [
      'في جهور، نؤمن أن أفضل طريقة للتعريف بقدراتنا هي من خلال الحملات الإعلانية التي نفذناها والنتائج التي حققناها لعملائنا.',
      'كل حملة نعمل عليها هي فرصة لفهم الجمهور، وصناعة الرسالة المناسبة، والوصول إلى العملاء المحتملين عبر القنوات الإعلانية الأكثر ملاءمة.',
      'في هذه الصفحة، نستعرض مجموعة من أبرز الحملات الإعلانية التي أدارها فريق جهور، وما حققته من نتائج وأثر على أعمال عملائنا.',
    ],
    ctaSection: {
      ...(body.ctaSection || {}),
      title: 'خلنا نبدأ بحملتك',
      intro: 'لديك منتج، هدف، وميزانية.',
      points: [],
      closing: 'نحولها إلى حملة إعلانية تصل إلى العميل المناسب.',
      cta: 'ابدأ حملتك الآن',
    },
  }
}

function reviseWorksProjects(body) {
  return {
    ...body,
    title: 'حملات تُرى وتُسمع وتبيع',
    description: 'مجموعة مختارة من حملاتنا الإعلانية التي تحولت من مجرد إنفاق إلى نتائج. استراتيجيات مدروسة، استهداف دقيق، وتحسين مستمر للحملات بهدف الوصول إلى الجمهور المناسب وتحقيق المزيد من المبيعات والعملاء والنمو.',
  }
}

function reviseBlogHero(body) {
  return {
    ...body,
    introParagraphs: [
      'في مدونة جهور نشارك خبرتنا في مجالات التسويق الرقمي وإدارة الحملات الإعلانية لمساعدة الشركات ورواد الأعمال على الوصول إلى عملائهم، تنمية أعمالهم، وتحقيق نتائج أفضل في السوق.',
      'نقدم في المدونة مقالات تعليمية وتحليلية تساعدك على فهم أفضل ممارسات التسويق الرقمي والإعلانات، بالإضافة إلى نصائح عملية يمكن تطبيقها لتطوير استراتيجيتك التسويقية وتحسين أداء حملاتك.',
      'سواء كنت صاحب مشروع، مسوقاً رقمياً، أو مهتماً بتنمية أعمالك، ستجد في مدونة جهور محتوى قيماً يساعدك على اتخاذ قرارات تسويقية أفضل وتحقيق أقصى استفادة من ميزانيتك الإعلانية.',
    ],
  }
}

function reviseBlogPreview(body) {
  return {
    ...body,
    description: 'في هذا القسم ستجد أحدث المقالات التي نشرناها في مدونة جهور، والتي تغطي موضوعات مختلفة في التسويق الرقمي وإدارة الحملات الإعلانية. نحرص على تحديث المدونة بشكل مستمر بمقالات جديدة تساعدك على مواكبة أحدث الاتجاهات في عالم التسويق والإعلانات وتحقيق نتائج أفضل لأعمالك.',
  }
}

function reviseTrainingOverview(body) {
  const items = Array.isArray(body.items) ? body.items : []
  return {
    ...body,
    items: items.map((item) => {
      const title = normalize(item?.title)
      const isIdentityCourse = title.includes('أساسيات') && (title.includes('الهوية') || title.includes('هوية'))
      if (!isIdentityCourse) return item
      return {
        ...item,
        title: 'تنفيذ إعلانات على مواقع الذكاء الاصطناعي',
        summary: 'تعلّم كيف تستخدم أدوات ومواقع الذكاء الاصطناعي لتجهيز إعلانات أسرع وأكثر تنوعاً، من الفكرة والنص إلى الصورة والفيديو، ثم تهيئتها للاستخدام في حملاتك الإعلانية.',
        outcomes: [
          'اختيار أدوات الذكاء الاصطناعي المناسبة للإعلانات',
          'كتابة أفكار ونصوص إعلانية بمساعدة الذكاء الاصطناعي',
          'إنشاء صور وفيديوهات إعلانية قابلة للاستخدام',
          'تجهيز أكثر من نسخة للإعلان للاختبار والتحسين',
        ],
      }
    }),
  }
}

function reviseContactForm(body) {
  return { ...body, services: [...CONTACT_SERVICES] }
}

function reviseContactHero(body) {
  return {
    ...body,
    talkAboutProject: body.talkAboutProject
      ? { ...body.talkAboutProject, services: [...CONTACT_SERVICES] }
      : body.talkAboutProject,
  }
}

const revisions = {
  brand_story: reviseBrandStory,
  featured_services: reviseFeaturedServices,
  home_services_reveal: reviseHomeServicesReveal,
  about_hero: reviseAboutHero,
  services_hero: reviseServicesHero,
  works_hero: reviseWorksHero,
  works_projects: reviseWorksProjects,
  blog_hero: reviseBlogHero,
  blog_preview: reviseBlogPreview,
  training_courses_overview: reviseTrainingOverview,
  contact_form: reviseContactForm,
  contact_hero: reviseContactHero,
}

function parseBody(entry) {
  try {
    return typeof entry.jsonContent === 'string' ? JSON.parse(entry.jsonContent) : entry.jsonContent
  } catch {
    return null
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${AUTH_TOKEN}`,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${text}`)
  }
  return text ? JSON.parse(text) : null
}

async function main() {
  const entries = await request('/api/content')
  const candidates = []

  for (const entry of entries) {
    const body = parseBody(entry)
    const sectionKey = body?._meta?.sectionKey
    const revise = revisions[sectionKey]
    if (!revise) continue

    const revisedBody = revise(body)
    if (JSON.stringify(revisedBody) === JSON.stringify(body)) continue
    candidates.push({ entry, sectionKey, revisedBody })
  }

  console.log(`Found ${candidates.length} content sections to update.`)
  for (const candidate of candidates) {
    const { entry, sectionKey, revisedBody } = candidate
    if (DRY_RUN) {
      console.log(`[dry-run] ${sectionKey} (${entry.id})`)
      continue
    }

    await request(`/api/content/${entry.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        contentType: entry.contentType,
        jsonContent: JSON.stringify(revisedBody),
      }),
    })
    console.log(`Updated ${sectionKey} (${entry.id})`)
  }

  console.log(DRY_RUN ? 'Dry run completed; no content was changed.' : 'Client content revision applied successfully.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
