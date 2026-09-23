import { getSeoDescriptions, getSiteContent } from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";
import BlogPage from "../../src/page-components/blog-page";

export async function generateMetadata() {
  const [site, seoDescs] = await Promise.all([getSiteContent(), getSeoDescriptions()]);

  return buildPageMetadata({
    description: seoDescs["/blog"]?.trim() || site.pages.blog.hero.ogDescription?.trim() || site.pages.blog.hero.description,
    image: {
      alt: site.global.header.logo.alt,
      url: site.global.header.logo.image,
    },
    path: "/blog",
    title: "المدونة | جهور",
  });
}

export default async function Page() {
  const site = await getSiteContent();

  return (
    <BlogPage
      hero={site.pages.blog.hero}
      preview={site.pages.blog.preview}
    />
  );
}
