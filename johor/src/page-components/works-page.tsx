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
import { reviseContentSection } from "../lib/client-content-revision";
import { useLiveSection } from "../lib/use-live-image";

type WorksPageProps = {
  hero: WorksHeroContent;
  pagination: WorksPaginationContent;
  projectsContent: WorksProjectsContent;
  projects: WorkProject[];
};

function WorksPage({ hero, pagination, projects, projectsContent: initialProjectsContent }: WorksPageProps) {
  const revisedHero = reviseContentSection("works_hero", hero);
  const revisedProjectsContent = reviseContentSection(
    "works_projects",
    initialProjectsContent,
  );
  const projectsContent = useLiveSection("works_projects", revisedProjectsContent);
  const liveProjects = projectsContent.projects?.length ? projectsContent.projects : projects;

  return (
    <>
      <WorksHeroSection content={revisedHero} />
      <WorkServices
        detailsButtonLabel={pagination.detailsButton}
        listingDescription={projectsContent.description}
        listingTitle={projectsContent.title}
        projects={liveProjects}
        workCategories={projectsContent.workCategories}
      />
      <WorksContentSections content={revisedHero} />
      <AboutStartJourneySection
        content={revisedHero}
        journey={revisedHero.ctaSection}
        sectionKey="works_hero"
        journeyKey="ctaSection"
      />
    </>
  );
}

export default WorksPage;
