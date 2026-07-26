import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { FooterContent, HeaderContent } from "../../../lib/api";
import Cursor from "../common/cursor";
import ScrollToTopButton from "../common/scroll-to-top-button";
import FooterSection from "./footer-section";
import Header from "./header";

function HashAnchorScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let frameId = 0;

    const scrollToCurrentHash = () => {
      const { hash } = window.location;
      if (!hash) {
        return;
      }

      const targetId = decodeURIComponent(hash.slice(1));
      frameId = window.requestAnimationFrame(() => {
        const targetElement = document.getElementById(targetId);
        targetElement?.scrollIntoView({ block: "start" });
      });
    };

    scrollToCurrentHash();
    window.addEventListener("hashchange", scrollToCurrentHash);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("hashchange", scrollToCurrentHash);
    };
  }, [pathname]);

  return null;
}

/**
 * Global chrome: custom cursor, header, main content, footer.
 * Use data-cursor-surface on sections to tune cursor dot color (see cursor.tsx).
 */
export default function RootLayout({
  children,
  footer,
  header,
}: {
  children: ReactNode;
  footer: FooterContent;
  header: HeaderContent;
}) {
  return (
   <div className="font-inter overflow-hidden">
      <HashAnchorScroll />
      <Cursor />
      <Header content={header} subHeader={footer} />
      <main className="overflow-x-hidden">{children}</main>
      <FooterSection content={footer} />
      <ScrollToTopButton phone={footer.contact.phone} />
    </div>
  );
}
