import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import type { WorkProject, WorksGalleryContent, WorksProjectsContent } from "../../../../lib/api";
import { Icons } from "../../../constant/icons";
import { cn } from "../../../lib/cn";
import { fadeUp } from "../../../lib/motion";
import CtaLinkButton from "../../common/cta-link-button";
import { useCursorMask } from "../../common/cursor-mask-context";
import Container from "../../common/container";
import { useLiveSection } from "../../../lib/use-live-image";

const WORKS_BUTTON_LABEL = "عرض كل الأعمال";
const MOSAIC_LAYOUT_CLASSES = [
  "md:col-start-1 md:row-start-1 md:row-span-2",
  "md:col-start-1 md:row-start-3",
  "md:col-start-2 md:row-start-1",
  "md:col-start-2 md:row-start-2 md:row-span-2",
  "md:col-start-3 md:row-start-1",
  "md:col-start-3 md:row-start-2 md:row-span-2",
] as const;

type WorksGallerySectionProps = {
  content: WorksGalleryContent;
  id?: string;
};

function WorksGallerySection({
  content: initialContent,
  id = "works-gallery-section",
}: WorksGallerySectionProps) {
  const content = useLiveSection("works_gallery", initialContent);
  const liveProjects = useLiveSection<WorksProjectsContent>("works_projects", { projects: [] as WorkProject[] });
  const { setMaskMode } = useCursorMask();
  const PlayIcon = Icons.Play;
  const galleryItems = useMemo(() => {
    const projects: WorkProject[] = liveProjects.projects?.length
      ? liveProjects.projects
      : [];
    if (projects.length > 0) {
      return projects
        .filter((p) => p.coverImage && p.coverImage !== "undefined")
        .slice(0, 6)
        .map((p) => ({
          image: p.coverImage,
          alt: p.title,
          brand: p.title,
          subtitle: p.client || p.category || "",
          slug: p.slug,
          hasVideo: p.storyBlocks?.some(
            (block) => typeof block.video === "string" && block.video.trim(),
          ) ?? false,
        }));
    }
    const rawItems = Array.isArray(content.items) ? content.items : [];
    return rawItems.slice(0, 6).map((item) => ({ ...item, slug: "", hasVideo: false }));
  }, [liveProjects.projects, content.items]);
  const useMosaicLayout = galleryItems.length >= 5;

  return (
    <section id={id} className="scroll-mt-20 bg-(--white-shades-01) pb-fluid-8 pt-fluid-7">
      <Container>
        <motion.div
          className="mb-fluid-6 flex flex-wrap items-center justify-between gap-fluid-4"
          {...fadeUp(0.04, 28, 0.72)}
        >
          <div className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-(--primary-shades-03)/62">
            <span className="h-2 w-2 rounded-full bg-(--secondary-shades-09)" />
            <span>{content.label}</span>
          </div>

          <div className="h-px flex-1 bg-linear-to-l from-(--primary-shades-03)/12 to-transparent" />
        </motion.div>

        <motion.div className="max-w-3xl text-right" {...fadeUp(0.08, 34, 0.8)}>
          <h2 className="font-poppins text-[clamp(1rem,7.4vw,5rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-(--primary-shades-03)">
            {content.title}
          </h2>
          <p className="mt-fluid-5 text-fluid-lg leading-relaxed text-(--primary-shades-03)/62">
            {content.description}
          </p>
        </motion.div>
      </Container>

      {galleryItems.length > 0 ? (
        <motion.div
          className={cn(
            "mt-fluid-7 grid gap-3 sm:gap-4",
            useMosaicLayout
              ? "md:grid-cols-3 md:auto-rows-[9rem]"
              : "sm:grid-cols-2 lg:grid-cols-3",
          )}
          {...fadeUp(0.08, 34, 0.8)}
          dir="ltr"
        >
          {galleryItems.map((slide, index) => (
            <article
              key={`${slide.brand}-${slide.image}-${index}`}
              className={cn(
                "group relative isolate overflow-hidden border border-(--primary-shades-03)/14 bg-(--primary-shades-02)/6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                useMosaicLayout
                  ? cn("min-h-[12rem] md:min-h-0", MOSAIC_LAYOUT_CLASSES[index] || "")
                  : "min-h-[11.5rem] aspect-[4/3]",
              )}
              onMouseEnter={() => setMaskMode("work")}
              onMouseLeave={() => setMaskMode("none")}
            >
              {slide.slug ? (
                <Link href={`/works/${slide.slug}`} className="absolute inset-0 z-30" aria-label={slide.brand} />
              ) : null}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  sizes={
                    useMosaicLayout
                      ? "(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 420px"
                      : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  }
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
              </div>

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--primary-shades-02)/72 via-(--primary-shades-02)/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-0 border border-white/14" />

              {slide.hasVideo ? (
                <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-17 w-17 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/48 bg-white/20 text-white backdrop-blur-[1px]">
                  <PlayIcon className="h-6 w-6 translate-x-[1px]" />
                </span>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 z-20 p-3 text-white sm:p-4">
                <p className="text-[11px] font-medium tracking-[0.2em] text-white/72">
                  {slide.subtitle}
                </p>
                <h3 className="mt-1 font-poppins text-fluid-base font-semibold leading-tight sm:text-fluid-lg">
                  {slide.brand}
                </h3>
              </div>
            </article>
          ))}
        </motion.div>
      ) : (
        <motion.p
          className="mt-fluid-7 text-center text-fluid-base text-(--primary-shades-03)/60"
          {...fadeUp(0.1, 20, 0.65)}
        >
          Ù„Ø§ ØªÙˆØ¬Ø¯ Ø£Ø¹Ù…Ø§Ù„ Ù…ØªØ§Ø­Ø© Ø­Ø§Ù„ÙŠØ§Ù‹.
        </motion.p>
      )}

      <Container>
        <motion.div className="mt-fluid-6 flex justify-center" {...fadeUp(0.16, 24, 0.72)}>
          <CtaLinkButton
            href="/works"
            label={WORKS_BUTTON_LABEL}
            scroll={false}
            surface="light"
          />
        </motion.div>
      </Container>
    </section>
  );
}

export default WorksGallerySection;
