import type { BlogHeroContent } from "../../../../lib/api";
import blogHeroBackground from "../../../assets/images/3.png";
import { useLiveImage } from "../../../lib/use-live-image";
import PageHeroSection from "../shared/page-hero-section";

function BlogHeroSection({ content }: { content: BlogHeroContent }) {
  const liveBackground = useLiveImage(
    "blog_hero",
    ["background"],
    content.background || "",
  );
  const liveMobileBackground = useLiveImage(
    "blog_hero",
    ["mobileBackground"],
    content.mobileBackground || "",
  );

  return (
    <PageHeroSection
      lines={content.lines}
      description={content.description}
      supportText={content.supportText}
      extraParagraphs={content.introParagraphs}
      backgroundImage={liveBackground || blogHeroBackground}
      mobileBackgroundImage={
        liveMobileBackground || liveBackground || blogHeroBackground
      }
      accent="teal"
    />
  );
}

export default BlogHeroSection;
