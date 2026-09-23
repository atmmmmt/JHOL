import type { PageHeroContent } from "../../../../lib/api";
import trainingHeroBackground from "../../../assets/images/1.webp";
import { useLiveImage } from "../../../lib/use-live-image";
import PageHeroSection from "../shared/page-hero-section";

function TrainingCoursesHeroSection({ content }: { content: PageHeroContent }) {
  const liveBackground = useLiveImage(
    "training_courses_hero",
    ["background"],
    content.background || "",
  );
  const liveMobileBackground = useLiveImage(
    "training_courses_hero",
    ["mobileBackground"],
    content.mobileBackground || "",
  );

  return (
    <PageHeroSection
      lines={content.lines}
      description={content.description}
      supportText={content.supportText}
      backgroundImage={liveBackground || trainingHeroBackground}
      mobileBackgroundImage={
        liveMobileBackground || liveBackground || trainingHeroBackground
      }
      accent="teal"
    />
  );
}

export default TrainingCoursesHeroSection;
