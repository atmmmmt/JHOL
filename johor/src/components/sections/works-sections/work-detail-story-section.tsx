import { motion } from "framer-motion";
import Image from "next/image";
import type { WorkProject } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";

type WorkDetailStorySectionProps = {
  work: WorkProject;
};

function WorkDetailStorySection({ work }: WorkDetailStorySectionProps) {
  const storyBlocks = work.storyBlocks;

  if (storyBlocks.length === 0) return null;

  return (
    <section className="bg-transparent py-fluid-8 text-white" dir="rtl">
      <div className="mx-auto flex flex-col gap-0 md:w-[75%] lg:w-[70%]">
        {storyBlocks.map((block, index) => {
          const hasText = block.title || block.description;

          return (
            <motion.article
              key={block.id}
              className="flex flex-col gap-0"
              {...fadeUp(0.04 + index * 0.04, 34, 0.78)}
            >
              {/* Media — video or image */}
              {block.video ? (
                <div className="w-full overflow-hidden bg-black shadow-[0_24px_70px_rgba(8,6,28,0.28)]">
                  <video
                    src={block.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="aspect-video w-full object-cover"
                  />
                </div>
              ) : block.image && block.image !== "undefined" ? (
                <div className="w-full overflow-hidden bg-white/[0.04] shadow-[0_24px_70px_rgba(8,6,28,0.28)]">
                  <Image
                    src={block.image}
                    alt={block.title ?? "مشهد المشروع"}
                    width={1920}
                    height={1080}
                    sizes="100vw"
                    loading={index === 0 ? "eager" : "lazy"}
                    className="aspect-video w-full object-cover"
                  />
                </div>
              ) : null}

              {/* Text */}
              {hasText ? (
                <motion.div
                  className="py-fluid-5"
                  {...fadeUp(0.06 + index * 0.04, 24, 0.72)}
                >
                  <Container>
                    <div className="flex flex-col gap-3 text-right lg:w-[60%]" style={{ marginInlineStart: "auto", marginInlineEnd: "auto" }}>
                      {block.title ? (
                        <h3 className="font-poppins text-[clamp(1.1rem,2.4vw,2rem)] font-semibold leading-snug tracking-[-0.02em] text-white/90">
                          {block.title}
                        </h3>
                      ) : null}
                      {block.description ? (
                        <p className="text-fluid-base leading-[1.9] text-white/60">
                          {block.description}
                        </p>
                      ) : null}
                    </div>
                  </Container>
                </motion.div>
              ) : null}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default WorkDetailStorySection;
