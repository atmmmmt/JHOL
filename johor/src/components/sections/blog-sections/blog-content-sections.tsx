import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { BlogHeroContent } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import { useCursorMask } from "../../common/cursor-mask-context";
import SliderNav from "../../ui/slider-nav";

type BlogContentSectionsProps = {
  content: BlogHeroContent;
};

function BlogContentSections({ content }: BlogContentSectionsProps) {
  const { setMaskMode } = useCursorMask();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const hasWhatYouWillFind =
    !!content.whatYouWillFind?.title ||
    !!content.whatYouWillFind?.intro ||
    (content.whatYouWillFind?.topics?.length ?? 0) > 0;
  const hasWhyWeCreatedBlog =
    !!content.whyWeCreatedBlog?.title ||
    !!content.whyWeCreatedBlog?.intro ||
    !!content.whyWeCreatedBlog?.pointsTitle ||
    (content.whyWeCreatedBlog?.points?.length ?? 0) > 0 ||
    !!content.whyWeCreatedBlog?.closing;
  const hasPracticalContent =
    !!content.practicalContent?.title ||
    !!content.practicalContent?.intro ||
    !!content.practicalContent?.pointsTitle ||
    (content.practicalContent?.points?.length ?? 0) > 0 ||
    !!content.practicalContent?.closing;
  const insightSlides = useMemo(
    () =>
      [
        hasWhyWeCreatedBlog
          ? {
              closing: content.whyWeCreatedBlog?.closing,
              intro: content.whyWeCreatedBlog?.intro,
              points: content.whyWeCreatedBlog?.points ?? [],
              pointsTitle: content.whyWeCreatedBlog?.pointsTitle,
              title: content.whyWeCreatedBlog?.title,
            }
          : null,
        hasPracticalContent
          ? {
              closing: content.practicalContent?.closing,
              intro: content.practicalContent?.intro,
              points: content.practicalContent?.points ?? [],
              pointsTitle: content.practicalContent?.pointsTitle,
              title: content.practicalContent?.title,
            }
          : null,
      ].filter(Boolean),
    [
      content.practicalContent?.closing,
      content.practicalContent?.intro,
      content.practicalContent?.points,
      content.practicalContent?.pointsTitle,
      content.practicalContent?.title,
      content.whyWeCreatedBlog?.closing,
      content.whyWeCreatedBlog?.intro,
      content.whyWeCreatedBlog?.points,
      content.whyWeCreatedBlog?.pointsTitle,
      content.whyWeCreatedBlog?.title,
      hasPracticalContent,
      hasWhyWeCreatedBlog,
    ],
  );
  const currentInsightSlide =
    insightSlides[Math.min(activeSlideIndex, Math.max(0, insightSlides.length - 1))];
  const canGoPrev = activeSlideIndex > 0;
  const canGoNext = activeSlideIndex < insightSlides.length - 1;
  if (!hasWhatYouWillFind && !hasWhyWeCreatedBlog && !hasPracticalContent) {
    return null;
  }

  return (
    <motion.section className="bg-white py-fluid-8 text-(--primary-shades-03)" {...fadeUp(0, 40, 0.7)}>
      <Container>
        <div dir="rtl" className="space-y-fluid-6">
          {hasWhatYouWillFind ? (
            <motion.article
              className="relative overflow-hidden rounded-[2rem] border border-(--primary-shades-03)/12 bg-linear-to-br from-(--primary-shades-04)/10 via-(--white-shades-01) to-(--secondary-shades-08)/12 p-fluid-5 shadow-[0_22px_64px_rgba(34,27,79,0.12)]"
              {...fadeUp(0.06, 30, 0.72)}
              whileHover={{ y: -4, scale: 1.005 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setMaskMode("cta")}
              onMouseLeave={() => setMaskMode("none")}
              onFocus={() => setMaskMode("cta")}
              onBlur={() => setMaskMode("none")}
            >
              <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-36 w-36 rounded-full bg-(--secondary-shades-09)/18 blur-[92px]" />
              {content.whatYouWillFind?.title ? (
                <h2 className="relative z-10 mb-fluid-4 text-fluid-xl font-semibold leading-[1.6] text-(--secondary-shades-08)">
                  {content.whatYouWillFind.title}
                </h2>
              ) : null}
              {content.whatYouWillFind?.intro ? (
                <p className="relative z-10 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
                  {content.whatYouWillFind.intro}
                </p>
              ) : null}

              {(content.whatYouWillFind?.topics?.length ?? 0) > 0 ? (
                <div className="relative z-10 mt-fluid-4 space-y-fluid-4">
                  {content.whatYouWillFind?.topics?.map((topic, index) => (
                    <motion.div
                      key={topic.title}
                      className="border-b border-(--primary-shades-03)/12 pb-fluid-3"
                      {...fadeUp(0.1 + index * 0.05, 18, 0.54)}
                    >
                      <h3 className="flex items-center gap-2 font-poppins text-fluid-lg font-semibold text-(--primary-shades-03)">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-(--secondary-shades-08)" />
                        <span>{topic.title}</span>
                      </h3>
                      <p className="mt-2 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">{topic.description}</p>
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </motion.article>
          ) : null}

          {insightSlides.length > 0 ? (
            <motion.article
              className="relative overflow-hidden rounded-[2rem] border border-(--primary-shades-03)/12 bg-linear-to-br from-(--primary-shades-04)/10 via-(--white-shades-01) to-(--secondary-shades-08)/12 p-fluid-5 shadow-[0_22px_64px_rgba(34,27,79,0.12)]"
              {...fadeUp(0.1, 30, 0.72)}
              whileHover={{ y: -4, scale: 1.005 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setMaskMode("cta")}
              onMouseLeave={() => setMaskMode("none")}
              onFocus={() => setMaskMode("cta")}
              onBlur={() => setMaskMode("none")}
            >
              <div className="pointer-events-none absolute bottom-[-18%] right-[-10%] h-36 w-36 rounded-full bg-(--secondary-shades-08)/18 blur-[92px]" />
              <div className="relative z-10 mb-fluid-4 flex items-center justify-between gap-3">
                <SliderNav
                  tone="dark"
                  activeIndex={activeSlideIndex}
                  length={insightSlides.length}
                  onPrev={() => setActiveSlideIndex((current) => Math.max(0, current - 1))}
                  onNext={() =>
                    setActiveSlideIndex((current) =>
                      Math.min(insightSlides.length - 1, current + 1),
                    )
                  }
                  canGoPrev={canGoPrev}
                  canGoNext={canGoNext}
                />
                <p className="text-[11px] font-medium tracking-[0.24em] text-(--primary-shades-03)/55">
                  {String(activeSlideIndex + 1).padStart(2, "0")} /{" "}
                  {String(insightSlides.length).padStart(2, "0")}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {currentInsightSlide ? (
                  <motion.div
                    key={`${currentInsightSlide.title ?? "slide"}-${activeSlideIndex}`}
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -26 }}
                    transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10"
                  >
                    {currentInsightSlide.title ? (
                      <h2 className="mb-fluid-4 text-fluid-xl font-semibold leading-[1.6] text-(--secondary-shades-08)">
                        {currentInsightSlide.title}
                      </h2>
                    ) : null}
                    {currentInsightSlide.intro ? (
                      <p className="text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
                        {currentInsightSlide.intro}
                      </p>
                    ) : null}
                    {currentInsightSlide.pointsTitle ? (
                      <h3 className="mt-fluid-4 text-fluid-lg font-semibold leading-[1.6] text-(--primary-shades-03)">
                        {currentInsightSlide.pointsTitle}
                      </h3>
                    ) : null}
                    {(currentInsightSlide.points?.length ?? 0) > 0 ? (
                      <ul className="mt-fluid-3 space-y-2 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
                        {currentInsightSlide.points?.map((point) => (
                          <li key={point} className="flex items-center gap-2">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-(--secondary-shades-08)" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {currentInsightSlide.closing ? (
                      <p className="mt-fluid-3 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
                        {currentInsightSlide.closing}
                      </p>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.article>
          ) : null}

        </div>
      </Container>
    </motion.section>
  );
}

export default BlogContentSections;
