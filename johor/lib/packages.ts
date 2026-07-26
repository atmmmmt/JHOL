import {
  PACKAGE_DETAILS,
  type PackageDetail,
  type PackageSaleTier,
} from "../src/data/package-details";
import type { SiteContent } from "./api";

function normalizePackageRouteKey(value: string) {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .pop()
    ?.toLowerCase() ?? "";
}

/**
 * Shared package-resolution logic used by both the build-time routes
 * (app/packages/...) and the client-side resolvers that fetch fresh content
 * for packages/tiers added after the last static build.
 */
export function resolvePackageDetails(siteContent: SiteContent): PackageDetail[] {
  const candidate = (
    siteContent.shared.packagesShowcase as {
      packageDetails?: unknown;
    }
  ).packageDetails;

  if (!Array.isArray(candidate)) {
    return PACKAGE_DETAILS;
  }

  const normalized = candidate.filter(
    (entry): entry is PackageDetail =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as { id?: unknown }).id === "string" &&
      typeof (entry as { path?: unknown }).path === "string" &&
      typeof (entry as { title?: unknown }).title === "string" &&
      typeof (entry as { description?: unknown }).description === "string",
  );

  return normalized.length > 0 ? normalized : PACKAGE_DETAILS;
}

/**
 * Same as {@link resolvePackageDetails}, but additionally merges each API
 * package's sale tiers with the matching static `PACKAGE_DETAILS` tier so
 * pricing cards (which only exist in static data) are preserved.
 */
export function resolvePackageDetailsForTierRoute(
  siteContent: SiteContent,
): PackageDetail[] {
  const normalized = resolvePackageDetails(siteContent);

  if (normalized === PACKAGE_DETAILS) {
    return PACKAGE_DETAILS;
  }

  return normalized.map((apiPkg) => {
    const staticPkg = PACKAGE_DETAILS.find((s) => s.id === apiPkg.id);
    if (!staticPkg) return apiPkg;

    const mergedTiers = (apiPkg.saleTiers ?? staticPkg.saleTiers ?? []).map(
      (apiTier) => {
        const staticTier = staticPkg.saleTiers?.find((s) => s.id === apiTier.id);
        if (!staticTier) return apiTier;

        return {
          ...staticTier,
          ...apiTier,
          // Always use static cards so price features are preserved.
          cards: staticTier.cards,
          price: apiTier.price ?? staticTier.price,
        };
      },
    );

    return { ...staticPkg, ...apiPkg, saleTiers: mergedTiers };
  });
}

// Maps canonical package ids to their pretty URL slugs.
const PACKAGE_SLUG_MAP: Record<string, string> = {
  "package-1": "campaign-packages",
  "package-2": "identity-packages",
};

export function findPackageDetail(details: PackageDetail[], packageId: string) {
  const normalizedLookup = normalizePackageRouteKey(packageId);

  return details.find((entry) => {
    if (entry.id === packageId) return true;
    if (entry.path === packageId) return true;
    if (normalizePackageRouteKey(entry.path) === normalizedLookup) return true;
    // Also match when the URL uses the pretty slug but the stored path still
    // uses the legacy "/packages/package-N" form.
    const prettySlug = PACKAGE_SLUG_MAP[entry.id];
    if (prettySlug && normalizePackageRouteKey(prettySlug) === normalizedLookup) return true;
    return false;
  });
}

export function findTier(detail: PackageDetail | undefined, tierId: string) {
  return detail?.saleTiers?.find((tier: PackageSaleTier) => tier.id === tierId);
}

function firstGalleryImage(tier?: PackageSaleTier): string | undefined {
  for (const image of tier?.gallery ?? []) {
    const src =
      typeof image?.src === "string" && image.src.trim()
        ? image.src.trim()
        : typeof image?.image === "string" && image.image.trim()
          ? image.image.trim()
          : "";
    if (src) return src;
  }
  return undefined;
}

/**
 * Resolves a representative image URL for a package, used for social share
 * (Open Graph) previews. Only absolute/remote URLs are meaningful for crawlers.
 */
export function resolvePackageOgImage(
  detail: PackageDetail,
): string | undefined {
  const hero = detail.hero?.backgroundImage;
  if (typeof hero === "string" && hero.trim()) return hero.trim();

  for (const tier of detail.saleTiers ?? []) {
    if (typeof tier.previewImage === "string" && tier.previewImage.trim()) {
      return tier.previewImage.trim();
    }
    const gallery = firstGalleryImage(tier);
    if (gallery) return gallery;
  }

  return undefined;
}

/** Resolves a representative image for a single tier's social share preview. */
export function resolveTierOgImage(
  detail: PackageDetail,
  tier: PackageSaleTier,
): string | undefined {
  if (typeof tier.previewImage === "string" && tier.previewImage.trim()) {
    return tier.previewImage.trim();
  }
  const gallery = firstGalleryImage(tier);
  if (gallery) return gallery;
  return resolvePackageOgImage(detail);
}
