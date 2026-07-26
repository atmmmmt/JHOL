import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import type { PartnerLogo, PartnersLogosContent } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import { useLiveSection } from "../../../lib/use-live-image";
import Container from "../../common/container";
import { BRAND_LOGO_MASK_RADIUS } from "../../common/cursor-mask-constants";
import { useCursorMask } from "../../common/cursor-mask-context";

const logoImgClass =
  "h-auto w-[clamp(68px,8vw,112px)] object-contain pointer-events-none select-none";
const PARTNER_LOGO_WIDTH = 112;
const PARTNER_LOGO_HEIGHT = 52;

type BrandLogoCellProps = {
  item: PartnerLogo;
  isDuplicate?: boolean;
};

function BrandLogoCell({ item, isDuplicate = false }: BrandLogoCellProps) {
  const { setMaskMode, brandLogoMaskTargetRef } = useCursorMask();
  const [hovered, setHovered] = useState(false);
  const [cursorMaskEnabled, setCursorMaskEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const apply = () => {
      setCursorMaskEnabled(mediaQuery.matches);
    };

    apply();
    mediaQuery.addEventListener("change", apply);
    return () => {
      mediaQuery.removeEventListener("change", apply);
    };
  }, []);

  return (
    <div
      aria-hidden={isDuplicate}
      className="relative z-50 flex max-lg:cursor-auto cursor-none shrink-0 items-center justify-center"
    >
      <motion.div
        className="relative isolate flex items-center justify-center"
        style={
          {
            "--mask-r":
              hovered && cursorMaskEnabled ? `${BRAND_LOGO_MASK_RADIUS}px` : "0px",
          } as CSSProperties
        }
        onMouseEnter={(event) => {
          setHovered(true);
          if (cursorMaskEnabled) {
            brandLogoMaskTargetRef.current = event.currentTarget as HTMLDivElement;
            setMaskMode("brandLogo");
          }
        }}
        onMouseLeave={() => {
          setHovered(false);
          if (cursorMaskEnabled) {
            brandLogoMaskTargetRef.current = null;
            setMaskMode("none");
          }
        }}
        initial={false}
        animate={{ scale: hovered ? 1.065 : 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`${logoImgClass} relative z-0`}>
          <Image
            src={item.image}
            alt={item.alt}
            width={PARTNER_LOGO_WIDTH}
            height={PARTNER_LOGO_HEIGHT}
            className="h-auto w-full object-contain"
            sizes="112px"
            style={{
              filter:
                hovered && !cursorMaskEnabled
                  ? "brightness(0) saturate(100%) invert(1) contrast(1.05)"
                  : "none",
              transition: "filter 0.24s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />

          {cursorMaskEnabled ? (
            <div
              className="pointer-events-none absolute inset-0 z-10 will-change-[clip-path]"
              style={{
                clipPath:
                  "circle(var(--mask-r, 0px) at var(--mask-x, 50%) var(--mask-y, 50%))",
                WebkitClipPath:
                  "circle(var(--mask-r, 0px) at var(--mask-x, 50%) var(--mask-y, 50%))",
              }}
            >
              <Image
                src={item.image}
                alt=""
                aria-hidden
                width={PARTNER_LOGO_WIDTH}
                height={PARTNER_LOGO_HEIGHT}
                className="absolute left-0 top-0 h-auto w-full object-contain"
                sizes="112px"
                style={{
                  filter: "brightness(0) saturate(100%) invert(1) contrast(1.05)",
                }}
              />
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

function BrandLogosSection({ content: initialContent }: { content: PartnersLogosContent }) {
  const content = useLiveSection("partners_logos", initialContent);
  const visibleLogos = content.logos.filter((logo) => logo.image?.trim());
  const durationSeconds = Math.max(18, visibleLogos.length * 2.8);

  return (
    <motion.section className="bg-(--white-shades-01) py-fluid-8" {...fadeUp(0, 34, 0.7)}>
      <Container>
        <div className="mb-fluid-6 flex flex-wrap items-center justify-between gap-fluid-4">
          <div className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-(--primary-shades-03)/62">
            <span className="h-2 w-2 rounded-full bg-(--secondary-shades-09)" />
            <span>{content.label}</span>
          </div>

          <div className="h-px flex-1 bg-linear-to-l from-(--primary-shades-03)/12 to-transparent" />
        </div>

        <div className="mb-fluid-6 max-w-3xl text-right">
          <h2 className="font-poppins text-[clamp(1rem,7.4vw,5rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-(--primary-shades-03)">
            {content.title}
          </h2>
          <p className="mt-fluid-6 text-fluid-lg leading-relaxed text-(--primary-shades-03)/62">
            {content.description}
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[60] w-16 bg-linear-to-r from-(--white-shades-01) to-transparent md:w-28" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[60] w-16 bg-linear-to-l from-(--white-shades-01) to-transparent md:w-28" />

          {visibleLogos.length > 0 ? (
            <div
              className="brand-logos-marquee-track relative z-50 flex w-max flex-row flex-nowrap items-center py-3"
              style={
                {
                  "--brand-marquee-duration": `${durationSeconds}s`,
                  direction: "ltr",
                } as CSSProperties
              }
            >
              <div className="brand-logos-marquee-group flex min-w-full flex-row flex-nowrap items-center justify-around gap-x-[clamp(0.9rem,2.2vw,2rem)]">
                {visibleLogos.map((item, index) => (
                  <BrandLogoCell key={`${item.name}-${index}`} item={item} />
                ))}
              </div>

              <div
                className="brand-logos-marquee-group flex min-w-full flex-row flex-nowrap items-center justify-around gap-x-[clamp(0.9rem,2.2vw,2rem)]"
                aria-hidden
              >
                {visibleLogos.map((item, index) => (
                  <BrandLogoCell
                    key={`${item.name}-duplicate-${index}`}
                    item={item}
                    isDuplicate
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </motion.section>
  );
}

export default BrandLogosSection;
