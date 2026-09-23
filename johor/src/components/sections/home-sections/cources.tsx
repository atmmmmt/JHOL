import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import type { PackagesShowcaseContent } from "../../../../lib/api";
import packagesIcon from "../../../assets/images/packages.svg";
import secondPackageIcon from "../../../assets/images/هوية بصرية جهور.svg";
import { cn } from "../../../lib/cn";
import { fadeUp } from "../../../lib/motion";
import { useLiveSection } from "../../../lib/use-live-image";
import { useCursorMask } from "../../common/cursor-mask-context";
import CtaLinkButton from "../../common/cta-link-button";
import Container from "../../common/container";

type PackageAccent = "coral" | "teal";
type PackageSurface = "dark" | "light";

type PackageCardItem = {
  accent: PackageAccent;
  cta: string;
  ctaHref: string;
  description: string;
  id: string;
  icon: string;
  includes: string[];
  note?: string;
  surface: PackageSurface;
  title: string;
};

const PACKAGE_STYLES = {
  coral: {
    dot: "bg-(--secondary-shades-08)",
    glowPrimary: "rgba(238, 32, 77, 0.16)",
    glowSecondary: "rgba(160, 149, 208, 0.18)",
    line: "from-(--secondary-shades-08)/60 via-(--primary-shades-04)/25 to-transparent",
  },
  teal: {
    dot: "bg-(--secondary-shades-09)",
    glowPrimary: "rgba(238, 32, 77, 0.18)",
    glowSecondary: "rgba(238, 32, 77, 0.14)",
    line: "from-(--secondary-shades-09)/60 via-(--secondary-shades-08)/22 to-transparent",
  },
} as const;

type PackageTextContentProps = {
  accentDotClass: string;
  item: PackageCardItem;
  listY: MotionValue<number>;
  noteY: MotionValue<number>;
  surface: PackageSurface;
  titleY: MotionValue<number>;
};

function PackageTextContent({
  accentDotClass,
  item,
  listY,
  noteY,
  surface,
  titleY,
}: PackageTextContentProps) {
  const titleColorClass = surface === "dark" ? "text-white" : "text-(--primary-shades-03)";
  const bodyColorClass = surface === "dark" ? "text-white/72" : "text-(--primary-shades-03)/68";
  const listColorClass = surface === "dark" ? "text-white/84" : "text-(--primary-shades-03)/84";
  const noteColorClass = surface === "dark" ? "text-white/62" : "text-(--primary-shades-03)/58";
  const neutralBulletClass = surface === "dark" ? "bg-white/24" : "bg-(--primary-shades-03)/18";

  return (
    <>
      <motion.div className="max-w-[29rem] max-sm:text-center" style={{ y: titleY }}>
        <h3
          className={cn(
            "font-poppins text-[clamp(1.6rem,8vw,2.7rem)] font-semibold leading-[1.08] tracking-[-0.03em]",
            titleColorClass,
          )}
        >
          {item.title}
        </h3>

        <p className={cn("mt-fluid-4 text-fluid-base leading-[1.8]", bodyColorClass)}>
          {item.description}
        </p>
      </motion.div>

      <motion.ul className="mt-fluid-4 grid gap-2.5 max-sm:text-right" style={{ y: listY }}>
        {(item.includes ?? []).map((entry, entryIndex) => (
          <li key={entry} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full",
                entryIndex === 0 ? accentDotClass : neutralBulletClass,
              )}
            />
            <span className={cn("text-fluid-sm leading-[1.75]", listColorClass)}>
              {entry}
            </span>
          </li>
        ))}
      </motion.ul>

      {item.note ? (
        <motion.p
          className={cn("mt-fluid-4 max-w-[29rem] text-fluid-sm leading-[1.8]", noteColorClass)}
          style={{ y: noteY }}
        >
          {item.note}
        </motion.p>
      ) : null}
    </>
  );
}

