import { motion } from "framer-motion";
import {
  BarChart3,
  BriefcaseBusiness,
  Compass,
  Quote,
  Sparkles,
} from "lucide-react";
import type { WorksHeroContent } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";

type WorksContentSectionsProps = {
  content: WorksHeroContent;
};

function splitTitleToTwoLines(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { firstLine: title, secondLine: "" };
  }

  const splitIndex = Math.ceil(words.length / 2);
  return {
    firstLine: words.slice(0, splitIndex).join(" "),
    secondLine: words.slice(splitIndex).join(" "),
  };
}

const safeFadeUp = (delay = 0, distance = 40, duration = 0.75) => ({
  ...fadeUp(delay, distance, duration),
  viewport: { once: true, amount: 0.15 },
});

function WorksContentSections({ content }: WorksContentSectionsProps) {
  const hasHowWeWork =
    !!content.howWeWork?.title ||
    !!content.howWeWork?.intro ||
    (content.howWeWork?.steps?.length ?? 0) > 0;
  const hasRealResults =
    !!content.realResults?.title ||
    !!content.realResults?.intro ||
    (content.realResults?.points?.length ?? 0) > 0 ||
    !!content.realResults?.closing;
  const hasProjectDomains =
    !!content.projectDomains?.title ||
    !!content.projectDomains?.intro ||
    (content.projectDomains?.points?.length ?? 0) > 0 ||
    !!content.projectDomains?.closing;
  const hasSuccessStory =
    !!content.successStory?.title ||
    (content.successStory?.paragraphs?.length ?? 0) > 0;

  if (
    !hasHowWeWork &&
    !hasRealResults &&
    !hasProjectDomains &&
    !hasSuccessStory
  ) {
    return null;
  }

  return (
    <motion.section
      className="bg-white py-fluid-8 text-(--primary-shades-03)"
      {...safeFadeUp(0, 40, 0.7)}
    >
      <Container>
        <div dir="rtl" className="space-y-fluid-6">
          {hasHowWeWork ? (
            <motion.article
              className="relative min-h-[72svh] border-b border-(--primary-shades-03)/10 py-fluid-7"
              {...safeFadeUp(0.06, 30, 0.72)}
            >
              <div className="relative z-10 grid gap-fluid-8 lg:grid-cols-[clamp(340px,40vw,560px)_minmax(0,1fr)] lg:items-start">
                <div className="lg:sticky lg:top-fluid-4 lg:self-start">
                  {content.howWeWork?.title ? (
                    <div className="mb-fluid-3 flex items-center gap-3">
                      <motion.span
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--secondary-shades-08)/26 bg-(--secondary-shades-08)/10 text-(--secondary-shades-08)"
                        animate={{ y: [0, -2, 0], rotate: [0, 2, 0, -2, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Compass className="h-5 w-5" strokeWidth={1.9} />
                      </motion.span>
                      {(() => {
                        const { firstLine, secondLine } = splitTitleToTwoLines(
                          content.howWeWork.title,
                        );
                        return (
                          <h2 className="inline-block max-w-full text-fluid-2xl font-semibold leading-[1.35] text-(--secondary-shades-08) break-words whitespace-normal">
                            {firstLine}
                            {secondLine ? <><br />{secondLine}</> : null}
                          </h2>
                        );
                      })()}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-fluid-4">
                  {content.howWeWork?.intro ? (
                    <p className="text-fluid-xl leading-[1.9] text-(--primary-shades-03)">
                      {content.howWeWork.intro}
                    </p>
                  ) : null}
                  {(content.howWeWork?.steps?.length ?? 0) > 0 ? (
                    <div className="space-y-fluid-3">
                      {content.howWeWork?.steps?.map((step, index) => (
                        <motion.div
                          key={`${step.order}-${step.title}`}
                          className="border-b border-(--primary-shades-03)/10 pb-fluid-3"
                          {...safeFadeUp(0.1 + index * 0.05, 18, 0.54)}
                        >
                          <h3 className="font-poppins text-fluid-xl font-semibold text-(----primary-shades-03)">
                            {step.order}. {step.title}
                          </h3>
                          <p className="mt-2 text-fluid-lg leading-[1.9] text-(--primary-shades-03)">
                            {step.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.article>
          ) : null}

          {hasRealResults ? (
            <motion.article
              className="relative min-h-[72svh] border-b border-(--primary-shades-03)/10 py-fluid-7"
              {...safeFadeUp(0.1, 30, 0.72)}
            >
              <div className="relative z-10 grid gap-fluid-8 lg:grid-cols-[clamp(340px,40vw,560px)_minmax(0,1fr)] lg:items-start">
                <div className="lg:sticky lg:top-fluid-4 lg:self-start">
                  {content.realResults?.title ? (
                    <div className="mb-fluid-3 flex items-center gap-3">
                      <motion.span
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--secondary-shades-08)/26 bg-(--secondary-shades-08)/10 text-(--secondary-shades-08)"
                        animate={{ y: [0, -2, 0], scale: [1, 1.03, 1] }}
                        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <BarChart3 className="h-5 w-5" strokeWidth={1.9} />
                      </motion.span>
                      {(() => {
                        const { firstLine, secondLine } = splitTitleToTwoLines(
                          content.realResults.title,
                        );
                        return (
                          <h2 className="inline-block max-w-full text-fluid-2xl font-semibold leading-[1.35] text-(--secondary-shades-08) break-words whitespace-normal">
                            {firstLine}
                            {secondLine ? <><br />{secondLine}</> : null}
                          </h2>
                        );
                      })()}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-fluid-4">
                  {content.realResults?.intro ? (
                    <p className="text-fluid-xl leading-[1.9] text-(--primary-shades-03)/82">
                      {content.realResults.intro}
                    </p>
                  ) : null}
                  {(content.realResults?.points?.length ?? 0) > 0 ? (
                    <ul className="space-y-2 text-fluid-lg leading-[1.95] text-(--primary-shades-03)/82">
                      {content.realResults?.points?.map((point, index) => (
                        <motion.li
                          key={point}
                          className="flex items-center gap-2"
                          {...safeFadeUp(0.13 + index * 0.04, 14, 0.5)}
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-(----primary-shades-03)" />
                          <span>{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : null}
                  {content.realResults?.closing ? (
                    <p className="text-fluid-xl leading-[1.9] text-(--primary-shades-03)/82">
                      {content.realResults.closing}
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.article>
          ) : null}

          {hasProjectDomains ? (
            <motion.article
              className="relative min-h-[72svh] border-b border-(--primary-shades-03)/10 py-fluid-7"
              {...safeFadeUp(0.14, 30, 0.72)}
            >
              <div className="relative z-10 grid gap-fluid-8 lg:grid-cols-[clamp(340px,40vw,560px)_minmax(0,1fr)] lg:items-start">
                <div className="lg:sticky lg:top-fluid-4 lg:self-start">
                  {content.projectDomains?.title ? (
                    <div className="mb-fluid-3 flex items-center gap-3">
                      <motion.span
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--secondary-shades-08)/26 bg-(--secondary-shades-08)/10 text-(--secondary-shades-08)"
                        animate={{ y: [0, -2, 0], rotate: [0, 2, 0, -2, 0] }}
                        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <BriefcaseBusiness className="h-5 w-5" strokeWidth={1.9} />
                      </motion.span>
                      {(() => {
                        const { firstLine, secondLine } = splitTitleToTwoLines(
                          content.projectDomains.title,
                        );
                        return (
                          <h2 className="inline-block max-w-full text-fluid-2xl font-semibold leading-[1.35] text-(--secondary-shades-08) break-words whitespace-normal">
                            {firstLine}
                            {secondLine ? <><br />{secondLine}</> : null}
                          </h2>
                        );
                      })()}
                    </div>
                  ) : null}
                </div>
                <div className="space-y-fluid-4">
                  {content.projectDomains?.intro ? (
                    <p className="text-fluid-xl leading-[1.9] text-(--primary-shades-03)/82">
                      {content.projectDomains.intro}
                    </p>
                  ) : null}
                  {(content.projectDomains?.points?.length ?? 0) > 0 ? (
                    <ul className="space-y-2 text-fluid-lg leading-[1.95] text-(--primary-shades-03)/82">
                      {content.projectDomains?.points?.map((point, index) => (
                        <motion.li
                          key={point}
                          className="flex items-center gap-2"
                          {...safeFadeUp(0.17 + index * 0.04, 12, 0.5)}
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-(----primary-shades-03)" />
                          {point}
                        </motion.li>
                      ))}
                    </ul>
                  ) : null}
                  {content.projectDomains?.closing ? (
                    <p className="text-fluid-xl leading-[1.9] text-(--primary-shades-03)/82">
                      {content.projectDomains.closing}
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.article>
          ) : null}

          {hasSuccessStory ? (
            <motion.article
              className="relative overflow-hidden rounded-[2rem] border border-(--primary-shades-03)/12 bg-white p-fluid-5 shadow-[0_22px_64px_rgba(34,27,79,0.12)]"
              {...safeFadeUp(0.18, 30, 0.72)}
              whileHover={{ y: -4, scale: 1.005 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pointer-events-none absolute right-[-10%] top-[-16%] h-36 w-36 rounded-full bg-(--secondary-shades-08)/10 blur-[90px]" />
              {content.successStory?.title ? (
                <div className="relative z-10 mb-fluid-4 flex items-center gap-3">
                  <motion.span
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--secondary-shades-08)/26 bg-(--secondary-shades-08)/10 text-(--secondary-shades-08)"
                    animate={{ y: [0, -2, 0], scale: [1, 1.03, 1] }}
                    transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="h-5 w-5" strokeWidth={1.9} />
                  </motion.span>
                  <h2 className="text-fluid-xl font-semibold leading-[1.6] text-(--secondary-shades-08)">
                    {content.successStory.title}
                  </h2>
                </div>
              ) : null}
              {(content.successStory?.paragraphs?.length ?? 0) > 0 ? (
                <motion.blockquote
                  className="relative z-10 mt-fluid-2 rounded-[1.4rem] border border-(--primary-shades-03)/10 bg-(----primary-shades-03)/4 px-fluid-5 py-fluid-6"
                  {...safeFadeUp(0.2, 16, 0.52)}
                >
                  <span className="pointer-events-none absolute right-fluid-3 top-fluid-1 text-(--secondary-shades-08)/28">
                    <Quote className="h-10 w-10" strokeWidth={2.2} />
                  </span>
                  <span className="pointer-events-none absolute bottom-fluid-1 left-fluid-3 text-(--secondary-shades-08)/28">
                    <Quote className="h-10 w-10 rotate-180" strokeWidth={2.2} />
                  </span>
                  <div className="space-y-fluid-3 border-r-3 border-(--secondary-shades-08)/45 pr-fluid-5">
                    {content.successStory?.paragraphs?.map((paragraph, index) => (
                      <motion.p
                        key={paragraph}
                        className="text-fluid-base leading-[1.95] text-(--primary-shades-03)/82"
                        {...safeFadeUp(0.2 + index * 0.05, 14, 0.5)}
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>
                </motion.blockquote>
              ) : null}
            </motion.article>
          ) : null}
        </div>
      </Container>
    </motion.section>
  );
}

export default WorksContentSections;
