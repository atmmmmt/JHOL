import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import type { WorkProject } from "../../../../lib/api";
import type { PackageDetail } from "../../../data/package-details";
import { cn } from "../../../lib/cn";
import { fadeUp } from "../../../lib/motion";
import CtaSubmitButton from "../../common/cta-submit-button";
import { useCursorMask } from "../../common/cursor-mask-context";
import Container from "../../common/container";
import { PackageVideoGrid } from "../packages-sections/package-video-grid";
import { useLiveSection } from "../../../lib/use-live-image";
import Breadcrumb from "../../common/breadcrumb";

// Hierarchy: main category → sub-categories
const CATEGORY_HIERARCHY: Record<string, string[]> = {
  'هويات بصرية': ['التراث', 'الصحة', 'التجزئة', 'العقارات', 'الضيافة'],
}

const ALL_SUB_CATEGORIES = new Set(Object.values(CATEGORY_HIERARCHY).flat())

function normalizeCategoryValue(value: string) {
  return value.trim().toLowerCase().replace(/^ال/, "").replace(/\s+ال/g, " ");
}

function categoryMatchesPackage(categoryNorm: string, pkgTitle: string): boolean {
  const strip = (s: string) => normalizeCategoryValue(s).replace(/ال/g, '').replace(/\s+/g, ' ').trim();
  const catStripped = strip(categoryNorm);
  const pkgStripped = strip(pkgTitle);
  const words = catStripped.split(' ').filter(w => w.length >= 3);
  return words.some(word => pkgStripped.includes(word.slice(0, 4)));
}

