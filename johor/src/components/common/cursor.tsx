import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  type Variants,
} from "framer-motion";
import {
  BRAND_LOGO_MASK_RADIUS,
  CTA_CURSOR_SIZE,
  COURSE_CARD_CURSOR_SIZE,
  FOOTER_MASK_RADIUS,
  HEADER_NAV_CURSOR_SIZE,
  MASK_RADIUS,
  WORK_CURSOR_SIZE,
} from "./cursor-mask-constants";
import { useCursorMask } from "./cursor-mask-context";

const cursorSpring = { stiffness: 520, damping: 38, mass: 0.3 };

/** Size only — position while masked uses raw pointer (no easing). Same for hero / blend / footer. */
const maskTransition = { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function surfaceFromPoint(clientX: number, clientY: number): "light" | "dark" {
  const el = document.elementFromPoint(clientX, clientY);
  if (!el) return "light";
  const marked = el.closest("[data-cursor-surface]");
  const v = marked?.getAttribute("data-cursor-surface");
  return v === "dark" ? "dark" : "light";
}

export default function Cursor() {
  const {
    maskMode,
    maskTargetRef,
    blendMaskTargetRef,
    courseMaskTargetRef,
    ctaTargetRef,
    brandLogoMaskTargetRef,
    footerMaskTargetRef,
  } = useCursorMask();
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, cursorSpring);
  const smoothY = useSpring(cursorY, cursorSpring);
  const lastPointer = useRef({ x: 0, y: 0 });
  const maskModeRef = useRef(maskMode);
  const cursorRootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    maskModeRef.current = maskMode;
  }, [maskMode]);
  const [surface, setSurface] = useState<"light" | "dark">("light");

  const maskActive =
    maskMode === "hero" ||
    maskMode === "pageHero" ||
    maskMode === "blend" ||
    maskMode === "course" ||
    maskMode === "brandLogo" ||
    maskMode === "footer";
  const refreshSurface = useCallback(() => {
    const { x, y } = lastPointer.current;
    if (x === 0 && y === 0) return;
    setSurface(surfaceFromPoint(x, y));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastPointer.current = { x: e.clientX, y: e.clientY };
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setSurface(surfaceFromPoint(e.clientX, e.clientY));
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [cursorX, cursorY]);

  useEffect(() => {
    const onScrollOrResize = () => refreshSurface();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [refreshSurface]);

  const syncMaskCoords = useCallback(() => {
    const el =
      maskMode === "hero" || maskMode === "pageHero"
        ? maskTargetRef.current
        : maskMode === "blend"
          ? blendMaskTargetRef.current
          : maskMode === "course"
            ? courseMaskTargetRef.current
          : maskMode === "brandLogo"
            ? brandLogoMaskTargetRef.current
            : maskMode === "footer"
              ? footerMaskTargetRef.current
              : null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = cursorX.get();
    const y = cursorY.get();
    el.style.setProperty("--mask-x", `${x - rect.left}px`);
    el.style.setProperty("--mask-y", `${y - rect.top}px`);
  }, [
    maskMode,
    maskTargetRef,
    blendMaskTargetRef,
    courseMaskTargetRef,
    brandLogoMaskTargetRef,
    footerMaskTargetRef,
    cursorX,
    cursorY,
  ]);

  useMotionValueEvent(cursorX, "change", syncMaskCoords);
  useMotionValueEvent(cursorY, "change", syncMaskCoords);

  useEffect(() => {
    syncMaskCoords();
  }, [maskMode, syncMaskCoords]);

  useEffect(() => {
    if (!maskActive) return;
    const onScrollOrResize = () => syncMaskCoords();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [maskActive, syncMaskCoords]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const root = cursorRootRef.current;
      const mode = maskModeRef.current;
      if (root) {
        let x: number;
        let y: number;
        if (
          mode === "hero" ||
          mode === "pageHero" ||
          mode === "blend" ||
          mode === "course" ||
          mode === "work" ||
          mode === "brandLogo" ||
          mode === "footer" ||
          mode === "headerNav"
        ) {
          x = cursorX.get();
          y = cursorY.get();
        } else if (mode === "cta") {
          const target = ctaTargetRef.current;
          const { x: px, y: py } = lastPointer.current;
          if (target) {
            const r = target.getBoundingClientRect();
            x = clamp(px, r.left, r.right);
            y = clamp(py, r.top, r.bottom);
          } else {
            x = px;
            y = py;
          }
        } else {
          x = smoothX.get();
          y = smoothY.get();
        }
        root.style.left = `${x}px`;
        root.style.top = `${y}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    cursorX,
    cursorY,
    smoothX,
    smoothY,
    courseMaskTargetRef,
    ctaTargetRef,
    brandLogoMaskTargetRef,
    footerMaskTargetRef,
  ]);

  const cursorVariants: Variants = {
    hidden: {
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderWidth: 0,
      borderColor: "transparent",
      boxShadow: "none",
      opacity: 0,
    },
    defaultLight: {
      width: 12,
      height: 12,
      backgroundColor: "var(--primary-shades-02)",
      borderStyle: "solid",
      borderWidth: 0,
      borderColor: "transparent",
      boxShadow: "none",
      opacity: 1,
    },
    defaultDark: {
      width: 12,
      height: 12,
      backgroundColor: "#ffffff",
      borderStyle: "solid",
      borderWidth: 0,
      borderColor: "transparent",
      boxShadow: "none",
      opacity: 1,
    },
    maskHero: {
      width: MASK_RADIUS * 2,
      height: MASK_RADIUS * 2,
      backgroundColor: "#ffffff",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.72)",
      boxShadow: "0 0 34px rgba(255, 255, 255, 0.28)",
      opacity: 0.95,
    },
    maskPageHero: {
      width: MASK_RADIUS * 2,
      height: MASK_RADIUS * 2,
      backgroundColor: "#ffffff",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.72)",
      boxShadow: "0 0 34px rgba(255, 255, 255, 0.28)",
      opacity: 0.95,
    },
    maskBlend: {
      width: MASK_RADIUS * 2,
      height: MASK_RADIUS * 2,
      backgroundColor: "var(--primary-shades-02)",
      borderStyle: "solid",
      borderWidth: 0,
      borderColor: "transparent",
      boxShadow: "0 0 48px rgba(34, 27, 79, 0.35)",
      opacity: 1,
    },
    courseHoverLightCard: {
      width: COURSE_CARD_CURSOR_SIZE,
      height: COURSE_CARD_CURSOR_SIZE,
      backgroundColor: "var(--primary-shades-02)",
      borderStyle: "solid",
      borderWidth: 0,
      borderColor: "transparent",
      boxShadow: "0 0 32px rgba(34, 27, 79, 0.18)",
      opacity: 0.22,
    },
    courseHoverDarkCard: {
      width: COURSE_CARD_CURSOR_SIZE,
      height: COURSE_CARD_CURSOR_SIZE,
      backgroundColor: "#ffffff",
      borderStyle: "solid",
      borderWidth: 0,
      borderColor: "transparent",
      boxShadow: "0 0 32px rgba(255, 255, 255, 0.16)",
      opacity: 0.22,
    },
    workHoverLight: {
      width: WORK_CURSOR_SIZE,
      height: WORK_CURSOR_SIZE,
      backgroundColor: "rgba(34, 27, 79, 0.14)",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "rgba(34, 27, 79, 0.22)",
      boxShadow: "0 0 38px rgba(34, 27, 79, 0.1)",
      opacity: 1,
    },
    workHoverDark: {
      width: WORK_CURSOR_SIZE,
      height: WORK_CURSOR_SIZE,
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.24)",
      boxShadow: "0 0 38px rgba(255, 255, 255, 0.08)",
      opacity: 1,
    },
    maskBrandLogo: {
      width: BRAND_LOGO_MASK_RADIUS * 2,
      height: BRAND_LOGO_MASK_RADIUS * 2,
      backgroundColor: "var(--primary-shades-02)",
      borderStyle: "solid",
      borderWidth: 0,
      borderColor: "transparent",
      boxShadow: "0 0 40px rgba(34, 27, 79, 0.28)",
      opacity: 0.92,
    },
    maskFooter: {
      width: FOOTER_MASK_RADIUS * 2,
      height: FOOTER_MASK_RADIUS * 2,
      backgroundColor: "#ffffff",
      borderStyle: "solid",
      borderWidth: 0,
      borderColor: "transparent",
      boxShadow: "0 0 40px rgba(255, 255, 255, 0.22)",
      opacity: 1,
    },
    headerNavHover: {
      width: HEADER_NAV_CURSOR_SIZE,
      height: HEADER_NAV_CURSOR_SIZE,
      backgroundColor: "#ffffff",
      borderStyle: "solid",
      borderWidth: 0,
      borderColor: "transparent",
      boxShadow: "0 0 28px rgba(255, 255, 255, 0.25)",
      opacity: 0.25,
    },
    ctaHover: {
      width: CTA_CURSOR_SIZE,
      height: CTA_CURSOR_SIZE,
      backgroundColor: "var(--secondary-shades-08)",
      boxShadow:
        "0 0 0 1px rgba(255,255,255,0.35), 0 12px 40px rgba(238, 32, 77, 0.35)",
      opacity: 0.25,
    },
  };

  const animateVariant =
    maskMode === "hidden"
      ? "hidden"
      : maskMode === "hero"
      ? "maskHero"
      : maskMode === "pageHero"
        ? "maskPageHero"
      : maskMode === "blend"
        ? "maskBlend"
        : maskMode === "course"
          ? surface === "dark"
            ? "courseHoverDarkCard"
            : "courseHoverLightCard"
        : maskMode === "work"
          ? surface === "dark"
            ? "workHoverDark"
            : "workHoverLight"
        : maskMode === "brandLogo"
          ? "maskBrandLogo"
          : maskMode === "footer"
            ? "maskFooter"
            : maskMode === "headerNav"
              ? "headerNavHover"
            : maskMode === "cta"
              ? "ctaHover"
              : surface === "dark"
                ? "defaultDark"
                : "defaultLight";

  return (
    <div
      ref={cursorRootRef}
      className="pointer-events-none fixed left-0 top-0 z-40 max-lg:hidden -translate-x-1/2 -translate-y-1/2 will-change-[left,top]"
    >
      <motion.div
        layout={false}
        className="box-border rounded-full"
        variants={cursorVariants}
        initial="defaultLight"
        animate={animateVariant}
        transition={maskTransition}
      />
    </div>
  );
}
