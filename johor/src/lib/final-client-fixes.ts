import type {
  BlogHeroContent,
  BrandStoryContent,
  ContactHeroContent,
  FeaturedServicesContent,
  WorksGalleryContent,
} from "../../lib/api";

const HOME_WORKS_DESCRIPTION =
  "مجموعة مختارة من حملاتنا الإعلانية التي تحولت من مجرد إنفاق إلى نتائج.\nاستراتيجيات مدروسة، استهداف دقيق، وتحسين مستمر للحملات بهدف الوصول إلى الجمهور المناسب وتحقيق المزيد من المبيعات والعملاء والنمو.";

const BRAND_STORY_PARAGRAPHS = [
  "نحن وكالة تسويق نساعد العلامات التجارية على الوصول إلى عملائها وتحويل حضورها الرقمي إلى نتائج. نطوّر الاستراتيجيات، نبني الحملات، ونصنع المحتوى الذي يخدم أهدافك التجارية.",
  "في جهور، لا نكتفي بصناعة حضور لعلامتك، بل نعمل على تحويل التسويق إلى أداة للنمو. من الاستراتيجية إلى التنفيذ، نبني حلولًا تسويقية مصممة لتصل إلى الجمهور المناسب وتحقق أثرًا يمكن قياسه.",
  "جهور — نعرف نخلي إعلانك يشتغل.",
  "لديك منتج، هدف، وميزانية.",
  "نحوّلها إلى حملة إعلانية تصل إلى العميل المناسب.",
];

function normalized(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function isCampaignServiceTitle(value: unknown) {
  const text = normalized(value);
  return (
    (text.includes("حمل") && (text.includes("إعلان") || text.includes("ترويج"))) ||
    text.toLowerCase().includes("campaign")
  );
}

function isTrademarkServiceTitle(value: unknown) {
  const text = normalized(value);
  return (
    (text.includes("تسجيل") && text.includes("علام")) ||
    text.includes("العلامات التجارية") ||
    text.toLowerCase().includes("trademark")
  );
}

function fixWorksGallery(content: WorksGalleryContent): WorksGalleryContent {
  return {
    ...content,
    title: "حملات تُرى وتُسمع وتبيع",
    description: HOME_WORKS_DESCRIPTION,
  };
}

function fixBrandStory(content: BrandStoryContent): BrandStoryContent {
  return {
    ...content,
    aboutUs: {
      ...content.aboutUs,
      title: "من نحن؟",
      paragraphs: [...BRAND_STORY_PARAGRAPHS],
    },
  };
}

function fixFeaturedServices(
  content: FeaturedServicesContent,
): FeaturedServicesContent {
  const items = (content.items ?? [])
    .filter(
      (item) =>
        isCampaignServiceTitle(item.title) || isTrademarkServiceTitle(item.title),
    )
    .map((item, index) => ({
      ...item,
      number: String(index + 1).padStart(2, "0"),
    }));

  return {
    ...content,
    items,
  };
}

function fixContactHero(content: ContactHeroContent): ContactHeroContent {
  let replaced = false;
  const lines = (content.lines ?? []).map((line) => {
    if (normalized(line).includes("تواصل مع جهور")) {
      replaced = true;
      return "خلّنا نبدأ بحملتك.";
    }
    return line;
  });

  return {
    ...content,
    lines: replaced ? lines : ["خلّنا نبدأ بحملتك.", ...lines],
  };
}

function fixBlogHero(content: BlogHeroContent): BlogHeroContent {
  if (!content.helpCta) return content;

  return {
    ...content,
    helpCta: {
      ...content.helpCta,
      points: ["إطلاق حملات تسويقية ناجحة", "تطوير حضورك الرقمي"],
    },
  };
}

export function applyFinalClientFixes<T>(sectionKey: string, content: T): T {
  switch (sectionKey) {
    case "works_gallery":
      return fixWorksGallery(content as WorksGalleryContent) as T;
    case "brand_story":
      return fixBrandStory(content as BrandStoryContent) as T;
    case "featured_services":
      return fixFeaturedServices(content as FeaturedServicesContent) as T;
    case "contact_hero":
      return fixContactHero(content as ContactHeroContent) as T;
    case "blog_hero":
      return fixBlogHero(content as BlogHeroContent) as T;
    default:
      return content;
  }
}
