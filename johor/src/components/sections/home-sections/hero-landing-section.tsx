import { motion } from "framer-motion";
import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import type { HomeHeroContent } from "../../../../lib/api";
import homeHeroBackground from "../../../assets/images/7.webp";
import Container from "../../common/container";
import { MASK_RADIUS } from "../../common/cursor-mask-constants";
import { useCursorMask } from "../../common/cursor-mask-context";
import {
  clearHeroMaskPosition,
  syncHeroMaskPosition,
} from "../shared/hero-mask-utils";
import { cn } from "../../../lib/cn";
import { useLiveSection } from "../../../lib/use-live-image";

const homeHeroBackgroundStyle: CSSProperties = {
  backgroundImage: `url(${homeHeroBackground.src})`,
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
};

function HeroLandingSection({
  content: initialContent,
}: {
  content: HomeHeroContent;
}) {
  const content = useLiveSection("home_hero", initialContent);
  const { maskMode, setMaskMode, maskTargetRef } = useCursorMask();
  const [maskEnabled, setMaskEnabled] = useState(false);

  const desktopHeroBackgroundStyle: CSSProperties = content.background
    ? {
        backgroundImage: `url(${content.background})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }
    : homeHeroBackgroundStyle;

  const mobileHeroBackgroundStyle: CSSProperties = content.mobileBackground
    ? {
        backgroundImage: `url(${content.mobileBackground})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }
    : desktopHeroBackgroundStyle;

  useEffect(() => {
    return () => {
      setMaskMode("none");
    };
  }, [setMaskMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine)",
    );

    const apply = () => {
      const enabled = mediaQuery.matches;
      setMaskEnabled(enabled);

      if (!enabled) {
        setMaskMode("none");
      }
    };

    apply();
    mediaQuery.addEventListener("change", apply);

    return () => {
      mediaQuery.removeEventListener("change", apply);
    };
  }, [setMaskMode]);

  const mob = content.mobileHeadline;

  const line1Text = content.headline.line1 ?? "";
  const highlightText = content.headline.highlight?.trim() ?? "";
  const highlightCandidate = highlightText || "جهور";

  const fallbackHighlight =
    !highlightText && line1Text.includes("جهور") ? "جهور" : highlightText;

  const resolvedHighlightText = line1Text.includes(highlightCandidate)
    ? highlightCandidate
    : fallbackHighlight;

  // No hardcoded fallback: clearing the tagline in the dashboard must remove it.
  const line2Text = content.headline.line2?.trim() ?? "";

  // Mobile-specific overrides (fallback to desktop if empty)
  const mobLine1Text = mob?.line1?.trim() || line1Text;
  const mobHighlight = mob?.highlight?.trim() || resolvedHighlightText;
  const mobLine2Text = mob?.line2?.trim() || line2Text;

  // Headline alignment, editable from the dashboard.
  const align = content.align ?? "right";
  const ALIGN_TEXT = {
    right: "sm:text-right",
    center: "sm:text-center",
    left: "sm:text-left",
  } as const;
  const ALIGN_ITEMS = {
    right: "sm:items-end",
    center: "sm:items-center",
    left: "sm:items-start",
  } as const;
  const alignText = ALIGN_TEXT[align] ?? ALIGN_TEXT.right;
  const alignItems = ALIGN_ITEMS[align] ?? ALIGN_ITEMS.right;

  // Headline size, editable from the dashboard (falls back to the design values).
  const desktopVw = content.fontSize?.desktopVw;
  const mobilePx = content.fontSize?.mobilePx;
  const heroFontVars = {
    ...(desktopVw ? { "--hero-fs-desktop": `${desktopVw}vw` } : {}),
    ...(mobilePx ? { "--hero-fs-mobile": `${mobilePx}px` } : {}),
  } as CSSProperties;

  const ctaEnabled = content.cta?.enabled !== false;
  const ctaLabel = content.cta?.label?.trim() || "ابني علامتك التجارية الان";
  const ctaHref = content.cta?.href?.trim() || "/packages";
  const mobHighlightIdx = mobLine1Text.indexOf(mobHighlight);
  const mobHasHighlight = mobHighlightIdx >= 0;
  const mobBefore = mobHasHighlight ? mobLine1Text.slice(0, mobHighlightIdx) : mobLine1Text;
  const mobAfter = mobHasHighlight ? mobLine1Text.slice(mobHighlightIdx + mobHighlight.length) : "";

  const highlightIndex = resolvedHighlightText
    ? line1Text.indexOf(resolvedHighlightText)
    : -1;

  const hasInlineHighlight = highlightIndex >= 0;

  const line1BeforeHighlight = hasInlineHighlight
    ? line1Text.slice(0, highlightIndex)
    : line1Text;

  const line1AfterHighlight = hasInlineHighlight
    ? line1Text.slice(highlightIndex + resolvedHighlightText.length)
    : "";

  // Split afterHighlight into marketing word + rest for mobile kashida span
  const MARKETING_KEYWORD = "للتسويق";
  const MARKETING_KASHIDA  = "للتـسـويـق";
  function renderAfterHighlight(text: string, mobile: boolean) {
    if (!mobile) return text;
    const ki = text.indexOf(MARKETING_KEYWORD);
    if (ki === -1) return text;
    return (
      <>
        {text.slice(0, ki)}
        <span className="marketing-line">{MARKETING_KASHIDA}</span>
        {text.slice(ki + MARKETING_KEYWORD.length)}
      </>
    );
  }


  return (
    <>
      <motion.section
        data-cursor-surface="dark"
        className="relative h-auto min-h-[90vh] max-sm:min-h-[88vh] overflow-x-clip overflow-y-visible bg-(--primary-shades-02) pt-[calc(var(--header-overlay-offset)+var(--space-fluid-2))]"
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="absolute inset-0 hidden sm:block"
          style={desktopHeroBackgroundStyle}
          aria-hidden
        />

        <div
          className="absolute inset-0 sm:hidden"
          style={mobileHeroBackgroundStyle}
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 bg-(--primary-shades-02)/45" />

        <Container className="relative sm:h-full lg:min-h-[calc(90vh-var(--header-overlay-offset)-var(--space-fluid-2))] max-sm:max-w-[102rem] lg:max-w-[100rem]">
          <div
            className={cn(
              "flex min-h-[calc(88vh-var(--header-overlay-offset))] items-center justify-center sm:min-h-0 sm:h-full sm:items-center sm:justify-start sm:pb-[clamp(180px,24vh,400px)] lg:relative lg:min-h-[calc(90vh-var(--header-overlay-offset)-var(--space-fluid-2))]",
            )}
          >
            <div
              dir="rtl"
              ref={maskTargetRef}
              onMouseEnter={(event) => {
                if (!maskEnabled) return;
                syncHeroMaskPosition(event.currentTarget, event.clientX, event.clientY);
              }}
              onMouseMove={(event) => {
                if (!maskEnabled) return;

                syncHeroMaskPosition(
                  event.currentTarget,
                  event.clientX,
                  event.clientY,
                );
              }}
              onMouseLeave={(event) => {
                if (!maskEnabled) return;

                clearHeroMaskPosition(event.currentTarget);
                setMaskMode("none");
              }}
              className={`hero-mask-target relative z-50 w-full max-sm:flex max-sm:flex-col max-sm:items-center max-sm:text-center lg:absolute lg:inset-x-0 lg:top-44 ${alignText} ${
                maskEnabled ? "cursor-none" : "cursor-auto"
              }`}
              style={
                {
                  ...heroFontVars,
                  "--mask-r":
                    maskEnabled && maskMode === "pageHero"
                      ? `${MASK_RADIUS}px`
                      : "0px",
                } as CSSProperties
              }
            >
              <h1
                className="font-hero text-[clamp(2rem,8.9vw,4.55rem)] lg:text-[length:var(--hero-fs-desktop,6vw)] lg:whitespace-nowrap font-bold leading-[1.1] tracking-[-0.02em] text-white max-sm:text-center max-sm:text-[length:var(--hero-fs-mobile,68px)] max-sm:tracking-[-0.02em]"
                style={{
                  lineHeight: "1.08",
                }}
              >
                <span className="block sm:hidden">
                  {mobHasHighlight ? (
                    <>
                      {mobBefore}
                      <span className="hero-identity-glow inline-block"
                        onMouseEnter={() => { if (maskEnabled) setMaskMode("pageHero"); }}
                        onMouseLeave={() => { if (maskEnabled) setMaskMode("none"); }}
                      >
                        {mobHighlight}
                      </span>
                      {renderAfterHighlight(mobAfter, true)}
                    </>
                  ) : (
                    renderAfterHighlight(mobLine1Text, true)
                  )}
                </span>

                <span className="hidden sm:inline">
                  {hasInlineHighlight ? (
                    <>
                      {line1BeforeHighlight}

                      <span className="hero-identity-glow inline-block"
                        onMouseEnter={() => { if (maskEnabled) setMaskMode("pageHero"); }}
                        onMouseLeave={() => { if (maskEnabled) setMaskMode("none"); }}
                      >
                        {resolvedHighlightText}
                      </span>

                      {line1AfterHighlight}
                    </>
                  ) : (
                    <>
                      {line1Text}

                      {resolvedHighlightText ? (
                        <>
                          {" "}
                          <span className="hero-identity-glow inline-block">
                            {resolvedHighlightText}
                          </span>
                        </>
                      ) : null}
                    </>
                  )}
                </span>

                {false ? (
                  <>
                    <br />
                    <span className="mt-fluid-5 block text-[clamp(1.9rem,5.6vw,4.2rem)] font-semibold leading-[1.05]">
                      {line2Text}
                    </span>
                  </>
                ) : null}
              </h1>

              {maskEnabled ? (
                <div
                  dir="rtl"
                  className="pointer-events-none absolute inset-0 z-10 overflow-visible will-change-[clip-path]"
                  style={{
                    WebkitClipPath:
                      "circle(var(--mask-r, 0px) at var(--mask-x, 0px) var(--mask-y, 0px))",
                    clipPath:
                      "circle(var(--mask-r, 0px) at var(--mask-x, 0px) var(--mask-y, 0px))",
                  }}
                  aria-hidden
                >
                  <h1
                    className="font-hero text-[clamp(2.15rem,8.9vw,4.55rem)] lg:text-[length:var(--hero-fs-desktop,6vw)] lg:whitespace-nowrap font-bold leading-[1.08] tracking-[-0.02em] text-(--primary-shades-02) max-sm:text-center max-sm:text-[44px] max-sm:tracking-normal"
                    style={{
                      color: "var(--primary-shades-02)",
                      lineHeight: "1.08",
                    }}
                  >
                    {hasInlineHighlight ? (
                      <>
                        {line1BeforeHighlight}

                        <span className="hero-identity-glow--overlay inline-block">
                          {resolvedHighlightText}
                        </span>

                        {line1AfterHighlight}
                      </>
                    ) : (
                      <>
                        {line1Text}

                        {resolvedHighlightText ? (
                          <>
                            {" "}
                            <span className="hero-identity-glow--overlay inline-block">
                              {resolvedHighlightText}
                            </span>
                          </>
                        ) : null}
                      </>
                    )}

                    {false ? (
                      <>
                        <br />
                        <span className="mt-fluid-5 block text-[clamp(1.9rem,5.6vw,4.2rem)] font-semibold leading-[1.05]">
                          {line2Text}
                        </span>
                      </>
                    ) : null}
                  </h1>
                </div>
              ) : null}

              <div className={`mt-14 sm:mt-10 flex flex-col items-center gap-12 sm:gap-14 ${alignItems}`}>
                {line2Text || mobLine2Text ? (
                  <p className="font-hero font-normal text-[clamp(1.4rem,5.5vw,3rem)] leading-[1.22] text-white/90 max-sm:text-[40px] max-sm:text-center sm:whitespace-nowrap">
                    <span className="sm:hidden">{mobLine2Text}</span>
                    <span className="hidden sm:inline">{line2Text}</span>
                  </p>
                ) : null}

                {ctaEnabled ? (
                  <a
                    href={ctaHref}
                    className="inline-flex min-h-[3.5rem] items-center gap-3 rounded-full bg-(--secondary-shades-08) px-6 py-3 text-[17px] font-bold leading-tight whitespace-nowrap text-white shadow-[0_14px_36px_rgba(238,32,77,0.45)] transition hover:brightness-110 active:scale-95"
                  >
                    <span>{ctaLabel}</span>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M7 17L17 7M17 7H7M17 7v10"/>
                      </svg>
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>

        </Container>
      </motion.section>
    </>
  );
}

export default HeroLandingSection;
