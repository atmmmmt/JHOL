"use client";

import type { BlogHeroContent, BlogPreviewContent } from "../../lib/api";
import AboutStartJourneySection from "../components/sections/about-sections/about-start-journey-section";
import BlogContentSections from "../components/sections/blog-sections/blog-content-sections";
import BlogHeroSection from "../components/sections/blog-sections/blog-hero-section";
import BlogPreviewSection from "../components/sections/blog-sections/blog-preview-section";

type BlogPageProps = {
  hero: BlogHeroContent;
  preview: BlogPreviewContent;
};

function BlogPage({ hero, preview }: BlogPageProps) {
  return (
    <>
      <BlogHeroSection content={hero} />
      <BlogPreviewSection content={preview} />
      <BlogContentSections content={hero} />
      <AboutStartJourneySection
        content={hero}
        journey={hero.helpCta}
        sectionKey="blog_hero"
        journeyKey="helpCta"
      />
    </>
  );
}

export default BlogPage;
