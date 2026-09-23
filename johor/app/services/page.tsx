import { getSeoDescriptions, getSiteContent } from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";
import ServicesPage from "../../src/page-components/services-page";

const SERVICES_DESCRIPTION =
  "خدمات جهور تركز على إطلاق وإدارة الحملات الإعلانية وتسجيل العلامات التجارية، مع استهداف أدق وإدارة للميزانية وتحسين مستمر للنتائج.";

export async function generateMetadata() {
  const [site, seoDescs] = await Promise.all([getSiteContent(), getSeoDescriptions()]);
  const primaryProject = site.pages.works.projects.projects[0];

  return buildPageMetadata({
    description: seoDescs["/services"]?.trim() || SERVICES_DESCRIPTION,
    image: primaryProject
      ? {
          alt: primaryProject.title,
          url: primaryProject.coverImage,
        }
      : {
          alt: site.global.header.logo.alt,
          url: site.global.header.logo.image,
        },
    path: "/services",
    title: "الخدمات | جهور",
  });
}

export default async function Page() {
  const site = await getSiteContent();

  return (
    <ServicesPage
      featuredServices={site.shared.featuredServices}
      hero={site.pages.services.hero}
    />
  );
}
