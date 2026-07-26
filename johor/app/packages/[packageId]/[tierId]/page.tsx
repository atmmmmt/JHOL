import { DETAIL_FALLBACK_SLUG, getSiteContent } from "../../../../lib/api";
import {
  findPackageDetail,
  findTier,
  resolvePackageDetailsForTierRoute,
  resolveTierOgImage,
} from "../../../../lib/packages";
import { buildPageMetadata } from "../../../../lib/seo";
import { PACKAGE_DETAILS } from "../../../../src/data/package-details";
import PackageTierDetailResolver from "../../../../src/page-components/package-tier-detail-resolver";

type PackageTierDetailRouteProps = {
  params: Promise<{
    packageId: string;
    tierId: string;
  }>;
};

function getPackageRouteParam(path: string, fallbackId: string) {
  const normalized = path
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);

  return normalized[normalized.length - 1] || fallbackId;
}

const PACKAGE_SLUG_MAP: Record<string, string> = {
  "package-1": "campaign-packages",
  "package-2": "identity-packages",
};

function getPackageRouteAliases(path: string, fallbackId: string) {
  const aliases = new Set<string>();
  const routeParam = getPackageRouteParam(path, fallbackId);

  if (fallbackId.trim()) {
    aliases.add(fallbackId.trim());
    // Add known pretty slug for this package id
    const prettySlug = PACKAGE_SLUG_MAP[fallbackId.trim()];
    if (prettySlug) aliases.add(prettySlug);
  }

  if (routeParam.trim()) {
    aliases.add(routeParam.trim());
  }

  return Array.from(aliases);
}

async function getResolvedPackageDetails() {
  try {
    const siteContent = await getSiteContent();
    return resolvePackageDetailsForTierRoute(siteContent);
  } catch {
    return PACKAGE_DETAILS;
  }
}

export async function generateStaticParams() {
  const details = await getResolvedPackageDetails();
  const params = details.flatMap((entry) =>
    getPackageRouteAliases(entry.path, entry.id).flatMap((packageId) =>
      (entry.saleTiers ?? []).map((tier) => ({
        packageId,
        tierId: tier.id,
      })),
    ),
  );

  // Always emit a fallback template so routes for tiers added after this
  // build can still be served (see johor/public/.htaccess).
  return [
    ...params,
    { packageId: DETAIL_FALLBACK_SLUG, tierId: DETAIL_FALLBACK_SLUG },
  ];
}

export async function generateMetadata({ params }: PackageTierDetailRouteProps) {
  const { packageId, tierId } = await params;

  if (packageId === DETAIL_FALLBACK_SLUG || tierId === DETAIL_FALLBACK_SLUG) {
    return buildPageMetadata({
      noIndex: true,
      path: `/packages/${packageId}/${tierId}`,
      title: "الباقات | جهور",
    });
  }

  const details = await getResolvedPackageDetails();
  const detail = findPackageDetail(details, packageId);
  const tier = findTier(detail, tierId);

  if (!detail || !tier) {
    return buildPageMetadata({
      path: `/packages/${packageId}/${tierId}`,
      title: "الباقات | جهور",
    });
  }

  const ogImage = resolveTierOgImage(detail, tier);

  return buildPageMetadata({
    description: tier.subtitle || detail.description,
    image: ogImage ? { alt: tier.name, url: ogImage } : undefined,
    path: `${detail.path.replace(/\/+$/, "")}/${tierId}`,
    title: `${tier.name} | ${detail.title} | جهور`,
    type: "article",
  });
}

export default async function Page({ params }: PackageTierDetailRouteProps) {
  const { packageId, tierId } = await params;

  return (
    <PackageTierDetailResolver
      buildPackageId={packageId}
      buildTierId={tierId}
      initialDetail={null}
      initialTier={null}
    />
  );
}
