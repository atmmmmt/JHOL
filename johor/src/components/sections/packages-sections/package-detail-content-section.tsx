import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type {
  PackageDetail,
  PackageDetailProcess,
  PackageDetailStep,
} from "../../../data/package-details";
import { cn } from "../../../lib/cn";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import CtaLinkButton from "../../common/cta-link-button";

type PackageDetailContentSectionProps = {
  detail: PackageDetail;
};

type AccentStyle = {
  dot: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  glowPrimary: string;
  glowSecondary: string;
  line: string;
  ring: string;
};

const ACCENT_STYLES: Record<string, AccentStyle> = {
  "package-1": {
    dot: "bg-(--secondary-shades-08)",
    badgeBg: "bg-(--secondary-shades-08)/12",
    badgeBorder: "border-(--secondary-shades-08)/28",
    badgeText: "text-(--secondary-shades-08)",
    glowPrimary: "bg-(--secondary-shades-08)/14",
    glowSecondary: "bg-(--primary-shades-04)/14",
    line: "from-(--secondary-shades-08)/66 via-(--primary-shades-04)/24 to-transparent",
    ring: "ring-(--secondary-shades-08)/24",
  },
  "package-2": {
    dot: "bg-(--primary-shades-04)",
    badgeBg: "bg-(--primary-shades-04)/16",
    badgeBorder: "border-(--primary-shades-04)/30",
    badgeText: "text-(--primary-shades-03)",
    glowPrimary: "bg-(--primary-shades-04)/16",
    glowSecondary: "bg-(--secondary-shades-08)/12",
    line: "from-(--primary-shades-04)/66 via-(--secondary-shades-08)/24 to-transparent",
    ring: "ring-(--primary-shades-04)/24",
  },
};

function ProcessStepRow({
  step,
  index,
  align,
  mobileTimelineLeft = false,
}: {
  step: PackageDetailStep;
  index: number;
  align: "left" | "right";
  mobileTimelineLeft?: boolean;
}) {
  return (
    <motion.li
      className={cn(
        "relative overflow-hidden lg:overflow-visible rounded-[1.2rem] border border-(--primary-shades-03)/12 bg-linear-to-br from-(--primary-shades-04)/10 via-(--white-shades-01) to-(--secondary-shades-08)/12 px-3 py-3 sm:px-fluid-4 sm:py-fluid-4 lg:w-[calc(50%-1.25rem)]",
        mobileTimelineLeft ? "ml-6 max-md:ml-6" : "",
        align === "right" ? "lg:mr-auto" : "lg:ml-auto",
      )}
      {...fadeUp(0.08 + index * 0.05, 24, 0.58)}
    >
      {/* Mobile: number badge inside card top-left */}
      <span className="lg:hidden absolute top-3 left-3 text-[1.5rem] font-bold leading-none text-(--secondary-shades-08)">
        {step.order.toString().padStart(2, "0")}
      </span>
      {/* Desktop: floating number above card */}
      <span className="hidden lg:block pointer-events-none absolute -top-25 z-20 font-semibold leading-none text-(--secondary-shades-08) text-[clamp(2.2rem,5vw,4.2rem)]">
        {step.order.toString().padStart(2, "0")}
      </span>

      <div className="relative z-10 min-w-0 text-right pl-10 lg:pl-0">
        <p className="text-fluid-lg font-semibold leading-[1.55] text-(--primary-shades-03)">
          {step.title}
        </p>
        {step.description ? (
          <p className="mt-1.5 text-fluid-base leading-[1.8] text-(--primary-shades-03)/74">
            {step.description}
          </p>
        ) : null}

        {step.link && step.link.trim() ? (
          <div className="mt-3 flex justify-start">
            <CtaLinkButton
              href={step.link.trim()}
              label={step.linkLabel?.trim() || "اعرف أكثر"}
              surface="dark"
              hoverMatchDot
              truncateLabel={false}
              openInNewTab
              shellClassName="bg-(--secondary-shades-08) text-white max-sm:min-h-10 max-sm:px-3 max-sm:py-2 max-sm:text-[0.8rem]"
            />
          </div>
        ) : null}
      </div>

    </motion.li>
  );
}

