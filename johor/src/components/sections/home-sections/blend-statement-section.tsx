import { motion } from "framer-motion";
import Image from "next/image";
import type { BrandStoryContent } from "../../../../lib/api";
import loudVoiceBaseImage from "../../../assets/images/success.png";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import { useLiveImage } from "../../../lib/use-live-image";

type BlendStatementSectionProps = {
  content: BrandStoryContent;
  id?: string;
};

function BlendStatementSection({
  content,
  id = "about",
}: BlendStatementSectionProps) {
  const liveImage = useLiveImage(
    "brand_story",
    ["image"],
    content.image || loudVoiceBaseImage.src,
  );
  const highlightedMeaning = content.meaning.slice(0, 2);
  const remainingMeaning = content.meaning.slice(2);

  return (
    <motion.section
      id={id}
      className="scroll-mt-20 overflow-hidden bg-(--white-shades-01) py-fluid-8 text-(--primary-shades-03)"
      {...fadeUp(0, 40, 0.7)}
    >
      <Container className="h-full">
        <div className="grid items-start gap-fluid-6 lg:[direction:ltr] lg:grid-cols-[minmax(420px,0.95fr)_minmax(0,1.05fr)]">
          <motion.div
            className="relative row-start-2 mx-auto w-full max-w-[460px] lg:col-start-1 lg:row-start-1 lg:mx-0"
            animate={{ y: [-20, 20], rotate: [-1.8, 1.8] }}
            transition={{
              duration: 4.8,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse",
            }}
            whileHover={{ scale: 1.02 }}
          >
            <Image
              src={liveImage}
              alt="Loud voice visual"
              width={460}
              height={460}
              className="h-auto w-full object-contain"
              sizes="(max-width: 1024px) 82vw, 460px"
              priority={false}
              unoptimized={typeof liveImage === "string"}
            />
          </motion.div>

          <div
            dir="rtl"
            className="row-start-1 space-y-fluid-4 lg:col-start-2 lg:row-start-1"
          >
            <motion.h2
              {...fadeUp(0.08, 40, 0.75)}
              className="font-poppins text-fluid-4xl font-semibold leading-[1.25] text-(--primary-shades-03)"
            >
              {content.headline}
            </motion.h2>

            <motion.div
              {...fadeUp(0.12, 38, 0.75)}
              className="rounded-2xl bg-(--secondary-shades-08) px-fluid-4 py-fluid-4 text-(--white-shades-01) shadow-[0_22px_48px_rgba(239,35,84,0.22)]"
            >
              <p className="text-fluid-xl mb-fluid-3 font-semibold leading-[1.7]">
                {content.lead}
              </p>
              {highlightedMeaning.map((paragraph) => (
                <p key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </motion.div>

            <motion.div
              {...fadeUp(0.16, 34, 0.72)}
              className="space-y-fluid-3 leading-[1.9] text-(--primary-shades-03)/92"
            >
              {remainingMeaning.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </motion.div>

            <motion.div
              {...fadeUp(0.2, 34, 0.72)}
              className="leading-[1.9] text-(--primary-shades-03)/92"
            >
              <h3 className="text-fluid-2xl font-semibold text-(--secondary-shades-08)">
                {content.aboutUs.title}
              </h3>
              {content.aboutUs.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </motion.div>
          </div>
        </div>
      </Container>
    </motion.section>
  );
}

export default BlendStatementSection;
