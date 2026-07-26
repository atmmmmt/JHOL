import { DETAIL_FALLBACK_SLUG, getSiteContent } from "../../../lib/api";
import {
  findPackageDetail,
  resolvePackageDetails,
  resolvePackageOgImage,
} from "../../../lib/packages";
import { buildPageMetadata } from "../../../lib/seo";
import PackageDetailResolver from "../../../src/page-components/package-detail-resolver";
import { PACKAGE_DETAILS } from "../../../src/data/package-details";

type PackageDetailRouteProps = {
  params: Promise<{
    packageId: string;
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
    return {
      details: resolvePackageDetails(siteContent),
      logo: siteContent.global.header.logo,
    };
  } catch {
    return {
      details: PACKAGE_DETAILS,
      logo: undefined,
    };
  }
}

export async function generateStaticParams() {
  const { details } = await getResolvedPackageDetails();
  const params = details.flatMap((entry) =>
    getPackageRouteAliases(entry.path, entry.id).map((packageId) => ({
      packageId,
    })),
  );

  // Always emit a fallback template so routes for packages added after this
  // build can still be served (see johor/public/.htaccess).
  return [...params, { packageId: DETAIL_FALLBACK_SLUG }];
}

export async function generateMetadata({ params }: PackageDetailRouteProps) {
  const { packageId } = await params;

  if (packageId === DETAIL_FALLBACK_SLUG) {
    return buildPageMetadata({
      noIndex: true,
      path: `/packages/${packageId}`,
      title: "الباقات | جهور",
    });
  }

  const { details, logo } = await getResolvedPackageDetails();
  const detail = findPackageDetail(details, packageId);

  if (!detail) {
    return buildPageMetadata({
      path: `/packages/${packageId}`,
      title: "الباقات | جهور",
    });
  }

  const ogImage = resolvePackageOgImage(detail);

  return buildPageMetadata({
    description: detail.description,
    image: ogImage
      ? { alt: detail.title, url: ogImage }
      : logo
        ? { alt: logo.alt || detail.title, url: logo.image }
        : undefined,
    path: detail.path,
    title: `${detail.title} | جهور`,
    type: "article",
  });
}

export default async function Page({ params }: PackageDetailRouteProps) {
  const { packageId } = await params;

  return (
    <PackageDetailResolver buildPackageId={packageId} initialDetail={null} />
  );
}
