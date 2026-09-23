import { getSeoDescriptions, getSiteContent } from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";
import TrainingCoursesPage from "../../src/page-components/training-courses-page";

const TRAINING_DESCRIPTION =
  "دورات جهور التدريبية تشمل التسويق الرقمي والإعلانات واستخدام أدوات الذكاء الاصطناعي لتجهيز مواد إعلانية واختبارها وتحسينها.";

export async function generateMetadata() {
  const [site, seoDescs] = await Promise.all([getSiteContent(), getSeoDescriptions()]);

  return buildPageMetadata({
    description: seoDescs["/training-courses"]?.trim() || TRAINING_DESCRIPTION,
    image: {
      alt: site.global.header.logo.alt,
      url: site.global.header.logo.image,
    },
    path: "/training-courses",
    title: "الدورات التدريبية | جهور",
  });
}

export default async function Page() {
  const site = await getSiteContent();

  return (
    <TrainingCoursesPage
      hero={site.pages.trainingCourses.hero}
      overview={site.pages.trainingCourses.overview}
    />
  );
}
