import { motion } from "framer-motion";
import type { WorkProject } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";

type WorkDetailHeroSectionProps = {
  work: WorkProject;
};

function WorkDetailHeroSection({ work }: WorkDetailHeroSectionProps) {
  return (
    <motion.section
      data-cursor-surface="dark"
      className="relative flex min-h-[72vh] items-center overflow-hidden bg-transparent pb-fluid-7 pt-[calc(var(--header-overlay-offset)+var(--space-fluid-5))] text-white"
      initial={{ opacity: 0, y: 34 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute left-[-10%] top-[18%] h-72 w-72 rounded-full bg-(--secondary-shades-08)/12 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[-8%] right-[-12%] h-80 w-80 rounded-full bg-(--secondary-shades-09)/12 blur-[165px]" />

      <Container className="relative z-10">
        <motion.div
          className="mb-fluid-5 flex flex-wrap items-center justify-between gap-fluid-4"
          {...fadeUp(0.04, 28, 0.72)}
        >
          <div className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-white/62">
            <span className="h-2 w-2 rounded-full bg-(--secondary-shades-08)" />
            <span>{work.category}</span>
          </div>

          <div className="inline-flex items-center gap-3 text-fluid-sm text-white/56">
            <span>{work.client}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/28" />
            <span>{work.number}</span>
          </div>
        </motion.div>

        <div className="grid gap-fluid-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <motion.div className="text-right" {...fadeUp(0.08, 34, 0.8)}>
            <h1 className="font-hero text-[clamp(2rem,5.3vw,4.55rem)] font-bold leading-[1.12] tracking-[-0.01em] text-white">
              {work.title}
            </h1>
          </motion.div>

          <motion.div className="space-y-fluid-3 text-right" {...fadeUp(0.12, 30, 0.8)}>
            <p className="text-fluid-lg leading-relaxed text-white/80">
              {work.overview}
            </p>
            <p className="text-fluid-base leading-[1.9] text-white/68">
              {work.supportText}
            </p>
          </motion.div>
        </div>
      </Container>
    </motion.section>
  );
}

export default WorkDetailHeroSection;
