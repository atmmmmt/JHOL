"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { PackageSaleCard, PackageSaleTier } from "../../../data/package-details";
import { cn } from "../../../lib/cn";
import { fadeUp } from "../../../lib/motion";
import { isPriceText, parsePriceText } from "../../../lib/price";
import detailsGalleryOne from "../../../assets/images/1.webp";
import detailsGalleryTwo from "../../../assets/images/2.webp";
import detailsGalleryThree from "../../../assets/images/3.webp";
import detailsGalleryFour from "../../../assets/images/4.webp";
import detailsGalleryFive from "../../../assets/images/5.webp";
import detailsGallerySix from "../../../assets/images/6.webp";
import detailsGallerySeven from "../../../assets/images/7.webp";
import Container from "../../common/container";
import CtaLinkButton from "../../common/cta-link-button";
import { useCursorMask } from "../../common/cursor-mask-context";

type PackageDetailSaleCardsSectionProps = {
  packageId: string;
  packagePath?: string;
  cards?: PackageSaleCard[];
  tiers?: PackageSaleTier[];
  imageTiers?: PackageSaleTier[];
  dotClass: string;
  glowPrimaryClass: string;
  glowSecondaryClass: string;
};

type TierPrice = {
  value: string;
  note?: string;
};

type CardDensity = "regular" | "compact";

type TierPreviewImage = {
  alt: string;
  src: string | StaticImageData;
};

type ResolvedVideoSource = {
  type: "embed" | "file";
  src: string;
};

const DEFAULT_TIER_PREVIEW_IMAGES: Record<string, TierPreviewImage> = {
  snapchat: { src: detailsGalleryOne, alt: "صورة باقة حملات السناب شات" },
  meta: { src: detailsGalleryTwo, alt: "صورة باقة حملات الإنستغرام والفيسبوك" },
  tiktok: { src: detailsGalleryThree, alt: "صورة باقة حملات التيك توك" },
  "all-platforms": { src: detailsGalleryFour, alt: "صورة باقة جميع المنصات" },
  basic: { src: detailsGalleryOne, alt: "صورة الباقة الأساسية" },
  advanced: { src: detailsGalleryFive, alt: "صورة الباقة الشاملة" },
  "cafes-restaurants": { src: detailsGallerySix, alt: "صورة باقة المقاهي والمطاعم" },
};

function getTierPrice(tier: PackageSaleTier): TierPrice | null {
  if (tier.price) {
    const parsedPrice = parsePriceText(tier.price);
    return {
      note: tier.priceNote || parsedPrice.note,
      value: parsedPrice.value,
    };
  }

  const priceFeature = tier.cards
    .flatMap((card) => card.features)
    .find((feature) => isPriceText(feature.title));

  if (!priceFeature) {
    return null;
  }

  const parsedPrice = parsePriceText(priceFeature.title);
  const subtitleNote = (priceFeature.subtitle ?? "").trim();
  const mergedNote = [parsedPrice.note, subtitleNote].filter(Boolean).join(" • ");

  return {
    note: mergedNote || undefined,
    value: parsedPrice.value,
  };
}

function detectCompactLayout(tiers: PackageSaleTier[]) {
  if (tiers.length >= 4) {
    return true;
  }

  return tiers.some((tier) =>
    tier.cards.some((card) =>
      card.features.some((feature) => feature.title.length > 56),
    ),
  );
}

function getDisplayBadge(card?: PackageSaleCard) {
  if (!card?.badge || card.badge.trim() === "تشمل") {
    return "خطة الباقة";
  }

  return card.badge;
}

function resolveFeaturedTierIndex(
  tiers: PackageSaleTier[],
  imageTiers?: PackageSaleTier[],
) {
  const explicitFeaturedIndex = tiers.findIndex((tier) => {
    if (tier.isFeatured === true) {
      return true;
    }

    const fallbackTier = imageTiers?.find(
      (candidateTier) => candidateTier.id === tier.id,
    );

    return fallbackTier?.isFeatured === true;
  });

  if (explicitFeaturedIndex !== -1) {
    return explicitFeaturedIndex;
  }

  const allPlatformsIndex = tiers.findIndex((tier) => tier.id === "all-platforms");
  if (allPlatformsIndex !== -1) {
    return allPlatformsIndex;
  }

  if (tiers.length >= 3 && tiers.length % 2 === 1) {
    return Math.floor(tiers.length / 2);
  }

  return -1;
}

