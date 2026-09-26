"use client";

import type {
  AboutHeroContent,
  BrandStoryContent,
  HomeServicesRevealContent,
  PartnersLogosContent,
} from "../../lib/api";
import AboutCoreSection from "../components/sections/about-sections/about-core-section";
import AboutHeroSection from "../components/sections/about-sections/about-hero-section";
import AboutStartJourneySection from "../components/sections/about-sections/about-start-journey-section";
import SecondAboutSection from "../components/sections/home-sections/abour-section-two";
import BlendStatementSection from "../components/sections/home-sections/blend-statement-section";
import BrandLogosSection from "../components/sections/home-sections/brand-logos-section";
import { reviseContentSection } from "../lib/client-content-revision";
import { applyFinalClientFixes } from "../lib/final-client-fixes";

type AboutPageProps = {
  brandStory: BrandStoryContent;
  hero: AboutHeroContent;
  homeServicesReveal: HomeServicesRevealContent;
  partnersLogos: PartnersLogosContent;
};

function AboutPage({
  brandStory,
  hero,
  homeServicesReveal,
  partnersLogos,
}: AboutPageProps) {
  const revisedBrandStory = applyFinalClientFixes(
    "brand_story",
    reviseContentSection("brand_story", brandStory),
  );
  const revisedHero = reviseContentSection("about_hero", hero);
  const revisedServicesReveal = reviseContentSection(
    "home_services_reveal",
    homeServicesReveal,
  );

  return (
    <>
      <AboutHeroSection content={revisedHero} />
      <BlendStatementSection content={revisedBrandStory} id="about-page-story" />
      <AboutCoreSection content={revisedHero} showWhyChoose={false} />
      <SecondAboutSection content={revisedServicesReveal} />
      <AboutCoreSection content={revisedHero} showMissionVision={false} />
      <BrandLogosSection content={partnersLogos} />
      <AboutStartJourneySection
        content={revisedHero}
        sectionKey="about_hero"
        journeyKey="startJourney"
      />
    </>
  );
}

export default AboutPage;
