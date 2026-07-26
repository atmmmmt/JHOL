"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { WorkProject, WorksGalleryContent, WorksProjectsContent } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import { useLiveSection } from "../../../lib/use-live-image";
import Container from "../../common/container";

/* ─── Card dimensions ─── */
const GAP = 20;
function getCardDims(vw: number): { w: number; h: number } {
  if (vw >= 1600) return { w: 730, h: 540 };
  if (vw >= 1280) return { w: 580, h: 430 };
  if (vw >= 1024) return { w: 460, h: 340 };
  if (vw >= 768)  return { w: 360, h: 265 };
  return { w: 260, h: 192 };
}

/* ─── Marketing cards content ─── */
type MarketingCard = { id: string; text: string; color: string };
type SliderCardsContent = { cards: MarketingCard[] };

const DEFAULT_SLIDER_CARDS: SliderCardsContent = {
  cards: [
    { id: "mc-1", text: "عقول\nمُبدعة",     color: "#3B28CC" },
    { id: "mc-2", text: "أفكار\nمُلهمة",     color: "#ee204d" },
    { id: "mc-3", text: "إبداع\nلا يتوقف",   color: "#221b4f" },
  ],
};

const DEFAULT_GALLERY_HEADER: WorksGalleryContent = {
  label: "أعمالنا",
  title: "أعمال نفتخر بها",
  description:
    "مجموعة مختارة من مشاريعنا التي جمعت بين الإبداع، الاحتراف، وتحقيق النتائج.\nكل مشروع هنا يروي قصة نجاح صُمّمت بإتقان على يد فريق جهور.",
  items: [],
};

/* ─── Helpers ─── */
function getProjectImages(project: WorkProject): string[] {
  const seen = new Set<string>();
  const imgs: string[] = [];
  const push = (src?: string) => {
    const s = src?.trim();
    if (s && s !== "undefined" && !seen.has(s)) { seen.add(s); imgs.push(s); }
  };
  push(project.coverImage);
  for (const block of project.storyBlocks ?? []) push(block.image);
  return imgs;
}

/* ─── Slot types ─── */
type ProjectSlot = { kind: "project"; data: WorkProject; slotKey: string };
type CardSlot    = { kind: "card";    card: MarketingCard; slotKey: string };
type Slot = ProjectSlot | CardSlot;

function buildSlots(projects: WorkProject[], cards: MarketingCard[]): Slot[] {
  const slots: Slot[] = [];
  if (cards.length === 0) {
    projects.forEach((p, i) => slots.push({ kind: "project", data: p, slotKey: `p-${p.slug}-${i}` }));
    return slots;
  }
  let cardIdx = 0;
  for (let i = 0; i < projects.length; i += 2) {
    slots.push({ kind: "project", data: projects[i], slotKey: `p-${projects[i].slug}-${i}` });
    if (projects[i + 1]) {
      slots.push({ kind: "project", data: projects[i + 1], slotKey: `p-${projects[i + 1].slug}-${i + 1}` });
    }
    const c = cards[cardIdx % cards.length];
    slots.push({ kind: "card", card: c, slotKey: `mc-${cardIdx}-${i}` });
    cardIdx++;
  }
  return slots;
}

/* ─── Project card (always auto-cycles images) ─── */
function ProjectCard({
  project, cardW, cardH, onHover,
}: {
  project: WorkProject; cardW: number; cardH: number;
  onHover: (slug: string | null) => void;
}) {
  const images = useMemo(() => getProjectImages(project), [project]);
  const [frame, setFrame] = useState(0);
  const [prev, setPrev]   = useState<number | null>(null);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (images.length > 1) {
      ivRef.current = setInterval(() => {
        setFrame(f => {
          const next = (f + 1) % images.length;
          setPrev(f);
          return next;
        });
      }, 2000);
    }
    return () => { if (ivRef.current) clearInterval(ivRef.current); };
  }, [images.length]);

  return (
    <Link
      href={`/works/${project.slug}`}
      className="group relative shrink-0 overflow-hidden rounded-2xl bg-(--primary-shades-02)/8"
      style={{ width: cardW, height: cardH }}
      aria-label={project.title}
      onMouseEnter={() => onHover(project.slug)}
      onMouseLeave={() => onHover(null)}
    >
      {images.map((src, fi) => {
        const isCurrent = fi === frame;
        const isPrev    = fi === prev;
        return (
          <Image
            key={src}
            src={src}
            alt={fi === 0 ? project.title : ""}
            fill
            sizes="(min-width:1600px) 730px, (min-width:1280px) 580px, (min-width:1024px) 460px, (min-width:768px) 360px, 260px"
            className="object-cover"
            style={{
              opacity: isCurrent ? 1 : 0,
              zIndex: isCurrent ? 2 : isPrev ? 1 : 0,
              transition: isCurrent ? "opacity 700ms ease-in-out" : isPrev ? "opacity 700ms ease-in-out" : "none",
            }}
          />
        );
      })}
      <div className="pointer-events-none absolute inset-0 z-10 bg-(--primary-shades-02)/0 transition-colors duration-500 group-hover:bg-(--primary-shades-02)/15" />
    </Link>
  );
}

