import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { getChromeContent, getPixelsSettings } from "../lib/api";
import { buildDefaultMetadata } from "../lib/seo";
import App from "../src/App";
import ComingSoonGate from "../src/components/common/coming-soon-gate";
import LicenseGate from "../src/components/common/license-gate";
import PixelsManager from "../src/components/common/pixels-manager";
import "lenis/dist/lenis.css";
import "../src/index.css";

const GA_ID = "G-X3ZWJFVWYZ";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  const defaultMetadata = buildDefaultMetadata();
  const faviconPath = "/lolo-head.png";

  return {
    ...defaultMetadata,
    icons: {
      apple: [{ url: faviconPath }],
      icon: [{ url: faviconPath }],
      shortcut: [{ url: faviconPath }],
    },
    verification: {
      google: "U9H4jCAAydrNpjgZEmGA5TG5IEeJce2hCRR-KXQ9B3o",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [chrome, pixels] = await Promise.all([
    getChromeContent(),
    getPixelsSettings(),
  ]);

  return (
    <html lang="ar" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body dir="rtl" suppressHydrationWarning>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "وكالة جهور للتسويق الالكتروني",
              alternateName: "Johor Agency",
              url: "https://jhoragency.com.sa",
              logo: "https://jhoragency.com.sa/og-logo.webp",
              description:
                "وكالة جهور للتسويق الالكتروني - نصمّم هويات بصرية احترافية، ننفّذ حملات إعلانية مؤثرة، وننشئ محتوى رقمياً يُحوّل متابعيك إلى عملاء.",
              sameAs: [
                "https://www.instagram.com/jhoragency",
                "https://twitter.com/jhoragency",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+966-59-009-7538",
                contactType: "customer service",
                availableLanguage: "Arabic",
              },
            }),
          }}
        />
        <div id="root">
          <LicenseGate>
            <ComingSoonGate>
              <App chrome={chrome}>{children}</App>
            </ComingSoonGate>
          </LicenseGate>
        </div>
        <PixelsManager
          googleAdsId={pixels.googleAdsId}
          metaPixelId={pixels.metaPixelId}
          snapchatPixelId={pixels.snapchatPixelId}
          twitterPixelId={pixels.twitterPixelId}
        />
      </body>
    </html>
  );
}
