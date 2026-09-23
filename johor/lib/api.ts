import { cache } from "react";

export const SITE_NAME = "جهور";
export const DEFAULT_SITE_DESCRIPTION =
  "وكالة جهور - نصمّم هويات بصرية احترافية، ننفّذ حملات إعلانية مؤثرة، وننشئ محتوى رقمياً يُحوّل متابعيك إلى عملاء.";

export const API_BASE_URL =
  process.env.CONTENT_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://johor-back.euphoria-motiva.com";

export const SITE_URL =
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://jhoragency.com.sa";

/**
 * Sentinel slug used to guarantee a static HTML template always exists for the
 * `/works/[workSlug]` and `/blog/[slug]` routes, even if there is no content at
 * build time. The `.htaccess` fallback rewrites unknown detail routes to this
 * template, which then resolves the real slug on the client. See
 * `johor/public/.htaccess`.
 */
export const DETAIL_FALLBACK_SLUG = "__fallback__";

export const CONTENT_IDS = {
  global: {
    header_navigation: "d2a82bf3-5d01-4964-add9-e436d5101b3e",
    footer_content: "f7068a95-2e65-48f6-a451-75125dcb46bc",
  },
  shared_sections: {
    brand_story: "a0e32e10-dfcc-4c50-9752-f939b7283188",
    featured_services: "a3ee81be-371e-44eb-9797-c9e643653e82",
    works_gallery: "eb5be03f-a949-4b7e-b271-a1d9d59e79c1",
    packages_showcase: "a0d6ac17-a298-4b6d-9826-4a9ded8fc737",
    partners_logos: "b1103129-b234-4943-bd3e-4dc9869fc5a4",
  },
  pages: {
    home: {
      home_hero: "2a1c7622-24f7-42b0-b4cd-9eeb0c051d63",
      home_statistics: "9d93ef4f-0bf5-4cfb-9f57-26f61d180d4f",
      home_feedback: "45474449-acf7-4b1f-9142-16b7e981e466",
      home_contact_preview: "0d5a265a-bc48-4175-aa9a-4e2244f114f7",
      home_services_reveal: "ebea8664-c0c5-40e8-8aa6-2df6b9f695d9",
    },
    about: {
      about_hero: "c2ed4efd-c658-4637-9d0e-f95331d2d72e",
    },
    services: {
      services_hero: "b55059a9-09ba-4e92-8664-bca94c25a586",
    },
    packages: {
      packages_hero: "b2dbd456-fbf1-42f2-b120-4e3d85b27f6b",
    },
    training_courses: {
      training_courses_hero: "a136f6e6-2ecf-4e8c-978e-293bccd4860c",
      training_courses_overview: "0d0529af-cd66-46dc-a30e-7f76392c66ae",
    },
    works: {
      works_hero: "c788d0e6-988a-4e59-91ac-ea0486540ea5",
      works_projects: "e8c6f1f0-f640-4fb2-a28e-e0660755adc5",
    },
    work_details: {
      works_projects: "e8c6f1f0-f640-4fb2-a28e-e0660755adc5",
      works_pagination: "69d23e36-7f81-4f75-a5a9-49494d7b571d",
    },
    blog: {
      blog_hero: "f0a106bc-2951-406e-8fa9-ebc3e825c734",
      blog_preview: "41e9b705-9781-49e1-88ab-9af629008a75",
    },
    contact: {
      contact_hero: "2924931c-7913-4aa7-a045-76bfeea034ec",
      contact_form: "f5c21e5f-587c-4f91-9858-e462ea5f0219",
    },
  },
  system: {
    loading_statuses: "2bab3b91-c1bd-41eb-9ed9-d06c491ef87c",
  },
} as const;

type ContentEntry = {
  id: string;
  contentType: number;
  contentTypeName: string;
  jsonContent: string | Record<string, unknown>;
  createdAt: string;
  updatedAt: string | null;
};

export type ImageAsset = {
  alt: string;
  image: string;
};

export type NavigationItem = {
  label: string;
  to: string;
  archived?: boolean;
};

export type HeaderContent = {
  logo: ImageAsset;
  navigation: NavigationItem[];
  mobileMenu?: {
    sectionLabel?: string;
  };
};

export type FooterLink = {
  text: string;
  href: string;
};

export type FooterSocialLink = {
  label: string;
  href: string;
};

