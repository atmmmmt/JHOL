"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSiteContentClient } from "../../lib/api";
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
 * Resolves a package on the client so packages added after the last static
 * build still render (their route is served by the `.htaccess` fallback).
 */
export default function PackageDetailResolver({
  buildPackageId,
  initialDetail,
}: PackageDetailResolverProps) {
  const [state, setState] = useState<ResolvedState>(
    initialDetail ? { status: "ready", detail: initialDetail } : { status: "loading" },
  );

  useEffect(() => {
    const packageId = getPackageIdFromLocation(buildPackageId);

    if (initialDetail && packageId === buildPackageId) {
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    fetchSiteContentClient()
      .then((site) => {
        if (cancelled) return;

        const details = resolvePackageDetails(site);
        const detail = findPackageDetail(details, packageId);

        if (!detail) {
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
        title="لم يتم العثور على هذه الباقة"
        description="ربما تم نقل الباقة أو تغيير رابطها."
        action={<Link href="/packages">العودة للباقات</Link>}
      />
    );
  }

  return <PackageDetailPage detail={state.detail} />;
}
