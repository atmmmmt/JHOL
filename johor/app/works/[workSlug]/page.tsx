import {
  DETAIL_FALLBACK_SLUG,
  getAdjacentWorkProjects,
  getSiteContent,
  getWorkProjectBySlug,
} from "../../../lib/api";
import { buildPageMetadata } from "../../../lib/seo";
import WorkDetailResolver from "../../../src/page-components/work-detail-resolver";

type WorkDetailPageProps = {
  params: Promise<{
    workSlug: string;
  }>;
};

function resolveWorkMetadataDescription(
  project: Awaited<ReturnType<typeof getWorkProjectBySlug>>,
) {
  if (!project) {
    return undefined;
  }

  const descriptionCandidates = [
    project.listingDescription,
    project.overview,
    project.supportText,
    ...project.storyBlocks.map((block) => block.description),
  ];

  return descriptionCandidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0,
  )?.trim();
}

function resolveWorkMetadataImage(
  project: Awaited<ReturnType<typeof getWorkProjectBySlug>>,
) {
  if (!project) {
    return undefined;
  }

  const imageCandidates = [
    project.coverImage,
    ...project.storyBlocks.map((block) => block.image),
  ];

  return imageCandidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0,
  )?.trim();
}

export async function generateStaticParams() {
  try {
    const site = await getSiteContent();
    const params = site.pages.works.projects.projects
      .filter(
        (project) =>
          typeof project.slug === "string" && project.slug.trim().length > 0,
      )
      .map((project) => ({
        workSlug: project.slug.trim(),
      }));

    // Always emit a fallback template so routes for projects added after this
    // build can still be served (see johor/public/.htaccess).
    return [...params, { workSlug: DETAIL_FALLBACK_SLUG }];
  } catch {
    return [{ workSlug: DETAIL_FALLBACK_SLUG }];
  }
}

export async function generateMetadata({ params }: WorkDetailPageProps) {
  const { workSlug } = await params;

  if (workSlug === DETAIL_FALLBACK_SLUG) {
    return buildPageMetadata({
      noIndex: true,
      path: `/works/${workSlug}`,
      title: "ملف الأعمال | جهور",
    });
  }

  const project = await getWorkProjectBySlug(workSlug);

  if (!project) {
    return buildPageMetadata({
      path: `/works/${workSlug}`,
      title: "ملف الأعمال | جهور",
    });
  }

  const description = resolveWorkMetadataDescription(project);
  const imageUrl = resolveWorkMetadataImage(project);

  return buildPageMetadata({
    description,
    image: imageUrl
      ? {
          alt: project.title,
          url: imageUrl,
        }
      : undefined,
    path: `/works/${project.slug}`,
    title: `${project.title} | ملف الأعمال | جهور`,
    type: "article",
  });
}

export default async function Page({ params }: WorkDetailPageProps) {
  const { workSlug } = await params;
  const site = await getSiteContent();
  const project =
    workSlug === DETAIL_FALLBACK_SLUG
      ? undefined
      : await getWorkProjectBySlug(workSlug);
  const adjacentProjects = project
    ? await getAdjacentWorkProjects(workSlug)
    : { previousWork: undefined, nextWork: undefined };

  return (
    <WorkDetailResolver
      buildSlug={workSlug}
      initialWork={project ?? null}
      initialPagination={site.pages.workDetails.pagination}
      initialPreviousWork={adjacentProjects.previousWork}
      initialNextWork={adjacentProjects.nextWork}
    />
  );
}
