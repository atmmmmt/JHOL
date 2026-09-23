"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect } from "react";

export type LightboxItem = {
  id: string;
  src: string;
  alt: string;
  kind: "image" | "video";
};

type MediaLightboxProps = {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
};

/**
 * Full-screen viewer for project media. Images are shown uncropped and bounded
 * by the viewport, so tall and wide assets both fit without being cut.
 */
function MediaLightbox({ items, index, onClose, onNavigate }: MediaLightboxProps) {
  const isOpen = index !== null && index >= 0 && index < items.length;
  const current = isOpen ? items[index] : null;
  const hasMultiple = items.length > 1;

  const goTo = useCallback(
    (delta: number) => {
      if (index === null) return;
      // Wrap around so the arrows never dead-end.
      onNavigate((index + delta + items.length) % items.length);
    },
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      // The gallery is RTL, but arrow keys stay physical: Right goes right.
      if (event.key === "ArrowRight") goTo(1);
      if (event.key === "ArrowLeft") goTo(-1);
    };

    window.addEventListener("keydown", handleKey);

    // Prevent the page behind the overlay from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, goTo]);

  if (!isOpen || !current) {
    return null;
  }

  return (
    <>
      {/*
        Deliberately a plain conditional render rather than AnimatePresence:
        this overlay covers the viewport and captures clicks, so "closed" must
        mean "unmounted" unconditionally. Tying removal to an exit animation
        completing risks leaving an invisible full-screen layer that swallows
        every click on the page. Entrance polish is a pure CSS animation.
      */}
      <div
        className="animate-[lightbox-in_0.22s_ease-out] fixed inset-0 z-[120] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm sm:p-8"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={current.alt}
      >
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(-1);
                }}
                aria-label="السابق"
                className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(1);
                }}
                aria-label="التالي"
                className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}

          <div
            key={current.id}
            className="max-h-full max-w-full"
            onClick={(event) => event.stopPropagation()}
          >
            {current.kind === "video" ? (
              <video
                src={current.src}
                className="max-h-[85svh] max-w-[92vw] rounded-lg bg-black"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={current.src}
                alt={current.alt}
                className="max-h-[85svh] max-w-[92vw] rounded-lg object-contain"
              />
            )}
          </div>

          {hasMultiple ? (
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              {index + 1} / {items.length}
            </p>
          ) : null}
      </div>
    </>
  );
}

export default MediaLightbox;
