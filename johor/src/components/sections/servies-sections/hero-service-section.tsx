import type { ServicesHeroContent } from "../../../../lib/api";
import servicesHeroBackground from "../../../assets/images/7.webp";
import { useLiveImage } from "../../../lib/use-live-image";
import PageHeroSection from "../shared/page-hero-section";

function ServicesHeroSection({ content }: { content: ServicesHeroContent }) {
  const liveBackground = useLiveImage(
    "services_hero",
    ["background"],
    content.background || "",
  );
  const liveMobileBackground = useLiveImage(
    "services_hero",
    ["mobileBackground"],
    content.mobileBackground || "",
  );

  return (
    <PageHeroSection
      lines={content.lines}
      description={content.description}
      supportText={content.supportText}
      extraParagraphs={content.introParagraphs}
      backgroundImage={liveBackground || servicesHeroBackground}
      mobileBackgroundImage={
        liveMobileBackground || liveBackground || servicesHeroBackground
      }
      accent="teal"
    />
  );
}

export default ServicesHeroSection;