export type FooterContent = {
  logo: ImageAsset;
  partnerLogos?: PartnerLogo[];
  quickLinksTitle: string;
  quickLinks: FooterLink[];
  contact: {
    phone: string;
    email: string;
  };
  socials: FooterSocialLink[];
};

export type BrandStoryContent = {
  headline: string;
  lead: string;
  meaning: string[];
  image?: string;
  aboutUs: {
    title: string;
    paragraphs: string[];
  };
};

export type FeaturedServiceItem = {
  number: string;
  title: string;
  description: string;
  chips: string[];
  image?: string;
};

export type FeaturedServicesContent = {
  label: string;
  title: string;
  description: string;
  items: FeaturedServiceItem[];
};

export type GalleryItem = {
  brand: string;
  subtitle: string;
  alt: string;
  image: string;
};

export type WorksGalleryContent = {
  label: string;
  title: string;
  description: string;
  items: GalleryItem[];
};

export type PackageItem = {
  title: string;
  description: string;
  includes: string[];
  note?: string;
  cta: string;
};

export type PackagesShowcaseContent = {
  label: string;
  title: string;
  description: string;
  items: PackageItem[];
  packageDetails?: unknown;
};

export type PartnerLogo = {
  name: string;
  alt: string;
  image: string;
};

export type PartnersLogosContent = {
  label: string;
  title: string;
  description: string;
  logos: PartnerLogo[];
};

export type HomeHeroSlide = {
  brand: string;
  subtitle: string;
  alt: string;
  image: string;
  sourceProjectSlug?: string;
};

export type HomeHeroContent = {
  headline: {
    line1: string;
    highlight: string;
    line2: string;
  };
  mobileHeadline?: {
    line1?: string;
    highlight?: string;
    line2?: string;
  };
  align?: "right" | "center" | "left";
  fontSize?: {
    desktopVw?: number;
    mobilePx?: number;
  };
  cta?: {
    enabled?: boolean;
    label?: string;
    href?: string;
  };
  background?: string;
  mobileBackground?: string;
  slides: HomeHeroSlide[];
};

export type StatisticItem = {
  value: number;
  prefix?: string;
  label: string;
  description: string;
};

export type HomeStatisticsContent = {
  label: string;
  title: string;
  description: string;
  items: StatisticItem[];
};

export type FeedbackItem = {
  name: string;
  role: string;
  company: string;
  quote: string;
};

export type HomeFeedbackContent = {
  label: string;
  title: string;
  description: string;
  items: FeedbackItem[];
};

export type FormField = {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "tel" | "textarea";
};

export type HomeContactPreviewContent = {
  label: string;
  title: string;
  description: string;
  fields: FormField[];
  submitButton: string;
};

export type HomeServicesRevealLine = {
  id: string;
  prefix: string;
  suffix: string;
  tickerItems: string[];
  image: string;
  alt: string;
  enterDelay?: number;
};

export type HomeServicesRevealContent = {
  headline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  serviceLines: HomeServicesRevealLine[];
};

export type PageHeroContent = {
  lines: string[];
  description: string;
  supportText: string;
  ogDescription?: string;
  background?: string;
  mobileBackground?: string;
};

export type ServicesHeroContent = PageHeroContent & {
  background?: string;
  introParagraphs?: string[];
  whyChooseServices?: {
    title: string;
    description: string;
    points: string[];
    closing?: string;
  };
  ctaSection?: {
    title: string;
    intro: string;
    points: string[];
    closing?: string;
    cta?: string;
  };
};

export type WorksProcessStep = {
  order: number;
  title: string;
  description: string;
};

export type WorksListBlock = {
  title: string;
  intro: string;
  points: string[];
  closing?: string;
};

export type WorksSuccessStoryBlock = {
  title: string;
  paragraphs: string[];
};

export type WorksCtaSectionBlock = {
  title: string;
  intro: string;
  points: string[];
  closing: string;
  cta: string;
};

export type WorksHeroContent = PageHeroContent & {
  background?: string;
  introParagraphs?: string[];
  howWeWork?: {
    title: string;
    intro: string;
    steps: WorksProcessStep[];
  };
  realResults?: WorksListBlock;
  projectDomains?: WorksListBlock;
  successStory?: WorksSuccessStoryBlock;
  ctaSection?: WorksCtaSectionBlock;
};

export type BlogTopicItem = {
  title: string;
  description: string;
};

export type BlogWhatYouWillFindBlock = {
  title: string;
  intro: string;
  topics: BlogTopicItem[];
};

