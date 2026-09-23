import type { AboutHeroContent } from "../../../../lib/api";
import aboutHeroBackground from "../../../assets/images/6.webp";
import { useLiveImage } from "../../../lib/use-live-image";
import PageHeroSection from "../shared/page-hero-section";

function AboutHeroSection({ content }: { content: AboutHeroContent }) {
  const liveBackground = useLiveImage(
    "about_hero",
    ["background"],
    content.background || "",
  );
  const liveMobileBackground = useLiveImage(
    "about_hero",
    ["mobileBackground"],
    content.mobileBackground || "",
  );

  return (
    <PageHeroSection
      lines={content.lines}
      description={content.description}
      supportText={content.supportText}
      extraParagraphs={content.introParagraphs}
      backgroundImage={liveBackground || aboutHeroBackground}
      mobileBackgroundImage={
        liveMobileBackground || liveBackground || aboutHeroBackground
      }
      accent="violet"
    />
  );
}

export default AboutHeroSection;