/* ─── Marketing card (static — no image cycling) ─── */
function MarketingCardSlide({
  card, cardW, cardH, onHover,
}: {
  card: MarketingCard; cardW: number; cardH: number;
  onHover: (s: string | null) => void;
}) {
  const lines = card.text.split("\n");
  const fontSize = cardH < 220
    ? "clamp(1.6rem,5vw,2.4rem)"
    : cardH < 320
    ? "clamp(2rem,6vw,3rem)"
    : "clamp(2.4rem,7vw,4.2rem)";

  return (
    <div
      className="relative shrink-0 cursor-default select-none overflow-hidden rounded-2xl"
      style={{ width: cardW, height: cardH, background: card.color }}
      onMouseEnter={() => onHover(`card-${card.id}`)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className="absolute bottom-0 right-0 p-[7%] text-right"
        style={{ direction: "rtl" }}
      >
        {lines.map((line, i) => (
          <p
            key={i}
            className="font-poppins font-bold leading-[1.15] text-white"
            style={{ fontSize }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ─── Main section ─── */
export default function ProjectsInfiniteSliderSection() {
  const liveProjects  = useLiveSection<WorksProjectsContent>("works_projects",    { projects: [] });
  const sliderCards   = useLiveSection<SliderCardsContent>("home_slider_cards",   DEFAULT_SLIDER_CARDS);
  const galleryHeader = useLiveSection<WorksGalleryContent>("works_gallery",      DEFAULT_GALLERY_HEADER);

  const [card, setCard] = useState<{ w: number; h: number }>({ w: 580, h: 430 });
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setCard(getCardDims(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const projects = useMemo(
    () =>
      (liveProjects.projects ?? [])
        .filter(p => p.coverImage && p.coverImage !== "undefined" && p.slug)
        .slice(0, 18),
    [liveProjects.projects],
  );

  const cards = sliderCards.cards?.length ? sliderCards.cards : DEFAULT_SLIDER_CARDS.cards;

  const slots  = useMemo(() => buildSlots(projects, cards), [projects, cards]);
  const items: Slot[] = useMemo(
    () => [...slots, ...slots.map(s => ({ ...s, slotKey: `dup-${s.slotKey}` }))],
    [slots],
  );

  const trackWidth = items.length * (card.w + GAP);

  if (projects.length === 0) return null;

  return (
    <section className="bg-(--white-shades-01) pb-fluid-8 pt-fluid-7" dir="rtl">
      {/* Header */}
      <Container>
        <motion.div
          className="mb-fluid-6 flex flex-wrap items-center gap-fluid-4"
          {...fadeUp(0.04, 28, 0.72)}
        >
          <div className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-(--primary-shades-03)/62">
            <span className="h-2 w-2 rounded-full bg-(--secondary-shades-09)" />
            <span>{galleryHeader.label}</span>
          </div>
          <div className="h-px flex-1 bg-linear-to-l from-(--primary-shades-03)/12 to-transparent" />
        </motion.div>

        <motion.div className="max-w-3xl" {...fadeUp(0.08, 34, 0.8)}>
          <h2 className="font-poppins text-fluid-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-(--primary-shades-03)">
            {galleryHeader.title}
          </h2>
          <p className="mt-fluid-5 whitespace-pre-line text-fluid-lg leading-relaxed text-(--primary-shades-03)/62">
            {galleryHeader.description}
          </p>
        </motion.div>
      </Container>

      {/* Slider */}
      <div className="relative mt-fluid-7 overflow-hidden" dir="ltr">
        {/* Gradient fade — left */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10"
          style={{
            width: "clamp(60px,8vw,140px)",
            background: "linear-gradient(to right, var(--white-shades-01), transparent)",
          }}
        />
        {/* Gradient fade — right */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10"
          style={{
            width: "clamp(60px,8vw,140px)",
            background: "linear-gradient(to left, var(--white-shades-01), transparent)",
          }}
        />

        <div
          className="marquee-track flex"
          style={{
            width: `${trackWidth}px`,
            gap: `${GAP}px`,
            animationPlayState: hoveredKey ? "paused" : "running",
          }}
        >
          {items.map(slot =>
            slot.kind === "project" ? (
              <ProjectCard
                key={slot.slotKey}
                project={slot.data}
                cardW={card.w}
                cardH={card.h}
                onHover={setHoveredKey}
              />
            ) : (
              <MarketingCardSlide
                key={slot.slotKey}
                card={slot.card}
                cardW={card.w}
                cardH={card.h}
                onHover={setHoveredKey}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
