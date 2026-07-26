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
  return (
    <>
      <AboutHeroSection content={hero} />
      <BlendStatementSection content={brandStory} id="about-page-story" />
      <AboutCoreSection content={hero} showWhyChoose={false} />
      <SecondAboutSection content={homeServicesReveal} />
      <AboutCoreSection content={hero} showMissionVision={false} />
      <BrandLogosSection content={partnersLogos} />
      <AboutStartJourneySection
        content={hero}
        sectionKey="about_hero"
        journeyKey="startJourney"
      />
    </>
  );
}

export default AboutPage;
