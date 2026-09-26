import type { PackageDetail } from "../src/data/package-details";

export type PackageArchiveReference = {
  archived?: boolean;
  id?: string;
  path?: string;
  title?: string;
};

const ARCHIVED_PACKAGE_IDS = new Set(["package-2"]);
const ARCHIVED_PACKAGE_SLUGS = new Set(["identity-packages", "package-2"]);

function normalize(value: unknown) {
  return typeof value === "string"
    ? value.trim().replace(/^\/+|\/+$/g, "").toLowerCase()
    : "";
}

function lastPathSegment(value: unknown) {
  const normalized = normalize(value);
  if (!normalized) return "";
  const segments = normalized.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
}

function isIdentityPackageTitle(value: unknown) {
  if (typeof value !== "string") return false;
  const title = value.replace(/\s+/g, " ").trim();

  const mentionsLogo = title.includes("شعار") || title.includes("الشعارات");
  const mentionsIdentity =
    title.includes("الهوية البصرية") || title.includes("الهويات البصرية");

  return mentionsLogo && mentionsIdentity;
}

/**
 * Packages archived from the public website remain fully preserved in the CMS
 * and static package data. Re-activating them only requires removing their
 * archive key here (or setting `archived: false` once the CMS exposes it).
 */
export function isArchivedPackageReference(
  reference: PackageArchiveReference | null | undefined,
) {
  if (!reference) return false;
  if (reference.archived === true) return true;

  const id = normalize(reference.id);
  if (ARCHIVED_PACKAGE_IDS.has(id)) return true;

  const slug = lastPathSegment(reference.path);
  if (ARCHIVED_PACKAGE_SLUGS.has(slug)) return true;

  return isIdentityPackageTitle(reference.title);
}

export function isArchivedPackageRoute(packageId: string) {
  return ARCHIVED_PACKAGE_SLUGS.has(lastPathSegment(packageId));
}

export function isArchivedPackageDetail(detail: PackageDetail | null | undefined) {
  return isArchivedPackageReference(detail);
}

export function filterActivePackageDetails(details: PackageDetail[]) {
  return details.filter((detail) => !isArchivedPackageDetail(detail));
}
