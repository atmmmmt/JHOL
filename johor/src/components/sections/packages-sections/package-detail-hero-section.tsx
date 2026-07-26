import type { PackageDetail } from "../../../data/package-details";
import packagesHeroBackground from "../../../assets/images/9.png";
import PageHeroSection from "../shared/page-hero-section";

type PackageDetailHeroSectionProps = {
  detail: PackageDetail;
};

function PackageDetailHeroSection({ detail }: PackageDetailHeroSectionProps) {
  return (
    <PageHeroSection
      lines={detail.hero.lines}
      description={detail.hero.description}
      supportText={detail.hero.supportText}
      backgroundImage={detail.hero.backgroundImage || packagesHeroBackground}
      accent={detail.hero.accent}
      contentAlign="center"
      descriptionSingleLine
      supportTextSingleLine
      styleVariant="blogDetail"
      showOverlay={false}
    />
  );
}

export default PackageDetailHeroSection;
