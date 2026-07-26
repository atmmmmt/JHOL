"use client";

import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type {
  FooterContent,
  HeaderContent,
  LoadingStatusesContent,
} from "../lib/api";
import { CursorMaskProvider } from "./components/common/cursor-mask-provider";
import CookieConsentManager from "./components/common/cookie-consent-manager";
import LoadingOverlay from "./components/common/loading-overlay";
import RootLayout from "./components/layout/root-layout";

const LOADER_SHOWCASE_MODE = false;

type AppProps = {
  chrome: {
    footer: FooterContent;
    header: HeaderContent;
    loadingStatuses: LoadingStatusesContent;
  };
  children: ReactNode;
};

function App({ chrome, children }: AppProps) {
  const pathname = usePathname();
  const [showLoader, setShowLoader] = useState(true);
  const [hasBooted, setHasBooted] = useState(false);
  const previousPathnameRef = useRef(pathname);
  const isHomePage = pathname === "/";
  const shouldShowLoader = isHomePage && (LOADER_SHOWCASE_MODE || showLoader);

  useEffect(() => {
    document.body.classList.toggle("loading-active", shouldShowLoader);

    return () => {
      document.body.classList.remove("loading-active");
    };
  }, [shouldShowLoader]);

  useEffect(() => {
    if (LOADER_SHOWCASE_MODE) {
      return;
    }

    if (!hasBooted) {
      previousPathnameRef.current = pathname;
      return;
    }

    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;

    const frameId = window.requestAnimationFrame(() => {
      setShowLoader(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [hasBooted, pathname]);

  const handleLoaderComplete = () => {
    setHasBooted(true);

    if (LOADER_SHOWCASE_MODE) {
      return;
    }

    setShowLoader(false);
  };

  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      anchors: true,
      autoRaf: true,
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1,
      wheelMultiplier: 0.9,
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  return (
    <CursorMaskProvider>
      <AnimatePresence mode="wait">
        {shouldShowLoader ? (
          <LoadingOverlay
            key={hasBooted ? pathname : "initial-loader"}
            mode={hasBooted ? "route" : "initial"}
            persist={LOADER_SHOWCASE_MODE}
            onComplete={handleLoaderComplete}
          />
        ) : null}
      </AnimatePresence>

      <RootLayout footer={chrome.footer} header={chrome.header}>
        {children}
      </RootLayout>
      {hasBooted && !shouldShowLoader ? <CookieConsentManager /> : null}
    </CursorMaskProvider>
  );
}

export default App;
