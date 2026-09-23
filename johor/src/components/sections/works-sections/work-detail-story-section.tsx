"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  DEFAULT_GALLERY_GAP,
  type WorkProject,
  type WorkStoryBlock,
} from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import MediaLightbox, {
  type LightboxItem,
} from "../../common/media-lightbox";

type WorkDetailStorySectionProps = {
  work: WorkProject;
};

/**
 * How many blocks of this width fit on one desktop row. Blocks are laid out in
 * a single wrapping flex row, so consecutive half/third blocks pair up on their
 * own. Below `md` everything is full width.
 */
const WIDTH_COLUMNS: Record<string, number> = {
  full: 1,
  half: 2,
  third: 3,
};

/** Flex basis for `columns` items per row once the shared gap is removed. */
function basisForColumns(columns: number, gap: number) {
  if (columns <= 1) return "100%";
  return `calc((100% - ${gap * (columns - 1)}px) / ${columns})`;
}

function hasMedia(block: WorkStoryBlock) {
  return Boolean(block.video || (block.image && block.image !== "undefined"));
}

function StoryBlockText({ block }: { block: WorkStoryBlock }) {
  return (
    <>
      {block.title ? (
        <h3 className="font-poppins text-[clamp(1.1rem,2.4vw,2rem)] font-semibold leading-snug tracking-[-0.02em] text-white/90">
          {block.title}
        </h3>
      ) : null}
      {block.description ? (
        <p className="text-fluid-base leading-[1.9] text-white/60">
          {block.description}
        </p>
      ) : null}
    </>
  );
}

function WorkDetailStorySection({ work }: WorkDetailStorySectionProps) {
  const storyBlocks = work.storyBlocks;
  const gap = work.galleryGap ?? DEFAULT_GALLERY_GAP;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Only blocks that actually carry media are addressable in the lightbox, so
  // the index a block passes in must be its position within *that* list.
  // Keyed by array position rather than block.id: ids are optional in the
  // dashboard content and are frequently absent, which would collapse every
  // block onto a single key.
  const { lightboxItems, mediaIndexByBlock } = useMemo(() => {
    const items: LightboxItem[] = [];
    const byBlock = new Array<number | undefined>(storyBlocks.length);

    storyBlocks.forEach((block, blockIndex) => {
      if (!hasMedia(block)) return;
      byBlock[blockIndex] = items.length;
      items.push({
        id: block.id || `story-${blockIndex}`,
        src: (block.video || block.image) as string,
        alt: block.title || "مشهد المشروع",
        kind: block.video ? "video" : "image",
      });
    });

    return { lightboxItems: items, mediaIndexByBlock: byBlock };
  }, [storyBlocks]);

  if (storyBlocks.length === 0) return null;

  return (
    <section className="bg-transparent py-fluid-8 text-white" dir="rtl">
      <div className="mx-auto w-full max-w-[110rem] px-fluid-3">
        <div
          className="flex flex-wrap items-start"
          style={{ gap: `${gap}px` }}
        >
          {storyBlocks.map((block, index) => {
            const showsMedia = hasMedia(block);
            const hasText = Boolean(block.title || block.description);
            const width = block.width ?? "full";
            const columns = WIDTH_COLUMNS[width] ?? 1;
            const isFullWidth = columns === 1;
            const mediaIndex = mediaIndexByBlock[index];

            return (
              <motion.article
                key={block.id || `story-${index}`}
                // Full width on mobile; the computed basis takes over from md up.
                className="w-full md:[flex-basis:var(--basis)] md:[width:var(--basis)]"
                style={{
                  ["--basis" as string]: basisForColumns(columns, gap),
                }}
                {...fadeUp(0.04 + Math.min(index, 6) * 0.04, 34, 0.78)}
              >
                <div>
                  {showsMedia ? (
                    <button
                      type="button"
                      onClick={() =>
                        mediaIndex !== undefined && setLightboxIndex(mediaIndex)
                      }
                      aria-label={`تكبير ${block.title || "صورة المشروع"}`}
                      className="group block w-full cursor-zoom-in overflow-hidden bg-white/[0.04]"
                    >
                      {block.video ? (
                        <video
                          src={block.video}
                          autoPlay
                          muted
                          loop
                          playsInline
                          // h-auto keeps the file's own aspect ratio — no crop.
                          className="h-auto w-full"
                        />
                      ) : (
                        // Plain <img>: next/image is unoptimized in this export
                        // anyway, and intrinsic sizing is what keeps every asset
                        // uncropped whatever its ratio.
                        <img
                          src={block.image}
                          alt={block.title || "مشهد المشروع"}
                          loading={index === 0 ? "eager" : "lazy"}
                          className="h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                        />
                      )}
                    </button>
                  ) : null}

                  {hasText ? (
                    <motion.div
                      className="py-fluid-5"
                      {...fadeUp(0.06 + Math.min(index, 6) * 0.04, 24, 0.72)}
                    >
                      {/*
                        A full-width block gets the narrow centred measure so the
                        line length stays readable across the whole page. A
                        half/third block is already narrow, so the same clamp
                        would squeeze the text into a column with wide empty
                        margins — there it fills its column instead.
                      */}
                      {isFullWidth ? (
                        <Container>
                          <div
                            className="mx-auto flex flex-col gap-3 text-right lg:w-[60%]"
                          >
                            <StoryBlockText block={block} />
                          </div>
                        </Container>
                      ) : (
                        // Fills the whole column, with just enough inline padding
                        // to keep the text off the column edge.
                        <div className="flex w-full flex-col gap-3 px-fluid-2 text-right">
                          <StoryBlockText block={block} />
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      <MediaLightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}

export default WorkDetailStorySection;