function resolveTierPreviewImage(
  tier: PackageSaleTier,
  fallbackTier?: PackageSaleTier,
): TierPreviewImage {
  const directPreviewImageCandidates = [tier.previewImage, fallbackTier?.previewImage]

  for (const candidateValue of directPreviewImageCandidates) {
    if (typeof candidateValue === "string" && candidateValue.trim()) {
      return {
        alt: `صورة ${tier.name}`,
        src: candidateValue.trim(),
      };
    }
  }

  const gallerySources = [tier.gallery, fallbackTier?.gallery];

  for (const gallery of gallerySources) {
    if (!Array.isArray(gallery)) {
      continue;
    }

    for (const image of gallery) {
      const src = typeof image?.src === "string" && image.src.trim()
        ? image.src.trim()
        : typeof image?.image === "string" && image.image.trim()
          ? image.image.trim()
          : "";

      if (!src) {
        continue;
      }

      return {
        alt: image.alt || `صورة ${tier.name}`,
        src,
      };
    }
  }

  return (
    DEFAULT_TIER_PREVIEW_IMAGES[tier.id] ?? {
      src: detailsGallerySeven,
      alt: `صورة ${tier.name}`,
    }
  );
}

function resolveCardVideoSource(videoUrl?: string): ResolvedVideoSource | null {
  if (!videoUrl || typeof videoUrl !== "string") {
    return null;
  }

  const trimmedUrl = videoUrl.trim();
  if (!trimmedUrl) {
    return null;
  }

  const youtubeWatchMatch = trimmedUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/i,
  );
  if (youtubeWatchMatch?.[1]) {
    return {
      type: "embed",
      src: `https://www.youtube.com/embed/${youtubeWatchMatch[1]}`,
    };
  }

  const youtubeEmbedMatch = trimmedUrl.match(/youtube\.com\/embed\/([\w-]{6,})/i);
  if (youtubeEmbedMatch?.[1]) {
    return {
      type: "embed",
      src: `https://www.youtube.com/embed/${youtubeEmbedMatch[1]}`,
    };
  }

  const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch?.[1]) {
    return {
      type: "embed",
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(trimmedUrl)) {
    return {
      type: "file",
      src: trimmedUrl,
    };
  }

  return null;
}

