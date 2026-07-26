"use client";

import type {
  FeaturedServicesContent,
  ServicesHeroContent,
} from "../../lib/api";
import AboutStartJourneySection from "../components/sections/about-sections/about-start-journey-section";
import FeaturedServicesSection from "../components/sections/home-sections/view-all-works-section";
import ServicesExtraSections from "../components/sections/servies-sections/services-extra-sections";
import ServicesHeroSection from "../components/sections/servies-sections/hero-service-section";

type ServicesPageProps = {
  featuredServices: FeaturedServicesContent;
  hero: ServicesHeroContent;
};

function ServicesPage({
  featuredServices,
  hero,
}: ServicesPageProps) {
  return (
    <>
      <ServicesHeroSection content={hero} />
      <FeaturedServicesSection content={featuredServices} />
      <ServicesExtraSections content={hero} />
      <AboutStartJourneySection
        content={hero}
        journey={hero.ctaSection}
        sectionKey="services_hero"
        journeyKey="ctaSection"
      />
    </>
  );
}

export default ServicesPage;
