import type { Metadata } from "next";
import { API_BASE_URL, SITE_NAME } from "../lib/api";
import { buildPageMetadata } from "../lib/seo";
import LegalPage from "../src/page-components/legal-page";

type LegalSectionKey =
  | "campaign_terms_conditions"
  | "identity_terms_conditions"
  | "privacy_policy";

type LegalPagePayload = {
  _meta?: {
    sectionKey?: string;
    tabLabel?: string;
  };
  content?: string;
};

const legalPageConfig: Record<
  LegalSectionKey,
  {
    path: string;
    fallbackTitle: string;
  }
> = {
  campaign_terms_conditions: {
    path: "/campaign-terms",
    fallbackTitle: "شروط وأحكام الحملات",
  },
  identity_terms_conditions: {
    path: "/identity-terms",
    fallbackTitle: "شروط وأحكام الهويات",
  },
  privacy_policy: {
    path: "/privacy-policy",
    fallbackTitle: "سياسة الخصوصية",
  },
};

export async function getLegalPageContent(sectionKey: LegalSectionKey) {
  let items: Array<{ jsonContent: string }> = [];

  try {
    const response = await fetch(`${API_BASE_URL}/api/content`, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      items = (await response.json()) as Array<{ jsonContent: string }>;
    }
  } catch {
    // API unreachable — return fallback so build doesn't fail
    return {
      content: "",
      title: legalPageConfig[sectionKey].fallbackTitle,
    };
  }

  for (const item of items) {
    try {
      const payload = JSON.parse(item.jsonContent) as LegalPagePayload;

      if (payload?._meta?.sectionKey === sectionKey) {
        return {
          content: typeof payload.content === "string" ? payload.content : "",
          title:
            (typeof payload?._meta?.tabLabel === "string" &&
              payload._meta.tabLabel.trim()) ||
            legalPageConfig[sectionKey].fallbackTitle,
        };
      }
    } catch {
      continue;
    }
  }

  return {
    content: "",
    title: legalPageConfig[sectionKey].fallbackTitle,
  };
}

export async function buildLegalPageMetadata(
  sectionKey: LegalSectionKey,
): Promise<Metadata> {
  const page = await getLegalPageContent(sectionKey);

  if (!page) {
    return buildPageMetadata({
      path: legalPageConfig[sectionKey].path,
      title: `${legalPageConfig[sectionKey].fallbackTitle} | ${SITE_NAME}`,
    });
  }

  const plainTextDescription = page.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  return buildPageMetadata({
    description: plainTextDescription,
    path: legalPageConfig[sectionKey].path,
    title: `${page.title} | ${SITE_NAME}`,
  });
}

export async function renderLegalPage(sectionKey: LegalSectionKey) {
  const page = await getLegalPageContent(sectionKey);
  return <LegalPage title={page.title} htmlContent={page.content} />;
}