function ProcessLeadSection({
  process,
  accent,
}: {
  process: PackageDetailProcess;
  accent: AccentStyle;
}) {
  const processRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: processRef,
    offset: ["start 85%", "end 15%"],
  });

  const listY = useTransform(scrollYProgress, [0, 1], [24, -14]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start 88%", "end 30%"],
  });
  const timelineScaleY = useTransform(timelineProgress, [0, 1], [0.05, 1]);

  return (
    <motion.article
      dir="rtl"
      ref={processRef}
      className="relative overflow-hidden px-fluid-5 py-fluid-6 text-(--primary-shades-03)"
      {...fadeUp(0.06, 24, 0.66)}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            "absolute left-[-8%] top-[-15%] h-64 w-64 rounded-full blur-[120px]",
            accent.glowPrimary,
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-18%] right-[-12%] h-72 w-[19rem] rounded-full blur-[126px]",
            accent.glowSecondary,
          )}
        />
      </div>

      <motion.div className="relative z-10" style={{ y: listY }}>
        {(process.title || process.noticeText || process.stat) ? (
          <motion.div
            className="mb-fluid-7 px-fluid-4 pb-fluid-6 text-center"
            {...fadeUp(0.08, 22, 0.64)}
          >
            {process.title ? (
              <h2 className="text-[clamp(1.6rem,6vw,2.8rem)] font-semibold leading-[1.15] text-(--primary-shades-03)">
                {process.title}
              </h2>
            ) : null}
            {process.noticeText ? (
              <p className="mx-auto mt-4 max-w-3xl text-fluid-base leading-[1.85] text-(--primary-shades-03)/72">
                {process.noticeText}
                {process.stat ? (
                  <span className="mr-1 font-semibold text-(--secondary-shades-08)">
                    {" "}{process.stat}
                  </span>
                ) : null}
              </p>
            ) : null}
          </motion.div>
        ) : null}

        <div ref={timelineRef} className="relative">
          <div className={cn(
            "pointer-events-none absolute inset-y-3 left-1/2 z-20 w-px -translate-x-1/2 bg-(--secondary-shades-08)/20 lg:translate-x-2",
            "max-md:left-0 max-md:-translate-x-0.5",
          )} />
          <motion.div
            className={cn(
              "pointer-events-none absolute inset-y-3 left-1/2 z-20 w-[2px] -translate-x-1/2 origin-top bg-linear-to-b from-(--secondary-shades-08) to-(--primary-shades-04) lg:translate-x-2",
              "max-md:left-0 max-md:-translate-x-0.5",
            )}
            style={{ scaleY: timelineScaleY }}
          />

          <motion.ul
            className="grid gap-3.5 mt-fluid-5 max-md:mt-3"
            {...fadeUp(0.16, 18, 0.54)}
          >
            {process.steps.map((step, index) => (
              <ProcessStepRow
                key={`${step.order}-${step.title}`}
                step={step}
                index={index}
                align={index % 2 === 0 ? "right" : "left"}
                mobileTimelineLeft={true}
              />
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </motion.article>
  );
}

function DetailsListSection({
  detail,
  accent,
  delay,
}: {
  detail: PackageDetail;
  accent: AccentStyle;
  delay: number;
}) {
  

  return (
    <motion.article
      dir="rtl"
      className="rounded-[1.7rem] border border-(--primary-shades-03)/10 bg-white px-fluid-5 py-fluid-5 shadow-[0_20px_58px_rgba(34,27,79,0.08)]"
      {...fadeUp(delay, 24, 0.64)}
    >
      <h2 className="text-right text-[clamp(1.3rem,4.1vw,2.45rem)] font-semibold leading-[1.45] text-(--primary-shades-03)">
        {detail.title}
      </h2>

      <p className="mt-fluid-3 text-right text-fluid-base leading-[1.9] text-(--primary-shades-03)/78">
        {detail.description}
      </p>

      <ul className="mt-fluid-4 space-y-2.5">
        {detail.items.map((item, index) => (
          <motion.li
            key={item}
            className="flex items-start gap-2.5 rounded-xl border border-(--primary-shades-03)/10 bg-white px-3.5 py-3"
            {...fadeUp(delay + 0.05 + index * 0.03, 14, 0.48)}
          >
            <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", accent.dot)} />
            <span className="text-right text-fluid-base leading-[1.85] text-(--primary-shades-03)/80">
              {item}
            </span>
          </motion.li>
        ))}
      </ul>

      

      {detail.note ? (
        <p className="mt-fluid-4 text-right text-fluid-base leading-[1.85] text-(--primary-shades-03)/74">
          {detail.note}
        </p>
      ) : null}
    </motion.article>
  );
}

function PackageDetailContentSection({ detail }: PackageDetailContentSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const ambientY = useTransform(scrollYProgress, [0, 1], [46, -46]);
  const accent = ACCENT_STYLES[detail.id] ?? ACCENT_STYLES["package-1"];
  const processForDisplay = detail.process;

  return (
    <section
      ref={sectionRef}
      dir="rtl"
      className="relative isolate overflow-hidden bg-(--white-shades-01) py-fluid-8 text-(--primary-shades-03)"
    >
      <motion.div className="pointer-events-none absolute inset-0" style={{ y: ambientY }}>
        <div
          className={cn(
            "absolute left-[-10%] top-[10%] h-64 w-64 rounded-full blur-[108px]",
            accent.glowPrimary,
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-12%] right-[-10%] h-72 w-[18rem] rounded-full blur-[120px]",
            accent.glowSecondary,
          )}
        />
      </motion.div>

      <Container className="relative z-10 space-y-fluid-6">
        {processForDisplay ? (
          <ProcessLeadSection
            process={processForDisplay}
            accent={accent}
          />
        ) : null}

        {!processForDisplay ? (
          <DetailsListSection detail={detail} accent={accent} delay={0.08} />
        ) : null}
      </Container>
    </section>
  );
}

export default PackageDetailContentSection;
