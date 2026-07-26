"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_UPDATED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  getDefaultCookieConsent,
  parseCookieConsent,
  type CookieConsent,
} from "../../lib/cookie-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_SCRIPT_ID = "jhor-ga-script";
const GTAG_SCRIPT_ID = "jhor-gtag-inline";
const OPEN_EVENT_NAME = "open-cookie-preferences";

function ensureGoogleAnalytics(measurementId: string) {
  if (document.getElementById(GA_SCRIPT_ID)) {
    return;
  }

  const script = document.createElement("script");
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  const inline = document.createElement("script");
  inline.id = GTAG_SCRIPT_ID;
  inline.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${measurementId}', { anonymize_ip: true });
  `;
  document.head.appendChild(inline);
}

function applyGtagConsent(consent: CookieConsent) {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag("consent", "update", {
    ad_personalization: consent.marketing ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    analytics_storage: consent.analytics ? "granted" : "denied",
    functionality_storage: "granted",
    personalization_storage: consent.marketing ? "granted" : "denied",
    security_storage: "granted",
  });
}

function CookieTypeRow({
  description,
  enabled,
  onChange,
  title,
  locked,
}: {
  title: string;
  description: string;
  enabled: boolean;
  locked?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-white/14 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-right">
          <h4 className="text-fluid-base font-semibold text-white">{title}</h4>
          <p className="mt-1 text-sm leading-7 text-white/80">{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={title}
          disabled={locked}
          onClick={() => !locked && onChange(!enabled)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
            enabled ? "bg-(--secondary-shades-08)" : "bg-white/25"
          } ${locked ? "cursor-not-allowed opacity-70" : ""}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              enabled ? "right-1" : "right-6"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default function CookieConsentManager() {
  const [consent, setConsent] = useState<CookieConsent>(getDefaultCookieConsent());
  const [isReady, setIsReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };

    window.gtag("consent", "default", {
      ad_personalization: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      analytics_storage: "denied",
      functionality_storage: "granted",
      personalization_storage: "denied",
      security_storage: "granted",
      wait_for_update: 500,
    });

    const stored = parseCookieConsent(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY),
    );

    if (stored) {
      setConsent(stored);
      applyGtagConsent(stored);
      if (stored.analytics && measurementId) {
        ensureGoogleAnalytics(measurementId);
      }
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }

    setIsReady(true);
  }, [measurementId]);

  useEffect(() => {
    const openPreferences = () => setShowPreferences(true);
    window.addEventListener(OPEN_EVENT_NAME, openPreferences);

    return () => {
      window.removeEventListener(OPEN_EVENT_NAME, openPreferences);
    };
  }, []);

  const persistConsent = (nextConsent: CookieConsent) => {
    setConsent(nextConsent);
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(nextConsent),
    );
    applyGtagConsent(nextConsent);
    if (nextConsent.analytics && measurementId) {
      ensureGoogleAnalytics(measurementId);
    }
    window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: nextConsent }));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const acceptAll = () =>
    persistConsent({
      essential: true,
      analytics: true,
      marketing: true,
      updatedAt: new Date().toISOString(),
    });

  const rejectAll = () =>
    persistConsent({
      essential: true,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString(),
    });

  if (!isReady) {
    return null;
  }

  return (
    <>
      {showBanner ? (
        <section
          dir="rtl"
          className="fixed inset-x-4 bottom-4 z-[120] mx-auto w-auto max-w-3xl rounded-2xl border border-white/15 bg-(--primary-shades-02) p-5 text-white shadow-[0_20px_48px_rgba(8,6,22,0.45)]"
        >
          <h3 className="text-lg font-semibold">إعدادات ملفات تعريف الارتباط</h3>
          <p className="mt-2 text-sm leading-7 text-white/85">
            نستخدم ملفات تعريف الارتباط الضرورية لتحسين عمل الموقع، ويمكنك اختيار
            السماح بالتحليلية والتسويقية. لن يتم تفعيل غير الضرورية قبل موافقتك.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:border-white/55"
            >
              تخصيص الاختيارات
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              رفض الكل
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-lg bg-(--secondary-shades-08) px-4 py-2 text-sm font-semibold text-(--primary-shades-02) transition hover:brightness-110"
            >
              قبول الكل
            </button>
          </div>
        </section>
      ) : null}

      {showPreferences ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/55 p-4">
          <section
            dir="rtl"
            className="w-full max-w-2xl rounded-2xl border border-white/10 bg-(--primary-shades-02) p-5 text-white shadow-[0_24px_56px_rgba(8,6,22,0.52)]"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="rounded-md border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white"
              >
                إغلاق
              </button>
              <div className="text-right">
                <h3 className="text-xl font-semibold">تفضيلات الكوكيز</h3>
                <p className="mt-1 text-sm leading-7 text-white/80">
                  يمكنك تعديل موافقتك في أي وقت. الكوكيز الضرورية تبقى مفعلة لضمان
                  عمل الموقع.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <CookieTypeRow
                title="ضرورية (Essential)"
                description="مطلوبة لتشغيل الموقع، الأمان، وإدارة الجلسة."
                enabled
                locked
                onChange={() => undefined}
              />
              <CookieTypeRow
                title="تحليلية (Analytics)"
                description="تساعدنا في فهم استخدام الموقع وتحسين الأداء."
                enabled={consent.analytics}
                onChange={(next) => setConsent((prev) => ({ ...prev, analytics: next }))}
              />
              <CookieTypeRow
                title="تسويقية (Marketing)"
                description="تستخدم لقياس الحملات وتخصيص الرسائل الإعلانية."
                enabled={consent.marketing}
                onChange={(next) => setConsent((prev) => ({ ...prev, marketing: next }))}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={rejectAll}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                رفض الكل
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-lg bg-(--secondary-shades-08) px-4 py-2 text-sm font-semibold text-(--primary-shades-02) hover:brightness-110"
              >
                قبول الكل
              </button>
              <button
                type="button"
                onClick={() =>
                  persistConsent({
                    ...consent,
                    essential: true,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="rounded-lg border border-white/35 px-4 py-2 text-sm font-medium text-white hover:border-white/60"
              >
                حفظ الاختيارات
              </button>
            </div>
          </section>
        </div>
      ) : null}

    </>
  );
}
