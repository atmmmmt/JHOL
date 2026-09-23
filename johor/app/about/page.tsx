import { getSeoDescriptions, getSiteContent } from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";
import AboutPage from "../../src/page-components/about-page";

const ABOUT_DESCRIPTION =
  "وكالة جهور السعودية متخصصة في التسويق الرقمي وإدارة الحملات الإعلانية الممولة، ونساعد الشركات على الوصول إلى جمهورها وتحقيق نمو ونتائج قابلة للقياس.";

export async function generateMetadata() {
  const [site, seoDescs] = await Promise.all([getSiteContent(), getSeoDescriptions()]);

  return buildPageMetadata({
    description: seoDescs["/about"]?.trim() || ABOUT_DESCRIPTION,
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
