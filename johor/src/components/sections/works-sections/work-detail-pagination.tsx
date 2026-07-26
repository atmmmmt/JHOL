import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { WorkProject, WorksPaginationContent } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import { useCursorMask } from "../../common/cursor-mask-context";

type WorkDetailPaginationProps = {
  content: WorksPaginationContent;
  previousWork?: WorkProject;
  nextWork?: WorkProject;
};

type WorkPaginationLinkProps = {
  align: "start" | "end";
  emptyLabel: string;
  icon: "left" | "right";
  label: string;
  work?: WorkProject;
};

function WorkPaginationLink({
  align,
  emptyLabel,
  icon,
  label,
  work,
}: WorkPaginationLinkProps) {
  const { setMaskMode } = useCursorMask();
  const alignmentClass = align === "start" ? "justify-self-start" : "justify-self-end";
  const iconNode =
    icon === "left" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />;
  const baseClass = `group block w-full max-w-sm max-lg:cursor-auto cursor-none ${alignmentClass}`;

  if (!work) {
    return (
      <div className={`${baseClass} pointer-events-none text-right opacity-40`} dir="rtl">
        <div className="inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-white/42">
          {iconNode}
          <span>{label}</span>
        </div>
        <p className="mt-fluid-3 font-poppins text-fluid-xl font-semibold text-white/54">
          {emptyLabel}
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/works/${work.slug}`}
      className={baseClass}
      dir="rtl"
      onMouseEnter={() => setMaskMode("work")}
      onMouseLeave={() => setMaskMode("none")}
      onClick={() => setMaskMode("none")}
    >
      <div className="inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-white/46">
        <span
          className={`transition-transform duration-300 ${icon === "left" ? "group-hover:translate-x-1 group-hover:scale-110" : "group-hover:-translate-x-1 group-hover:scale-110"}`}
        >
          {iconNode}
        </span>
        <span>{label}</span>
      </div>
      <p className="mt-fluid-3 font-poppins text-fluid-xl font-semibold text-white transition-colors duration-300 group-hover:text-(--secondary-shades-08)">
        {work.title}
      </p>
    </Link>
  );
}

function WorkDetailPagination({
  content,
  previousWork,
  nextWork,
}: WorkDetailPaginationProps) {
  return (
    <section className="bg-transparent pb-fluid-8 pt-fluid-3 text-white">
      <Container>
        <motion.div
          className="grid gap-fluid-6 pt-fluid-5 md:grid-cols-2"
          dir="ltr"
          {...fadeUp(0.04, 24, 0.7)}
        >
          <WorkPaginationLink
            label={content.previousLabel}
            emptyLabel={content.emptyPreviousLabel}
            work={previousWork}
            align="start"
            icon="right"
          />
          <WorkPaginationLink
            label={content.nextLabel}
            emptyLabel={content.emptyNextLabel}
            work={nextWork}
            align="end"
            icon="left"
          />
        </motion.div>
      </Container>
    </section>
  );
}

export default WorkDetailPagination;
