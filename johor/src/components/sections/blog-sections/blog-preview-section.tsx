import { motion } from "framer-motion";
import { ArrowUpLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { BlogPreviewContent, BlogPreviewItem } from "../../../../lib/api";
import { cn } from "../../../lib/cn";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import NewsletterSubscribe from "../../common/newsletter-subscribe";
import { useLiveSection } from "../../../lib/use-live-image";

const accentDotClasses = {
  coral: "bg-(--secondary-shades-08)",
  teal: "bg-(--secondary-shades-09)",
  violet: "bg-(--primary-shades-04)",
} as const;

const accentOrder = ["coral", "teal", "violet"] as const;
const BLOG_DETAILS_BUTTON_LABEL = "\u0627\u0642\u0631\u0623 \u0627\u0644\u0645\u0632\u064A\u062F";
const SEARCH_PLACEHOLDER =
  "\u0627\u0628\u062D\u062B \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u062F\u0648\u0646\u0629";
const DEFAULT_CATEGORY = "\u0639\u0627\u0645";
const DEFAULT_SOURCE = "\u0627\u0644\u0645\u062F\u0648\u0646\u0629";
const DEFAULT_META = "\u062D\u062F\u064A\u062B\u0627\u064B";
const DEFAULT_COMMENT_AUTHOR = "\u0632\u0627\u0626\u0631";
const EMPTY_EXCERPT_FALLBACK =
  "\u0633\u064A\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0645\u0644\u062E\u0635 \u0647\u0630\u0647 \u0627\u0644\u0645\u0642\u0627\u0644\u0629 \u0642\u0631\u064A\u0628\u0627\u064B.";
const NEWSLETTER_TITLE = "شترك بالنشرة البريدية ليصلك كل جديد";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function resolveCategoryLabel(category: unknown) {
  if (typeof category === "string") {
    return category.trim();
  }

  if (Array.isArray(category)) {
    return category
      .map((entry) => {
        if (typeof entry === "string") {
          return entry.trim();
        }

        if (
          typeof entry === "object" &&
          entry !== null &&
          "name" in entry &&
          typeof (entry as { name?: unknown }).name === "string"
        ) {
          return String((entry as { name: string }).name).trim();
        }

        return "";
      })
      .filter(Boolean)
      .join(", ");
  }

  if (
    typeof category === "object" &&
    category !== null &&
    "name" in category &&
    typeof (category as { name?: unknown }).name === "string"
  ) {
    return String((category as { name: string }).name).trim();
  }

  return "";
}

function buildSearchText(item: BlogPreviewItem, categoryNames: string[]) {
  return normalizeText(
    [
      item.title,
      item.slug,
      item.excerpt,
      resolveCategoryLabel(item.category),
      ...categoryNames,
      item.meta,
      item.source,
    ].join(" "),
  );
}

function getItemCategoryNames(
  item: BlogPreviewItem,
  categoriesById: Map<string, string>,
) {
  const names = new Set<string>();
  const directCategory = resolveCategoryLabel(item.category);

  if (directCategory) {
    names.add(directCategory);
  }

  if (Array.isArray(item.categoryIds)) {
    item.categoryIds.forEach((id) => {
      const categoryName = categoriesById.get(id);
      if (categoryName) {
        names.add(categoryName);
      }
    });
  }

  return Array.from(names);
}

function toPreviewText(value: string, maxLength = 92) {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}...`;
}

function resolveBlogItemLink(item: BlogPreviewItem) {
  if (item.link?.trim()) {
    return item.link.trim();
  }

  return `/blog/${item.slug}`;
}

function getPublishDateSortValue(item: BlogPreviewItem) {
  const rawValue = typeof item.publishDate === "string" ? item.publishDate.trim() : "";

  if (!rawValue) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsedValue = Date.parse(rawValue);

  if (!Number.isNaN(parsedValue)) {
    return parsedValue;
  }

  return Number.NEGATIVE_INFINITY;
}

function BlogPreviewSection({ content: initialContent }: { content: BlogPreviewContent }) {
  const content = useLiveSection("blog_preview", initialContent);
  const allItems = useMemo(() => {
    const items = Array.isArray(content.items) ? content.items : [];

    return [...items].sort(
      (first, second) => getPublishDateSortValue(second) - getPublishDateSortValue(first),
    );
  }, [content.items]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const normalizedQuery = normalizeText(searchQuery);
  const categoriesById = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(content.categories)) {
      content.categories.forEach((category) => {
        if (category?.id && category?.name) {
          map.set(category.id, category.name);
        }
      });
    }
    return map;
  }, [content.categories]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const categoryNames = getItemCategoryNames(item, categoriesById);
      const matchesSearch =
        !normalizedQuery || buildSearchText(item, categoryNames).includes(normalizedQuery);
      const matchesCategory =
        !selectedCategory || categoryNames.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [allItems, categoriesById, normalizedQuery, selectedCategory]);

  const latestPosts = useMemo(() => {
    return allItems.slice(0, 4);
  }, [allItems]);
  const latestPostsCount = latestPosts.length;

  const categoryStats = useMemo(() => {
    const countsById = new Map<string, number>();
    const countsByName = new Map<string, number>();

    allItems.forEach((item) => {
      const namespacedName = resolveCategoryLabel(item.category) || DEFAULT_CATEGORY;
      countsByName.set(namespacedName, (countsByName.get(namespacedName) || 0) + 1);

      if (Array.isArray(item.categoryIds) && item.categoryIds.length > 0) {
        item.categoryIds.forEach((categoryId) => {
          countsById.set(categoryId, (countsById.get(categoryId) || 0) + 1);
        });
      }
    });

    if (Array.isArray(content.categories) && content.categories.length > 0) {
      return content.categories.map((category) => ({
        count: countsById.get(category.id) || countsByName.get(category.name) || 0,
        name: category.name,
      }));
    }

    return Array.from(countsByName.entries()).map(([name, count]) => ({
      count,
      name,
    }));
  }, [allItems, content.categories]);

  const latestComments = useMemo(
    () => (Array.isArray(content.comments) ? content.comments.slice(0, 4) : []),
    [content.comments],
  );

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitted(true);
    setNewsletterEmail("");
    setTimeout(() => setNewsletterSubmitted(false), 2500);
  };

  return (
    <section className="relative overflow-x-clip bg-white py-fluid-8 text-(--primary-shades-03)">
      <div className="pointer-events-none absolute left-[-10%] top-[18%] h-64 w-64 rounded-full bg-(--secondary-shades-08)/6 blur-[125px]" />
      <div className="pointer-events-none absolute bottom-[6%] right-[-10%] h-72 w-72 rounded-full bg-(--secondary-shades-09)/6 blur-[145px]" />

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
          <h2 className="font-poppins text-[clamp(2rem,5vw,4.8rem)] font-semibold leading-[1.1] tracking-[-0.02em] overflow-visible">
            {content.title}
          </h2>
          <p className="mt-fluid-5 text-fluid-lg leading-relaxed text-(--primary-shades-03)/66">
            {content.description}
          </p>
        </motion.div>

        <div className="mt-fluid-7 grid gap-fluid-6 md:[direction:ltr] md:grid-cols-[minmax(0,1.75fr)_minmax(16rem,0.95fr)] md:items-start md:gap-fluid-6 lg:grid-cols-[minmax(0,1.9fr)_minmax(17rem,0.95fr)] lg:gap-fluid-7">
          <aside className="order-1 space-y-fluid-5 md:order-2 md:sticky md:top-[7rem] md:self-start lg:[direction:rtl]">
            <motion.div
              className="border-b border-(--primary-shades-03)/12 pb-fluid-5"
              {...fadeUp(0.12, 28, 0.7)}
            >
              <h3 className="font-poppins text-fluid-xl font-semibold text-(--primary-shades-03)">
                {"\u0627\u0644\u0628\u062D\u062B"}
              </h3>
              <div className="mt-fluid-3">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={SEARCH_PLACEHOLDER}
                  className="h-12 w-full rounded-xl border border-(--primary-shades-03)/14 bg-white px-4 text-fluid-base text-(--primary-shades-03) outline-none transition duration-300 placeholder:text-(--primary-shades-03)/40 focus:border-(--secondary-shades-09) focus:ring-2 focus:ring-(--secondary-shades-09)/20"
                />
              </div>
            </motion.div>

            <motion.div
              className="border-b border-(--primary-shades-03)/12 pb-fluid-5"
              {...fadeUp(0.16, 28, 0.7)}
            >
              <h3 className="font-poppins text-fluid-xl font-semibold text-(--primary-shades-03)">
                {`\u0622\u062E\u0631 ${latestPostsCount} \u0628\u0648\u0633\u062A\u0627\u062A`}
              </h3>
              <div className="mt-fluid-4 space-y-3">
                {latestPosts.length === 0 ? (
                  <p className="text-fluid-base leading-relaxed text-(--primary-shades-03)/60">
                    {"\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u0648\u0633\u062A\u0627\u062A \u062D\u0627\u0644\u064A\u0627\u064B."}
                  </p>
                ) : (
                  latestPosts.map((post, index) => (
                    <Link
                      key={post.slug}
                      href={resolveBlogItemLink(post)}
                      className="group block border-b border-(--primary-shades-03)/10 px-1 py-3 transition duration-300 hover:border-(--secondary-shades-09)/40"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-2 h-2 w-2 shrink-0 rounded-full",
                            accentDotClasses[accentOrder[index % accentOrder.length]],
                          )}
                        />
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-fluid-base font-semibold leading-[1.55] text-(--primary-shades-03)">
                            {post.title}
                          </p>
                          <p className="mt-1 text-[11px] tracking-[0.18em] text-(--primary-shades-03)/52">
                            {post.meta || DEFAULT_META}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              className="border-b border-(--primary-shades-03)/12 pb-fluid-5"
              {...fadeUp(0.2, 28, 0.7)}
            >
              <h3 className="font-poppins text-fluid-xl font-semibold text-(--primary-shades-03)">
                {"\u0627\u0644\u062A\u0635\u0646\u064A\u0641\u0627\u062A"}
              </h3>
              <div className="mt-fluid-4 flex flex-wrap gap-2">
                {categoryStats.length === 0 ? (
                  <p className="text-fluid-base leading-relaxed text-(--primary-shades-03)/60">
                    {"\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0635\u0646\u064A\u0641\u0627\u062A \u062D\u0627\u0644\u064A\u0627\u064B."}
                  </p>
                ) : (
                  categoryStats.map((category, index) => (
                    <button
                      type="button"
                      key={category.name}
                      onClick={() =>
                        setSelectedCategory((current) =>
                          current === category.name ? "" : category.name,
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-[0.2em] transition",
                        selectedCategory === category.name
                          ? "border-(--secondary-shades-09) bg-(--secondary-shades-09)/8 text-(--primary-shades-03)"
                          : "border-(--primary-shades-03)/14 bg-transparent text-(--primary-shades-03)/64 hover:border-(--secondary-shades-09)/45",
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          accentDotClasses[accentOrder[index % accentOrder.length]],
                        )}
                      />
                      <span>{category.name}</span>
                      <span className="text-(--secondary-shades-08)">{category.count}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              className="pb-fluid-2"
              {...fadeUp(0.24, 28, 0.7)}
            >
              <h3 className="font-poppins text-fluid-xl font-semibold text-(--primary-shades-03)">
                {"\u0622\u062E\u0631 \u0627\u0644\u062A\u0639\u0644\u064A\u0642\u0627\u062A"}
              </h3>
              <div className="mt-fluid-4 space-y-3">
                {latestComments.length === 0 ? (
                  <p className="text-fluid-base leading-relaxed text-(--primary-shades-03)/60">
                    {"\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0639\u0644\u064A\u0642\u0627\u062A \u062D\u0627\u0644\u064A\u0627\u064B."}
                  </p>
                ) : (
                  latestComments.map((comment, index) => (
                    <div
                      key={comment.id || `${comment.userName}-${index}`}
                      className="border-b border-(--primary-shades-03)/10 px-1 py-3"
                    >
                      <p className="text-fluid-sm leading-[1.8] text-(--primary-shades-03)/74">
                        {toPreviewText(comment.comment || EMPTY_EXCERPT_FALLBACK, 92)}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] tracking-[0.18em] text-(--primary-shades-03)/52">
                        <span>{comment.userName || DEFAULT_COMMENT_AUTHOR}</span>
                        <span>{comment.date || DEFAULT_META}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              className="border-t border-(--primary-shades-03)/12 pt-fluid-5"
              {...fadeUp(0.28, 28, 0.7)}
            >
              <NewsletterSubscribe
                title={NEWSLETTER_TITLE}
                headingTone="primary"
                description="أدخل بريدك الإلكتروني ليصلك كل جديد من مقالات جهور."
                email={newsletterEmail}
                onEmailChange={setNewsletterEmail}
                onSubmit={handleNewsletterSubmit}
                submitted={newsletterSubmitted}
                surface="light"
              />
            </motion.div>
          </aside>

          <div className="order-2 space-y-fluid-5 md:order-1 lg:[direction:rtl]">
            {filteredItems.length === 0 ? (
              <motion.div
                className="border-b border-(--primary-shades-03)/12 pb-fluid-5 text-center"
                {...fadeUp(0.12, 30, 0.72)}
              >
                <p className="text-fluid-lg leading-relaxed text-(--primary-shades-03)/68">
                  {"\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0642\u0627\u0644\u0627\u062A \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0628\u062D\u062B."}
                </p>
              </motion.div>
            ) : (
              filteredItems.map((item, index) => {
                const accent = accentOrder[index % accentOrder.length];
                const cardExcerpt = item.excerpt?.trim() || EMPTY_EXCERPT_FALLBACK;
                const itemHref = resolveBlogItemLink(item);

                return (
                  <motion.article
                    key={item.slug}
                    className="group overflow-hidden border-b border-(--primary-shades-03)/12 bg-transparent pb-fluid-5 last:border-b-0"
                    {...fadeUp(0.1 + index * 0.04, 30, 0.7)}
                    whileHover={{ y: -7 }}
                  >
                    <Link href={itemHref} className="block">
                      <div className="relative aspect-[2.1/1] overflow-hidden border-b border-(--primary-shades-03)/10 bg-(--primary-shades-03)/5">
                        {item.coverImage ? (
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 780px"
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-fluid-sm text-(--primary-shades-03)/48">
                            {"\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0648\u0631\u0629"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-fluid-4 p-fluid-5 text-right sm:p-fluid-6">
                        <h3 className="font-poppins text-[clamp(1.45rem,2.6vw,2.1rem)] font-semibold leading-[1.2] text-(--primary-shades-03)">
                          {item.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-(--primary-shades-03)/56">
                          <span className="inline-flex items-center gap-2 rounded-full border border-(--primary-shades-03)/14 px-3 py-1">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              accentDotClasses[accent],
                            )}
                          />
                          <span>{resolveCategoryLabel(item.category) || DEFAULT_CATEGORY}</span>
                        </span>
                          <span>{item.meta || DEFAULT_META}</span>
                          <span>{item.source || DEFAULT_SOURCE}</span>
                        </div>

                        <p className="text-fluid-base leading-[1.9] text-(--primary-shades-03)/68">
                          {cardExcerpt}
                        </p>

                        {Array.isArray(item.tags) && item.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-(--primary-shades-03)/12 bg-(--primary-shades-03)/4 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.15em] text-(--primary-shades-03)/60"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="pt-1">
                          <span className="inline-flex items-center">
                            <span className="inline-flex items-center gap-2.5 rounded-full bg-(--primary-shades-02) px-4 py-2.5 text-fluid-sm font-semibold text-white shadow-[0_14px_36px_rgba(34,27,79,0.16)]">
                              <span className="h-2 w-2 rounded-full bg-(--secondary-shades-08)" />
                              <span>{BLOG_DETAILS_BUTTON_LABEL}</span>
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                                <ArrowUpLeft className="h-3.5 w-3.5" />
                              </span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default BlogPreviewSection;
