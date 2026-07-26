"use client";

import { PACKAGE_DETAILS, type PackageDetail, type PackageSaleTier } from "../data/package-details";
import Breadcrumb from "../components/common/breadcrumb";
import PackageDetailHeroSection from "../components/sections/packages-sections/package-detail-hero-section";
import PackageTierDetailSection from "../components/sections/packages-sections/package-tier-detail-section";
import { useLiveSection } from "../lib/use-live-image";

type PackageTierDetailPageProps = {
  detail: PackageDetail;
  tier: PackageSaleTier;
};

type PackageDetailWithSummary = PackageDetail & {
  saleTiersSummary?: PackageSaleTier[];
};

function PackageTierDetailPage({
  detail: initialDetail,
  tier: initialTier,
}: PackageTierDetailPageProps) {
  const liveShowcase = useLiveSection<{ packageDetails?: PackageDetail[] }>(
    "packages_showcase",
    { packageDetails: [initialDetail] },
  );
  // Match the live package by stable identity first; only use positional
  // fallback for malformed legacy rows that lose ids/paths.
  const buildDetailIndex = PACKAGE_DETAILS.findIndex(
    (entry) => entry.id === initialDetail.id,
  );
  const liveDetail =
    liveShowcase.packageDetails?.find(
      (entry) => entry.id === initialDetail.id || entry.path === initialDetail.path,
    ) ??
    liveShowcase.packageDetails?.[buildDetailIndex >= 0 ? buildDetailIndex : 0] ??
    initialDetail;
  const buildTierIndex =
    initialDetail.saleTiers?.findIndex((entry) => entry.id === initialTier.id) ?? -1;
  const liveTier =
    liveDetail.saleTiers?.find((entry) => entry.id === initialTier.id) ??
    liveDetail.saleTiers?.[buildTierIndex >= 0 ? buildTierIndex : 0] ??
    initialTier;
  const liveSummaryTier =
    (liveDetail as PackageDetailWithSummary).saleTiersSummary?.find(
      (entry) => entry.id === initialTier.id,
    );
  const detail = liveDetail;
  const tier: PackageSaleTier = {
    ...initialTier,
    ...liveTier,
    cards:
      Array.isArray(liveTier.cards) && liveTier.cards.length > 0
        ? liveTier.cards
        : initialTier.cards,
    price: liveTier.price ?? liveSummaryTier?.price ?? initialTier.price,
    priceNote:
      liveTier.priceNote ?? liveSummaryTier?.priceNote ?? initialTier.priceNote,
    previewImage:
      liveTier.previewImage ?? liveSummaryTier?.previewImage ?? initialTier.previewImage,
    gallery:
      Array.isArray(liveTier.gallery) && liveTier.gallery.length > 0
        ? liveTier.gallery
        : initialTier.gallery,
  };

  const tierHeroDetail: PackageDetail = {
    ...detail,
    hero: {
      ...detail.hero,
      lines: [tier.name],
      description: "لنجاحك صوت جهور",
      supportText: tier.subtitle ?? "",
    },
  };

  return (
    <>
      <PackageDetailHeroSection detail={tierHeroDetail} />
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "الباقات", href: "/packages" },
          { label: detail.title, href: detail.path },
          { label: tier.name },
        ]}
      />
      <PackageTierDetailSection detail={detail} tier={tier} />
    </>
  );
}

export default PackageTierDetailPage;
