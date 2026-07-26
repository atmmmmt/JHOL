import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Sparkles } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import type { AboutHeroContent } from "../../../../lib/api";
import messageCardImage from "../../../assets/images/message.png";
import visionCardImage from "../../../assets/images/vision.png";
import { cn } from "../../../lib/cn";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import { useCursorMask } from "../../common/cursor-mask-context";

type FlipInfoCardProps = {
  image: StaticImageData;
  imageAlt: string;
  title?: string;
  brandLine?: string;
  description?: string;
  startsWith?: string;
  points?: string[];
  closing?: string;
  accentClass: string;
  accentDotClass: string;
};

function FlipInfoCard({
  image,
  imageAlt,
  title,
  brandLine = "في جهــــــــــــــور",
  description,
  startsWith,
  points,
  closing,
  accentClass,
  accentDotClass,
}: FlipInfoCardProps) {
  const { setMaskMode } = useCursorMask();
  const [isFlippedMobile, setIsFlippedMobile] = useState(false);

  const handleMobileFlipToggle = () => {
    if (typeof window === "undefined") {
      return;
    }

    const isMobileOrTouch = window.matchMedia(
      "(max-width: 1023px), (pointer: coarse)",
    ).matches;

    if (!isMobileOrTouch) {
      return;
    }

    setIsFlippedMobile((current) => !current);
  };

  return (
    <motion.article
      className="group relative h-[clamp(480px,72vw,620px)] w-full max-w-[34rem] max-lg:cursor-auto cursor-none lg:h-[clamp(460px,56vw,620px)] [perspective:1800px]"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setMaskMode("cta")}
      onMouseLeave={() => setMaskMode("none")}
      onClick={handleMobileFlipToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleMobileFlipToggle();
        }
      }}
      onFocus={() => setMaskMode("cta")}
      onBlur={() => setMaskMode("none")}
      tabIndex={0}
    >
      <div
        className={cn(
          "relative h-full w-full [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[transform:rotateY(180deg)]",
          isFlippedMobile && "max-lg:[transform:rotateY(180deg)]",
        )}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[1.8rem] border border-(--primary-shades-03)/12 bg-(--white-shades-01) [backface-visibility:hidden] shadow-[0_24px_64px_rgba(34,27,79,0.14)]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 90vw, 520px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-(--primary-shades-02)/55 via-(--primary-shades-02)/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-fluid-4 text-right text-white">
            {title ? (
              <h3 className="font-poppins text-[clamp(1.9rem,4.6vw,3.2rem)] font-semibold leading-none tracking-[-0.03em]">
                {title}
              </h3>
            ) : null}
            <p className="mt-2 w-fit font-normal font-poppins text-[clamp(1.2rem,2.7vw,1.9rem)] font-medium leading-none tracking-[-0.01em] text-white/92">
              {brandLine}
            </p>
          </div>
        </div>

        <div
          dir="rtl"
          className="absolute inset-0 overflow-hidden rounded-[1.8rem] border border-(--primary-shades-03)/12 bg-(--white-shades-01) p-fluid-4 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-[0_24px_64px_rgba(34,27,79,0.12)]"
        >
          {title ? <h2 className={`text-fluid-xl font-semibold leading-[1.6] ${accentClass}`}>{title}</h2> : null}
          {description ? (
            <p className="mt-fluid-3 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">{description}</p>
          ) : null}
          {startsWith ? (
            <p className="mt-fluid-3 text-fluid-base font-semibold leading-[1.9] text-(--primary-shades-03)">
              {startsWith}
            </p>
          ) : null}
          {(points?.length ?? 0) > 0 ? (
            <ul className="mt-fluid-3 space-y-2 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
              {points?.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${accentDotClass}`} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {closing ? (
            <p className="mt-fluid-3 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">{closing}</p>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

type AboutCoreSectionProps = {
  content: AboutHeroContent;
  showMissionVision?: boolean;
  showWhyChoose?: boolean;
};

function AboutCoreSection({
  content,
  showMissionVision = true,
  showWhyChoose = true,
}: AboutCoreSectionProps) {
  const { setMaskMode } = useCursorMask();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const hasMission =
    !!content.mission?.title ||
    !!content.mission?.description ||
    (content.mission?.points?.length ?? 0) > 0;
  const hasVision =
    !!content.vision?.title ||
    !!content.vision?.description ||
    (content.vision?.points?.length ?? 0) > 0;
  const hasWhyChoose =
    !!content.whyChoose?.title ||
    !!content.whyChoose?.intro ||
    (content.whyChoose?.reasons?.length ?? 0) > 0 ||
    (content.whyChoose?.results?.length ?? 0) > 0;

  const shouldShowMission = showMissionVision && hasMission;
  const shouldShowVision = showMissionVision && hasVision;
  const shouldShowWhyChoose = showWhyChoose && hasWhyChoose;
  const whyChooseFaqItems = [
    ...(content.whyChoose?.reasons?.map((reason) => ({
      answer: reason.description,
      question: reason.title,
      results: [] as string[],
    })) ?? []),
    ...((content.whyChoose?.resultsTitle || (content.whyChoose?.results?.length ?? 0) > 0)
      ? [
          {
            answer: "",
            question: content.whyChoose?.resultsTitle ?? "نتائج قابلة للقياس",
            results: content.whyChoose?.results ?? [],
          },
        ]
      : []),
  ];

  if (!shouldShowMission && !shouldShowVision && !shouldShowWhyChoose) {
    return null;
  }

  return (
    <section className="bg-(--white-shades-01) pb-fluid-8 text-(--primary-shades-03) overflow-x-hidden">
      <Container>
        <div dir="rtl" className="space-y-fluid-6">
          {shouldShowMission || shouldShowVision ? (
            <div className="grid gap-fluid-4 lg:grid-cols-2 lg:items-start">
              {shouldShowMission ? (
                <motion.article
                  className="relative p-fluid-2 lg:pr-0 lg:flex lg:justify-start"
                  {...fadeUp(0.06, 30, 0.72)}
                >
                  <FlipInfoCard
                    image={messageCardImage}
                    imageAlt="رسالة جهور"
                    title={content.mission?.title}
                    brandLine="في جهــــــــــــــور"
                    description={content.mission?.description}
                    startsWith={content.mission?.startsWith}
                    points={content.mission?.points}
                    closing={content.mission?.closing}
                    accentClass="text-(--secondary-shades-08)"
                    accentDotClass="bg-(--secondary-shades-08)"
                  />
                </motion.article>
              ) : null}

              {shouldShowVision ? (
                <motion.article
                  className="relative p-fluid-2 lg:pl-0 lg:flex lg:justify-end"
                  {...fadeUp(0.12, 30, 0.72)}
                >
                  <FlipInfoCard
                    image={visionCardImage}
                    imageAlt="رؤية جهور"
                    title={content.vision?.title}
                    brandLine="في جهــور"
                    description={content.vision?.description}
                    startsWith={content.vision?.startsWith}
                    points={content.vision?.points}
                    closing={content.vision?.closing}
                    accentClass="text-(--secondary-shades-09)"
                    accentDotClass="bg-(--secondary-shades-09)"
                  />
                </motion.article>
              ) : null}
            </div>
          ) : null}

          {shouldShowWhyChoose ? (
            <motion.article
              className="relative p-fluid-2"
              {...fadeUp(0.16, 34, 0.74)}
            >
              {content.whyChoose?.title ? (
                <motion.div
                  className="relative z-10 mb-fluid-4 flex items-center gap-3"
                  {...fadeUp(0.18, 20, 0.58)}
                >
                  <motion.span
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-(--secondary-shades-08)"
                    animate={{ y: [0, -3, 0], rotate: [0, 3, 0, -3, 0] }}
                    transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="h-5 w-5" strokeWidth={1.9} />
                  </motion.span>
                  <h2 className="text-fluid-xl font-semibold leading-[1.6] text-(--secondary-shades-08)">{content.whyChoose.title}</h2>
                </motion.div>
              ) : null}
              {content.whyChoose?.intro ? (
                <p className="relative z-10 mt-fluid-3 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">{content.whyChoose.intro}</p>
              ) : null}

              {whyChooseFaqItems.length > 0 ? (
                <motion.div
                  className="relative z-10 mt-fluid-5"
                  {...fadeUp(0.22, 24, 0.62)}
                >
                  {whyChooseFaqItems.map((faqItem, index) => {
                    const isOpen = openFaqIndex === index;

                    return (
                      <div
                        key={`${faqItem.question}-${index}`}
                        onMouseEnter={() => setMaskMode("cta")}
                        onMouseLeave={() => setMaskMode("none")}
                        className="max-lg:cursor-auto cursor-none overflow-hidden border-b border-(--primary-shades-03)/12"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenFaqIndex((current) =>
                              current === index ? -1 : index,
                            )
                          }
                          onFocus={() => setMaskMode("cta")}
                          onBlur={() => setMaskMode("none")}
                          className="flex w-full items-center justify-between gap-3 px-fluid-4 py-fluid-3 text-right"
                        >
                          <span className="font-poppins text-fluid-xl font-semibold text-(--primary-shades-03)">
                            {faqItem.question}
                          </span>
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-(--secondary-shades-08)">
                            {isOpen ? (
                              <Minus className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                            >
                              <div className="px-fluid-4 pb-fluid-4 pt-fluid-1 text-fluid-lg leading-[1.85] text-(--primary-shades-03)/80">
                                {faqItem.answer ? <p>{faqItem.answer}</p> : null}
                                {(faqItem.results?.length ?? 0) > 0 ? (
                                  <ul className="mt-2 grid gap-2 md:grid-cols-2">
                                    {faqItem.results.map((result) => (
                                      <li key={result} className="flex items-center gap-2">
                                        <span className="h-2 w-2 shrink-0 rounded-full bg-(--secondary-shades-08)" />
                                        <span>{result}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              ) : null}
            </motion.article>
          ) : null}

        </div>
      </Container>
    </section>
  );
}

export default AboutCoreSection;
