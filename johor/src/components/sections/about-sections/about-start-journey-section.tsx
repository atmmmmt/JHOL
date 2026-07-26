import { motion } from "framer-motion";
import type { AboutHeroContent } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import { useLiveSection } from "../../../lib/use-live-image";
import CtaLinkButton from "../../common/cta-link-button";
import Container from "../../common/container";
import { useCursorMask } from "../../common/cursor-mask-context";
import { PartnerBadges } from "../../common/partner-badges";

type StartJourneyContent = {
  startJourney?: AboutHeroContent["startJourney"];
};

type JourneyContent = {
  title?: string;
  intro?: string;
  points?: string[];
  closing?: string;
  cta?: string;
};

type AboutStartJourneySectionProps<T extends object> = {
  content: T & StartJourneyContent;
  journey?: JourneyContent;
  showBottomImage?: boolean;
  sectionKey?: string;
  journeyKey?: string;
};

function splitIntroToTwoLines(intro: string) {
  const normalizedIntro = intro.trim();
  const colonIndex = normalizedIntro.indexOf(":");

  if (colonIndex !== -1 && colonIndex < normalizedIntro.length - 1) {
    return {
      firstLine: normalizedIntro.slice(0, colonIndex + 1).trim(),
      secondLine: normalizedIntro.slice(colonIndex + 1).trim(),
    };
  }

  const words = normalizedIntro.split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    return { firstLine: normalizedIntro, secondLine: "" };
  }

  const splitIndex = Math.ceil(words.length / 2);
  return {
    firstLine: words.slice(0, splitIndex).join(" "),
    secondLine: words.slice(splitIndex).join(" "),
  };
}

