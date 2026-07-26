"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PackageVideo } from "../../../data/package-details";
import { fadeUp } from "../../../lib/motion";

// Use the video's own first frame as the cover instead of a static frontend
// image. Appending a media fragment nudges the browser to seek + paint the
// first frame while only `metadata` is preloaded, so no separate poster asset
// is needed.
function firstFrameSrc(url: string) {
  if (!url) return url;
  if (url.includes("#")) return url;
  return `${url}#t=0.1`;
}

type VideoCardProps = {
  video: PackageVideo;
  playingId: string | null;
  onPlay: (id: string) => void;
};

function VideoCard({ video, playingId, onPlay }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlaying = playingId === video.id;

  const handleClick = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      onPlay("");
    } else {
      onPlay(video.id);
      el.play().catch(() => {});
    }
  }, [isPlaying, onPlay, video.id]);

  useEffect(() => {
    if (!isPlaying && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div
      className="relative aspect-video cursor-pointer overflow-hidden rounded-2xl bg-(--primary-shades-02)"
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        src={firstFrameSrc(video.url)}
        className="h-full w-full object-cover"
        playsInline
        preload="metadata"
        onEnded={() => onPlay("")}
      />

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(180deg,rgba(18,12,51,0.14),rgba(18,12,51,0.68))] transition-opacity"
        animate={{ opacity: isPlaying ? 0 : 1 }}
        transition={{ duration: 0.28 }}
        style={{ pointerEvents: "none" }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/20 backdrop-blur-sm">
          <svg viewBox="0 0 24 24" className="h-6 w-6 translate-x-0.5 fill-white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        {video.title ? (
          <p className="mt-3 px-4 text-center text-sm font-medium text-white/90 leading-snug">
            {video.title}
          </p>
        ) : null}
      </motion.div>
    </div>
  );
}

type PackageVideoGridProps = {
  videos: PackageVideo[];
  sectionLabel?: string;
};

export function PackageVideoGrid({ videos, sectionLabel }: PackageVideoGridProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = useCallback((id: string) => {
    setPlayingId(id || null);
  }, []);

  if (!videos.length) return null;

  return (
    <motion.section
      dir="rtl"
      className="pb-fluid-5"
      {...fadeUp(0.06, 28, 0.7)}
    >
      <div className="mx-auto w-full max-w-[86rem] px-fluid-4 relative z-10">
        {sectionLabel ? (
          <p className="mb-4 text-right text-[0.82rem] font-medium tracking-[0.08em] text-(--secondary-shades-08)">
            {sectionLabel}
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {videos.map((video, index) => (
            <motion.div key={video.id} {...fadeUp(0.04 + index * 0.06, 22, 0.6)}>
              <VideoCard video={video} playingId={playingId} onPlay={handlePlay} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
