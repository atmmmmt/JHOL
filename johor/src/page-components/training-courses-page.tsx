"use client";

import type {
  PageHeroContent,
  TrainingCoursesOverviewContent,
} from "../../lib/api";
import AboutStartJourneySection from "../components/sections/about-sections/about-start-journey-section";
import TrainingCoursesHeroSection from "../components/sections/training-sections/training-courses-hero-section";
import TrainingCoursesOverviewSection from "../components/sections/training-sections/training-courses-overview-section";
import { reviseContentSection } from "../lib/client-content-revision";

type TrainingCoursesPageProps = {
  hero: PageHeroContent;
  overview: TrainingCoursesOverviewContent;
};

function TrainingCoursesPage({
  hero,
  overview,
}: TrainingCoursesPageProps) {
  const revisedOverview = reviseContentSection(
    "training_courses_overview",
    overview,
  );

  return (
    <>
      <TrainingCoursesHeroSection content={hero} />
      <TrainingCoursesOverviewSection content={revisedOverview} />
      <AboutStartJourneySection
        content={hero}
        sectionKey="training_courses_hero"
        journeyKey="startJourney"
      />
    </>
  );
}

export default TrainingCoursesPage;
