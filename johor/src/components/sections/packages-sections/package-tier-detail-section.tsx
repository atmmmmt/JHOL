"use client";

import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useMemo, useCallback, useEffect, useState } from "react";
import type { PackageDetail, PackageSaleTier } from "../../../data/package-details";
import { addCartItem, requestOpenCart } from "../../../lib/cart";
import { cn } from "../../../lib/cn";
import { isPriceText, parsePriceText } from "../../../lib/price";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import CtaSubmitButton from "../../common/cta-submit-button";

type TierGalleryImage = {
  alt: string;
  src: StaticImageData | string;
  video?: string;
};

type ResolvedVideoSource = {
  type: "embed" | "file";
  src: string;
};

type PackageTierDetailSectionProps = {
  detail: PackageDetail;
  tier: PackageSaleTier;
};


function getTierGallery(tier: PackageSaleTier): TierGalleryImage[] {
  const dashboardGallery: TierGalleryImage[] = [];

  tier.gallery?.forEach((image, index) => {
    const src = image.src || image.image;
    const video = (image as { video?: string }).video?.trim();

    if (!src && !video) {
      return;
    }

    dashboardGallery.push({
      alt: image.alt || `${tier.name} ${index + 1}`,
      src: src || (video as string),
      video: video || undefined,
    });
  });

  if (dashboardGallery.length) {
    return dashboardGallery;
  }

  return [];
}

function getTierCoverImage(tier: PackageSaleTier): string | undefined {
  if (typeof tier.previewImage === "string" && tier.previewImage.trim()) {
    return tier.previewImage.trim();
  }

  for (const image of tier.gallery ?? []) {
    const src = typeof image?.src === "string" && image.src.trim()
      ? image.src.trim()
      : typeof image?.image === "string" && image.image.trim()
        ? image.image.trim()
        : "";

    if (src) {
      return src;
    }
  }

  return undefined;
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
    return { type: "embed", src: `https://www.youtube.com/embed/${youtubeWatchMatch[1]}` };
  }

  const youtubeEmbedMatch = trimmedUrl.match(/youtube\.com\/embed\/([\w-]{6,})/i);
  if (youtubeEmbedMatch?.[1]) {
    return { type: "embed", src: `https://www.youtube.com/embed/${youtubeEmbedMatch[1]}` };
  }

  const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch?.[1]) {
    return { type: "embed", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(trimmedUrl)) {
    return { type: "file", src: trimmedUrl };
  }

  return null;
}

