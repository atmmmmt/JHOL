export const CONSENT_UPDATED_EVENT = "jhor:consent-updated";

export type CookieConsent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export const COOKIE_CONSENT_STORAGE_KEY = "jhor_cookie_consent_v1";

export function getDefaultCookieConsent(): CookieConsent {
  return {
    essential: true,
    analytics: false,
    marketing: false,
    updatedAt: new Date(0).toISOString(),
  };
}

export function parseCookieConsent(value: string | null): CookieConsent | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<CookieConsent>;

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