export type BlogPointsBlock = {
  title: string;
  intro: string;
  pointsTitle?: string;
  points: string[];
  closing?: string;
};

export type BlogHelpCtaBlock = {
  title: string;
  intro: string;
  points: string[];
  closing?: string;
  cta?: string;
};

export type BlogHeroContent = PageHeroContent & {
  background?: string;
  introParagraphs?: string[];
  whatYouWillFind?: BlogWhatYouWillFindBlock;
  whyWeCreatedBlog?: BlogPointsBlock;
  practicalContent?: BlogPointsBlock;
  helpCta?: BlogHelpCtaBlock;
};

export type ContactListBlock = {
  title: string;
  intro: string;
  closing?: string;
};

export type ContactTalkAboutProjectBlock = ContactListBlock & {
  services: string[];
};

export type ContactWhyContactUsBlock = ContactListBlock & {
  benefits: string[];
};

export type ContactStartTodayBlock = ContactListBlock & {
  points: string[];
  cta?: string;
};

export type ContactHeroContent = PageHeroContent & {
  background?: string;
  talkAboutProject?: ContactTalkAboutProjectBlock;
  whyContactUs?: ContactWhyContactUsBlock;
  startToday?: ContactStartTodayBlock;
};

type AboutSimpleListBlock = {
  title?: string;
  description?: string;
  startsWith?: string;
  points?: string[];
  closing?: string;
};

type AboutWhyChooseReason = {
  title: string;
  description: string;
};

type AboutWhyChooseBlock = {
  title?: string;
  intro?: string;
  reasons?: AboutWhyChooseReason[];
  resultsTitle?: string;
  results?: string[];
};

type AboutStartJourneyBlock = {
  title?: string;
  intro?: string;
  points?: string[];
  closing?: string;
  cta?: string;
};

export type AboutHeroContent = PageHeroContent & {
  background?: string;
  introParagraphs?: string[];
  mission?: AboutSimpleListBlock;
  vision?: AboutSimpleListBlock;
  whyChoose?: AboutWhyChooseBlock;
  startJourney?: AboutStartJourneyBlock;
};

export type TrainingCourseItem = {
  title: string;
  duration: string;
  level: string;
  summary: string;
  outcomes: string[];
};

export type TrainingCoursesOverviewContent = {
  label: string;
  title: string;
  description: string;
  items: TrainingCourseItem[];
  cta: string;
};

/**
 * How much of the row a media block takes. Blocks flow in a wrapping row, so
 * two consecutive "half" blocks sit side by side and three "third" blocks form
 * a triptych — the Behance-style case-study layout — without the dashboard
 * having to model rows explicitly.
 */
export type WorkStoryBlockWidth = "full" | "half" | "third";

export const WORK_STORY_BLOCK_WIDTHS: WorkStoryBlockWidth[] = [
  "full",
  "half",
  "third",
];

export type WorkStoryBlock = {
  id: string;
  title: string;
  description: string;
  image: string;
  video?: string;
  width?: WorkStoryBlockWidth;
};

export type WorkProject = {
  id: string;
  slug: string;
  number: string;
  title: string;
  category: string;
  client: string;
  listingDescription: string;
  overview: string;
  supportText: string;
  ogDescription?: string;
  coverImage: string;
  /** Gap between gallery media, in px. Falls back to DEFAULT_GALLERY_GAP. */
  galleryGap?: number;
  storyBlocks: WorkStoryBlock[];
};

export const DEFAULT_GALLERY_GAP = 16;

export type WorksProjectsContent = {
  label?: string;
  title?: string;
  description?: string;
  focusAreas?: string[];
  workCategories?: string[];
  projects: WorkProject[];
};

export type WorksPaginationContent = {
  previousLabel: string;
  nextLabel: string;
  emptyPreviousLabel: string;
  emptyNextLabel: string;
  detailsButton: string;
};

export type BlogPreviewItem = {
  category: string;
  categoryIds?: string[];
  coverImage: string;
  content: string;
  excerpt: string;
  ogDescription?: string;
  link?: string;
  meta: string;
  publishDate?: string;
  slug: string;
  source: string;
  tags?: string[];
  title: string;
};

export type BlogPreviewCategory = {
  id: string;
  name: string;
};

export type BlogPreviewComment = {
  id: string;
  userName: string;
  date: string;
  comment: string;
};

