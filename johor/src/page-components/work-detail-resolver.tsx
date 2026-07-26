"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchSiteContentClient,
  type WorkProject,
  type WorksPaginationContent,
} from "../../lib/api";
import WorkDetailPage from "./work-detail-page";
import { DetailLoadingState, DetailNotFoundState } from "./detail-fallback-states";

type WorkDetailResolverProps = {
  buildSlug: string;
  initialWork: WorkProject | null;
  initialPagination: WorksPaginationContent;
  initialPreviousWork?: WorkProject;
  initialNextWork?: WorkProject;
};

type ResolvedState =
  | { status: "loading" }
  | { status: "notfound" }
  | {
      status: "ready";
      work: WorkProject;
      pagination: WorksPaginationContent;
      previousWork?: WorkProject;
      nextWork?: WorkProject;
    };

function getSlugFromLocation(fallbackSlug: string): string {
  if (typeof window === "undefined") {
    return fallbackSlug;
  }

  const segments = window.location.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? fallbackSlug;

  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

/**
 * Resolves a work project on the client so that projects added after the last
 * static build still render (their route is served by the `.htaccess` fallback).
 * When the server already rendered the correct project (a slug that existed at
 * build time) it is used as-is with no extra fetch.
 */
export default function WorkDetailResolver({
  buildSlug,
  initialWork,
  initialPagination,
  initialPreviousWork,
  initialNextWork,
}: WorkDetailResolverProps) {
  const [state, setState] = useState<ResolvedState>(
    initialWork
      ? {
          status: "ready",
          work: initialWork,
          pagination: initialPagination,
          previousWork: initialPreviousWork,
          nextWork: initialNextWork,
        }
      : { status: "loading" },
  );

  useEffect(() => {
    const slug = getSlugFromLocation(buildSlug);

    // Fast path: the server already rendered the correct project.
    if (initialWork && slug === buildSlug) {
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    fetchSiteContentClient()
      .then((site) => {
        if (cancelled) return;

        const projects = site.pages.workDetails.projects.projects;
        const index = projects.findIndex((project) => project.slug === slug);

        if (index === -1) {
          setState({ status: "notfound" });
          return;
        }

        setState({
          status: "ready",
          work: projects[index],
          pagination: site.pages.workDetails.pagination,
          previousWork: index > 0 ? projects[index - 1] : undefined,
          nextWork:
            index < projects.length - 1 ? projects[index + 1] : undefined,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "notfound" });
      });

    return () => {
      cancelled = true;
    };
  }, [buildSlug, initialWork, initialPagination, initialPreviousWork, initialNextWork]);

  if (state.status === "loading") {
    return <DetailLoadingState />;
  }

  if (state.status === "notfound") {
    return (
      <DetailNotFoundState
        title="لم يتم العثور على هذا العمل"
        description="ربما تم نقل هذا العمل أو تغيير رابطه."
        action={<Link href="/works">العودة لملف الأعمال</Link>}
      />
    );
  }

  return (
    <WorkDetailPage
      work={state.work}
      pagination={state.pagination}
      previousWork={state.previousWork}
      nextWork={state.nextWork}
    />
  );
}
