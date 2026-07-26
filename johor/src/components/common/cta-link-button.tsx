"use client";

import { ArrowUpLeft } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";
import { cn } from "../../lib/cn";
import { useCursorMask } from "./cursor-mask-context";

export type CtaButtonSurface = "dark" | "light";

type CtaLinkButtonProps = {
  href: string;
  label: string;
  dotClassName?: string;
  surface?: CtaButtonSurface;
  hoverMatchDot?: boolean;
  linkClassName?: string;
  shellClassName?: string;
  labelClassName?: string;
  truncateLabel?: boolean;
  scroll?: boolean;
  openInNewTab?: boolean;
};

function getShellClass(surface: CtaButtonSurface) {
  return cn(
    "inline-flex min-h-12 items-center gap-2.5 rounded-full px-4 py-2.5 text-fluid-sm font-semibold leading-[1.35] whitespace-nowrap",
    surface === "dark"
      ? "bg-white text-(--primary-shades-02) shadow-[0_14px_36px_rgba(0,0,0,0.2)]"
      : "bg-(--primary-shades-02) text-white shadow-[0_14px_36px_rgba(34,27,79,0.16)]",
  );
}

function getBubbleClass(surface: CtaButtonSurface) {
  return surface === "dark" ? "bg-(--primary-shades-02)/8" : "bg-white/10";
}

function CtaLinkButton({
  href,
  label,
  dotClassName = "bg-(--secondary-shades-08)",
  surface = "dark",
  hoverMatchDot = false,
  linkClassName,
  shellClassName,
  labelClassName,
  truncateLabel = true,
  scroll = false,
  openInNewTab = false,
}: CtaLinkButtonProps) {
  const { ctaTargetRef, setMaskMode } = useCursorMask();

  const activateCtaCursor = (event: MouseEvent<HTMLAnchorElement>) => {
    ctaTargetRef.current = event.currentTarget;
    setMaskMode("cta");
  };

  const deactivateCtaCursor = () => {
    ctaTargetRef.current = null;
    setMaskMode("none");
  };

  return (
    <Link
      href={href}
      scroll={scroll}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noreferrer noopener" : undefined}
      onMouseEnter={activateCtaCursor}
      onMouseMove={activateCtaCursor}
      onMouseLeave={deactivateCtaCursor}
      onFocus={() => setMaskMode("cta")}
      onBlur={deactivateCtaCursor}
      className={cn(
        "group inline-flex max-w-full items-center transition duration-500",
        linkClassName,
      )}
    >
      <span
        className={cn(
          getShellClass(surface),
          "min-w-0 max-w-full",
          hoverMatchDot &&
            "transition-colors duration-300 group-hover:bg-(--secondary-shades-08) group-hover:text-white",
          shellClassName,
        )}
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full duration-500",
            getBubbleClass(surface),
            hoverMatchDot &&
              "group-hover:scale-125 group-hover:bg-white/20 group-hover:text-white",
          )}
        >
          <ArrowUpLeft className="h-3.5 w-3.5  transition " />
        </span>

        <span
          className={cn(
            "min-w-0 inline-block align-middle",
            truncateLabel ? "truncate" : undefined,
            labelClassName,
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "size-2 shrink-0 rounded-full transition-transform duration-300",
            hoverMatchDot ? "group-hover:scale-160" : "",
            dotClassName,
          )}
        />
      </span>
    </Link>
  );
}

export default CtaLinkButton;
