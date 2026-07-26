import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

const FAILSAFE_DURATION = 8000;
const POST_VIDEO_DELAY = 200;
const ROUTE_MAX_DURATION = 1800;
const INTRO_VIDEO_SRC = "/videos/JHOR.mp4";

type LoadingOverlayProps = {
  mode: "initial" | "route";
  persist?: boolean;
  onComplete: () => void;
};

function LoadingOverlay({
  mode,
  persist = false,
  onComplete,
}: LoadingOverlayProps) {
  const completedRef = useRef(false);
  const videoEndTimeoutRef = useRef<number | null>(null);

  const clearVideoEndTimeout = () => {
    if (videoEndTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(videoEndTimeoutRef.current);
    videoEndTimeoutRef.current = null;
  };

  const complete = useCallback(() => {
    if (completedRef.current) {
      return;
    }

    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    clearVideoEndTimeout();
  }, [mode]);

  useEffect(() => {
    if (persist) {
      return;
    }

    const duration = mode === "route" ? ROUTE_MAX_DURATION : FAILSAFE_DURATION;
    const timeoutId = window.setTimeout(complete, duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [complete, persist, mode]);

  useEffect(() => {
    return () => {
      clearVideoEndTimeout();
    };
  }, []);

  return (
    <motion.div
      className="loading-overlay fixed inset-0 z-120 overflow-hidden text-white max-sm:bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      exit={{
        opacity: 0,
        transition: { duration: 0.08, ease: "linear" },
      }}
    >
      <motion.div
        className="relative z-10 h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
      >
        <video
          key={mode}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => {
            clearVideoEndTimeout();
            videoEndTimeoutRef.current = window.setTimeout(() => {
              videoEndTimeoutRef.current = null;
              complete();
            }, POST_VIDEO_DELAY);
          }}
          className="absolute inset-0 h-full w-full object-cover max-sm:object-contain max-sm:scale-[2.5] max-sm:[mix-blend-mode:multiply]"
        >
          <source src={INTRO_VIDEO_SRC} type="video/mp4" />
        </video>
      </motion.div>
    </motion.div>
  );
}

export default LoadingOverlay;
