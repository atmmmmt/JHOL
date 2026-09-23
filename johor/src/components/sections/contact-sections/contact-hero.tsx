import type { ContactHeroContent } from "../../../../lib/api";
import contactHeroBackground from "../../../assets/images/9.webp";
import { useLiveImage } from "../../../lib/use-live-image";
import PageHeroSection from "../shared/page-hero-section";

function ContactHeroSection({ content }: { content: ContactHeroContent }) {
  const liveBackground = useLiveImage(
    "contact_hero",
    ["background"],
    content.background || "",
  );
  const liveMobileBackground = useLiveImage(
    "contact_hero",
    ["mobileBackground"],
    content.mobileBackground || "",
  );

  return (
    <PageHeroSection
      lines={content.lines}
      description={content.description}
      supportText={content.supportText}
      backgroundImage={liveBackground || contactHeroBackground}
      mobileBackgroundImage={
        liveMobileBackground || liveBackground || contactHeroBackground
      }
      accent="coral"
    />
  );
}

export default ContactHeroSection;
