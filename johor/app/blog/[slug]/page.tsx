import {
  DETAIL_FALLBACK_SLUG,
  getBlogPostBySlug,
  getSiteContent,
} from "../../../lib/api";
import { buildPageMetadata } from "../../../lib/seo";
import BlogDetailResolver from "../../../src/page-components/blog-detail-resolver";

type BlogDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  try {
    const site = await getSiteContent();
    const params = site.pages.blog.preview.items
      .filter((item) => item.slug && item.slug.trim())
      .map((item) => ({ slug: item.slug }));

    // Always emit a fallback template so routes for posts added after this
    // build can still be served (see johor/public/.htaccess).
    return [...params, { slug: DETAIL_FALLBACK_SLUG }];
  } catch {
    return [{ slug: DETAIL_FALLBACK_SLUG }];
  }
}

export async function generateMetadata({ params }: BlogDetailRouteProps) {
  const { slug } = await params;

  if (slug === DETAIL_FALLBACK_SLUG) {
    return buildPageMetadata({
      noIndex: true,
      path: `/blog/${slug}`,
      title: "المدونة | جهور",
    });
  }

  try {
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return buildPageMetadata({
        path: `/blog/${slug}`,
        title: "المدونة | جهور",
      });
    }

    return buildPageMetadata({
      description: post.excerpt,
      image: post.coverImage
        ? {
            alt: post.title,
            url: post.coverImage,
          }
        : undefined,
      path: `/blog/${post.slug}`,
      title: `${post.title} | المدونة | جهور`,
      type: "article",
    });
  } catch {
    return buildPageMetadata({
      path: `/blog/${slug}`,
      title: "المدونة | جهور",
    });
  }
}

export default async function Page({ params }: BlogDetailRouteProps) {
  const { slug } = await params;

  let post = null;
  if (slug !== DETAIL_FALLBACK_SLUG) {
    try {
      post = await getBlogPostBySlug(slug);
    } catch {
      post = null;
    }
  }

  return <BlogDetailResolver buildSlug={slug} initialPost={post ?? null} />;
}
