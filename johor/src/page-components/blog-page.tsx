"use client";

import type { BlogHeroContent, BlogPreviewContent } from "../../lib/api";
import AboutStartJourneySection from "../components/sections/about-sections/about-start-journey-section";
import BlogContentSections from "../components/sections/blog-sections/blog-content-sections";
import BlogHeroSection from "../components/sections/blog-sections/blog-hero-section";
import BlogPreviewSection from "../components/sections/blog-sections/blog-preview-section";
import { reviseContentSection } from "../lib/client-content-revision";
import { applyFinalClientFixes } from "../lib/final-client-fixes";

type BlogPageProps = {
  hero: BlogHeroContent;
  preview: BlogPreviewContent;
};

function BlogPage({ hero, preview }: BlogPageProps) {
  const revisedHero = applyFinalClientFixes(
    "blog_hero",
    reviseContentSection("blog_hero", hero),
  );
  const revisedPreview = reviseContentSection("blog_preview", preview);

  return (
    <>
      <BlogHeroSection content={revisedHero} />
      <BlogPreviewSection content={revisedPreview} />
      <BlogContentSections content={revisedHero} />
      <AboutStartJourneySection
        content={revisedHero}
        journey={revisedHero.helpCta}
        sectionKey="blog_hero"
        journeyKey="helpCta"
      />
    </>
  );
}

export default BlogPage;
