import type { PageHeroContent } from "../../../../lib/api";
import { useLiveImage, useLiveSection } from "../../../lib/use-live-image";
import PageHeroSection from "../shared/page-hero-section";

function PackagesHeroSection({ content }: { content: PageHeroContent }) {
  const liveContent = useLiveSection<PageHeroContent>("packages_hero", content);
  const liveBackground = useLiveImage(
    "packages_hero",
    ["background"],
    content.background || "",
  );
  const liveMobileBackground = useLiveImage(
    "packages_hero",
    ["mobileBackground"],
    content.mobileBackground || "",
  );

  return (
    <PageHeroSection
      lines={liveContent.lines ?? content.lines}
      description={liveContent.description ?? content.description}
      supportText={liveContent.supportText ?? content.supportText}
      backgroundImage={liveBackground}
      mobileBackgroundImage={liveMobileBackground || liveBackground}
      accent="coral"
    />
  );
}

export default PackagesHeroSection;
