"use client";

import type {
  WorkProject,
  WorksPaginationContent,
  WorksProjectsContent,
} from "../../lib/api";
import Breadcrumb from "../components/common/breadcrumb";
import WorkDetailHeroSection from "../components/sections/works-sections/work-detail-hero-section";
import WorkDetailPagination from "../components/sections/works-sections/work-detail-pagination";
import WorkDetailStorySection from "../components/sections/works-sections/work-detail-story-section";
import { useLiveSection } from "../lib/use-live-image";

type WorkDetailPageProps = {
  nextWork?: WorkProject;
  pagination: WorksPaginationContent;
  previousWork?: WorkProject;
  work: WorkProject;
};

function WorkDetailPage({
  nextWork,
  pagination,
  previousWork,
  work: initialWork,
}: WorkDetailPageProps) {
  const liveProjectsContent = useLiveSection<WorksProjectsContent>("works_projects", {
    projects: [initialWork],
  });
  const work =
    liveProjectsContent.projects.find((project) => project.slug === initialWork.slug) ??
    initialWork;

  return (
    <div data-cursor-surface="dark" className="bg-(--primary-shades-02) text-white">
      <WorkDetailHeroSection work={work} />
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "الأعمال", href: "/works" },
          { label: work.title },
        ]}
      />
      <WorkDetailStorySection work={work} />
      <WorkDetailPagination
        content={pagination}
        previousWork={previousWork}
        nextWork={nextWork}
      />
    </div>
  );
}

export default WorkDetailPage;
