import { useRef, useState, type ReactNode } from "react";
import {
  CursorMaskContext,
  type CursorMaskMode,
} from "./cursor-mask-context";

export function CursorMaskProvider({ children }: { children: ReactNode }) {
  const maskTargetRef = useRef<HTMLDivElement | null>(null);
  const blendMaskTargetRef = useRef<HTMLDivElement | null>(null);
  const courseMaskTargetRef = useRef<HTMLElement | null>(null);
  const ctaTargetRef = useRef<HTMLElement | null>(null);
  const brandLogoMaskTargetRef = useRef<HTMLDivElement | null>(null);
  const footerMaskTargetRef = useRef<HTMLElement | null>(null);
  const [maskMode, setMaskMode] = useState<CursorMaskMode>("none");

  return (
    <CursorMaskContext.Provider
      value={{
        maskMode,
        setMaskMode,
        maskTargetRef,
        blendMaskTargetRef,
        courseMaskTargetRef,
        ctaTargetRef,
        brandLogoMaskTargetRef,
        footerMaskTargetRef,
      }}
    >
      {children}
    </CursorMaskContext.Provider>
  );
}
