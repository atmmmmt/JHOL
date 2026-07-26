import { Icons } from "../../constant/icons";
import { cn } from "../../lib/cn";

type SliderNavProps = {
  onPrev: () => void;
  onNext: () => void;
  tone?: "light" | "dark";
  variant?: "default" | "hero";
  activeIndex?: number;
  length?: number;
  canGoPrev?: boolean;
  canGoNext?: boolean;
};

function SliderNav({
  onPrev,
  onNext,
  tone = "light",
  variant = "default",
  activeIndex,
  length,
  canGoPrev,
  canGoNext,
}: SliderNavProps) {
  const PlayIcon = Icons.Play;
  const isHero = variant === "hero";
  const isDarkTone = tone === "dark";

  const resolvedCanGoPrev =
    canGoPrev ?? (typeof activeIndex === "number" ? activeIndex > 0 : true);
  const resolvedCanGoNext =
    canGoNext ??
    (typeof activeIndex === "number" && typeof length === "number"
      ? activeIndex < length - 1
      : true);

  const fillClass = isHero
    ? "bg-(--secondary-shades-08)"
    : "bg-(--primary-shades-02)";

  const ringEnabledClass = isHero
    ? "border-(--secondary-shades-08)"
    : isDarkTone
      ? "border-(--primary-shades-03)"
      : "border-(--primary-shades-02)";

  const ringDisabledClass = isHero
    ? "border-(--secondary-shades-08)/35"
    : "border-(--primary-shades-02)/35";

  const iconColorClass = "size-2 text-(--white-shades-01)";
  const baseButtonClass =
    "group relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border transition-colors duration-300";

  return (
    <div className="flex items-center gap-fluid-2">
      <button
        type="button"
        onClick={onNext}
        disabled={!resolvedCanGoNext}
        aria-label="Next slide"
        className={cn(
          baseButtonClass,
          resolvedCanGoNext ? ringEnabledClass : ringDisabledClass,
          !resolvedCanGoNext && "cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "absolute inset-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            fillClass,
            resolvedCanGoNext
              ? "scale-[0.28] group-hover:scale-100"
              : "scale-[0.28] opacity-50",
          )}
        />
        <span
          className={cn(
            "relative z-10 inline-flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            iconColorClass,
            resolvedCanGoNext
              ? "scale-[0.72] group-hover:scale-100"
              : "scale-[0.72] opacity-70",
          )}
        >
          <PlayIcon
            className={cn(
              "h-4 w-4 fill-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              resolvedCanGoNext ? "scale-90 group-hover:scale-160" : "scale-90",
            )}
          />
        </span>
      </button>
      
      <button
        type="button"
        onClick={onPrev}
        disabled={!resolvedCanGoPrev}
        aria-label="Previous slide"
        className={cn(
          baseButtonClass,
          resolvedCanGoPrev ? ringEnabledClass : ringDisabledClass,
          !resolvedCanGoPrev && "cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "absolute inset-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            fillClass,
            resolvedCanGoPrev
              ? "scale-[0.28] group-hover:scale-100"
              : "scale-[0.28] opacity-50",
          )}
        />
        <span
          className={cn(
            "relative z-10 inline-flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            iconColorClass,
            resolvedCanGoPrev
              ? "scale-[0.72] group-hover:scale-100"
              : "scale-[0.72] opacity-70",
          )}
        >
          <PlayIcon
            className={cn(
              "-rotate-180 h-4 w-4 fill-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              resolvedCanGoPrev ? "scale-90 group-hover:scale-110" : "scale-90",
            )}
          />
        </span>
      </button>
    </div>
  );
}

export default SliderNav;
