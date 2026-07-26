import { ArrowUpLeft } from "lucide-react";
import { cn } from "../../lib/cn";
import type { CtaButtonSurface } from "./cta-link-button";

type CtaSubmitButtonProps = {
  label: string;
  type?: "button" | "submit" | "reset";
  dotClassName?: string;
  surface?: CtaButtonSurface;
  buttonClassName?: string;
  shellClassName?: string;
  disabled?: boolean;
  onClick?: () => void;
};

function getShellClass(surface: CtaButtonSurface) {
  return cn(
    "inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-fluid-sm font-semibold",
    surface === "dark"
      ? "bg-white text-(--primary-shades-02) shadow-[0_14px_36px_rgba(0,0,0,0.2)]"
      : "bg-(--primary-shades-02) text-white shadow-[0_14px_36px_rgba(34,27,79,0.16)]",
  );
}

function getBubbleClass(surface: CtaButtonSurface) {
  return surface === "dark" ? "bg-(--primary-shades-02)/8" : "bg-white/10";
}

function CtaSubmitButton({
  label,
  type = "submit",
  dotClassName = "bg-(--secondary-shades-08)",
  surface = "dark",
  buttonClassName,
  shellClassName,
  disabled = false,
  onClick,
}: CtaSubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
        buttonClassName,
      )}
    >
      <span className={cn(getShellClass(surface), shellClassName)}>
        <span className={cn("h-2 w-2 rounded-full", dotClassName)} />
        <span>{label}</span>
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full",
            getBubbleClass(surface),
          )}
        >
          <ArrowUpLeft className="h-3.5 w-3.5" />
        </span>
      </span>
    </button>
  );
}

export default CtaSubmitButton;