export type BlogPreviewContent = {
  label: string;
  title: string;
  description: string;
  items: BlogPreviewItem[];
  categories?: BlogPreviewCategory[];
  comments?: BlogPreviewComment[];
};

export type ContactFormContent = {
  title?: string;
  description?: string;
  interestTitle: string;
  services: string[];
  fields: FormField[];
  submitButton: string;
};

export type LoadingStatusesContent = {
  brandCode: string;
  statuses: {
    initialPreparing: string;
    initialReady: string;
    initialEntering: string;
    routePreparing: string;
    routeEntering: string;
    persistentPreparing: string;
  };
};

export type SiteContent = {
  global: {
    header: HeaderContent;
    footer: FooterContent;
  };
  shared: {
    brandStory: BrandStoryContent;
    featuredServices: FeaturedServicesContent;
    worksGallery: WorksGalleryContent;
    packagesShowcase: PackagesShowcaseContent;
    partnersLogos: PartnersLogosContent;
  };
  pages: {
    home: {
      hero: HomeHeroContent;
      statistics: HomeStatisticsContent;
      feedback: HomeFeedbackContent;
      contactPreview: HomeContactPreviewContent;
      servicesReveal: HomeServicesRevealContent;
    };
    about: {
      hero: AboutHeroContent;
    };
    services: {
      hero: ServicesHeroContent;
    };
    packages: {
      hero: PageHeroContent;
    };
    trainingCourses: {
      hero: PageHeroContent;
      overview: TrainingCoursesOverviewContent;
    };
    works: {
      hero: WorksHeroContent;
      projects: WorksProjectsContent;
    };
    workDetails: {
      projects: WorksProjectsContent;
      pagination: WorksPaginationContent;
    };
    blog: {
      hero: BlogHeroContent;
      preview: BlogPreviewContent;
    };
    contact: {
      hero: ContactHeroContent;
      form: ContactFormContent;
    };
  };
  system: {
    loadingStatuses: LoadingStatusesContent;
  };
};

function getAbsoluteUrl(value: string) {
  try {
    return new URL(value, API_BASE_URL);
  } catch {
    return null;
  }
}

const LEGACY_IMAGE_HOSTS: Record<string, string> = {
  "gohor.octoserv-comp.com": "johor-back.euphoria-motiva.com",
};

function normalizeImageUrl(image: string | undefined | null) {
  if (!image || image === "undefined" || image === "null") return "";
  const url = getAbsoluteUrl(image);

  if (!url) {
    return image;
  }

  if (url.hostname in LEGACY_IMAGE_HOSTS) {
    url.hostname = LEGACY_IMAGE_HOSTS[url.hostname]!;
    url.protocol = "https:";
    return url.toString();
  }

  const apiUrl = getAbsoluteUrl(API_BASE_URL);

  if (apiUrl && url.hostname === apiUrl.hostname && apiUrl.protocol === "https:") {
    url.protocol = "https:";
  }

  return url.toString();
}

function normalizeImageAsset(asset: ImageAsset): ImageAsset {
  return {
    ...asset,
    image: normalizeImageUrl(asset.image),
  };
}

function normalizeGalleryItem<T extends { image: string }>(item: T): T {
  return {
    ...item,
    image: normalizeImageUrl(item.image),
  };
}

function normalizeStoryBlockWidth(value: unknown): WorkStoryBlockWidth {
  const candidate = typeof value === "string" ? value.trim().toLowerCase() : "";
  return (WORK_STORY_BLOCK_WIDTHS as string[]).includes(candidate)
    ? (candidate as WorkStoryBlockWidth)
    : "full";
}

function normalizeGalleryGap(value: unknown): number {
  // The dashboard stores this as free text, so it can arrive as "24", 24, or junk.
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_GALLERY_GAP;
  }
  return Math.min(parsed, 120);
}

function normalizeWorkProject(project: WorkProject, index: number): WorkProject {
  return {
    ...project,
    id: project.id || `${project.slug}-${index + 1}`,
    coverImage: normalizeImageUrl(project.coverImage),
    galleryGap: normalizeGalleryGap(project.galleryGap),
    storyBlocks: project.storyBlocks.map((block, blockIndex) => ({
      ...block,
      id: block.id || `${project.slug}-story-${blockIndex + 1}`,
      image: normalizeImageUrl(block.image),
      video: typeof (block as { video?: unknown }).video === 'string' ? (block as { video?: string }).video : undefined,
      width: normalizeStoryBlockWidth((block as { width?: unknown }).width),
    })),
  };
}

