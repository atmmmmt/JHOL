import { createContext, useContext, type RefObject } from "react";

export type CursorMaskMode =
  | "none"
  | "hidden"
  | "hero"
  | "pageHero"
  | "blend"
  | "course"
  | "work"
  | "cta"
  | "brandLogo"
  | "footer"
  | "headerNav";

export type CursorMaskContextValue = {
  maskMode: CursorMaskMode;
  setMaskMode: (mode: CursorMaskMode) => void;
  maskTargetRef: RefObject<HTMLDivElement | null>;
  blendMaskTargetRef: RefObject<HTMLDivElement | null>;
  courseMaskTargetRef: RefObject<HTMLElement | null>;
  ctaTargetRef: RefObject<HTMLElement | null>;
  brandLogoMaskTargetRef: RefObject<HTMLDivElement | null>;
  footerMaskTargetRef: RefObject<HTMLElement | null>;
};

export const CursorMaskContext = createContext<CursorMaskContextValue | null>(
  null,
);

export function useCursorMask() {
  const ctx = useContext(CursorMaskContext);
  if (!ctx) {
    throw new Error("useCursorMask must be used within CursorMaskProvider");
  }
  return ctx;
}
