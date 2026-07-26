"use client";

import { PACKAGE_DETAILS, type PackageDetail, type PackageSaleTier } from "../data/package-details";
import PackageDetailContentSection from "../components/sections/packages-sections/package-detail-content-section";
import PackageDetailFinalNoticeSection from "../components/sections/packages-sections/package-detail-final-notice-section";
import PackageDetailHeroSection from "../components/sections/packages-sections/package-detail-hero-section";
import PackageDetailSaleCardsSection from "../components/sections/packages-sections/package-detail-sale-cards-section";
import { PackageVideoGrid } from "../components/sections/packages-sections/package-video-grid";
import { useLiveSection } from "../lib/use-live-image";
import Breadcrumb from "../components/common/breadcrumb";

type PackageDetailPageProps = {
  detail: PackageDetail;
};

type PackageDetailWithSummary = PackageDetail & {
  saleTiersSummary?: PackageSaleTier[];
};

function PackageDetailPage({
  detail: initialDetail,
}: PackageDetailPageProps) {
  const liveShowcase = useLiveSection<{ items?: PackageDetail[]; packageDetails?: PackageDetail[] }>(
    "packages_showcase",
    { packageDetails: [initialDetail] },
  );
  const livePackages = liveShowcase.packageDetails ?? liveShowcase.items;
  const livePackageById = livePackages?.find(
    (entry) => entry?.id === initialDetail.id || entry?.path === initialDetail.path,
  );
  // Keep positional fallback only for malformed legacy rows that lose ids/paths.
  const detailIndex = PACKAGE_DETAILS.findIndex((d) => d.id === initialDetail.id);
  const livePackage =
    livePackageById ?? livePackages?.[detailIndex >= 0 ? detailIndex : 0];
  // Prefer live packageDetails from the dashboard, then fall back field-by-field
  // to the build-time static package definition for anything still missing.
  const staticDetail = PACKAGE_DETAILS.find((d) => d.id === initialDetail.id);
  const mergedProcess = (() => {
    const staticProc = staticDetail?.process;
    const liveProc = livePackage?.process;

    if (!staticProc && !liveProc) return undefined;
    if (!staticProc) return liveProc;
    if (!liveProc) return staticProc;

    const liveSteps = liveProc.steps ?? [];
    const mergedSteps = staticProc.steps.map((staticStep) => {
      const liveStep = liveSteps.find((s) => s.order === staticStep.order);
      return liveStep ? { ...staticStep, ...liveStep } : staticStep;
    });

    const extraLiveSteps = liveSteps.filter(
      (liveStep) => !staticProc.steps.some((staticStep) => staticStep.order === liveStep.order),
    );

    return {
      ...staticProc,
      ...liveProc,
      steps: [...mergedSteps, ...extraLiveSteps].sort((a, b) => a.order - b.order),
    };
  })();
  const detail: PackageDetail = livePackage
    ? {
        ...initialDetail,
        ...livePackage,
        process: mergedProcess,
        hero: {
          ...initialDetail.hero,
          ...livePackage.hero,
        },
        items: Array.isArray(livePackage.items) && livePackage.items.length > 0
          ? livePackage.items
          : initialDetail.items,
        videos: Array.isArray(livePackage.videos) ? livePackage.videos : initialDetail.videos,
        saleCards: Array.isArray(livePackage.saleCards) && livePackage.saleCards.length > 0
          ? livePackage.saleCards
          : initialDetail.saleCards,
        saleTiers: initialDetail.saleTiers?.map((staticTier, tierIndex) => {
          const liveTiers = livePackage.saleTiers as PackageSaleTier[] | undefined;
          const liveSummaryTiers =
            (livePackage as PackageDetailWithSummary).saleTiersSummary;
          // Match by ID first, fallback to position (DB may generate different IDs)
          const liveTier = liveTiers?.find((lt) => lt.id === staticTier.id) ?? liveTiers?.[tierIndex];
          const liveSummaryTier =
            liveSummaryTiers?.find((lt) => lt.id === staticTier.id) ??
            liveSummaryTiers?.[tierIndex];
          if (!liveTier) return staticTier;
          return {
            ...staticTier,
            ...liveTier,
            price: liveTier.price ?? liveSummaryTier?.price ?? staticTier.price,
            priceNote:
              liveTier.priceNote ?? liveSummaryTier?.priceNote ?? staticTier.priceNote,
            previewImage:
              (liveTier.previewImage as string | undefined) ??
              liveSummaryTier?.previewImage ??
              staticTier.previewImage,
            gallery: Array.isArray(liveTier.gallery) && liveTier.gallery.length > 0
              ? liveTier.gallery
              : staticTier.gallery,
          };
        }),
      }
    : { ...initialDetail, process: mergedProcess };
  const hasSaleTiers = Boolean(detail.saleTiers?.length || detail.saleCards?.length);
  const showContentSection = detail.id !== 'package-1';
  const summaryTiers = (detail as PackageDetailWithSummary).saleTiersSummary ?? detail.saleTiers;
  const saleAccentByPackage: Record<
    string,
    { dot: string; glowPrimary: string; glowSecondary: string }
  > = {
    "package-1": {
      dot: "bg-(--secondary-shades-08)",
      glowPrimary: "bg-(--secondary-shades-08)/14",
      glowSecondary: "bg-(--primary-shades-04)/14",
    },
    "package-2": {
      dot: "bg-(--primary-shades-04)",
      glowPrimary: "bg-(--primary-shades-04)/16",
      glowSecondary: "bg-(--secondary-shades-08)/12",
    },
  };
  const saleAccent = saleAccentByPackage[detail.id] ?? saleAccentByPackage["package-1"];
  const packageVideos = Array.isArray(detail.videos) ? detail.videos : [];

  return (
    <>
      <PackageDetailHeroSection detail={detail} />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "الباقات", href: "/packages" },
          { label: detail.title },
        ]}
      />

      {hasSaleTiers ? (
        <>
          <PackageDetailSaleCardsSection
            packageId={detail.id}
            packagePath={detail.path}
            cards={detail.saleCards}
            tiers={summaryTiers}
            imageTiers={detail.saleTiers}
            dotClass={saleAccent.dot}
            glowPrimaryClass={saleAccent.glowPrimary}
            glowSecondaryClass={saleAccent.glowSecondary}
          />
          {packageVideos.length > 0 ? (
            <PackageVideoGrid videos={packageVideos} />
          ) : null}
          {showContentSection ? <PackageDetailContentSection detail={detail} /> : null}
          <PackageDetailFinalNoticeSection />
        </>
      ) : null}
      {!hasSaleTiers ? (
        <>
          {packageVideos.length > 0 ? (
            <PackageVideoGrid videos={packageVideos} />
          ) : null}
          {showContentSection ? <PackageDetailContentSection detail={detail} /> : null}
        </>
      ) : null}
    </>
  );
}

export default PackageDetailPage;
