export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { getAbsoluteSiteUrl } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    host: getAbsoluteSiteUrl("/"),
    rules: [
      {
        allow: "/",
        userAgent: "*",
      },
    ],
    sitemap: getAbsoluteSiteUrl("/sitemap.xml"),
  };
}
