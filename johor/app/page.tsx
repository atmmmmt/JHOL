import { getSiteContent, SITE_NAME } from "../lib/api";
import { buildPageMetadata } from "../lib/seo";
import HomePage from "../src/page-components/home-page";

export async function generateMetadata() {
  const site = await getSiteContent();
  const primaryImage = site.pages.home.hero.slides[0];

  return buildPageMetadata({
    description: site.pages.home.hero.headline.line2,
    image: primaryImage
      ? {
          alt: primaryImage.alt,
          url: primaryImage.image,
        }
      : {
          alt: site.global.header.logo.alt,
          url: site.global.header.logo.image,
        },
    path: "/",
    title: SITE_NAME,
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