function AboutStartJourneySection<T extends object>({
  content,
  journey,
  showBottomImage = true,
  sectionKey,
  journeyKey,
}: AboutStartJourneySectionProps<T>) {
  const { setMaskMode } = useCursorMask();
  const liveFooter = useLiveSection("footer_content", { partnerLogos: [] });
  const liveContent = useLiveSection(sectionKey ?? "__disabled__", content);
  const liveJourneyCandidate =
    journeyKey &&
    liveContent &&
    typeof liveContent === "object" &&
    journeyKey in liveContent
      ? (liveContent as Record<string, unknown>)[journeyKey]
      : undefined;
  const journeyContent = (journey ??
    (liveJourneyCandidate as JourneyContent | undefined) ??
    (liveContent as StartJourneyContent).startJourney) as JourneyContent | undefined;
  const hasStartJourney =
    !!journeyContent?.title ||
    !!journeyContent?.intro ||
    (journeyContent?.points?.length ?? 0) > 0 ||
    !!journeyContent?.closing ||
    !!journeyContent?.cta;
  const arrowAnimationDuration = 1.7;
  const arrowAnimationStagger = 0.24;

  if (!hasStartJourney) {
    return null;
  }

  return (
    <section className="h-auto bg-(--white-shades-01) py-fluid-8 text-white">
      <Container>
        <motion.article
          dir="rtl"
          className="relative h-auto rounded-[2rem] border border-white/22 bg-(--primary-shades-02) px-5 py-6 shadow-[0_24px_72px_rgba(34,27,79,0.14)] max-sm:px-4 max-sm:py-5 sm:px-fluid-4 sm:py-fluid-5 lg:px-fluid-6"
          {...fadeUp(0.1, 36, 0.75)}
          onMouseEnter={() => setMaskMode("cta")}
          onMouseLeave={() => setMaskMode("none")}
          onFocus={() => setMaskMode("cta")}
          onBlur={() => setMaskMode("none")}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
            <div className="absolute -top-24 right-[34%] h-64 w-64 rounded-full bg-(--secondary-shades-08)/16 blur-[90px]" />
            <div className="absolute -bottom-24 left-[20%] h-64 w-64 rounded-full bg-(--secondary-shades-09)/14 blur-[95px]" />
          </div>

          <div className="relative z-10 grid h-auto gap-8 [direction:ltr] max-sm:[direction:rtl] max-sm:gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-x-fluid-6 xl:gap-x-fluid-4">
            <div className="order-2 flex flex-col items-end text-right lg:order-1 max-sm:items-start">
              {journeyContent?.intro
                ? (() => {
                    const { firstLine, secondLine } = splitIntroToTwoLines(journeyContent.intro);
                    return (
                      <p
                        dir="rtl"
                        className="ml-auto mr-0 max-w-[28rem] border-b border-(--secondary-shades-08)/55 pb-4 text-[clamp(1.7rem,7.4vw,2.3rem)] font-semibold leading-[1.35] text-white/92 max-sm:max-w-none max-sm:pb-3 max-sm:text-right max-sm:text-[1.6rem] max-sm:leading-[1.35]"
                      >
                        {firstLine}
                        {secondLine ? <><br />{secondLine}</> : null}
                      </p>
                    );
                  })()
                : null}

              {(journeyContent?.points?.length ?? 0) > 0 ? (
                <ul
                  dir="rtl"
                  className="mt-5 ml-auto mr-0 max-w-[28rem] space-y-2.5 text-right text-fluid-base leading-[1.8] text-white/86 max-sm:mt-4 max-sm:max-w-none max-sm:space-y-2 max-sm:text-[0.95rem] max-sm:leading-[1.75]"
                >
                  {journeyContent?.points?.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-white"
                      />
                      <span className="flex-1" dir="rtl">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {journeyContent?.closing ? (
                <p
                  dir="rtl"
                  className="mt-5 ml-auto mr-0 max-w-[28rem] text-fluid-base leading-[1.9] text-white/84 max-sm:mt-4 max-sm:max-w-none max-sm:text-[1.08rem] max-sm:leading-[1.8]"
                >
                  {journeyContent.closing}
                </p>
              ) : null}
            </div>

            <div className="relative order-1 lg:order-2">
              <motion.div
                dir="rtl"
                className="pointer-events-none absolute left-[5%] top-[30%] z-0 hidden -translate-y-1/2 items-center justify-end lg:flex"
                animate={{ x: [0, -4, 0, 4, 0] }}
                transition={{ duration: 6.2, ease: "easeInOut", repeat: Infinity }}
              >
                {[0, 1, 2].map((item) => (
                  <motion.div
                    key={item}
                    className={`h-58 w-[10.5rem] ${item > 0 ? "-mr-10" : ""} ${
                      item === 0 ?
                           "   bg-linear-to-br from-(--secondary-shades-08)/80 to-(--secondary-shades-09)/80"
                        : item === 1
                          ? "bg-linear-to-br from-(--secondary-shades-08)/76 to-(--secondary-shades-09)/66"
                          : "   bg-linear-to-br from-(--secondary-shades-08)/80 to-(--secondary-shades-09)/80"
                    }`}
                    style={{
                      clipPath:
                        "polygon(72% 0%, 100% 24%, 62% 50%, 100% 76%, 72% 100%, 0% 50%)",
                    }}
                    initial={{ opacity: 0.42 }}
                    animate={{ opacity: [0.42, 0.54, 0.68, 0.8, 0.68, 0.54, 0.42] }}
                    transition={{
                      duration: arrowAnimationDuration,
                      ease: "linear",
                      repeat: Infinity,
                      times: [0, 0.18, 0.34, 0.5, 0.66, 0.82, 1],
                      delay: item * arrowAnimationStagger,
                    }}
                  />
                ))}
              </motion.div>

              <div className="relative z-10 ml-auto mr-0 flex flex-col items-end text-right max-sm:items-stretch">
                {journeyContent?.title ? (
                  <h2 className="text-[clamp(2.2rem,10vw,3.8rem)] font-semibold leading-[1.08] text-(--secondary-shades-08) max-sm:text-center max-sm:text-[1.85rem] max-sm:leading-[1.2]">
                    {journeyContent.title}
                  </h2>
                ) : null}

                {journeyContent?.cta ? (
                  <div className="my-5 flex w-full justify-end max-sm:justify-center">
                    <motion.div
                      whileHover={{ x: -2 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full max-w-full sm:w-fit"
                    >
                      <CtaLinkButton
                        href="/contact"
                        label={journeyContent.cta}
                        surface="dark"
                        hoverMatchDot
                        truncateLabel={false}
                        linkClassName="w-full max-w-full sm:w-auto lg:max-w-[34rem]"
                        shellClassName="max-w-full whitespace-normal max-sm:min-h-[3rem] max-sm:w-full"
                        labelClassName="w-full text-right leading-[1.35] max-sm:pr-2 max-sm:text-[1rem]"
                      />
                    </motion.div>
                  </div>
                ) : null}

                {showBottomImage ? (
                  <PartnerBadges
                    logos={liveFooter.partnerLogos}
                    className="mt-5 ml-auto mr-0 grid w-full max-w-[22rem] grid-cols-2 gap-3 max-sm:mt-4 max-sm:max-w-none max-sm:gap-2.5"
                    itemClassName="flex min-w-0 items-center justify-center rounded-[1rem] border border-white/14 bg-white/2 px-3 py-2 max-sm:min-h-[5rem] max-sm:px-2.5 max-sm:py-1.5"
                    imageClassName="h-auto max-h-14 w-full max-w-[158px] object-contain max-sm:max-h-11 max-sm:max-w-[130px]"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </motion.article>
      </Container>
    </section>
  );
}

export default AboutStartJourneySection;