function PackageTierDetailSection({ detail, tier }: PackageTierDetailSectionProps) {
  const gallery = useMemo(() => getTierGallery(tier), [tier]);
  const [activeImageState, setActiveImageState] = useState({
    index: 0,
    tierId: tier.id,
  });
  const activeImageIndex =
    activeImageState.tierId === tier.id ? activeImageState.index : 0;
  const activeImage = gallery[activeImageIndex] ?? gallery[0];
  const activeVideo = resolveCardVideoSource(activeImage?.video);
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setLightboxOpen(false);
  }, [tier.id]);
  const coverImage = getTierCoverImage(tier);
  const selectedPreviewImage =
    coverImage ||
    (activeImage
        ? typeof activeImage.src === "string"
          ? activeImage.src
          : activeImage.src.src
        : undefined);

  const resolvedPrice = useMemo(() => {
    if (tier.price) {
      return parsePriceText(tier.price).value;
    }

    const priceFeature = tier.cards
      .flatMap((c) => c.features)
      .find((f) => isPriceText(f.title));

    if (!priceFeature) return undefined;

    return parsePriceText(priceFeature.title).value;
  }, [tier]);

  const packageType = detail.id === "package-2" ? "identity" as const : "campaign" as const;

  const handleAddToCart = () => {
    const result = addCartItem({
      packageId: detail.id,
      packageTitle: detail.title,
      tierId: tier.id,
      tierName: tier.name,
      previewImage: selectedPreviewImage,
      price: resolvedPrice,
      packageType,
    });

    if (result.added) {
      requestOpenCart();
    }
  };

  const handleDirectBuy = useCallback(() => {
    addCartItem({
      packageId: detail.id,
      packageTitle: detail.title,
      tierId: tier.id,
      tierName: tier.name,
      previewImage: selectedPreviewImage,
      price: resolvedPrice,
      packageType,
    });
    window.location.href = "/checkout";
  }, [detail, tier, selectedPreviewImage, resolvedPrice, packageType]);

  return (
    <section className="relative overflow-visible bg-(--white-shades-01) py-fluid-7">
      <Container className="relative z-10">
        <div className="grid gap-fluid-5 [direction:ltr] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <article className="lg:sticky lg:top-24 lg:self-start">
            <motion.div {...fadeUp(0.06, 24, 0.62)}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-(--primary-shades-03)/10 bg-(--white-shades-01) md:aspect-auto md:h-[460px]">
                {activeVideo ? (
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    aria-label="تكبير الفيديو وتشغيله"
                    className="group absolute inset-0 h-full w-full cursor-pointer"
                  >
                    {activeVideo.type === "file" ? (
                      <video
                        src={activeVideo.src}
                        className="h-full w-full object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <div className="h-full w-full bg-(--primary-shades-02)" />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/32">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-white/22 text-white backdrop-blur-[2px] transition-transform group-hover:scale-105">
                        <Play className="h-6 w-6 translate-x-[1px]" />
                      </span>
                    </span>
                  </button>
                ) : activeImage ? (
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 95vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="h-full w-full bg-(--primary-shades-02)/10" />
                )}
              </div>

              {gallery.length > 1 ? (
                <div className="mt-3 grid grid-cols-4 gap-2.5">
                  {gallery.map((image, index) => {
                    const thumbVideo = resolveCardVideoSource(image.video);

                    return (
                      <button
                        key={`${tier.id}-${image.alt}`}
                        type="button"
                        onClick={() => setActiveImageState({ index, tierId: tier.id })}
                        className={cn(
                          "relative h-[78px] overflow-hidden rounded-lg border",
                          index === activeImageIndex
                            ? "border-(--secondary-shades-08)"
                            : "border-(--primary-shades-03)/12",
                        )}
                      >
                        {thumbVideo ? (
                          <>
                            {thumbVideo.type === "file" ? (
                              <video
                                src={thumbVideo.src}
                                className="h-full w-full object-cover"
                                muted
                                preload="metadata"
                                playsInline
                              />
                            ) : (
                              <div className="h-full w-full bg-(--primary-shades-02)" />
                            )}
                            <span className="absolute inset-0 flex items-center justify-center bg-black/24">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-(--primary-shades-02)">
                                <Play className="h-3 w-3 translate-x-[1px]" />
                              </span>
                            </span>
                          </>
                        ) : (
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 22vw, 120px"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </motion.div>
          </article>

          <motion.article
            dir="rtl"
            className="rounded-[1.4rem] border border-(--primary-shades-03)/10 bg-white p-fluid-4 text-right shadow-[0_16px_50px_rgba(34,27,79,0.08)]"
            {...fadeUp(0.12, 24, 0.62)}
          >
            <header className="border-b border-(--primary-shades-03)/10 pb-3.5 text-right">
              <h1 className="text-[clamp(1.4rem,3.5vw,2.25rem)] font-semibold leading-[1.28] text-(--primary-shades-03)">
                {tier.name}
              </h1>
              {tier.subtitle ? (
                <p className="text-fluid-lg font-medium leading-[1.4] text-(--secondary-shades-08)">
                  {tier.subtitle}
                </p>
              ) : null}
            </header>

            <div className="mt-3.5 space-y-3">
              {tier.cards.map((group) => {
                const cardVideo = resolveCardVideoSource(group.video);

                return (
                  <section
                    key={`${tier.id}-${group.number}`}
                    className="rounded-xl border border-(--primary-shades-03)/10 bg-(--white-shades-01) p-3.5"
                  >
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-(--secondary-shades-08) px-2 text-fluid-sm font-semibold text-white">
                        {group.number}
                      </span>
                      <h2 className="text-fluid-base font-semibold text-(--primary-shades-03)">{group.badge}</h2>
                    </div>

                    {cardVideo ? (
                      <div className="mb-3 overflow-hidden rounded-lg border border-(--primary-shades-03)/10 bg-(--white-shades-01)">
                        {cardVideo.type === "embed" ? (
                          <iframe
                            src={cardVideo.src}
                            title={`Video ${group.badge}`}
                            className="aspect-video w-full"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            className="aspect-video w-full object-cover"
                            controls
                            preload="metadata"
                            playsInline
                          >
                            <source src={cardVideo.src} />
                          </video>
                        )}
                      </div>
                    ) : null}

                    <ul className="space-y-1 pr-4 text-fluid-sm leading-[1.7] text-(--primary-shades-03)/82 marker:text-(--secondary-shades-08)">
                      {group.features.map((feature) => (
                        <li key={`${group.number}-${feature.title}`} className="list-disc">
                          {feature.title}
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2.5 [direction:rtl]">
              <CtaSubmitButton
                type="button"
                label="أضف إلى السلة"
                surface="dark"
                buttonClassName="cursor-pointer"
                onClick={handleAddToCart}
              />
              <CtaSubmitButton
                type="button"
                label="شراء مباشر"
                surface="light"
                buttonClassName="cursor-pointer"
                onClick={handleDirectBuy}
              />
            </div>
          </motion.article>
        </div>
      </Container>

      {isLightboxOpen && activeVideo ? (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="إغلاق"
            className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="w-full max-w-4xl overflow-hidden rounded-xl shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            {activeVideo.type === "embed" ? (
              <iframe
                src={activeVideo.src}
                title={activeImage.alt}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <video
                src={activeVideo.src}
                className="aspect-video w-full bg-black"
                controls
                autoPlay
                playsInline
              />
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default PackageTierDetailSection;


