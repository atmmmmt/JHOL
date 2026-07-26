import { motion } from 'framer-motion'
import type { StaticImageData } from 'next/image'
import { useEffect, useState, type CSSProperties } from 'react'
import { fadeUp } from '../../../lib/motion'
import Container from '../../common/container'
import { MASK_RADIUS } from '../../common/cursor-mask-constants'
import { useCursorMask } from '../../common/cursor-mask-context'
import {
  clearHeroMaskPosition,
  syncHeroMaskPosition,
} from './hero-mask-utils'
import { cn } from '../../../lib/cn'

type PageHeroAccent = 'teal' | 'coral' | 'violet'
type PageHeroAlign = 'right' | 'center'
type PageHeroStyleVariant = 'default' | 'blogDetail'

type PageHeroSectionProps = {
  lines: string[]
  description: string
  supportText: string
  extraParagraphs?: string[]
  accent?: PageHeroAccent
  backgroundImage?: StaticImageData | string
  mobileBackgroundImage?: StaticImageData | string
  className?: string
  contentAlign?: PageHeroAlign
  descriptionSingleLine?: boolean
  supportTextSingleLine?: boolean
  styleVariant?: PageHeroStyleVariant
  showOverlay?: boolean
}

const accentStyles: Record<
  PageHeroAccent,
  {
    glowClass: string
  }
> = {
  teal: {
    glowClass: 'bg-(--secondary-shades-09)/18',
  },
  coral: {
    glowClass: 'bg-(--secondary-shades-08)/18',
  },
  violet: {
    glowClass: 'bg-(--primary-shades-04)/22',
  },
}

