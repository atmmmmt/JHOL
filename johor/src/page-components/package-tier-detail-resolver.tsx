"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSiteContentClient } from "../../lib/api";
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
 * Resolves a package tier on the client so tiers added after the last static
 * build still render (their route is served by the `.htaccess` fallback).
 */
export default function PackageTierDetailResolver({
  buildPackageId,
  buildTierId,
  initialDetail,
  initialTier,
}: PackageTierDetailResolverProps) {
  const [state, setState] = useState<ResolvedState>(
    initialDetail && initialTier
      ? { status: "ready", detail: initialDetail, tier: initialTier }
      : { status: "loading" },
  );

  useEffect(() => {
    const { packageId, tierId } = getIdsFromLocation(buildPackageId, buildTierId);

    if (
      initialDetail &&
      initialTier &&
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

        if (!detail || !tier) {
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
        title="لم يتم العثور على هذه الدرجة"
        description="ربما تم نقل هذه الباقة أو تغيير رابطها."
        action={<Link href="/packages">العودة للباقات</Link>}
      />
    );
  }

  return <PackageTierDetailPage detail={state.detail} tier={state.tier} />;
}
