import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useMemo, useRef, useState, useCallback } from "react";
import type { FeaturedServicesContent } from "../../../../lib/api";
import cloudAsset from "../../../assets/images/Cloud.png";
import { cn } from "../../../lib/cn";
import { fadeUp } from "../../../lib/motion";
import CtaLinkButton from "../../common/cta-link-button";
import Container from "../../common/container";
import { useLiveSection } from "../../../lib/use-live-image";

type ServiceItem = {
  chips: string[];
  description: string;
  id: string;
  image?: string;
  number: string;
  title: string;
};

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
const DESKTOP_DESC_WORD_LIMIT = 25;

function normalizeServiceTitle(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function resolveServiceButtonConfig(title: string) {
  const normalizedTitle = normalizeServiceTitle(title);

  const isVisualIdentity =
    normalizedTitle.includes("هويات") && normalizedTitle.includes("بصرية");
  const isCampaigns =
    normalizedTitle.includes("حملات") &&
    (normalizedTitle.includes("تمويل") ||
      normalizedTitle.includes("تمول") ||
      normalizedTitle.includes("ممول"));

  if (isVisualIdentity) {
    return {
      href: "/works?category=visual-identity",
      label: "عرض المشاريع",
    };
  }

  if (isCampaigns) {
    return {
      href: "/works?category=paid-campaigns",
      label: "عرض الحملات",
    };
  }

  return null;
}

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);

  if (words.length < 2) {
    return [title, ""];
  }

  const midpoint = Math.ceil(words.length / 2);

  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

type ServiceMotionRowProps = {
  index: number;
  isActive: boolean;
  onActivate: (id: string) => void;
  service: ServiceItem;
};

function truncateToWords(text: string, limit: number) {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return { short: text, rest: "" };
  return {
    short: words.slice(0, limit).join(" "),
    rest: " " + words.slice(limit).join(" "),
  };
}