function SummaryTierCard({
  detailPath,
  density,
  featureLimit,
  isFeatured,
  previewImage,
  tier,
  tierIndex,
}: {
  detailPath: string;
  density: CardDensity;
  featureLimit: number;
  isFeatured: boolean;
  previewImage: TierPreviewImage;
  tier: PackageSaleTier;
  tierIndex: number;
}) {
  const router = useRouter();
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const { setMaskMode, courseMaskTargetRef } = useCursorMask();
  const firstCard = tier.cards[0];
  const firstVideoCard = tier.cards.find(
    (card) => typeof card.video === "string" && card.video.trim().length > 0,
  );
  const resolvedCardVideo = resolveCardVideoSource(firstVideoCard?.video);
  const displayBadge = tier.summaryBadge?.trim() || getDisplayBadge(firstCard);
  const summaryAudienceNote = tier.summaryAudienceNote?.trim() || firstCard?.audienceNote;
  const tierPrice = getTierPrice(tier);
  const isCompact = density === "compact";
  const featureHighlights = Array.isArray(tier.summaryFeatures) && tier.summaryFeatures.length > 0
    ? tier.summaryFeatures.slice(0, featureLimit)
    : tier.cards
        .flatMap((card) => card.features.map((feature) => feature.title))
        .filter((feature) => !isPriceText(feature))
        .slice(0, featureLimit);

  return (
    <motion.article
      className={cn(
        "group relative h-full cursor-pointer overflow-hidden rounded-[1.6rem] border bg-(--white-shades-01) text-right transform-gpu transition-transform duration-250 ease-out will-change-transform hover:-translate-y-1",
        isCompact ? "p-3" : "p-fluid-4",
        isFeatured
          ? "border-(--secondary-shades-08) shadow-[0_20px_48px_rgba(238,32,77,0.2)] md:-translate-y-2"
          : "border-(--primary-shades-03)/12 shadow-[0_16px_42px_rgba(34,27,79,0.08)]",
      )}
      {...fadeUp(0.12 + tierIndex * 0.06, 24, 0.64)}
      onClick={() => router.push(detailPath)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(detailPath);
        }
      }}
      onMouseEnter={(event) => {
        courseMaskTargetRef.current = event.currentTarget;
        setMaskMode("course");
      }}
      onMouseLeave={() => {
        courseMaskTargetRef.current = null;
        setMaskMode("none");
      }}
      onFocus={(event) => {
        courseMaskTargetRef.current = event.currentTarget;
        setMaskMode("course");
      }}
      onBlur={() => {
        courseMaskTargetRef.current = null;
        setMaskMode("none");
      }}
      tabIndex={0}
      role="link"
      aria-label={`عرض تفاصيل ${tier.name}`}
    >
      {isFeatured ? (
        <div className="absolute inset-x-0 top-0 z-20 flex justify-center">
          <span className="inline-flex items-center gap-1 rounded-b-xl bg-(--secondary-shades-08) px-3 py-1 text-[0.72rem] font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5" />
            الأكثر تميزًا
          </span>
        </div>
      ) : null}

      <div className="relative z-10 flex h-full flex-col">
        <div
          className={cn(
            "flex h-full flex-col rounded-[1.35rem] border",
            isCompact ? "px-3 pb-3 pt-4" : "px-4 pb-4 pt-5",
            isCompact ? "min-h-[19rem]" : "min-h-[22rem]",
            isFeatured
              ? "border-(--secondary-shades-08)/35 bg-[linear-gradient(180deg,rgba(238,32,77,0.09),rgba(255,255,255,0.88)_58%)]"
              : "border-(--primary-shades-03)/10 bg-[linear-gradient(180deg,rgba(34,27,79,0.045),rgba(255,255,255,0.92)_62%)]",
          )}
        >
          <div className="mb-3">
            <div className="space-y-2.5">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-(--primary-shades-03)/12 bg-(--white-shades-01)">
                <Image
                  src={previewImage.src}
                  alt={previewImage.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 92vw, 28vw"
                />
              </div>

              {null}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-semibold leading-[1.2]",
                isFeatured
                  ? "bg-(--secondary-shades-08)/15 text-(--secondary-shades-08)"
                  : "bg-(--primary-shades-03)/8 text-(--primary-shades-03)/70",
              )}
            >
              {displayBadge}
            </span>
          </div>

          <div className="mt-4 text-center">
            <h4
              className={cn(
                "font-semibold leading-[1.3] text-(--primary-shades-03)",
                isCompact
                  ? "text-[clamp(1rem,1.9vw,1.35rem)]"
                  : "text-[clamp(1.15rem,2.4vw,1.65rem)]",
              )}
            >
              {tier.name}
            </h4>
            {tier.subtitle ? (
              <p
                className={cn(
                  "mt-1 font-semibold tracking-wide text-(--primary-shades-03)/66",
                  isCompact ? "line-clamp-2 text-[0.82rem] leading-[1.45]" : "text-[0.88rem]",
                )}
              >
                {tier.subtitle}
              </p>
            ) : null}
            {summaryAudienceNote ? (
              <p
                className={cn(
                  "mx-auto mt-3 max-w-[18rem] text-(--primary-shades-03)/62",
                  isCompact
                    ? "line-clamp-3 text-[0.78rem] leading-[1.72]"
                    : "text-[0.8rem] leading-[1.82]",
                )}
              >
                {summaryAudienceNote}
              </p>
            ) : null}
          </div>

          <div className="mt-auto pt-3">
            {tierPrice ? (
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-center",
                  isFeatured
                    ? "border-(--secondary-shades-08)/28"
                    : "border-(--primary-shades-03)/10",
                )}
              >
                <span
                  className={cn(
                    "text-[0.72rem] font-semibold",
                    isFeatured
                      ? "text-(--secondary-shades-08)"
                      : "text-(--primary-shades-03)/60",
                  )}
                >
                  السعر
                </span>
                <p
                  className={cn(
                    "mt-1.5 font-bold leading-none tracking-tight text-(--primary-shades-03)",
                    isCompact ? "text-[1.52rem]" : "text-[2rem]",
                  )}
                >
                  {tierPrice.value}
                </p>
                {tierPrice.note ? (
                  <p
                    className={cn(
                      "mt-1.5 text-(--primary-shades-03)/56",
                      isCompact
                        ? "line-clamp-2 text-[0.7rem] leading-[1.55]"
                        : "text-[0.72rem] leading-[1.65]",
                    )}
                  >
                    {tierPrice.note}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-3">
              <CtaLinkButton
                href={detailPath}
                label={tier.ctaLabel?.trim() || "اختر الخطة"}
                surface={isFeatured ? "light" : "dark"}
                hoverMatchDot
                truncateLabel={false}
                linkClassName="w-full"
                shellClassName={cn(
                  "w-full justify-between shadow-[0_12px_28px_rgba(34,27,79,0.08)]",
                  isFeatured ? "bg-(--secondary-shades-08) text-white" : undefined,
                )}
                dotClassName={isFeatured ? "bg-white" : undefined}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex-1 rounded-[1.2rem] border border-(--primary-shades-03)/10 bg-white/70 px-4 py-4">
          <h5
            className={cn(
              "mb-2 font-semibold text-(--primary-shades-03)",
                  isCompact ? "text-[0.92rem]" : "text-[0.95rem]",
            )}
          >
            محتوى الباقة
          </h5>
          <ul className="space-y-2">
            {featureHighlights.map((feature) => (
              <li
                key={`${tier.id}-${feature}`}
                className={cn(
                  "flex items-start gap-2 text-(--primary-shades-03)/80",
                  isCompact
                    ? "text-[0.86rem] leading-[1.68]"
                    : "text-[0.9rem] leading-[1.72]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full",
                    isFeatured ? "bg-(--secondary-shades-08)/16" : "bg-(--primary-shades-03)/10",
                  )}
                >
                  <Check
                    className={cn(
                      "h-3 w-3",
                      isFeatured ? "text-(--secondary-shades-08)" : "text-(--primary-shades-03)/75",
                    )}
                  />
                </span>
                <span className={cn(isCompact ? "line-clamp-2" : undefined)}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 border-t border-(--primary-shades-03)/10 pt-3">
          <div className="flex items-center justify-between gap-2 text-[0.78rem] text-(--primary-shades-03)/68">
            <span>تفاصيل أكثر</span>
            <span className="font-medium text-(--primary-shades-03)">
              {tier.cards.length} أقسام
            </span>
          </div>
        </div>
      </div>

      {isVideoDialogOpen && resolvedCardVideo && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsVideoDialogOpen(false);
              }}
            >
              <div
                className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <div className="flex items-center justify-between border-b border-white/15 px-4 py-2 text-white">
                  <p className="text-sm font-medium">الفيديو التعريفي - {tier.name}</p>
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-sm text-white/85 hover:bg-white/10"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsVideoDialogOpen(false);
                    }}
                  >
                    إغلاق
                  </button>
                </div>

                {resolvedCardVideo.type === "embed" ? (
                  <iframe
                    src={resolvedCardVideo.src}
                    title={`Video preview - ${tier.name}`}
                    className="aspect-video w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video className="aspect-video w-full" controls preload="metadata" playsInline autoPlay>
                    <source src={resolvedCardVideo.src} />
                  </video>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </motion.article>
  );
}

function PackageDetailSaleCardsSection({
  packageId,
  packagePath,
  cards,
  tiers,
  imageTiers,
  dotClass,
  glowPrimaryClass,
  glowSecondaryClass,
}: PackageDetailSaleCardsSectionProps) {
  const resolvedTiers: PackageSaleTier[] =
    tiers?.length
      ? tiers
      : cards?.length
        ? [{ id: "default", name: "الباقة الأساسية", cards }]
        : [];

  if (!resolvedTiers.length) {
    return null;
  }

  const featuredTierIndex = resolveFeaturedTierIndex(resolvedTiers, imageTiers);
  const isFourTierLayout = resolvedTiers.length === 4;
  const compactLayout = detectCompactLayout(resolvedTiers);
  const featureLimit = 999;
  const gridColsClass =
    resolvedTiers.length === 3
      ? "xl:grid-cols-3"
      : resolvedTiers.length >= 4
        ? "xl:grid-cols-4"
        : "xl:grid-cols-2";

  return (
    <section dir="rtl" className="relative py-fluid-6">
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            "absolute right-[-8%] top-[-14%] h-64 w-64 rounded-full blur-[118px]",
            glowPrimaryClass,
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-18%] left-[-12%] h-72 w-[18rem] rounded-full blur-[120px]",
            glowSecondaryClass,
          )}
        />
      </div>

      <Container className="relative z-10 space-y-fluid-5">
        <motion.div className="text-right" {...fadeUp(0.06, 24, 0.68)}>
          <span className="inline-flex items-center gap-2 text-[0.76rem] font-medium tracking-[0.08em] text-(--secondary-shades-08) sm:text-fluid-sm sm:tracking-[0.18em]">
            <span className={cn("h-2 w-2 rounded-full", dotClass)} />
            نوع الباقة والمحتوى
          </span>
          <h3 className="mt-2 max-w-[14rem] text-[clamp(1.75rem,7vw,2.3rem)] font-semibold leading-[1.18] text-(--primary-shades-03) sm:max-w-none">
            تفاصيل باقات الخدمة
          </h3>
        </motion.div>

        <div
          className={cn(
            "grid gap-fluid-4 md:grid-cols-2",
            gridColsClass,
            isFourTierLayout ? "xl:gap-3" : undefined,
          )}
        >
          {resolvedTiers.map((tier, tierIndex) => (
            <SummaryTierCard
              key={tier.id}
              detailPath={`${(packagePath || `/packages/${packageId}`).replace(/\/$/, "")}/${tier.id}`}
              density={compactLayout ? "compact" : "regular"}
              featureLimit={featureLimit}
              isFeatured={tierIndex === featuredTierIndex}
              previewImage={resolveTierPreviewImage(
                tier,
                imageTiers?.find((candidateTier) => candidateTier.id === tier.id),
              )}
              tier={tier}
              tierIndex={tierIndex}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default PackageDetailSaleCardsSection;
