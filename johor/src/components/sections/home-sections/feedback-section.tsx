import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { HomeFeedbackContent } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import SliderNav from "../../ui/slider-nav";

const sliderTransition = {
  duration: 0.85,
  ease: [0.22, 1, 0.36, 1] as const,
};

type FeedbackAccent = "teal" | "coral" | "violet";

type FeedbackCardItem = {
  accent: FeedbackAccent;
  company: string;
  id: string;
  name: string;
  quote: string;
  role: string;
};

const FEEDBACK_ACCENTS: FeedbackAccent[] = ["teal", "coral", "violet"];

const accentStyles: Record<
  FeedbackAccent,
  {
    badgeClass: string;
    glowClass: string;
    iconClass: string;
    lineClass: string;
    starClass: string;
  }
> = {
  teal: {
    badgeClass: "bg-(--secondary-shades-09)/14 text-(--secondary-shades-09)",
    glowClass: "bg-(--secondary-shades-09)/18",
    iconClass: "text-(--secondary-shades-09)",
    lineClass:
      "from-(--secondary-shades-09)/70 via-(--primary-shades-04)/22 to-transparent",
    starClass: "text-(--secondary-shades-09)",
  },
  coral: {
    badgeClass: "bg-(--secondary-shades-08)/14 text-(--secondary-shades-08)",
    glowClass: "bg-(--secondary-shades-08)/18",
    iconClass: "text-(--secondary-shades-08)",
    lineClass:
      "from-(--secondary-shades-08)/70 via-(--primary-shades-04)/22 to-transparent",
    starClass: "text-(--secondary-shades-08)",
  },
  violet: {
    badgeClass: "bg-(--primary-shades-04)/18 text-(--primary-shades-04)",
    glowClass: "bg-(--primary-shades-04)/20",
    iconClass: "text-(--primary-shades-04)",
    lineClass:
      "from-(--primary-shades-04)/70 via-(--secondary-shades-09)/18 to-transparent",
    starClass: "text-(--primary-shades-04)",
  },
};

function FeedbackSection({ content }: { content: HomeFeedbackContent }) {
  const feedbacks = content.items.map<FeedbackCardItem>((item, index) => ({
    accent: FEEDBACK_ACCENTS[index % FEEDBACK_ACCENTS.length],
    company: item.company,
    id: `${item.name}-${index}`,
    name: item.name,
    quote: item.quote,
    role: item.role,
  }));
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = feedbacks.length;
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(window.innerWidth >= 1024 ? 2 : 1);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = useMemo(
    () => Math.max(0, feedbacks.length - itemsPerView),
    [feedbacks.length, itemsPerView],
  );
  const clampedIndex = Math.min(activeIndex, maxIndex);

  const canGoPrev = clampedIndex > 0;
  const canGoNext = clampedIndex < maxIndex;

  const goPrev = useCallback(() => {
    setActiveIndex((current) => Math.max(0, Math.min(current, maxIndex) - 1));
  }, [maxIndex]);

  const goNext = useCallback(() => {
    setActiveIndex((current) => Math.min(maxIndex, Math.min(current, maxIndex) + 1));
  }, [maxIndex]);

  return (
    <section className="relative isolate overflow-hidden bg-(--white-shades-01) py-fluid-8 text-(--primary-shades-03)">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[12%] h-[19rem] w-[19rem] rounded-full bg-(--secondary-shades-08)/8 blur-[135px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[20rem] w-[20rem] rounded-full bg-(--secondary-shades-09)/8 blur-[140px]" />
      </div>

      <Container className="relative z-10">
        <motion.div
          className="mb-fluid-6 flex flex-wrap items-center justify-between gap-fluid-4"
          {...fadeUp(0.04, 28, 0.72)}
        >
          <div className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-(--primary-shades-03)/62">
            <span className="h-2 w-2 rounded-full bg-(--secondary-shades-08)" />
            <span>{content.label}</span>
          </div>

          <div className="h-px flex-1 bg-linear-to-l from-(--primary-shades-03)/12 to-transparent" />
        </motion.div>

        <motion.div {...fadeUp(0.08, 34, 0.8)}>
          <h2 className="font-poppins text-[clamp(1rem,7.4vw,5rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-(--primary-shades-03)">
            {content.title}
          </h2>

          <p className="mt-fluid-5 max-w-2xl text-fluid-lg leading-relaxed text-(--primary-shades-03)/62">
            {content.description}
          </p>
        </motion.div>

        <motion.div
          className="mt-fluid-5 flex items-center justify-between gap-fluid-4"
          {...fadeUp(0.1, 32, 0.8)}
        >
          <div className="text-fluid-sm text-(--primary-shades-03)/48">
            <span dir="ltr">
              {String(clampedIndex + 1).padStart(2, "0")} /{" "}
              {String(maxIndex + 1).padStart(2, "0")}
            </span>
          </div>

          <SliderNav
            tone="dark"
            onPrev={goPrev}
            onNext={goNext}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
          />
        </motion.div>

        <motion.div className="mt-fluid-4 overflow-hidden" {...fadeUp(0.12, 34, 0.85)} dir="ltr">
          <motion.div
            className="flex"
            dir="ltr"
            style={{ width: `${(totalSlides * 100) / itemsPerView}%` }}
            animate={{ x: `-${(clampedIndex * 100) / totalSlides}%` }}
            transition={sliderTransition}
          >
            {feedbacks.map((item) => {
              const accent = accentStyles[item.accent];

              return (
                <article
                  key={item.id}
                  className="relative shrink-0 p-fluid-2"
                  style={{
                    flex: `0 0 ${100 / totalSlides}%`,
                    width: `${100 / totalSlides}%`,
                  }}
                >
                  <motion.div
                    data-cursor-surface="dark"
                    dir="rtl"
                    className="group relative h-full overflow-hidden rounded-[2rem] border border-white/8 bg-(--primary-shades-02) p-fluid-5 text-white"
                    whileHover={{ scale: 1.01, y: -6 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className={`pointer-events-none absolute left-[-10%] top-[-12%] h-32 w-32 rounded-full blur-[100px] ${accent.glowClass}`}
                    />

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={`${item.id}-${starIndex}`}
                              className={`h-4 w-4 fill-current ${accent.starClass}`}
                              strokeWidth={1.6}
                            />
                          ))}
                        </div>

                        <div
                          className={`flex h-13 w-13 items-center justify-center rounded-[1rem] ${accent.badgeClass}`}
                        >
                          <Quote className={`h-6 w-6 ${accent.iconClass}`} />
                        </div>
                      </div>

                      <div className="mt-fluid-5 h-px w-full bg-linear-to-l from-white/18 to-transparent" />

                      <p className="mt-fluid-5 text-fluid-lg leading-[1.9] text-white/86">
                        "{item.quote}"
                      </p>

                      <div className={`mt-fluid-5 h-px w-full bg-linear-to-l ${accent.lineClass}`} />

                      <div className="mt-auto flex items-end justify-between gap-fluid-4 pt-fluid-5">
                        <div className="text-right">
                          <h3 className="font-poppins text-fluid-xl font-semibold text-white">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-fluid-sm text-white/62">
                            {item.role} - {item.company}
                          </p>
                        </div>

                        <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/38">
                          Feedback
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </article>
              );
            })}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

export default FeedbackSection;