function ServiceMotionRow({
  index,
  isActive,
  onActivate,
  service,
}: ServiceMotionRowProps) {
  const rowRef = useRef<HTMLElement>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const toggleDesc = useCallback(() => setDescExpanded((v) => !v), []);
  const { scrollYProgress } = useScroll({
    offset: ["start 88%", "center 52%", "end 16%"],
    target: rowRef,
  });
  const direction = index % 2 === 0 ? 1 : -1;
  const translateX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [direction * 42, 0, direction * -20],
  );
  const translateY = useTransform(scrollYProgress, [0, 0.5, 1], [54, 0, -34]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1.04, 0.97]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.22, 0.5, 1],
    [0.48, 0.72, 1, 0.62],
  );
  const numberX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [direction * 20, 0, direction * -12],
  );
  const numberScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1.08, 1]);
  const cloudY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [direction * -12, 0, direction * 8],
  );
  const cloudRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [direction * -6, 0, direction * 4],
  );
  const [firstLine, secondLine] = splitTitle(service.title);
  const { short: descShort, rest: descRest } = truncateToWords(service.description, DESKTOP_DESC_WORD_LIMIT);
  const hasMoreDesc = Boolean(descRest);
  const serviceImage = service.image || cloudAsset;
  const serviceImageAlt = service.image ? service.title : "Cloud icon";
  const serviceButton = resolveServiceButtonConfig(service.title);

  return (
    <motion.article
      ref={rowRef}
      className="relative"
      {...fadeUp(0.08 + index * 0.05, 26, 0.68)}
      onViewportEnter={() => onActivate(service.id)}
      onMouseEnter={() => onActivate(service.id)}
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.div
        style={{ opacity, scale, x: translateX, y: translateY }}
        transition={{ duration: 0.35, ease: MOTION_EASE }}
        className="relative flex items-center"
      >
        <div className="w-full py-fluid-8">
          <div className="grid grid-cols-[minmax(160px,240px)_auto] items-center gap-fluid-5 lg:[direction:ltr] lg:grid-cols-[clamp(200px,22vw,360px)_minmax(0,1fr)_auto] lg:items-center">
            <motion.div
              className="order-1 mx-auto w-[clamp(160px,36vw,360px)] lg:order-1 lg:mx-0"
              style={{ rotate: cloudRotate, y: cloudY }}
            >
              <motion.div
                animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
                transition={{ duration: 4.6, ease: "easeInOut", repeat: Infinity }}
              >
                <Image
                  src={serviceImage}
                  alt={serviceImageAlt}
                  width={760}
                  height={760}
                  className="h-auto w-full drop-shadow-[0_20px_48px_rgba(43,37,110,0.35)]"
                  priority={index === 0}
                />
              </motion.div>
            </motion.div>

            <div className="order-3 col-span-2 space-y-fluid-4 text-start lg:order-2 lg:col-span-1 lg:[direction:rtl]">
              <div className="space-y-3">
                <h3 className="font-poppins text-[clamp(1rem,7.4vw,3.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-(--secondary-shades-08)">
                  {firstLine}
                  {secondLine ? (
                    <>
                      <br />
                      <span
                        className={cn(
                          "my-fluid-4 block text-(--secondary-shades-08)",
                        )}
                      >
                        {secondLine}
                      </span>
                    </>
                  ) : null}
                </h3>

                <div className="relative max-w-2xl">
                  <p
                    className="text-fluid-lg leading-relaxed text-(--primary-shades-03)/76 overflow-hidden transition-[max-height] duration-500 ease-in-out"
                    style={{ maxHeight: hasMoreDesc && !descExpanded ? "4.8em" : "40em" }}
                  >
                    {descShort}
                    {hasMoreDesc ? descRest : null}
                  </p>
                  {hasMoreDesc && !descExpanded ? (
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-start pt-8"
                      style={{
                        background: "linear-gradient(to bottom, transparent 0%, var(--white-shades-01) 75%)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={toggleDesc}
                        className="text-(--secondary-shades-08) font-medium hover:underline focus:outline-none text-fluid-base pb-0.5"
                      >
                        اقرأ المزيد
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {(!hasMoreDesc || descExpanded) ? (
                <div className="flex flex-wrap justify-start gap-2">
                  {service.chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center rounded-full border border-(--primary-shades-03)/14 bg-(--primary-shades-03)/4 px-3 py-1 text-[11px] font-medium tracking-[0.08em] text-(--primary-shades-03)/72"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}

              {hasMoreDesc && descExpanded ? (
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={toggleDesc}
                    className="text-(--secondary-shades-08) font-medium hover:underline focus:outline-none text-fluid-base"
                  >
                    عرض أقل
                  </button>
                </div>
              ) : null}

              {serviceButton && (!hasMoreDesc || descExpanded) ? (
                <div className="pt-1 lg:flex">
                  <CtaLinkButton
                    href={serviceButton.href}
                    label={serviceButton.label}
                    truncateLabel={false}
                    scroll={false}
                    surface="light"
                  />
                </div>
              ) : null}
            </div>

            <motion.div
              className="order-2 justify-self-end font-poppins text-[clamp(4.5rem,11vw,9rem)] font-semibold leading-none tracking-[-0.05em] text-(--secondary-shades-08) lg:order-3 lg:justify-self-end"
              style={{ opacity: isActive ? 1 : 0.42, scale: numberScale, x: numberX }}
            >
              {service.number}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function FeaturedServicesSection({
  content: initialContent,
  showHead = true,
}: {
  content: FeaturedServicesContent;
  showHead?: boolean;
}) {
  const content = useLiveSection("featured_services", initialContent);
  const sectionRef = useRef<HTMLElement>(null);
  const serviceItems = useMemo<ServiceItem[]>(
    () =>
      content.items.map((item, index) => ({
        chips: item.chips,
        description: item.description,
        id: `service-${index + 1}`,
        image: item.image,
        number: item.number,
        title: item.title,
      })),
    [content.items],
  );
  const [activeServiceId, setActiveServiceId] = useState(
    serviceItems[0]?.id ?? "",
  );
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end start"],
    target: sectionRef,
  });
  const ambientY = useTransform(scrollYProgress, [0, 1], [70, -70]);

  const resolvedActiveServiceId = activeServiceId || serviceItems[0]?.id || "";

  return (
    <motion.section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-(--white-shades-01) py-fluid-8 "
    >
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ y: ambientY }}
      >
        <motion.div
          className="absolute right-[-10%] top-[12%] h-[22rem] w-[22rem] rounded-full bg-(--secondary-shades-09)/8 blur-[145px]"
          animate={{ opacity: [0.2, 0.36, 0.2], scale: [1, 1.12, 1] }}
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute left-[-10%] bottom-[10%] h-[20rem] w-[20rem] rounded-full bg-(--secondary-shades-08)/8 blur-[135px]"
          animate={{ scale: [1, 1.08, 1], x: [0, 26, 0], y: [0, -16, 0] }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
        />
      </motion.div>

      <Container className="relative z-10">
        {showHead ? (
          <>
          <motion.div
              className="mb-fluid-6 flex flex-wrap items-center justify-between gap-fluid-4 max-sm:flex-col max-sm:items-end"
              {...fadeUp(0.06, 22, 0.7)}
            >
              <div className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-(--primary-shades-03)/62">
                <span className="h-2 w-2 rounded-full bg-(--secondary-shades-08)" />
                <span>{content.label}</span>
              </div>

              <div className="h-px flex-1 bg-linear-to-l from-(--primary-shades-03)/12 to-transparent" />
            </motion.div>

            <motion.div
              className="max-w-3xl text-right max-sm:max-w-none"
              {...fadeUp(0.1, 28, 0.74)}
            >
              <h2 className="font-poppins text-[clamp(1.9rem,9vw,5rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-(--primary-shades-03)">
                {content.title}
              </h2>
              <p className="mt-fluid-4 max-w-2xl text-fluid-lg leading-[1.8] text-(--primary-shades-03)/62">
                {content.description}
              </p>
            </motion.div>
          </>
        ) : null}

        <div className="mt-fluid-8 flex flex-col gap-fluid-8 lg:flex-row-reverse lg:items-start">
          <div className="flex-1">
            {serviceItems.map((service, index) => (
              <ServiceMotionRow
                key={service.id}
                index={index}
                isActive={service.id === resolvedActiveServiceId}
                onActivate={setActiveServiceId}
                service={service}
              />
            ))}
          </div>
        </div>
      </Container>
    </motion.section>
  );
}

export default FeaturedServicesSection;