function WorkServices({
  detailsButtonLabel,
  listingDescription,
  listingTitle,
  projects,
  workCategories,
}: {
  detailsButtonLabel: string;
  listingDescription?: string;
  listingTitle?: string;
  projects: WorkProject[];
  workCategories?: string[];
}) {
  const { setMaskMode } = useCursorMask();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const livePackages = useLiveSection<{ items?: PackageDetail[]; packageDetails?: PackageDetail[] }>(
    "packages_showcase",
    { items: [] },
  );

  const allCategories = useMemo(() => {
    if (workCategories && workCategories.length > 0) {
      return workCategories.filter((c) => c.trim());
    }
    const seen = new Set<string>();
    return projects
      .map((p) => p.category?.trim())
      .filter((c): c is string => Boolean(c) && !seen.has(c) && seen.add(c) !== undefined);
  }, [workCategories, projects]);

  // Split into main and sub
  const mainCategories = useMemo(
    () => allCategories.filter((c) => !ALL_SUB_CATEGORIES.has(c)),
    [allCategories],
  );

  const activeSub = searchParams.get("category") || "";

  // If a sub-category is in the URL without a main, auto-derive the parent main
  const derivedMain = useMemo(() => {
    if (searchParams.get("main")) return searchParams.get("main")!;
    if (!activeSub) return "";
    for (const [main, subs] of Object.entries(CATEGORY_HIERARCHY)) {
      if (subs.some((s) => normalizeCategoryValue(s) === normalizeCategoryValue(activeSub))) {
        return main;
      }
    }
    return "";
  }, [searchParams, activeSub]);

  const activeMain = derivedMain;

  // Sub-categories for the active main (only those present in allCategories)
  const visibleSubCategories = useMemo(() => {
    if (!activeMain) return [];
    return (CATEGORY_HIERARCHY[activeMain] ?? []).filter((s) =>
      allCategories.some((c) => normalizeCategoryValue(c) === normalizeCategoryValue(s)),
    );
  }, [activeMain, allCategories]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allCategories.forEach((c) => counts.set(normalizeCategoryValue(c), 0));
    // also count for mains that have subs
    Object.keys(CATEGORY_HIERARCHY).forEach((main) => {
      if (!counts.has(normalizeCategoryValue(main))) counts.set(normalizeCategoryValue(main), 0);
    });
    projects.forEach((project) => {
      const cats = (project.category || "").split(",").map(c => normalizeCategoryValue(c)).filter(Boolean);
      cats.forEach((norm) => {
        if (counts.has(norm)) counts.set(norm, (counts.get(norm) || 0) + 1);
        // bubble up to parent main
        for (const [main, subs] of Object.entries(CATEGORY_HIERARCHY)) {
          if (subs.some(s => normalizeCategoryValue(s) === norm)) {
            const mainNorm = normalizeCategoryValue(main);
            counts.set(mainNorm, (counts.get(mainNorm) || 0) + 1);
          }
        }
      });
    });
    // Count videos from packages per category
    const packages = livePackages.items ?? livePackages.packageDetails ?? [];
    packages.forEach((pkg) => {
      const videoCount = pkg.videos?.length ?? 0;
      if (videoCount === 0) return;
      // match by categoryTag or title
      allCategories.forEach((cat) => {
        const catNorm = normalizeCategoryValue(cat);
        const tagMatch = pkg.categoryTag && normalizeCategoryValue(pkg.categoryTag) === catNorm;
        const fuzzyMatch = !tagMatch && pkg.title && categoryMatchesPackage(catNorm, pkg.title);
        if (tagMatch || fuzzyMatch) {
          counts.set(catNorm, (counts.get(catNorm) || 0) + videoCount);
        }
      });
    });
    return counts;
  }, [allCategories, projects, livePackages.items, livePackages.packageDetails]);

  const filteredProjects = useMemo(() => {
    if (activeSub) {
      const subNorm = normalizeCategoryValue(activeSub);
      return projects.filter((project) => {
        const cats = (project.category || "").split(",").map(c => normalizeCategoryValue(c)).filter(Boolean);
        return cats.includes(subNorm);
      });
    }
    if (activeMain) {
      const subs = CATEGORY_HIERARCHY[activeMain] ?? [];
      const matchNorms = [activeMain, ...subs].map(normalizeCategoryValue);
      return projects.filter((project) => {
        const cats = (project.category || "").split(",").map(c => normalizeCategoryValue(c)).filter(Boolean);
        return cats.some(c => matchNorms.includes(c));
      });
    }
    return projects;
  }, [projects, activeMain, activeSub]);

  const activeFilterNorm = activeSub
    ? normalizeCategoryValue(activeSub)
    : activeMain
      ? normalizeCategoryValue(activeMain)
      : "";

  const categoryVideos = useMemo(() => {
    if (!activeFilterNorm) return [];
    const packages = livePackages.items ?? livePackages.packageDetails ?? [];
    const exactMatch = packages.find(
      (pkg) => pkg.categoryTag && normalizeCategoryValue(pkg.categoryTag) === activeFilterNorm,
    );
    if (exactMatch?.videos?.length) return exactMatch.videos;
    const fuzzyMatch = packages.find(
      (pkg) => pkg.title && categoryMatchesPackage(activeFilterNorm, pkg.title),
    );
    return fuzzyMatch?.videos ?? [];
  }, [activeFilterNorm, livePackages.items, livePackages.packageDetails]);

  const handleMainToggle = (main: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeMain === main) {
      params.delete("main");
      params.delete("sub");
    } else {
      params.set("main", main);
      params.delete("sub");
    }
    router.push(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
  };

  const handleSubToggle = (sub: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeSub === sub) {
      params.delete("category");
    } else {
      params.set("category", sub);
    }
    router.push(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
  };

  return (
    <>
      {/* Breadcrumb — full-width red bar, flush under the hero */}
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "ملف الأعمال" },
        ]}
      />

      <motion.section
        data-cursor-surface="light"
        className="relative isolate overflow-hidden text-(--primary-shades-02) py-fluid-8 bg-white"
        {...fadeUp(0, 40, 0.7)}
      >
        <Container className="relative z-10">
        {listingTitle ? (
          <motion.div className="mb-fluid-7 text-right max-sm:max-w-none" {...fadeUp(0.04, 28, 0.72)}>
            <h2 className="font-poppins text-[clamp(2rem,9vw,4.8rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-(--primary-shades-03)">
              {listingTitle}
            </h2>
            {listingDescription ? (
              <p className="mt-fluid-3 max-w-4xl text-fluid-lg leading-[1.8] text-(--primary-shades-03)/68">
                {listingDescription}
              </p>
            ) : null}
          </motion.div>
        ) : null}

        <motion.div
          dir="rtl"
          className="mb-fluid-6 border-b border-(--primary-shades-03)/12 pb-fluid-5"
          {...fadeUp(0.08, 24, 0.64)}
        >
          <h3 className="font-poppins text-fluid-xl font-semibold text-(--primary-shades-03)">
            التصنيفات
          </h3>

          {/* Main categories */}
          <div className="mt-fluid-3 flex flex-wrap gap-2">
            {mainCategories.map((category) => {
              const norm = normalizeCategoryValue(category);
              const isActive = activeMain === category;
              return (
                <button
                  type="button"
                  key={category}
                  onClick={() => handleMainToggle(category)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-wide transition",
                    isActive
                      ? "border-(--secondary-shades-08) bg-(--secondary-shades-08)/8 text-(--primary-shades-03)"
                      : "border-(--primary-shades-03)/14 text-(--primary-shades-03)/72 hover:border-(--secondary-shades-08)/45",
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-(--secondary-shades-08)" />
                  <span>{category}</span>
                  <span className="text-(--secondary-shades-08)">
                    {categoryCounts.get(norm) || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-categories — shown only when a main with subs is active */}
          {visibleSubCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 pr-4 border-r-2 border-(--secondary-shades-08)/30">
              {visibleSubCategories.map((sub) => {
                const norm = normalizeCategoryValue(sub);
                const isActive = activeSub === sub;
                return (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => handleSubToggle(sub)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-medium tracking-wide transition",
                      isActive
                        ? "border-(--secondary-shades-08) bg-(--secondary-shades-08)/10 text-(--primary-shades-03)"
                        : "border-(--primary-shades-03)/10 text-(--primary-shades-03)/60 hover:border-(--secondary-shades-08)/35",
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-(--secondary-shades-08)/60" />
                    <span>{sub}</span>
                    <span className="text-(--secondary-shades-08)/70">
                      {categoryCounts.get(norm) || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {categoryVideos.length > 0 ? (
          <motion.div className="mb-fluid-6" {...fadeUp(0.1, 24, 0.64)}>
            <PackageVideoGrid videos={categoryVideos} />
          </motion.div>
        ) : null}

        <div className="grid gap-fluid-5 sm:gap-fluid-6 md:[direction:ltr] md:grid-cols-2 md:gap-x-fluid-6 md:gap-y-fluid-7 lg:gap-x-fluid-8 lg:gap-y-fluid-9">
          {filteredProjects.map((item, index) => {
            const isOffsetCard = index % 2 === 1;

            return (
              <motion.article
                key={item.id || item.slug || index}
                className={`relative ${isOffsetCard ? "md:mt-[clamp(5rem,11vw,9rem)]" : ""}`}
                {...fadeUp(index * 0.06, 38, 0.76)}
                whileHover={{ scale: 1.01, y: -6 }}
              >
                <Link
                  href={`/works/${item.slug}`}
                  aria-label={`Open ${item.title} work details`}
                  className="group relative z-10 block h-full max-lg:cursor-auto cursor-none"
                  onMouseEnter={() => setMaskMode("work")}
                  onMouseLeave={() => setMaskMode("none")}
                >
                  <div className="relative pt-fluid-2 sm:pt-fluid-3">
                    <div className="w-full md:[direction:rtl]">
                      <motion.div
                        whileHover="hover"
                        className="relative aspect-[16/10] overflow-hidden border border-white/10 bg-white/2.5"
                      >
                        <motion.div
                          variants={{
                            hover: { scale: 1.1 },
                          }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 48vw, 42vw"
                            className="object-cover"
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))]" />
                        <div className="absolute inset-4 border border-dashed border-white/12 sm:inset-6" />
                      </motion.div>

                      <h2
                        className="mt-fluid-4 text-right  font-poppins text-[clamp(1.5rem,3vw,2.35rem)] font-semibold leading-tight text-(--primary-shades-02)"
                      >
                        {item.title}
                      </h2>

                      <div className="mt-fluid-2 text-right">
                        <p className="max-w-2xl text-fluid-base leading-[1.95] text-(--primary-shades-02)/82 sm:text-fluid-lg">
                          {item.listingDescription}
                        </p>
                      </div>

                      <div className="mt-fluid-4 text-right">
                        <CtaSubmitButton
                          label={detailsButtonLabel}
                          type="button"
                          surface="light"
                          buttonClassName="pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>

        {filteredProjects.length === 0 && categoryVideos.length === 0 && (activeMain || activeSub) ? (
          <p
            dir="rtl"
            className="mt-fluid-5 text-fluid-lg text-(--primary-shades-03)/64"
          >
            لا توجد أعمال ضمن هذا التصنيف حالياً.
          </p>
        ) : null}
        </Container>
      </motion.section>
    </>
  );
}

export default WorkServices;
