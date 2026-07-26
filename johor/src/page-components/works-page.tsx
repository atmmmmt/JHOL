"use client";

import type {
  WorksHeroContent,
  WorkProject,
  WorksProjectsContent,
  WorksPaginationContent,
} from "../../lib/api";
import AboutStartJourneySection from "../components/sections/about-sections/about-start-journey-section";
import WorkServices from "../components/sections/servies-sections/work-services";
import WorksContentSections from "../components/sections/works-sections/works-content-sections";
import WorksHeroSection from "../components/sections/works-sections/works-hero-section";
import { useLiveSection } from "../lib/use-live-image";

type WorksPageProps = {
  hero: WorksHeroContent;
  pagination: WorksPaginationContent;
  projectsContent: WorksProjectsContent;
  projects: WorkProject[];
};

function WorksPage({ hero, pagination, projects, projectsContent: initialProjectsContent }: WorksPageProps) {
  const projectsContent = useLiveSection("works_projects", initialProjectsContent);
  const liveProjects = projectsContent.projects?.length ? projectsContent.projects : projects;

  return (
    <>
      <WorksHeroSection content={hero} />
      <WorkServices
        detailsButtonLabel={pagination.detailsButton}
        listingDescription={projectsContent.description}
        listingTitle={projectsContent.title}
        projects={liveProjects}
        workCategories={projectsContent.workCategories}
      />
      <WorksContentSections content={hero} />
      <AboutStartJourneySection
        content={hero}
        journey={hero.ctaSection}
        sectionKey="works_hero"
        journeyKey="ctaSection"
      />
    </>
  );
}

export default WorksPage;
