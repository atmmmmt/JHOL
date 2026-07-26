"use client";

import type { PackagesShowcaseContent, PageHeroContent } from "../../lib/api";
import AboutStartJourneySection from "../components/sections/about-sections/about-start-journey-section";
import Courses from "../components/sections/home-sections/cources";
import PackagesHeroSection from "../components/sections/packages-sections/packages-hero-section";

type PackagesPageProps = {
  hero: PageHeroContent;
  packagesShowcase: PackagesShowcaseContent;
};

function PackagesPage({ hero, packagesShowcase }: PackagesPageProps) {
  return (
    <>
      <PackagesHeroSection content={hero} />
      <Courses
        content={packagesShowcase}
        id="packages-page-content"
        showTrainingAnchor={false}
      />
      <AboutStartJourneySection
        content={hero}
        sectionKey="packages_hero"
        journeyKey="startJourney"
      />
    </>
  );
}

export default PackagesPage;
