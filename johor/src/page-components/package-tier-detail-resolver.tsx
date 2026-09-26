"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSiteContentClient } from "../../lib/api";
import {
  isArchivedPackageDetail,
  isArchivedPackageRoute,
} from "../../lib/package-archive";
import {
  findPackageDetail,
  findTier,
  resolvePackageDetailsForTierRoute,
} from "../../lib/packages";
import type { PackageDetail, PackageSaleTier } from "../data/package-details";
import PackageTierDetailPage from "./package-tier-detail-page";
import { DetailLoadingState, DetailNotFoundState } from "./detail-fallback-states";

type PackageTierDetailResolverProps = {
  buildPackageId: string;
  buildTierId: string;
  initialDetail: PackageDetail | null;
  initialTier: PackageSaleTier | null;
};

type ResolvedState =
  | { status: "loading" }
  | { status: "notfound" }
  | { status: "ready"; detail: PackageDetail; tier: PackageSaleTier };

function getIdsFromLocation(
  fallbackPackageId: string,
  fallbackTierId: string,
): { packageId: string; tierId: string } {
  if (typeof window === "undefined") {
    return { packageId: fallbackPackageId, tierId: fallbackTierId };
  }

  const segments = window.location.pathname.split("/").filter(Boolean);
  const tierId = segments[segments.length - 1] ?? fallbackTierId;
  const packageId = segments[segments.length - 2] ?? fallbackPackageId;

  const decode = (value: string) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  return { packageId: decode(packageId), tierId: decode(tierId) };
}

/**
 * Resolves an active package tier on the client. Archived identity-package
 * tiers remain preserved in data but are intentionally unavailable publicly.
 */
export default function PackageTierDetailResolver({
  buildPackageId,
  buildTierId,
  initialDetail,
  initialTier,
}: PackageTierDetailResolverProps) {
  const initialReady =
    initialDetail && initialTier && !isArchivedPackageDetail(initialDetail)
      ? { status: "ready" as const, detail: initialDetail, tier: initialTier }
      : { status: "loading" as const };
  const [state, setState] = useState<ResolvedState>(initialReady);

  useEffect(() => {
    const { packageId, tierId } = getIdsFromLocation(buildPackageId, buildTierId);

    if (isArchivedPackageRoute(packageId)) {
      setState({ status: "notfound" });
      return;
    }

    if (
      initialDetail &&
      initialTier &&
      !isArchivedPackageDetail(initialDetail) &&
      packageId === buildPackageId &&
      tierId === buildTierId
    ) {
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    fetchSiteContentClient()
      .then((site) => {
        if (cancelled) return;

        const details = resolvePackageDetailsForTierRoute(site);
        const detail = findPackageDetail(details, packageId);
        const tier = findTier(detail, tierId);

        if (!detail || isArchivedPackageDetail(detail) || !tier) {
          setState({ status: "notfound" });
          return;
        }

        setState({ status: "ready", detail, tier });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "notfound" });
      });

    return () => {
      cancelled = true;
    };
  }, [buildPackageId, buildTierId, initialDetail, initialTier]);

  if (state.status === "loading") {
    return <DetailLoadingState />;
  }

  if (state.status === "notfound") {
    return (
      <DetailNotFoundState
        title="هذه الباقة مؤرشفة حالياً"
        description="تفاصيل هذه الباقة غير متاحة للعرض حالياً، ويمكن إعادة تفعيلها لاحقاً."
        action={<Link href="/packages">العودة للباقات</Link>}
      />
    );
  }

  return <PackageTierDetailPage detail={state.detail} tier={state.tier} />;
}
