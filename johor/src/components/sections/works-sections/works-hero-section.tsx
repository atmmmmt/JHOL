import type { WorksHeroContent } from '../../../../lib/api'
import worksHeroBackground from '../../../assets/images/8.png'
import { useLiveImage } from '../../../lib/use-live-image'
import PageHeroSection from '../shared/page-hero-section'

function WorksHeroSection({ content }: { content: WorksHeroContent }) {
  const liveBackground = useLiveImage(
    'works_hero',
    ['background'],
    content.background || '',
  )
  const liveMobileBackground = useLiveImage(
    'works_hero',
    ['mobileBackground'],
    content.mobileBackground || '',
  )

  return (
    <PageHeroSection
      lines={content.lines}
      description={content.description}
      supportText={content.supportText}
      extraParagraphs={content.introParagraphs}
      backgroundImage={liveBackground || worksHeroBackground}
      mobileBackgroundImage={
        liveMobileBackground || liveBackground || worksHeroBackground
      }
      accent="coral"
      className="max-md:bg-position-[unset]"
    />
  )
}

export default WorksHeroSection
