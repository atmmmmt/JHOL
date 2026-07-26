"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLiveSection } from "../../../lib/use-live-image";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";

type Sector = {
  id: string;
  title: string;
  subtitle: string;
  details: string[];
};

type SectorsContent = {
  label?: string;
  heading?: string;
  sectors: Sector[];
};

const DEFAULT_SECTORS_CONTENT: SectorsContent = {
  label: "تخصصاتنا",
  heading: "قطاعات نخدمها",
  sectors: [
    {
      id: "hospitality",
      title: "الضيافة",
      subtitle: "مقاهي · مطاعم",
      details: ["هويّات المطاعم والمقاهي", "أنظمة الإرشاد البصري داخل المكان"],
    },
    {
      id: "real-estate",
      title: "العقارات",
      subtitle: "عقار",
      details: [
        "علامات تجاريّة لشركات التطوير العقاري",
        "مواد الترويج والبيع للمشاريع",
      ],
    },
    {
      id: "retail",
      title: "التجزئة",
      subtitle: "متاجر",
      details: ["تصاميم تغليف المنتجات", "هويّة المنتج داخل المتجر"],
    },
    {
      id: "health",
      title: "الصحّة",
      subtitle: "طبي",
      details: [
        "هويّات العيادات والمراكز الطبيّة",
        "حملات التوعية الصحيّة",
      ],
    },
    {
      id: "heritage",
      title: "التراث",
      subtitle: "ثقافة",
      details: [
        "هويّات تراثيّة وثقافيّة",
        "أنظمة تصميم ثنائية اللغة",
      ],
    },
  ],
};

export default function SectorsSection() {
  const content = useLiveSection<SectorsContent>(
    "home_sectors",
    DEFAULT_SECTORS_CONTENT,
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sectors = content.sectors ?? DEFAULT_SECTORS_CONTENT.sectors;
  const label = content.label ?? DEFAULT_SECTORS_CONTENT.label;
  const heading = content.heading ?? DEFAULT_SECTORS_CONTENT.heading;

  return (
    <section
      dir="rtl"
      className="bg-(--white-shades-01) pb-fluid-8 pt-fluid-7"
    >
      <Container>
        {/* Header */}
        <motion.div
          className="mb-fluid-7 flex flex-wrap items-center gap-fluid-4"
          {...fadeUp(0.04, 28, 0.72)}
        >
          <div className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-(--primary-shades-03)/62">
            <span className="h-2 w-2 rounded-full bg-(--secondary-shades-09)" />
            <span>{label}</span>
          </div>
          <div className="h-px flex-1 bg-linear-to-l from-(--primary-shades-03)/12 to-transparent" />
        </motion.div>

        <motion.h2
          className="mb-fluid-7 font-poppins text-fluid-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-(--primary-shades-03)"
          {...fadeUp(0.08, 34, 0.8)}
        >
          {heading}
        </motion.h2>

        {/* Sectors list */}
        <motion.div
          className="divide-y divide-(--primary-shades-03)/10"
          {...fadeUp(0.1, 28, 0.75)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {sectors.map((sector) => {
            const isHovered = hoveredId === sector.id;
            const isDimmed = hoveredId !== null && !isHovered;

            return (
              <Link
                key={sector.id}
                href={`/works?category=${encodeURIComponent(sector.title)}`}
                className="group block py-fluid-5 transition-all duration-300"
                style={{ opacity: isDimmed ? 0.28 : 1 }}
                onMouseEnter={() => setHoveredId(sector.id)}
              >
                <div className="flex items-center gap-fluid-4 max-sm:flex-col max-sm:items-start">
                  {/* Sector name */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className="shrink-0 text-[clamp(1rem,3vw,1.5rem)] text-(--primary-shades-03)/30 transition-colors duration-300 group-hover:text-(--secondary-shades-08)"
                      aria-hidden
                    >
                      ←
                    </span>
                    <h3 className="font-poppins text-fluid-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-(--primary-shades-03) transition-colors duration-300 group-hover:text-(--primary-shades-02)">
                      {sector.title}
                    </h3>
                  </div>

                  {/* Subtitle */}
                  <p className="w-[clamp(80px,14vw,160px)] shrink-0 text-fluid-sm text-(--primary-shades-03)/50 max-sm:hidden">
                    {sector.subtitle}
                  </p>

                  {/* Details */}
                  <ul className="flex w-[clamp(180px,28vw,340px)] shrink-0 flex-col gap-1 max-sm:hidden">
                    {sector.details.map((detail, i) => (
                      <li
                        key={i}
                        className="text-fluid-xs leading-[1.7] text-(--primary-shades-03)/55"
                      >
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
