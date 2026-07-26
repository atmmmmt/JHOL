export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { getSiteContent } from "../lib/api";
import { getAbsoluteSiteUrl } from "../lib/seo";
import { PACKAGE_DETAILS } from "../src/data/package-details";

function buildEntry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
): MetadataRoute.Sitemap[number] {
  return {
    changeFrequency,
    lastModified: new Date(),
    priority,
    url: getAbsoluteSiteUrl(path),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteContent();

  const staticRoutes: MetadataRoute.Sitemap = [
    buildEntry("/", 1, "weekly"),
    buildEntry("/about", 0.8, "monthly"),
    buildEntry("/services", 0.9, "weekly"),
    buildEntry("/packages", 0.8, "weekly"),
    buildEntry("/training-courses", 0.8, "weekly"),
    buildEntry("/works", 0.9, "weekly"),
    buildEntry("/blog", 0.8, "weekly"),
    buildEntry("/contact", 0.7, "monthly"),
    buildEntry("/campaign-terms", 0.4, "monthly"),
    buildEntry("/identity-terms", 0.4, "monthly"),
    buildEntry("/privacy-policy", 0.4, "monthly"),
    buildEntry("/cookies-policy", 0.4, "monthly"),
  ];

  const workRoutes: MetadataRoute.Sitemap = site.pages.works.projects.projects.map(
    (project) => buildEntry(`/works/${project.slug}`, 0.7, "monthly"),
  );

  const blogRoutes: MetadataRoute.Sitemap = site.pages.blog.preview.items.map((item) =>
    buildEntry(`/blog/${item.slug}`, 0.7, "monthly"),
  );

  const packageRoutes: MetadataRoute.Sitemap = PACKAGE_DETAILS.map((entry) =>
    buildEntry(entry.path, 0.75, "weekly"),
  );

  return [...staticRoutes, ...workRoutes, ...blogRoutes, ...packageRoutes];
}
