import { motion, useInView } from "framer-motion";
import { FolderOpen, Globe, ImageIcon, PenTool, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { HomeStatisticsContent } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";

type StatisticCardItem = {
  description: string;
  icon: LucideIcon;
  label: string;
  prefix?: string;
  value: number;
};

const STATISTIC_ICONS: LucideIcon[] = [FolderOpen, PenTool, Users];

function resolveStatisticIcon(label: string, fallbackIndex: number): LucideIcon {
  const normalized = label.toLowerCase();

  if (
    normalized.includes("Ø³ÙˆØ´ÙŠÙ„") ||
    normalized.includes("Ø³ÙˆØ´ÙŠØ§Ù„") ||
    normalized.includes("Ø³ÙˆØ´Ø§Ù„") ||
    normalized.includes("Ù…ÙŠØ¯ÙŠØ§")
  ) {
    return ImageIcon;
  }

  if (normalized.includes("Ù…ÙˆÙ‚Ø¹ ÙˆÙŠØ¨") || normalized.includes("ÙˆÙŠØ¨")) {
    return Globe;
  }

  return STATISTIC_ICONS[fallbackIndex % STATISTIC_ICONS.length];
}

const secondaryStyles = {
  cardClass:
    "border-(--primary-shades-03)/10 bg-white shadow-[0_24px_72px_rgba(34,27,79,0.08)]",
  dividerClass:
    "from-(--secondary-shades-09)/72 via-(--secondary-shades-08)/30 to-transparent",
  dotClass: "bg-(--secondary-shades-09)",
  glowClass: "bg-(--secondary-shades-09)/16",
  iconShellClass:
    "border-(--secondary-shades-09)/24 bg-(--secondary-shades-09)/12 text-(--secondary-shades-09)",
  valueClass: "text-(--secondary-shades-09)",
};

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function CountUpValue({
  value,
  prefix = "",
}: {
  value: number;
  prefix?: string;
}) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(valueRef, { amount: 0.7, once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    let frameId = 0;
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      setDisplayValue(Math.round(value * easedProgress));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isInView, value]);

  return (
    <span ref={valueRef}>
      {prefix}
      {displayValue}
    </span>
  );
}

function StatisticsSection({ content }: { content: HomeStatisticsContent }) {
  const statistics = content.items.map<StatisticCardItem>((item, index) => ({
    description: item.description,
    icon: resolveStatisticIcon(item.label, index),
    label: item.label,
    prefix: item.prefix,
    value: item.value,
  }));

  return (
    <section className="relative isolate overflow-hidden bg-(--white-shades-01) py-fluid-8 text-(--primary-shades-03)">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[10%] h-[20rem] w-[20rem] rounded-full bg-(--secondary-shades-08)/8 blur-[140px]" />
        <div className="absolute bottom-[0%] right-[-12%] h-[22rem] w-[22rem] rounded-full bg-(--secondary-shades-09)/8 blur-[145px]" />
      </div>

      <Container className="relative z-10">
        <motion.div
          className="mb-fluid-6 flex flex-wrap items-center justify-between gap-fluid-4"
          {...fadeUp(0.04, 28, 0.72)}
        >
          <div className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-(--primary-shades-03)/62">
            <span className="h-2 w-2 rounded-full bg-(--secondary-shades-09)" />
            <span>{content.label}</span>
          </div>

          <div className="h-px flex-1 bg-linear-to-l from-(--primary-shades-03)/12 to-transparent" />
        </motion.div>

        <motion.div className="mb-fluid-6" {...fadeUp(0.08, 34, 0.8)}>
          <div>
            <h2 className="font-poppins text-[clamp(1rem,7.4vw,5rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-(--primary-shades-03)">
              {content.title}
            </h2>
          </div>

          <p className="mt-fluid-5 max-w-2xl text-fluid-lg leading-relaxed text-(--primary-shades-03)/62">
            {content.description}
          </p>
        </motion.div>

        <div className="grid gap-fluid-4 md:grid-cols-2 xl:grid-cols-3">
          {statistics.map((item, index) => {
            const tone = secondaryStyles;
            const Icon = item.icon;

            return (
              <motion.article
                key={`${item.label}-${index}`}
                className={`group relative overflow-hidden rounded-[2rem] p-fluid-5 backdrop-blur-sm ${tone.cardClass}`}
                {...fadeUp(0.12 + index * 0.08, 38, 0.78)}
                whileHover={{ scale: 1.015, y: -6 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className={`pointer-events-none absolute left-[-10%] top-[-15%] h-32 w-32 rounded-full blur-[90px] ${tone.glowClass}`}
                />

                <div className="relative z-10 flex h-full flex-col gap-fluid-5">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-15 w-15 items-center justify-center rounded-[1.15rem] border ${tone.iconShellClass}`}
                    >
                      <Icon className="h-7 w-7" strokeWidth={1.8} />
                    </div>

                    <span className={`mt-2 h-2.5 w-2.5 rounded-full ${tone.dotClass}`} />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`h-px flex-1 bg-linear-to-l ${tone.dividerClass}`} />
                  </div>

                  <div className="space-y-3 text-right">
                    <div
                      className={`font-poppins text-[clamp(2.3rem,5vw,4.3rem)] font-semibold leading-none tracking-[-0.05em] ${tone.valueClass}`}
                    >
                      <CountUpValue value={item.value} prefix={item.prefix} />
                    </div>
                    <h3 className="font-poppins text-[clamp(1.05rem,2vw,1.55rem)] font-semibold leading-[1.35] text-(--primary-shades-03)">
                      {item.label}
                    </h3>
                  </div>

                  <p className="mt-auto max-w-[22rem] text-fluid-sm leading-[1.9] text-(--primary-shades-03)/62">
                    {item.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default StatisticsSection;
