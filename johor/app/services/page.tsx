import { getSiteContent } from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";
import ServicesPage from "../../src/page-components/services-page";

export async function generateMetadata() {
  const site = await getSiteContent();
  const primaryProject = site.pages.works.projects.projects[0];

  return buildPageMetadata({
    description: site.pages.services.hero.description,
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