function mapWorkProjectToGalleryItem(project: WorkProject): GalleryItem {
  return {
    alt: project.title,
    brand: project.client || project.title,
    image: project.coverImage,
    subtitle: project.category || project.title,
  };
}

function normalizeProjectSlug(value: string) {
  return value.trim().toLowerCase();
}

function resolveHeroLinkedProjects(
  slides: HomeHeroSlide[],
  projects: WorkProject[],
): WorkProject[] {
  const projectsBySlug = new Map(
    projects.map((project) => [normalizeProjectSlug(project.slug), project]),
  );
  const usedProjectSlugs = new Set<string>();
  const linkedProjects: WorkProject[] = [];

  for (const slide of slides) {
    const sourceSlug =
      typeof slide.sourceProjectSlug === "string"
        ? normalizeProjectSlug(slide.sourceProjectSlug)
        : "";

    if (!sourceSlug || usedProjectSlugs.has(sourceSlug)) {
      continue;
    }

    const matchedProject = projectsBySlug.get(sourceSlug);

    if (!matchedProject) {
      continue;
    }

    usedProjectSlugs.add(sourceSlug);
    linkedProjects.push(matchedProject);
  }

  return linkedProjects;
}

function resolveHomeHeroSlides(
  slides: HomeHeroSlide[],
  projects: WorkProject[],
): HomeHeroSlide[] {
  const linkedProjects = resolveHeroLinkedProjects(slides, projects);

  return linkedProjects.map((matchedProject) => {
    return {
      brand: matchedProject.client || matchedProject.title,
      subtitle: matchedProject.category || matchedProject.title,
      alt: matchedProject.title,
      image: matchedProject.coverImage,
      sourceProjectSlug: matchedProject.slug,
    };
  });
}

function normalizeEnglishSlugSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^opination-/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeBlogPreviewItem(
  item: BlogPreviewItem,
  index: number,
): BlogPreviewItem {
  const rawCategory = (item as { category?: unknown }).category;
  const resolvedCategory =
    typeof rawCategory === "string"
      ? rawCategory
      : Array.isArray(rawCategory)
        ? rawCategory
            .map((entry) =>
              typeof entry === "string"
                ? entry
                : typeof entry === "object" &&
                    entry !== null &&
                    "name" in entry &&
                    typeof (entry as { name?: unknown }).name === "string"
                  ? String((entry as { name: string }).name)
                  : "",
            )
            .filter(Boolean)
            .join(", ")
        : typeof rawCategory === "object" &&
            rawCategory !== null &&
            "name" in rawCategory &&
            typeof (rawCategory as { name?: unknown }).name === "string"
          ? String((rawCategory as { name: string }).name)
          : "";
  const slugSegment =
    normalizeEnglishSlugSegment(item.slug || "") ||
    normalizeEnglishSlugSegment(item.title || "");

  return {
    ...item,
    category: resolvedCategory,
    categoryIds: Array.isArray(item.categoryIds) ? item.categoryIds : [],
    content: item.content || "",
    coverImage: item.coverImage ? normalizeImageUrl(item.coverImage) : "",
    excerpt: item.excerpt || "",
    link: item.link || "",
    meta: item.meta || item.publishDate || "",
    publishDate: item.publishDate || "",
    slug: slugSegment || `post-${index + 1}`,
    source: item.source || "",
    tags: (() => {
      const raw = (item as { tags?: unknown }).tags;
      if (Array.isArray(raw)) return raw.filter((t): t is string => typeof t === "string" && t.trim() !== "").map((t) => t.trim());
      if (typeof raw === "string" && raw.trim()) return raw.split(",").map((t) => t.trim()).filter(Boolean);
      return [];
    })(),
    title: item.title || "",
  };
}

