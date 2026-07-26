"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSiteContentClient, type BlogPreviewItem } from "../../lib/api";
import BlogDetailPage from "./blog-detail-page";
import { DetailLoadingState, DetailNotFoundState } from "./detail-fallback-states";

type BlogDetailResolverProps = {
  buildSlug: string;
  initialPost: BlogPreviewItem | null;
};

type ResolvedState =
  | { status: "loading" }
  | { status: "notfound" }
  | { status: "ready"; post: BlogPreviewItem };

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
 * Resolves a blog post on the client so that posts added after the last static
 * build still render (their route is served by the `.htaccess` fallback). When
 * the server already rendered the correct post it is used as-is with no fetch.
 */
export default function BlogDetailResolver({
  buildSlug,
  initialPost,
}: BlogDetailResolverProps) {
  const [state, setState] = useState<ResolvedState>(
    initialPost
      ? { status: "ready", post: initialPost }
      : { status: "loading" },
  );

  useEffect(() => {
    const slug = getSlugFromLocation(buildSlug);

    if (initialPost && slug === buildSlug) {
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    fetchSiteContentClient()
      .then((site) => {
        if (cancelled) return;

        const post = site.pages.blog.preview.items.find(
          (item) => item.slug === slug,
        );

        if (!post) {
          setState({ status: "notfound" });
          return;
        }

        setState({ status: "ready", post });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "notfound" });
      });

    return () => {
      cancelled = true;
    };
  }, [buildSlug, initialPost]);

  if (state.status === "loading") {
    return <DetailLoadingState />;
  }

  if (state.status === "notfound") {
    return (
      <DetailNotFoundState
        title="لم يتم العثور على هذه التدوينة"
        description="ربما تم نقل التدوينة أو تغيير رابطها."
        action={<Link href="/blog">العودة للمدونة</Link>}
      />
    );
  }

  return <BlogDetailPage post={state.post} />;
}
