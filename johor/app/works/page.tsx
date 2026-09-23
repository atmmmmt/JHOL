import { getSeoDescriptions, getSiteContent } from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";
import WorksPage from "../../src/page-components/works-page";

const WORKS_DESCRIPTION =
  "حملات جهور الإعلانية: استراتيجيات مدروسة، استهداف دقيق، وتحسين مستمر لتحويل الميزانيات الإعلانية إلى مبيعات وعملاء ونمو قابل للقياس.";

export async function generateMetadata() {
  const [site, seoDescs] = await Promise.all([getSiteContent(), getSeoDescriptions()]);
  const primaryProject = site.pages.works.projects.projects[0];

  return buildPageMetadata({
    description: seoDescs["/works"]?.trim() || WORKS_DESCRIPTION,
    image: primaryProject
      ? {
          alt: primaryProject.title,
          url: primaryProject.coverImage,
        }
      : {
          alt: site.global.header.logo.alt,
          url: site.global.header.logo.image,
        },
    path: "/works",
    title: "الحملات والأعمال | جهور",
  });
}

export default async function Page() {
  const site = await getSiteContent();

  return (
    <WorksPage
      hero={site.pages.works.hero}
      pagination={site.pages.workDetails.pagination}
      projectsContent={site.pages.works.projects}
      projects={site.pages.works.projects.projects}
    />
  );
}
