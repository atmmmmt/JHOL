import {
  getSiteContent,
  type PackagesShowcaseContent,
  type PageHeroContent,
} from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";
import { PACKAGE_DETAILS } from "../../src/data/package-details";
import PackagesPage from "../../src/page-components/packages-page";

const FALLBACK_PACKAGES_HERO: PageHeroContent = {
  lines: ["الباقات"],
  description: "اختر الباقة الأنسب لمرحلة مشروعك واهدافك التسويقية.",
  supportText: "نوفر باقات مرنة قابلة للتخصيص حسب احتياجك.",
};

const FALLBACK_PACKAGES_SHOWCASE: PackagesShowcaseContent = {
  label: "PACKAGES",
  title: "باقات خدماتنا",
  description: "حلول عملية مصممة لرفع جودة حضورك وتحقيق نتائج واضحة.",
  items: PACKAGE_DETAILS.map((detail) => ({
    title: detail.title,
    description: detail.description,
    includes: detail.items,
    note: detail.note,
    cta: "عرض تفاصيل الخدمة",
  })),
};

async function getPackagesPageContent() {
  try {
    const site = await getSiteContent();
    return {
      hero: site.pages.packages.hero,
      packagesShowcase: site.shared.packagesShowcase,
    };
  } catch {
    return {
      hero: FALLBACK_PACKAGES_HERO,
      packagesShowcase: FALLBACK_PACKAGES_SHOWCASE,
    };
  }
}

export async function generateMetadata() {
  const content = await getPackagesPageContent();

  return buildPageMetadata({
    description: content.hero.description,
    path: "/packages",
    title: "الباقات | جهور",
  });
}

export default async function Page() {
  const content = await getPackagesPageContent();

  return (
    <PackagesPage
      hero={content.hero}
      packagesShowcase={content.packagesShowcase}
    />
  );
}
