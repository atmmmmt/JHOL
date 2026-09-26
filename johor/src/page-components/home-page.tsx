"use client";

import type {
  BrandStoryContent,
  ContactFormContent,
  FeaturedServicesContent,
  HomeFeedbackContent,
  HomeHeroContent,
  HomeStatisticsContent,
  PackagesShowcaseContent,
  PartnersLogosContent,
  TrainingCoursesOverviewContent,
} from "../../lib/api";
import BlendStatementSection from "../components/sections/home-sections/blend-statement-section";
import BrandLogosSection from "../components/sections/home-sections/brand-logos-section";
import Courses from "../components/sections/home-sections/cources";
import FormContact from "../components/sections/contact-sections/form-contact";
import FeedbackSection from "../components/sections/home-sections/feedback-section";
import HeroLandingSection from "../components/sections/home-sections/hero-landing-section";
import ProjectsInfiniteSliderSection from "../components/sections/home-sections/projects-infinite-slider-section";
import SectorsSection from "../components/sections/home-sections/sectors-section";
import StatisticsSection from "../components/sections/home-sections/statistics-section";
import FeaturedServicesSection from "../components/sections/home-sections/view-all-works-section";
import TrainingCoursesOverviewSection from "../components/sections/training-sections/training-courses-overview-section";
import { reviseContentSection } from "../lib/client-content-revision";
import { applyFinalClientFixes } from "../lib/final-client-fixes";

type HomePageProps = {
  brandStory: BrandStoryContent;
  contactForm: ContactFormContent;
  featuredServices: FeaturedServicesContent;
  feedback: HomeFeedbackContent;
  hero: HomeHeroContent;
  packagesShowcase: PackagesShowcaseContent;
  partnersLogos: PartnersLogosContent;
  statistics: HomeStatisticsContent;
  trainingCoursesOverview: TrainingCoursesOverviewContent;
};

function HomePage({
  brandStory,
  contactForm,
  featuredServices,
  feedback,
  hero,
  packagesShowcase,
  partnersLogos,
  statistics,
  trainingCoursesOverview,
}: HomePageProps) {
  const revisedBrandStory = applyFinalClientFixes(
    "brand_story",
    reviseContentSection("brand_story", brandStory),
  );
  const revisedContactForm = reviseContentSection("contact_form", contactForm);
  const revisedFeaturedServices = applyFinalClientFixes(
    "featured_services",
    reviseContentSection("featured_services", featuredServices),
  );
  const revisedTrainingOverview = reviseContentSection(
    "training_courses_overview",
    trainingCoursesOverview,
  );

  return (
    <>
      <HeroLandingSection content={hero} />
      <ProjectsInfiniteSliderSection />
      <div className="flex justify-center py-6">
        <a
          href="/works"
          className="inline-flex min-h-[3.2rem] items-center gap-3 rounded-full bg-(--secondary-shades-08) px-6 py-3 text-[16px] font-bold leading-tight whitespace-nowrap text-white shadow-[0_10px_28px_rgba(238,32,77,0.4)] transition hover:brightness-110 active:scale-95"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </span>
          <span>عرض جميع المشاريع</span>
        </a>
      </div>
      <SectorsSection />
      <BlendStatementSection content={revisedBrandStory} />
      <FeaturedServicesSection content={revisedFeaturedServices} />
      <Courses content={packagesShowcase} />
      <StatisticsSection content={statistics} />
      <TrainingCoursesOverviewSection content={revisedTrainingOverview} />
      <BrandLogosSection content={partnersLogos} />
      <FeedbackSection content={feedback} />
      <FormContact content={revisedContactForm} />
    </>
  );
}

export default HomePage;
