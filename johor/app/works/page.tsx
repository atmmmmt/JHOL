import { getSiteContent } from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";
import WorksPage from "../../src/page-components/works-page";

export async function generateMetadata() {
  const site = await getSiteContent();
  const primaryProject = site.pages.works.projects.projects[0];

  return buildPageMetadata({
    description: site.pages.works.hero.description,
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
    title: "ملف الأعمال | جهور",
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
