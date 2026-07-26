import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ServicesHeroContent } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import { useCursorMask } from "../../common/cursor-mask-context";

type ServicesExtraSectionsProps = {
  content: ServicesHeroContent;
};

function ServicesExtraSections({ content }: ServicesExtraSectionsProps) {
  const { setMaskMode } = useCursorMask();
  const hasWhyChoose =
    !!content.whyChooseServices?.title ||
    !!content.whyChooseServices?.description ||
    (content.whyChooseServices?.points?.length ?? 0) > 0 ||
    !!content.whyChooseServices?.closing;

  if (!hasWhyChoose) {
    return null;
  }

  return (
    <motion.section className="bg-white py-fluid-8 text-(--primary-shades-03)" {...fadeUp(0, 40, 0.7)}>
      <Container>
        <div dir="rtl" className="space-y-fluid-6">
          {hasWhyChoose ? (
            <motion.article
              className="relative overflow-hidden rounded-[2rem] border border-(--primary-shades-03)/12 bg-linear-to-br from-(--white-shades-01) to-(--secondary-shades-08)/8 p-fluid-5 shadow-[0_24px_70px_rgba(34,27,79,0.1)]"
              {...fadeUp(0.08, 30, 0.72)}
              whileHover={{ y: -4, scale: 1.005 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setMaskMode("cta")}
              onMouseLeave={() => setMaskMode("none")}
              onFocus={() => setMaskMode("cta")}
              onBlur={() => setMaskMode("none")}
            >
              <div className="pointer-events-none absolute left-[-9%] top-[-18%] h-36 w-36 rounded-full bg-(--secondary-shades-08)/16 blur-[86px]" />
              <div className="pointer-events-none absolute bottom-[-18%] right-[-10%] h-40 w-40 rounded-full bg-(--primary-shades-04)/14 blur-[92px]" />

              {content.whyChooseServices?.title ? (
                <motion.div
                  className="relative z-10 mb-fluid-4 flex items-center gap-3"
                  {...fadeUp(0.12, 20, 0.58)}
                >
                  <motion.span
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-(--secondary-shades-08)/26 bg-(--secondary-shades-08)/12 text-(--secondary-shades-08)"
                    animate={{ y: [0, -3, 0], rotate: [0, 3, 0, -3, 0] }}
                    transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="h-5 w-5" strokeWidth={1.9} />
                  </motion.span>
                  <h2 className="text-fluid-xl font-semibold leading-[1.6] text-(--secondary-shades-08)">
                    {content.whyChooseServices.title}
                  </h2>
                </motion.div>
              ) : null}

              {content.whyChooseServices?.description ? (
                <p className="relative z-10 mt-fluid-3 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
                  {content.whyChooseServices.description}
                </p>
              ) : null}

              {(content.whyChooseServices?.points?.length ?? 0) > 0 ? (
                <motion.div
                  className="relative z-10 mt-fluid-5 rounded-[1.5rem] backdrop-blur-sm"
                  {...fadeUp(0.18, 22, 0.58)}
                >
                  <div className="rounded-[1.5rem] border border-(--primary-shades-03)/10 bg-linear-to-br from-(--white-shades-01) to-(--secondary-shades-08)/8 p-fluid-4">
                    <ul className="space-y-2 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
                      {content.whyChooseServices?.points?.map((point, index) => (
                        <motion.li
                          key={point}
                          className="flex items-center gap-2"
                          {...fadeUp(0.2 + index * 0.04, 16, 0.5)}
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-(--secondary-shades-08)" />
                          <span>{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : null}

              {content.whyChooseServices?.closing ? (
                <p className="relative z-10 mt-fluid-3 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
                  {content.whyChooseServices.closing}
                </p>
              ) : null}
            </motion.article>
          ) : null}
        </div>
      </Container>
    </motion.section>
  );
}

export default ServicesExtraSections;
