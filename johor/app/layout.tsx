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

const GTM_ID = "GTM-K4R4JKDC";

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
        <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} /></noscript>
        <Script id="gtm-init" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js');var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
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
                "وكالة جهور للتسويق الرقمي وإدارة الحملات الإعلانية الممولة؛ نساعد الشركات على الوصول للجمهور المناسب، تحسين أداء الإعلانات، وتحقيق نتائج قابلة للقياس.",
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
