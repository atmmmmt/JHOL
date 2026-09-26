"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSiteContentClient } from "../../lib/api";
import {
  isArchivedPackageDetail,
  isArchivedPackageRoute,
} from "../../lib/package-archive";
import { findPackageDetail, resolvePackageDetails } from "../../lib/packages";
import type { PackageDetail } from "../data/package-details";
import PackageDetailPage from "./package-detail-page";
import { DetailLoadingState, DetailNotFoundState } from "./detail-fallback-states";

type PackageDetailResolverProps = {
  buildPackageId: string;
  initialDetail: PackageDetail | null;
};

type ResolvedState =
  | { status: "loading" }
  | { status: "notfound" }
  | { status: "ready"; detail: PackageDetail };

function getPackageIdFromLocation(fallbackId: string): string {
  if (typeof window === "undefined") {
    return fallbackId;
  }

  const segments = window.location.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? fallbackId;

  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

/**
 * Resolves a package on the client so active packages added after the last
 * static build still render. Archived packages remain preserved in data but
 * are intentionally unavailable on the public website.
 */
export default function PackageDetailResolver({
  buildPackageId,
  initialDetail,
}: PackageDetailResolverProps) {
  const initialReady =
    initialDetail && !isArchivedPackageDetail(initialDetail)
      ? { status: "ready" as const, detail: initialDetail }
      : { status: "loading" as const };
  const [state, setState] = useState<ResolvedState>(initialReady);

  useEffect(() => {
    const packageId = getPackageIdFromLocation(buildPackageId);

    if (isArchivedPackageRoute(packageId)) {
      setState({ status: "notfound" });
      return;
    }

    if (
      initialDetail &&
      !isArchivedPackageDetail(initialDetail) &&
      packageId === buildPackageId
    ) {
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    fetchSiteContentClient()
      .then((site) => {
        if (cancelled) return;

        const details = resolvePackageDetails(site);
        const detail = findPackageDetail(details, packageId);

        if (!detail || isArchivedPackageDetail(detail)) {
          setState({ status: "notfound" });
          return;
        }

        setState({ status: "ready", detail });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "notfound" });
      });

    return () => {
      cancelled = true;
    };
  }, [buildPackageId, initialDetail]);

  if (state.status === "loading") {
    return <DetailLoadingState />;
  }

  if (state.status === "notfound") {
    return (
      <DetailNotFoundState
        title="هذه الباقة مؤرشفة حالياً"
        description="الباقة غير متاحة للعرض حالياً، ويمكن إعادة تفعيلها لاحقاً."
        action={<Link href="/packages">العودة للباقات</Link>}
      />
    );
  }

  return <PackageDetailPage detail={state.detail} />;
}
