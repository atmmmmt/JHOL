"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Link2,
  Linkedin,
  MessageCircle,
  X,
} from "lucide-react";
import type { BlogPreviewItem } from "../../lib/api";
import Breadcrumb from "../components/common/breadcrumb";
import Container from "../components/common/container";

type BlogDetailPageProps = {
  post: BlogPreviewItem;
};

function BlogDetailPage({ post }: BlogDetailPageProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jhoragency.com.sa",
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteOrigin(window.location.origin);
    }
  }, []);

  const shareUrl = `${siteOrigin}/blog/${post.slug}`;
  const shareText = encodeURIComponent(post.title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleCopyAndShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      setLinkCopied(false);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.title,
          url: shareUrl,
        });
      } catch {
        // User dismissed share sheet; no action needed.
      }
    }
  };

  return (
    <>
      <section
        data-cursor-surface="dark"
        className="relative overflow-hidden bg-(--primary-shades-02) pb-fluid-8 pt-[calc(var(--header-overlay-offset)+var(--space-fluid-6))] text-white"
      >
        {post.coverImage ? (
          <div className="absolute inset-0">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="absolute inset-0 bg-black/52" />
        <div className="absolute inset-0 bg-linear-to-t from-(--primary-shades-02)/90 via-(--primary-shades-02)/72 to-(--primary-shades-02)/58" />
        <div className="pointer-events-none absolute left-[-10%] top-[14%] h-72 w-72 rounded-full bg-(--secondary-shades-08)/15 blur-[150px]" />
        <div className="pointer-events-none absolute bottom-[-8%] right-[-12%] h-80 w-80 rounded-full bg-(--secondary-shades-09)/15 blur-[165px]" />

        <Container className="relative z-10">
          <div className="mx-auto flex min-h-[58vh] max-w-5xl flex-col items-center justify-center text-center">
            {post.category ? (
              <div className="mb-fluid-3 inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.28em] text-white/80">
                <span className="h-2 w-2 rounded-full bg-(--secondary-shades-08)" />
                <span>{post.category}</span>
              </div>
            ) : null}

            <h1 className="max-w-4xl font-hero text-[clamp(2rem,5.3vw,4.55rem)] font-bold leading-[1.12] tracking-[-0.01em] text-white">
              {post.title}
            </h1>

            {post.meta || post.source ? (
              <div className="mt-fluid-4 flex flex-wrap items-center justify-center gap-3 border-t border-white/16 pt-fluid-3 text-[11px] font-medium tracking-[0.22em] text-white/72">
                {post.meta ? <span>{post.meta}</span> : null}
                {post.source ? <span>{post.source}</span> : null}
              </div>
            ) : null}

            {post.excerpt ? (
              <p className="mt-fluid-4 max-w-3xl text-fluid-lg leading-relaxed text-white/84">
                {post.excerpt}
              </p>
            ) : null}
          </div>
        </Container>
      </section>

      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "المدونة", href: "/blog" },
          { label: post.title },
        ]}
      />

      <section className="relative overflow-hidden bg-(--white-shades-01) py-fluid-8 text-(--primary-shades-03)">
        <div className="pointer-events-none absolute left-[-10%] top-[12%] h-64 w-64 rounded-full bg-(--secondary-shades-09)/6 blur-[125px]" />
        <div className="pointer-events-none absolute bottom-[10%] right-[-12%] h-72 w-72 rounded-full bg-(--secondary-shades-08)/6 blur-[140px]" />
        <Container className="relative z-10">
          <article className="mx-auto max-w-4xl border-t border-(--primary-shades-03)/12 pt-fluid-6">
            {post.content ? (
              <div
                dir="rtl"
                className="font-readex text-fluid-base leading-[2.05] text-(--primary-shades-03)/82 [&_*]:max-w-none [&_a]:font-medium [&_a]:text-(--secondary-shades-09) [&_a]:underline [&_blockquote]:my-fluid-7 [&_blockquote]:border-r-[3px] [&_blockquote]:border-(--secondary-shades-08) [&_blockquote]:bg-transparent [&_blockquote]:px-fluid-4 [&_blockquote]:py-fluid-2 [&_blockquote]:text-(--primary-shades-03)/72 [&_code]:rounded-md [&_code]:bg-(--primary-shades-03)/6 [&_code]:px-2 [&_code]:py-1 [&_em]:text-(--primary-shades-03)/74 [&_h1]:mt-fluid-8 [&_h1]:font-sans [&_h1]:text-[clamp(1.4rem,2.6vw,2rem)] [&_h1]:font-semibold [&_h1]:leading-[1.25] [&_h2]:mt-fluid-8 [&_h2]:font-sans [&_h2]:text-[clamp(1.2rem,2.1vw,1.7rem)] [&_h2]:font-semibold [&_h2]:leading-[1.3] [&_h3]:mt-fluid-7 [&_h3]:font-sans [&_h3]:text-[clamp(1.05rem,1.7vw,1.4rem)] [&_h3]:font-semibold [&_img]:my-fluid-7 [&_img]:overflow-hidden [&_img]:rounded-[1.3rem] [&_img]:border [&_img]:border-(--primary-shades-03)/10 [&_li]:mr-fluid-4 [&_li]:mt-2 [&_ol]:my-fluid-5 [&_ol]:list-decimal [&_p]:mt-fluid-5 [&_strong]:font-semibold [&_strong]:text-(--primary-shades-03) [&_table]:my-fluid-6 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-2xl [&_table]:border [&_table]:border-(--primary-shades-03)/10 [&_td]:border-t [&_td]:border-(--primary-shades-03)/10 [&_td]:px-4 [&_td]:py-3 [&_th]:bg-(--primary-shades-03)/4 [&_th]:px-4 [&_th]:py-3 [&_th]:text-right [&_ul]:my-fluid-5 [&_ul]:list-disc"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="text-fluid-lg leading-relaxed text-(--primary-shades-03)/68">
                سيتم إضافة محتوى هذه المقالة قريباً.
              </p>
            )}
          </article>

          {Array.isArray(post.tags) && post.tags.length > 0 ? (
            <div dir="rtl" className="mx-auto mt-fluid-6 max-w-4xl flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-(--primary-shades-03)/14 bg-(--primary-shades-03)/5 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-(--primary-shades-03)/65"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mx-auto mt-fluid-7 max-w-4xl border-t border-(--primary-shades-03)/12 pt-fluid-5">
            <div
              dir="rtl"
              className="flex flex-wrap items-center justify-between gap-fluid-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="ml-2 text-fluid-sm font-semibold text-(--primary-shades-03)/75">
                  شارك المقال:
                </span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Facebook"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--primary-shades-03)/14 bg-(--primary-shades-03)/4 text-(--primary-shades-03) transition hover:border-(--secondary-shades-08)/45 hover:text-(--secondary-shades-08)"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on LinkedIn"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--primary-shades-03)/14 bg-(--primary-shades-03)/4 text-(--primary-shades-03) transition hover:border-(--secondary-shades-08)/45 hover:text-(--secondary-shades-08)"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href={`https://x.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on X"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--primary-shades-03)/14 bg-(--primary-shades-03)/4 text-(--primary-shades-03) transition hover:border-(--secondary-shades-08)/45 hover:text-(--secondary-shades-08)"
                >
                  <X className="h-4 w-4" />
                </a>
                <a
                  href="https://www.instagram.com/jhoragency/?hl=ar"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--primary-shades-03)/14 bg-(--primary-shades-03)/4 text-(--primary-shades-03) transition hover:border-(--secondary-shades-08)/45 hover:text-(--secondary-shades-08)"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={`https://wa.me/?text=${shareText}%20${encodedUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on WhatsApp"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--primary-shades-03)/14 bg-(--primary-shades-03)/4 text-(--primary-shades-03) transition hover:border-(--secondary-shades-08)/45 hover:text-(--secondary-shades-08)"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyAndShareLink}
                  aria-label="Copy and share article link"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--primary-shades-03)/14 bg-(--primary-shades-03)/4 text-(--primary-shades-03) transition hover:border-(--secondary-shades-08)/45 hover:text-(--secondary-shades-08)"
                >
                  <Link2 className="h-4 w-4" />
                </button>
                {linkCopied ? (
                  <span className="rounded-full border border-(--secondary-shades-08)/30 bg-(--secondary-shades-08)/12 px-3 py-1 text-xs font-medium text-(--secondary-shades-09)">
                    تم نسخ الرابط
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative h-10 w-24 overflow-hidden px-2">
                  <Image
                    src="/GOGO.png"
                    alt="Johor logo"
                    fill
                    sizes="96px"
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-medium tracking-[0.18em] text-(--primary-shades-03)/45">
                    الكاتب
                  </p>
                  <p className="text-fluid-base font-semibold text-(--primary-shades-03)">
                    وكالة جهور للتسويق الالكتروني
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

export default BlogDetailPage;
