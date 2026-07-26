// Centralized price parsing for package tiers + cart.
//
// Prices are entered as free text in the dashboard (there is no dedicated price
// field), so the parser must be forgiving: it handles Arabic-Indic and Persian
// digits, several currency spellings, thousands separators, and a leading
// "السعر" label.

const ARABIC_INDIC_OFFSET = 0x0660; // ٠
const PERSIAN_OFFSET = 0x06f0; // ۰

/**
 * Convert Arabic-Indic (٠-٩) and Persian (۰-۹) digits to ASCII 0-9, and
 * normalize the Arabic thousands separator (٬) and decimal separator (٫).
 */
export function normalizeArabicDigits(value: string): string {
  return value
    .replace(/[٠-٩۰-۹]/g, (char) => {
      const code = char.charCodeAt(0);
      const base = code >= PERSIAN_OFFSET ? PERSIAN_OFFSET : ARABIC_INDIC_OFFSET;
      return String(code - base);
    })
    .replace(/٬/g, "") // Arabic thousands separator ٬ → drop
    .replace(/٫/g, "."); // Arabic decimal separator ٫ → .
}

/** True when the text looks like it carries a price (a number + a currency hint). */
export function isPriceText(value: string): boolean {
  const normalized = normalizeArabicDigits(value);
  const hasCurrency = /(?:^\s*السعر|ر\.?\s?س|ريال|SAR|درهم|د\.إ|AED|\$)/iu.test(
    normalized,
  );
  return hasCurrency && /\d/.test(normalized);
}

export type ParsedPrice = {
  /** Display string, e.g. "5,000 SAR". */
  value: string;
  /** Numeric amount for totals, or null when no number was found. */
  amount: number | null;
  /** Extra note text found around the price. */
  note?: string;
};

function normalizePriceText(value: string): string {
  return normalizeArabicDigits(value)
    .replace(/^\s*السعر\s*[:：\-]?\s*/u, "")
    .replace(/\.$/u, "")
    .trim();
}

function normalizePriceNote(value: string): string {
  return value
    .replace(/[()]/g, "")
    .replace(/^[،,:;\-\s]+|[،,:;\-\s.]+$/gu, "")
    .trim();
}

/** Extract just the numeric amount from a price string, or null. */
export function parsePriceAmount(value?: string): number | null {
  if (!value) return null;
  const match = normalizeArabicDigits(value).match(/\d[\d.,\s]*/);
  if (!match) return null;
  const numeric = Number.parseFloat(match[0].replace(/[,\s]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

/** Full parse of a price string into a display value + amount + note. */
export function parsePriceText(rawValue: string): ParsedPrice {
  const cleaned = normalizePriceText(rawValue);
  const priceMatch = cleaned.match(/(\d[\d.,\s]*)\s*(ر\.?\s?س|ريال|SAR|درهم|د\.إ|AED)?/iu);

  if (!priceMatch || typeof priceMatch.index !== "number" || !priceMatch[1]) {
    return { value: cleaned, amount: parsePriceAmount(cleaned) };
  }

  const amount = Number.parseFloat(priceMatch[1].replace(/[,\s]/g, ""));
  const rawCurrency = (priceMatch[2] ?? "").trim();
  const currency = rawCurrency
    ? /sar|ريال|ر\.?\s?س/i.test(rawCurrency)
      ? "SAR"
      : /aed|درهم|د\.إ/i.test(rawCurrency)
        ? "AED"
        : rawCurrency
    : "SAR";
  const displayAmount = Number.isFinite(amount)
    ? amount.toLocaleString("en-US")
    : priceMatch[1].trim();
  const value = `${displayAmount} ${currency}`.trim();
  const before = normalizePriceNote(cleaned.slice(0, priceMatch.index));
  const after = normalizePriceNote(
    cleaned.slice(priceMatch.index + priceMatch[0].length),
  );
  const noteParts = [before, after].filter(Boolean);

  return {
    value,
    amount: Number.isFinite(amount) ? amount : null,
    note: noteParts.length ? noteParts.join(" • ") : undefined,
  };
}
