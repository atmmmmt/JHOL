"use client";

import { useEffect } from "react";
import {
  CONSENT_UPDATED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  parseCookieConsent,
  type CookieConsent,
} from "../../lib/cookie-consent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    snaptr?: (...args: unknown[]) => void;
    twq?: ((...args: unknown[]) => void) & { exe?: unknown; version?: string; queue?: unknown[] };
  }
}

function loadMetaPixel(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return;
  if (document.getElementById("jhor-meta-pixel")) return;

  const script = document.createElement("script");
  script.id = "jhor-meta-pixel";
  script.async = true;
  script.text = `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init','${pixelId}');
    fbq('track','PageView');
  `;
  document.head.appendChild(script);
}

function loadSnapchatPixel(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return;
  if (document.getElementById("jhor-snap-pixel")) return;

  const script = document.createElement("script");
  script.id = "jhor-snap-pixel";
  script.async = true;
  script.text = `
    (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?
    a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
    a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
    r.src=n;var u=t.getElementsByTagName(s)[0];
    u.parentNode.insertBefore(r,u);})(window,document,
    'https://sc-static.net/scevent.min.js');
    snaptr('init','${pixelId}',{'user_email':''});
    snaptr('track','PAGE_VIEW');
  `;
  document.head.appendChild(script);
}

function loadTwitterPixel(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return;
  if (document.getElementById("jhor-twt-pixel")) return;

  const script = document.createElement("script");
  script.id = "jhor-twt-pixel";
  script.async = true;
  script.text = `
    !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):
    s.queue.push(arguments)},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,
    u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],
    a.parentNode.insertBefore(u,a))}(window,document,'script');
    twq('config','${pixelId}');
  `;
  document.head.appendChild(script);
}

function loadGoogleAds(adsId: string) {
  if (typeof window === "undefined" || !adsId) return;
  if (document.getElementById("jhor-gads-script")) return;

  if (!window.gtag) {
    const script = document.createElement("script");
    script.id = "jhor-gads-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
    document.head.appendChild(script);

    const inline = document.createElement("script");
    inline.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
    `;
    document.head.appendChild(inline);
  }

  window.gtag?.("config", adsId);
}

function applyConsentToPixels(
  consent: CookieConsent,
  ids: {
    googleAdsId?: string;
    metaPixelId?: string;
    snapchatPixelId?: string;
    twitterPixelId?: string;
  },
) {
  if (!consent.marketing) return;

  if (ids.metaPixelId) loadMetaPixel(ids.metaPixelId);
  if (ids.snapchatPixelId) loadSnapchatPixel(ids.snapchatPixelId);
  if (ids.twitterPixelId) loadTwitterPixel(ids.twitterPixelId);
  if (ids.googleAdsId) loadGoogleAds(ids.googleAdsId);
}

interface PixelsManagerProps {
  googleAdsId?: string;
  metaPixelId?: string;
  snapchatPixelId?: string;
  twitterPixelId?: string;
}

export default function PixelsManager({
  googleAdsId,
  metaPixelId,
  snapchatPixelId,
  twitterPixelId,
}: PixelsManagerProps) {
  const ids = { googleAdsId, metaPixelId, snapchatPixelId, twitterPixelId };

  useEffect(() => {
    const stored = parseCookieConsent(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY),
    );
    if (stored) {
      applyConsentToPixels(stored, ids);
    }

    function handleConsentUpdate(e: Event) {
      const consent = (e as CustomEvent<CookieConsent>).detail;
      applyConsentToPixels(consent, ids);
    }

    window.addEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdate);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