function PackageCard({ item, index }: { item: PackageCardItem; index: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const { setMaskMode, courseMaskTargetRef } = useCursorMask();
  const { scrollYProgress } = useScroll({
    offset: ["start 92%", "end 18%"],
    target: cardRef,
  });
  const accent = PACKAGE_STYLES[item.accent];
  const direction = index % 2 === 0 ? 1 : -1;

  const cardY = useTransform(scrollYProgress, [0, 0.52, 1], [48, 0, -16]);
  const cardScale = useTransform(scrollYProgress, [0, 0.52, 1], [0.95, 1, 0.985]);
  const cardRotate = useTransform(
    scrollYProgress,
    [0, 0.52, 1],
    [direction * 0.9, 0, direction * -0.3],
  );
  const primaryGlowX = useTransform(
    scrollYProgress,
    [0, 1],
    [direction * 26, direction * -14],
  );
  const primaryGlowY = useTransform(scrollYProgress, [0, 1], [26, -16]);
  const secondaryGlowY = useTransform(scrollYProgress, [0, 1], [-18, 14]);
  const dividerScale = useTransform(scrollYProgress, [0, 0.45, 1], [0.7, 1, 1.02]);
  const titleY = useTransform(scrollYProgress, [0, 0.42, 1], [20, 0, -5]);
  const listY = useTransform(scrollYProgress, [0, 0.5, 1], [26, 0, -8]);
  const noteY = useTransform(scrollYProgress, [0, 0.58, 1], [30, 0, -10]);
  const ctaY = useTransform(scrollYProgress, [0, 0.55, 1], [34, 0, -10]);

  return (
    <motion.article
      ref={cardRef}
      data-cursor-surface={item.surface}
      className={cn(
        "group relative isolate overflow-hidden rounded-[1.5rem] border max-lg:cursor-auto cursor-none",
        item.surface === "dark"
          ? "border-white/10 bg-(--primary-shades-02) text-white"
          : "border-(--primary-shades-03)/10 bg-white/72 text-(--primary-shades-03)",
      )}
      onMouseEnter={(event) => {
        courseMaskTargetRef.current = event.currentTarget;
        setMaskMode("course");
      }}
      onMouseLeave={() => {
        courseMaskTargetRef.current = null;
        setMaskMode("none");
      }}
      {...fadeUp(0.12 + index * 0.08, 46, 0.82)}
      whileHover={{ scale: 1.03, y: -10 }}
    >
      <motion.div style={{ rotate: cardRotate, scale: cardScale, y: cardY }} className="h-full">
        <motion.div
          className="pointer-events-none absolute right-[-10%] top-[-10%] h-44 w-44 rounded-full blur-[95px]"
          style={{
            backgroundColor: accent.glowPrimary,
            x: primaryGlowX,
            y: primaryGlowY,
          }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-[-16%] left-[2%] h-32 w-32 rounded-full blur-[82px]"
          style={{
            backgroundColor: accent.glowSecondary,
            y: secondaryGlowY,
          }}
        />

        <div className="relative z-10 flex h-full flex-col p-[clamp(1.05rem,1.45vw,1.35rem)] sm:p-[clamp(1.2rem,1.7vw,1.7rem)]">
          <span
            className={cn(
              "flex h-18 w-18 items-center justify-center rounded-xl border p-2 max-md:mx-auto sm:h-22 sm:w-22",
              item.surface === "dark"
                ? "border-white/14 bg-white/8"
                : "border-(--primary-shades-03)/14 bg-(--primary-shades-03)/[0.04]",
            )}
          >
            <Image
              src={item.icon}
              alt=""
              aria-hidden
              className="h-full w-full object-contain"
              sizes="(max-width: 640px) 72px, 88px"
            />
          </span>
          <div className="mt-fluid-3 flex items-center gap-2.5 max-sm:justify-center">
            <span className={cn("h-2 w-2 rounded-full", accent.dot)} />
            <motion.div
              className={cn("h-px flex-1 origin-right bg-linear-to-l", accent.line)}
              style={{ scaleX: dividerScale }}
            />
          </div>

          <div className="mt-fluid-4 flex flex-1 flex-col">
            <PackageTextContent
              accentDotClass={accent.dot}
              item={item}
              surface={item.surface}
              titleY={titleY}
              listY={listY}
              noteY={noteY}
            />

            <motion.div className="mt-auto w-full pt-fluid-4 sm:w-fit" style={{ y: ctaY }}>
              <CtaLinkButton
                href={item.ctaHref}
                scroll={false}
                label={item.cta}
                surface={item.surface}
                dotClassName={accent.dot}
                linkClassName="w-full sm:w-auto"
                shellClassName="w-full justify-center sm:w-auto sm:justify-start"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

type CoursesProps = {
  content: PackagesShowcaseContent;
  id?: string;
  trainingAnchorId?: string;
  showTrainingAnchor?: boolean;
};

function Courses({
  content,
  id = "packages",
  trainingAnchorId = "training-courses",
  showTrainingAnchor = true,
}: CoursesProps) {
  const liveContent = useLiveSection("packages_showcase", content);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end start"],
    target: sectionRef,
  });
  const ambientY = useTransform(scrollYProgress, [0, 1], [56, -56]);
  const livePackageDetails = Array.isArray(
    (liveContent as PackagesShowcaseContent & {
      packageDetails?: Array<{ path?: string; title?: string; description?: string; items?: string[]; details?: string[] }>;
    }).packageDetails,
  )
    ? (
        liveContent as PackagesShowcaseContent & {
          packageDetails?: Array<{ path?: string; title?: string; description?: string; items?: string[]; details?: string[] }>;
        }
      ).packageDetails ?? []
    : [];
  const packages = liveContent.items.map<PackageCardItem>((item, index) => {
    const richDetail = livePackageDetails[index];
    const fallbackIncludes = Array.isArray(richDetail?.items) ? richDetail.items as string[]
      : Array.isArray(richDetail?.details) ? richDetail.details as string[]
      : undefined;
    return {
      ctaHref:
        typeof richDetail?.path === "string" && richDetail.path.trim()
          ? richDetail.path.trim()
          : "/contact",
      accent: index % 2 === 0 ? "teal" : "coral",
      cta: item.cta || "شاهد الباقات",
      description: item.description || richDetail?.description as string | undefined || "",
      id: `package-${index + 1}`,
      icon: index === 1 ? secondPackageIcon : packagesIcon,
      includes: Array.isArray(item.includes) && item.includes.length > 0
        ? item.includes
        : fallbackIncludes ?? [],
      note: item.note,
      surface: index % 2 === 0 ? "dark" : "light",
      title: item.title || richDetail?.title as string | undefined || "",
    };
  });

  return (
    <>
      {showTrainingAnchor ? (
        <div id={trainingAnchorId} className="block scroll-mt-20" aria-hidden />
      ) : null}
      <section
        id={id}
        ref={sectionRef}
        className="relative isolate scroll-mt-20 overflow-hidden bg-(--white-shades-01) py-fluid-8 text-(--primary-shades-02)"
      >
        <motion.div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ y: ambientY }}>
          <div className="absolute left-[-8%] top-[12%] h-56 w-56 rounded-full bg-(--secondary-shades-08)/6 blur-[110px]" />
          <div className="absolute right-[-10%] bottom-[2%] h-64 w-[16rem] rounded-full bg-(--secondary-shades-09)/6 blur-[122px]" />
        </motion.div>

        <Container className="relative z-10">
          <motion.div
            className="mb-fluid-6 flex flex-wrap items-center justify-between gap-fluid-4"
            {...fadeUp(0.04, 28, 0.72)}
          >
            <div className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-(--primary-shades-03)/62">
              <span className="h-2 w-2 rounded-full bg-(--secondary-shades-08)" />
              <span>{liveContent.label}</span>
            </div>

            <div className="h-px flex-1 bg-linear-to-l from-(--primary-shades-03)/12 to-transparent" />
          </motion.div>

          <motion.div className="mb-fluid-6 max-w-3xl text-right max-sm:max-w-none" {...fadeUp(0.08, 34, 0.8)}>
            <h2 className="font-poppins text-[clamp(1.9rem,9vw,5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-(--primary-shades-03)">
              {liveContent.title}
            </h2>
            <p className="mt-fluid-4 text-fluid-lg leading-[1.8] text-(--primary-shades-03)/62">
              {liveContent.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.04fr_0.96fr]">
            {packages.map((item, index) => (
              <PackageCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

export default Courses;
