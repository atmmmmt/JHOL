"use client";

import type {
  FeaturedServicesContent,
  ServicesHeroContent,
} from "../../lib/api";
import AboutStartJourneySection from "../components/sections/about-sections/about-start-journey-section";
import FeaturedServicesSection from "../components/sections/home-sections/view-all-works-section";
import ServicesExtraSections from "../components/sections/servies-sections/services-extra-sections";
import ServicesHeroSection from "../components/sections/servies-sections/hero-service-section";
import { reviseContentSection } from "../lib/client-content-revision";
import { applyFinalClientFixes } from "../lib/final-client-fixes";

type ServicesPageProps = {
  featuredServices: FeaturedServicesContent;
  hero: ServicesHeroContent;
};

function ServicesPage({
  featuredServices,
  hero,
}: ServicesPageProps) {
  const revisedFeaturedServices = applyFinalClientFixes(
    "featured_services",
    reviseContentSection("featured_services", featuredServices),
  );
  const revisedHero = reviseContentSection("services_hero", hero);

  return (
    <>
      <ServicesHeroSection content={revisedHero} />
      <FeaturedServicesSection content={revisedFeaturedServices} />
      <ServicesExtraSections content={revisedHero} />
      <AboutStartJourneySection
        content={revisedHero}
        journey={revisedHero.ctaSection}
        sectionKey="services_hero"
        journeyKey="ctaSection"
      />
    </>
  );
}

export default ServicesPage;