function PageHeroSection({
  lines,
  description,
  supportText,
  extraParagraphs = [],
  accent = 'teal',
  backgroundImage,
  mobileBackgroundImage,
  className,
  contentAlign = 'right',
  descriptionSingleLine = false,
  supportTextSingleLine = false,
  styleVariant = 'default',
  showOverlay = true,
}: PageHeroSectionProps) {
  const { maskMode, setMaskMode, maskTargetRef } = useCursorMask()
  const [maskEnabled, setMaskEnabled] = useState(false)
  const accentStyle = accentStyles[accent]
  const isCentered = contentAlign === 'center'
  const isBlogDetailStyle = styleVariant === 'blogDetail'
  const backgroundImageUrl =
    typeof backgroundImage === 'string' ? backgroundImage : backgroundImage?.src
  const mobileBackgroundImageUrl =
    typeof mobileBackgroundImage === 'string'
      ? mobileBackgroundImage
      : mobileBackgroundImage?.src

  const desktopBackgroundStyle = backgroundImageUrl
    ? {
        backgroundImage: `url(${backgroundImageUrl})`,
      }
    : undefined
  const mobileBackgroundStyle = mobileBackgroundImageUrl || backgroundImageUrl
    ? {
        backgroundImage: `url(${mobileBackgroundImageUrl || backgroundImageUrl})`,
      }
    : undefined

  useEffect(() => {
    return () => {
      setMaskMode('none')
    }
  }, [setMaskMode])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(min-width: 1024px) and (pointer: fine)')
    const apply = () => {
      const enabled = mediaQuery.matches
      setMaskEnabled(enabled)
      if (!enabled) {
        setMaskMode('none')
      }
    }

    apply()
    mediaQuery.addEventListener('change', apply)
    return () => {
      mediaQuery.removeEventListener('change', apply)
    }
  }, [setMaskMode])

  return (
    <motion.section
      data-cursor-surface="dark"
      className={cn(
        "relative min-h-[100vh] overflow-x-hidden overflow-y-hidden bg-(--primary-shades-02) bg-cover bg-center bg-no-repeat text-white",
        className,
      )}
      initial={{ opacity: 0, y: 34 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      {desktopBackgroundStyle ? (
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat sm:block"
          style={desktopBackgroundStyle}
        />
      ) : null}
      {mobileBackgroundStyle ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat sm:hidden"
          style={mobileBackgroundStyle}
        />
      ) : null}
      {isBlogDetailStyle && showOverlay ? (
        <div className="absolute inset-0 bg-black/52" />
      ) : null}
      {isBlogDetailStyle && showOverlay ? (
        <div className="absolute inset-0 bg-linear-to-t from-(--primary-shades-02)/90 via-(--primary-shades-02)/72 to-(--primary-shades-02)/58" />
      ) : null}
      <div
        className={`pointer-events-none absolute right-[-16%] top-[18%] h-80 w-80 rounded-full blur-[155px] ${accentStyle.glowClass}`}
      />
      {isBlogDetailStyle ? (
        <div className="pointer-events-none absolute left-[-10%] top-[14%] h-72 w-72 rounded-full bg-(--secondary-shades-08)/15 blur-[150px]" />
      ) : null}
      {isBlogDetailStyle ? (
        <div className="pointer-events-none absolute bottom-[-8%] right-[-12%] h-80 w-80 rounded-full bg-(--secondary-shades-09)/15 blur-[165px]" />
      ) : null}

      <Container className="relative flex min-h-[100vh] items-center pb-fluid-8 pt-[calc(var(--header-overlay-offset)+var(--space-fluid-6))]">
        <div className={cn(isCentered ? "w-full text-center" : "text-right")}>
          <motion.div
            className={cn(
              isCentered ? "flex justify-center" : "flex justify-end",
            )}
            {...fadeUp(0.06, 32, 0.72)}
          >
            <div
              dir="rtl"
              ref={maskTargetRef}
              onMouseEnter={(event) => {
                if (!maskEnabled) return;
                syncHeroMaskPosition(
                  event.currentTarget,
                  event.clientX,
                  event.clientY,
                );
                setMaskMode("pageHero");
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
              className={cn(
                "hero-mask-target relative z-50 w-full max-w-6xl",
                isCentered ? "text-center" : "ml-auto text-right",
                maskEnabled ? "cursor-none" : "cursor-auto",
              )}
              style={
                {
                  "--mask-r":
                    maskEnabled && maskMode === "pageHero"
                      ? `${MASK_RADIUS}px`
                      : "0px",
                } as CSSProperties
              }
            >
              <h1
                className={cn(
                  "text-white",
                  isBlogDetailStyle
                    ? "mx-auto max-w-4xl font-hero text-[clamp(2rem,5.3vw,4.55rem)] font-bold leading-[1.12] tracking-[-0.01em]"
                    : "font-hero text-[clamp(2rem,5.3vw,4.55rem)] font-bold leading-[1.12] tracking-[-0.01em]",
                )}
                style={{ lineHeight: "1.2" }}
              >
                {/* Mobile: page name big, rest smaller below */}
                <span className="sm:hidden">
                  {(() => {
                    const filtered = lines.filter((l) => l?.trim());
                    const firstLine = filtered[0] ?? "";
                    const dashIdx = firstLine.indexOf(" - ");
                    const pageName = dashIdx >= 0 ? firstLine.slice(0, dashIdx) : firstLine;
                    const rest = [
                      ...(dashIdx >= 0 ? [firstLine.slice(dashIdx + 3)] : []),
                      ...filtered.slice(1),
                    ].filter(Boolean);
                    return (
                      <>
                        <span className="block text-[44px] leading-[1.15] tracking-normal">{pageName}</span>
                        {rest.map((line, i) => (
                          <span key={i} className="mt-2 block text-[1.45rem] font-semibold leading-[1.4] tracking-normal opacity-90">
                            {line}
                          </span>
                        ))}
                      </>
                    );
                  })()}
                </span>
                {/* Desktop: all lines same size */}
                {lines
                  .filter((line) => line?.trim())
                  .map((line, index) => (
                    <span key={`${line}-${index}`} className="hidden sm:block">
                      {line}
                    </span>
                  ))}
              </h1>

              {maskEnabled ? (
                <div
                  dir="rtl"
                  className={cn(
                    "pointer-events-none absolute inset-0 z-10 overflow-visible will-change-[clip-path]",
                    isCentered ? "text-center" : "text-right",
                  )}
                  style={{
                    clipPath:
                      "circle(var(--mask-r, 0px) at var(--mask-x, 0px) var(--mask-y, 0px))",
                    WebkitClipPath:
                      "circle(var(--mask-r, 0px) at var(--mask-x, 0px) var(--mask-y, 0px))",
                  }}
                  aria-hidden
                >
                  <h1
                    className={cn(
                      "text-(--primary-shades-02)",
                      isBlogDetailStyle
                        ? "mx-auto max-w-4xl font-hero text-[clamp(2rem,5.3vw,4.55rem)] font-bold leading-[1.12] tracking-[-0.01em]"
                        : "font-hero text-[clamp(2rem,5.3vw,4.55rem)] font-bold leading-[1.12] tracking-[-0.01em]",
                    )}
                    style={{
                      lineHeight: "1.2",
                      color: "var(--primary-shades-02)",
                    }}
                  >
                    <span className="sm:hidden">
                      {(() => {
                        const filtered = lines.filter((l) => l?.trim());
                        const firstLine = filtered[0] ?? "";
                        const parts = firstLine.split(/\s*\p{Pd}\s*/u);
                        const pageName = parts[0].trim();
                        const afterDash = parts.slice(1).join(" ").trim();
                        const rest = [
                          ...(afterDash ? [afterDash] : []),
                          ...filtered.slice(1),
                        ].filter(Boolean);
                        return (
                          <>
                            <span className="block text-[44px] leading-[1.15] tracking-normal">{pageName}</span>
                            {rest.length > 0 && (
                              <span className="mt-3 block text-[1.45rem] font-semibold leading-[1.4] tracking-normal opacity-90">
                                {rest.join(" ")}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </span>
                    {lines
                      .filter((line) => line?.trim())
                      .map((line, index) => (
                        <span key={`${line}-${index}`} className="hidden sm:block">
                          {line}
                        </span>
                      ))}
                  </h1>
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            className="mt-fluid-6 pt-fluid-5"
            {...fadeUp(0.14, 28, 0.7)}
          >
            <div
              dir="rtl"
              className={cn(
                " space-y-fluid-3",
                isCentered ? "mx-auto text-center" : "ml-auto text-right",
              )}
            >
              <p
                className={cn(
                  isBlogDetailStyle
                    ? "mx-auto font-inter text-fluid-lg leading-[1.9] text-white/86 max-sm:text-[1rem]"
                    : "font-inter text-fluid-lg leading-[1.9] text-white/92 max-sm:text-[1rem]",
                  descriptionSingleLine &&
                    "overflow-hidden text-fluid-lg text-ellipsis",
                )}
              >
                {description}
              </p>
              <p
                className={cn(
                  "font-inter text-fluid-base leading-[1.9] text-white/86 max-sm:text-[0.9rem]",
                  supportTextSingleLine &&
                    "overflow-hidden text-fluid-base text-ellipsis",
                )}
              >
                {supportText}
              </p>
              {extraParagraphs
                .filter((paragraph) => paragraph?.trim())
                .map((paragraph) => (
                  <p
                    key={paragraph}
                    className="font-inter text-fluid-base leading-[1.9] text-white/82"
                  >
                    {paragraph}
                  </p>
                ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </motion.section>
  );
}

export default PageHeroSection
