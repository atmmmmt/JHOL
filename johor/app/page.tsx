import { DEFAULT_SITE_DESCRIPTION, getSeoDescriptions, getSiteContent, SITE_NAME } from "../lib/api";
import { buildPageMetadata } from "../lib/seo";
import HomePage from "../src/page-components/home-page";

export async function generateMetadata() {
  const [, seoDescs] = await Promise.all([getSiteContent(), getSeoDescriptions()]);

  return buildPageMetadata({
    description: seoDescs["/"]?.trim() || DEFAULT_SITE_DESCRIPTION,
    image: {
      alt: SITE_NAME,
      url: "/OG.png",
    },
    path: "/",
    title: "وكالة جهور للتسويق الالكتروني | لنجاحك صوت جهور",
  });
}

export default async function Page() {
  const site = await getSiteContent();

  return (
    <HomePage
      brandStory={site.shared.brandStory}
      contactForm={site.pages.contact.form}
      featuredServices={site.shared.featuredServices}
      feedback={site.pages.home.feedback}
      hero={site.pages.home.hero}
      packagesShowcase={site.shared.packagesShowcase}
      partnersLogos={site.shared.partnersLogos}
      statistics={site.pages.home.statistics}
      trainingCoursesOverview={site.pages.trainingCourses.overview}
    />
  );
}