function parseJsonContent<T>(entriesById: Map<string, ContentEntry>, id: string): T {
  const entry = entriesById.get(id);

  if (!entry) {
    throw new Error(`Missing content entry for id "${id}".`);
  }

  try {
    if (typeof entry.jsonContent !== "string") {
      return entry.jsonContent as unknown as T;
    }
    return JSON.parse(entry.jsonContent) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse content entry "${id}": ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

const fetchContentEntries = cache(async (): Promise<ContentEntry[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(new URL("/api/content", API_BASE_URL), {
      cache: "force-cache",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) return [];
    return (await response.json()) as ContentEntry[];
  } catch {
    return [];
  }
});

async function fetchContentEntriesFresh(): Promise<ContentEntry[]> {
  const response = await fetch(new URL("/api/content", API_BASE_URL), {
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Content API request failed with status ${response.status}.`);
  }

  return (await response.json()) as ContentEntry[];
}

export function buildSiteContent(entries: ContentEntry[]): SiteContent {
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));

  const header = parseJsonContent<HeaderContent>(
    entriesById,
    CONTENT_IDS.global.header_navigation,
  );
  const footer = parseJsonContent<FooterContent>(
    entriesById,
    CONTENT_IDS.global.footer_content,
  );
  const brandStory = parseJsonContent<BrandStoryContent>(
    entriesById,
    CONTENT_IDS.shared_sections.brand_story,
  );
  const featuredServices = parseJsonContent<FeaturedServicesContent>(
    entriesById,
    CONTENT_IDS.shared_sections.featured_services,
  );
  const worksGallery = parseJsonContent<WorksGalleryContent>(
    entriesById,
    CONTENT_IDS.shared_sections.works_gallery,
  );
  const packagesShowcase = parseJsonContent<PackagesShowcaseContent>(
    entriesById,
    CONTENT_IDS.shared_sections.packages_showcase,
  );
  const partnersLogos = parseJsonContent<PartnersLogosContent>(
    entriesById,
    CONTENT_IDS.shared_sections.partners_logos,
  );
  const homeHero = parseJsonContent<HomeHeroContent>(
    entriesById,
    CONTENT_IDS.pages.home.home_hero,
  );
  const homeStatistics = parseJsonContent<HomeStatisticsContent>(
    entriesById,
    CONTENT_IDS.pages.home.home_statistics,
  );
  const homeFeedback = parseJsonContent<HomeFeedbackContent>(
    entriesById,
    CONTENT_IDS.pages.home.home_feedback,
  );
  const homeContactPreview = parseJsonContent<HomeContactPreviewContent>(
    entriesById,
    CONTENT_IDS.pages.home.home_contact_preview,
  );
  const homeServicesReveal = parseJsonContent<HomeServicesRevealContent>(
    entriesById,
    CONTENT_IDS.pages.home.home_services_reveal,
  );
  const aboutHero = parseJsonContent<AboutHeroContent>(
    entriesById,
    CONTENT_IDS.pages.about.about_hero,
  );
  const servicesHero = parseJsonContent<ServicesHeroContent>(
    entriesById,
    CONTENT_IDS.pages.services.services_hero,
  );
  const packagesHero = parseJsonContent<PageHeroContent>(
    entriesById,
    CONTENT_IDS.pages.packages.packages_hero,
  );
  const trainingHero = parseJsonContent<PageHeroContent>(
    entriesById,
    CONTENT_IDS.pages.training_courses.training_courses_hero,
  );
  const trainingOverview = parseJsonContent<TrainingCoursesOverviewContent>(
    entriesById,
    CONTENT_IDS.pages.training_courses.training_courses_overview,
  );
  const worksHero = parseJsonContent<WorksHeroContent>(
    entriesById,
    CONTENT_IDS.pages.works.works_hero,
  );
  const worksProjects = parseJsonContent<WorksProjectsContent>(
    entriesById,
    CONTENT_IDS.pages.works.works_projects,
  );
  const worksPagination = parseJsonContent<WorksPaginationContent>(
    entriesById,
    CONTENT_IDS.pages.work_details.works_pagination,
  );
  const blogHero = parseJsonContent<BlogHeroContent>(
    entriesById,
    CONTENT_IDS.pages.blog.blog_hero,
  );
  const blogPreview = parseJsonContent<BlogPreviewContent>(
    entriesById,
    CONTENT_IDS.pages.blog.blog_preview,
  );
  const contactHero = parseJsonContent<ContactHeroContent>(
    entriesById,
    CONTENT_IDS.pages.contact.contact_hero,
  );
  const contactForm = parseJsonContent<ContactFormContent>(
    entriesById,
    CONTENT_IDS.pages.contact.contact_form,
  );
  const loadingStatuses = parseJsonContent<LoadingStatusesContent>(
    entriesById,
    CONTENT_IDS.system.loading_statuses,
  );
  // Newest project (last one added in the dashboard) should appear first on the site.
  const normalizedWorksProjects = worksProjects.projects
    .map(normalizeWorkProject)
    .reverse();
  const heroLinkedProjects = resolveHeroLinkedProjects(
    homeHero.slides,
    normalizedWorksProjects,
  );
  const normalizedWorksGalleryItems = Array.isArray(worksGallery.items)
    ? worksGallery.items.map(normalizeGalleryItem)
    : [];
  const worksGalleryItems =
    normalizedWorksGalleryItems.length > 0
      ? normalizedWorksGalleryItems
      : heroLinkedProjects.map(mapWorkProjectToGalleryItem);
  const homeHeroSlides = resolveHomeHeroSlides(
    homeHero.slides,
    normalizedWorksProjects,
  );

  return {
    global: {
      header: {
        ...header,
        logo: normalizeImageAsset(header.logo),
      },
      footer: {
        ...footer,
        logo: normalizeImageAsset(footer.logo),
        partnerLogos: Array.isArray(footer.partnerLogos)
          ? footer.partnerLogos.map(normalizeGalleryItem)
          : [],
      },
    },
    shared: {
      brandStory,
      featuredServices: {
        ...featuredServices,
        items: featuredServices.items.map((item) => ({
          ...item,
          image: item.image ? normalizeImageUrl(item.image) : "",
        })),
      },
      worksGallery: {
        ...worksGallery,
        items: worksGalleryItems,
      },
      packagesShowcase,
      partnersLogos: {
        ...partnersLogos,
        logos: partnersLogos.logos.map(normalizeGalleryItem),
      },
    },
    pages: {
      home: {
        hero: {
          ...homeHero,
          background: homeHero.background
            ? normalizeImageUrl(homeHero.background)
            : "",
          mobileBackground: homeHero.mobileBackground
            ? normalizeImageUrl(homeHero.mobileBackground)
            : "",
          slides: homeHeroSlides,
        },
        statistics: homeStatistics,
        feedback: homeFeedback,
        contactPreview: homeContactPreview,
        servicesReveal: {
          ...homeServicesReveal,
          serviceLines: homeServicesReveal.serviceLines.map((line) => ({
            ...line,
            image: normalizeImageUrl(line.image),
          })),
        },
      },
      about: {
        hero: {
          ...aboutHero,
          background: aboutHero.background
            ? normalizeImageUrl(aboutHero.background)
            : "",
          mobileBackground: aboutHero.mobileBackground
            ? normalizeImageUrl(aboutHero.mobileBackground)
            : "",
        },
      },
      services: {
        hero: {
          ...servicesHero,
          background: servicesHero.background
            ? normalizeImageUrl(servicesHero.background)
            : "",
          mobileBackground: servicesHero.mobileBackground
            ? normalizeImageUrl(servicesHero.mobileBackground)
            : "",
        },
      },
      packages: {
        hero: {
          ...packagesHero,
          background: packagesHero.background
            ? normalizeImageUrl(packagesHero.background)
            : "",
          mobileBackground: packagesHero.mobileBackground
            ? normalizeImageUrl(packagesHero.mobileBackground)
            : "",
        },
      },
      trainingCourses: {
        hero: {
          ...trainingHero,
          background: trainingHero.background
            ? normalizeImageUrl(trainingHero.background)
            : "",
          mobileBackground: trainingHero.mobileBackground
            ? normalizeImageUrl(trainingHero.mobileBackground)
            : "",
        },
        overview: trainingOverview,
      },
      works: {
        hero: {
          ...worksHero,
          background: worksHero.background
            ? normalizeImageUrl(worksHero.background)
            : "",
          mobileBackground: worksHero.mobileBackground
            ? normalizeImageUrl(worksHero.mobileBackground)
            : "",
        },
        projects: {
          ...worksProjects,
          projects: normalizedWorksProjects,
        },
      },
      workDetails: {
        projects: {
          projects: normalizedWorksProjects,
        },
        pagination: worksPagination,
      },
      blog: {
        hero: {
          ...blogHero,
          background: blogHero.background
            ? normalizeImageUrl(blogHero.background)
            : "",
          mobileBackground: blogHero.mobileBackground
            ? normalizeImageUrl(blogHero.mobileBackground)
            : "",
        },
        preview: {
          ...blogPreview,
          items: blogPreview.items.map(normalizeBlogPreviewItem),
          categories: Array.isArray(blogPreview.categories)
            ? blogPreview.categories.map((category) => ({
                id: category.id,
                name: category.name,
              }))
            : [],
          comments: Array.isArray(blogPreview.comments)
            ? blogPreview.comments.map((comment, index) => ({
                id: comment.id || `comment-${index + 1}`,
                userName: comment.userName || "",
                date: comment.date || "",
                comment: comment.comment || "",
              }))
            : [],
        },
      },
      contact: {
        hero: {
          ...contactHero,
          background: contactHero.background
            ? normalizeImageUrl(contactHero.background)
            : "",
          mobileBackground: contactHero.mobileBackground
            ? normalizeImageUrl(contactHero.mobileBackground)
            : "",
        },
        form: contactForm,
      },
    },
    system: {
      loadingStatuses,
    },
  };
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const entries = await fetchContentEntries();
  return buildSiteContent(entries);
});

export async function getSiteContentFresh(): Promise<SiteContent> {
  const entries = await fetchContentEntriesFresh();
  return buildSiteContent(entries);
}

export type SeoDescriptions = Record<string, string>;

export const getSeoDescriptions = cache(async (): Promise<SeoDescriptions> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(
      new URL("/api/content/type/9996", API_BASE_URL),
      {
        cache: "force-cache",
        headers: { accept: "application/json" },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (!response.ok) return {};
    const data = (await response.json()) as ContentEntry | ContentEntry[];
    const entry = Array.isArray(data) ? data[0] : data;
    if (!entry) return {};
    const raw =
      typeof entry.jsonContent === "string"
        ? (JSON.parse(entry.jsonContent) as unknown)
        : entry.jsonContent;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return raw as SeoDescriptions;
  } catch {
    return {};
  }
});

/**
 * Client-safe fetch of the full site content. Unlike {@link getSiteContent} this
 * does not rely on React's server `cache`, so it can run in the browser to
 * resolve content (e.g. works/blog detail pages) that was added after the last
 * static build.
 */
export async function fetchSiteContentClient(): Promise<SiteContent> {
  const response = await fetch(new URL("/api/content", API_BASE_URL), {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Content API request failed with status ${response.status}.`);
  }

  const entries = (await response.json()) as ContentEntry[];
  return buildSiteContent(entries);
}

export const getChromeContent = cache(async () => {
  const siteContent = await getSiteContent();

  return {
    header: siteContent.global.header,
    footer: siteContent.global.footer,
    loadingStatuses: siteContent.system.loadingStatuses,
  };
});

export const getBlogPostBySlug = cache(async (slug: string) => {
  const siteContent = await getSiteContent();

  return siteContent.pages.blog.preview.items.find((item) => item.slug === slug);
});

export const getWorkProjectBySlug = cache(async (slug: string) => {
  const siteContent = await getSiteContent();

  return siteContent.pages.workDetails.projects.projects.find(
    (project) => project.slug === slug,
  );
});

export type PixelsSettingsContent = {
  googleAnalyticsId?: string;
  googleAdsId?: string;
  metaPixelId?: string;
  snapchatPixelId?: string;
  twitterPixelId?: string;
};

export const getPixelsSettings = cache(async (): Promise<PixelsSettingsContent> => {
  try {
    const entries = await fetchContentEntries();
    const pixelsEntry = entries.find((entry) => {
      try {
        const body = (typeof entry.jsonContent === "string" ? JSON.parse(entry.jsonContent) : entry.jsonContent) as Record<string, unknown>;
        const meta = body._meta as Record<string, unknown> | undefined;
        return meta?.sectionKey === "pixels_settings";
      } catch {
        return false;
      }
    });

    if (!pixelsEntry) {
      return {};
    }

    return (typeof pixelsEntry.jsonContent === "string" ? JSON.parse(pixelsEntry.jsonContent) : pixelsEntry.jsonContent) as PixelsSettingsContent;
  } catch {
    return {};
  }
});

export async function getAdjacentWorkProjects(slug: string) {
  const siteContent = await getSiteContent();
  const projects = siteContent.pages.workDetails.projects.projects;
  const currentIndex = projects.findIndex((project) => project.slug === slug);

  if (currentIndex === -1) {
    return {
      previousWork: undefined,
      nextWork: undefined,
    };
  }

  return {
    previousWork: currentIndex > 0 ? projects[currentIndex - 1] : undefined,
    nextWork:
      currentIndex < projects.length - 1 ? projects[currentIndex + 1] : undefined,
  };
}
