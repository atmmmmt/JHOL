import { getSiteContent } from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";
import AboutPage from "../../src/page-components/about-page";

export async function generateMetadata() {
  const site = await getSiteContent();

  return buildPageMetadata({
    description: site.pages.about.hero.description,
    image: {
      alt: site.global.header.logo.alt,
      url: site.global.header.logo.image,
    },
    path: "/about",
    title: "من نحن | جهور",
  });
}

export default async function Page() {
  const site = await getSiteContent();

  return (
    <AboutPage
      brandStory={site.shared.brandStory}
      hero={site.pages.about.hero}
      homeServicesReveal={site.pages.home.servicesReveal}
      partnersLogos={site.shared.partnersLogos}
    />
  );
}
