import type { Metadata } from "next";
import { DEFAULT_SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./api";

export const DEFAULT_METADATA_KEYWORDS = [
  "جهور",
  "Johor",
  "وكالة إبداعية",
  "وكالة تسويق",
  "هوية بصرية",
  "تصميم مواقع",
  "حلول رقمية",
  "إنتاج محتوى",
  "Branding Agency",
  "Marketing Agency",
] as const;

export const DEFAULT_SOCIAL_IMAGE = {
  alt: SITE_NAME,
  url: "/OG.png",
} as const;

type MetadataImage = {
  alt?: string;
  url: string;
};

type PageMetadataOptions = {
  description?: string;
  image?: MetadataImage;
  keywords?: string[];
  noIndex?: boolean;
  path: string;
  title: string;
  type?: "article" | "website";
};

function getMetadataBase() {
  try {
    return new URL(SITE_URL);
  } catch {
    return undefined;
  }
}

function getAbsoluteUrl(path: string) {
  const metadataBase = getMetadataBase();

  if (!metadataBase) {
    return undefined;
  }

  return new URL(path, metadataBase).toString();
}

export function getAbsoluteSiteUrl(path: string) {
  return getAbsoluteUrl(path) ?? path;
}

function buildRobots(noIndex = false): Metadata["robots"] {
  return {
    follow: !noIndex,
    googleBot: {
      follow: !noIndex,
      index: !noIndex,
    },
    index: !noIndex,
  };
}

export function buildDefaultMetadata(): Metadata {
  const homeUrl = getAbsoluteUrl("/");
  const defaultImageUrl = getAbsoluteSiteUrl(DEFAULT_SOCIAL_IMAGE.url);

  return {
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    alternates: {
      canonical: homeUrl ?? "/",
    },
    creator: SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    keywords: [...DEFAULT_METADATA_KEYWORDS],
    metadataBase: getMetadataBase(),
    openGraph: {
      description: DEFAULT_SITE_DESCRIPTION,
      images: [
        {
          alt: DEFAULT_SOCIAL_IMAGE.alt,
          url: defaultImageUrl,
        },
      ],
      locale: "ar_SA",
      siteName: SITE_NAME,
      title: "وكالة جهور للتسويق الالكتروني - لنجاحك صوت جهور",
      type: "website",
      url: homeUrl,
    },
    publisher: SITE_NAME,
    referrer: "origin-when-cross-origin",
    robots: buildRobots(),
    title: "وكالة جهور للتسويق الالكتروني | لنجاحك صوت جهور",
    twitter: {
      card: "summary_large_image",
      description: DEFAULT_SITE_DESCRIPTION,
      images: [defaultImageUrl],
      title: "وكالة جهور للتسويق الالكتروني - لنجاحك صوت جهور",
    },
  };
}

export function buildPageMetadata({
  description = DEFAULT_SITE_DESCRIPTION,
  image,
  keywords = [...DEFAULT_METADATA_KEYWORDS],
  noIndex = false,
  path,
  title,
  type = "website",
}: PageMetadataOptions): Metadata {
  const absoluteUrl = getAbsoluteUrl(path);
  const resolvedImage = image ?? DEFAULT_SOCIAL_IMAGE;
  const resolvedImageUrl = getAbsoluteSiteUrl(resolvedImage.url);

  return {
    alternates: {
      canonical: absoluteUrl ?? path,
    },
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    description,
    metadataBase: getMetadataBase(),
    keywords,
    openGraph: {
      description,
      images: [
        {
          alt: resolvedImage.alt ?? title,
          url: resolvedImageUrl,
        },
      ],
      locale: "ar_SA",
      siteName: SITE_NAME,
      title,
      type,
      url: absoluteUrl,
    },
    publisher: SITE_NAME,
    referrer: "origin-when-cross-origin",
    robots: buildRobots(noIndex),
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [resolvedImageUrl],
      title,
    },
  };
}
