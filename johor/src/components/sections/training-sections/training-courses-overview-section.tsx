import { motion } from "framer-motion";
import { ArrowUpLeft } from "lucide-react";
import Link from "next/link";
import type { TrainingCoursesOverviewContent } from "../../../../lib/api";
import { cn } from "../../../lib/cn";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";

const accentDotClasses = {
  coral: "bg-(--secondary-shades-08)",
  teal: "bg-(--secondary-shades-09)",
  violet: "bg-(--primary-shades-04)",
} as const;
const accentOrder = ["coral", "teal", "violet"] as const;

function TrainingCoursesOverviewSection({
  content,
}: {
  content: TrainingCoursesOverviewContent;
}) {
  return (
    <section className="relative overflow-hidden bg-(--white-shades-01) py-fluid-8 text-(--primary-shades-03)">
      <div className="pointer-events-none absolute left-[-10%] top-[12%] h-72 w-72 rounded-full bg-(--secondary-shades-08)/6 blur-[145px]" />
      <div className="pointer-events-none absolute bottom-[4%] right-[-12%] h-72 w-72 rounded-full bg-(--secondary-shades-09)/6 blur-[155px]" />

      <Container className="relative z-10">
        <motion.div
          className="mb-fluid-6 flex flex-wrap items-center justify-between gap-fluid-4"
          {...fadeUp(0.04, 28, 0.7)}
        >
          <div className="inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.32em] text-(--primary-shades-03)/58">
            <span className="h-2 w-2 rounded-full bg-(--secondary-shades-09)" />
            <span>{content.label}</span>
          </div>

          <div className="h-px flex-1 bg-linear-to-l from-(--primary-shades-03)/14 to-transparent" />
        </motion.div>

        <motion.div className="max-w-3xl text-right" {...fadeUp(0.08, 32, 0.74)}>
          <h2 className="font-poppins text-[clamp(1rem,7.4vw,5rem)] font-semibold leading-[1.2] tracking-[-0.04em]">
            {content.title}
          </h2>
          <p className="mt-fluid-5 text-fluid-lg leading-relaxed text-(--primary-shades-03)/66">
            {content.description}
          </p>
        </motion.div>

        <div className="mt-fluid-6 grid gap-4 xl:grid-cols-3">
          {content.items.map((item, index) => {
            const accent = accentOrder[index % accentOrder.length];

            return (
              <motion.article
                key={item.title}
                className="relative overflow-hidden rounded-[1.6rem] border border-(--primary-shades-03)/10 bg-white/80 p-fluid-4 shadow-[0_28px_70px_rgba(34,27,79,0.08)] backdrop-blur-sm"
                {...fadeUp(0.12 + index * 0.06, 34, 0.72)}
                whileHover={{ y: -8 }}
              >
                <div className="flex items-center justify-between gap-3 text-[11px] font-medium tracking-[0.22em] text-(--primary-shades-03)/55">
                  <span>{item.duration}</span>
                  <span className={cn("h-2.5 w-2.5 rounded-full", accentDotClasses[accent])} />
                </div>

                <h3 className="mt-fluid-4 font-poppins text-fluid-xl font-semibold leading-[1.35] text-(--primary-shades-03)">
                  {item.title}
                </h3>

                <p className="mt-2 text-fluid-sm leading-[1.85] text-(--primary-shades-03)/58">
                  {item.level}
                </p>

                <p className="mt-fluid-5 text-fluid-sm leading-[1.9] text-(--primary-shades-03)/72">
                  {item.summary}
                </p>

                <ul className="mt-fluid-4 space-y-2.5">
                  {item.outcomes.map((outcome, outcomeIndex) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2.5 text-fluid-sm leading-[1.8] text-(--primary-shades-03)/82"
                    >
                      <span
                        className={cn(
                          "mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full",
                          outcomeIndex === 0
                            ? accentDotClasses[accent]
                            : "bg-(--primary-shades-03)/18",
                        )}
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>

        <motion.div className="mt-fluid-6 flex justify-center" {...fadeUp(0.28, 26, 0.68)}>
          <Link
            href="/contact"
            scroll={false}
            className="inline-flex items-center gap-3 rounded-full bg-(--primary-shades-02) px-6 py-3 text-fluid-sm font-semibold text-white shadow-[0_18px_46px_rgba(34,27,79,0.18)] transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-(--secondary-shades-09)" />
            <span>{content.cta}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <ArrowUpLeft className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}

export default TrainingCoursesOverviewSection;
