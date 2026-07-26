import { getSiteContent } from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";
import TrainingCoursesPage from "../../src/page-components/training-courses-page";

export async function generateMetadata() {
  const site = await getSiteContent();

  return buildPageMetadata({
    description: site.pages.trainingCourses.hero.description,
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
