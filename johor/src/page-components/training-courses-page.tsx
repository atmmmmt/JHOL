"use client";

import type {
  PageHeroContent,
  TrainingCoursesOverviewContent,
} from "../../lib/api";
import AboutStartJourneySection from "../components/sections/about-sections/about-start-journey-section";
import TrainingCoursesHeroSection from "../components/sections/training-sections/training-courses-hero-section";
import TrainingCoursesOverviewSection from "../components/sections/training-sections/training-courses-overview-section";

type TrainingCoursesPageProps = {
  hero: PageHeroContent;
  overview: TrainingCoursesOverviewContent;
};

function TrainingCoursesPage({
  hero,
  overview,
}: TrainingCoursesPageProps) {
  return (
    <>
      <TrainingCoursesHeroSection content={hero} />
      <TrainingCoursesOverviewSection content={overview} />
      <AboutStartJourneySection
        content={hero}
        sectionKey="training_courses_hero"
        journeyKey="startJourney"
      />
    </>
  );
}

export default TrainingCoursesPage;
