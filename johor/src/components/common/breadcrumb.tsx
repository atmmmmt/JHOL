"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Container from "./container";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  // Retained for backward compatibility with existing call sites — every
  // breadcrumb now renders on the same full-width brand-red bar.
  surface?: "dark" | "light";
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <motion.nav
      dir="rtl"
      aria-label="breadcrumb"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      // Full-bleed red bar that spans the whole viewport width regardless of
      // where it is nested, so it sits flush directly under the hero.
      className="w-screen ml-[calc(50%-50vw)] bg-(--secondary-shades-08) text-white"
    >
      <Container>
        <div className="flex w-full flex-wrap items-center justify-start gap-1.5 py-3 text-right text-[11px] font-medium tracking-[0.12em]">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span className="select-none text-white/55">›</span>
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-white/80 transition-opacity hover:text-white"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "font-semibold text-white" : "text-white/80"}
                  >
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </Container>
    </motion.nav>
  );
}
