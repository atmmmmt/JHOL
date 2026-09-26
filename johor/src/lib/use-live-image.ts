"use client";

import { useEffect, useState } from "react";
import { reviseContentSection } from "./client-content-revision";
import { applyFinalClientFixes } from "./final-client-fixes";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://johor-back.euphoria-motiva.com";

type RawContentEntry = {
  jsonContent: string | Record<string, unknown>;
};

type ParsedContentEntry = {
  _meta?: { sectionKey?: string };
  [key: string]: unknown;
};

let parsedEntriesCache: ParsedContentEntry[] | null = null;
let parsedEntriesPromise: Promise<ParsedContentEntry[]> | null = null;
let parsedEntriesCacheAt = 0;
const CONTENT_CACHE_TTL_MS = 5000;

function parseEntry(entry: RawContentEntry): ParsedContentEntry | null {
  try {
    const payload =
      typeof entry.jsonContent === "string"
        ? JSON.parse(entry.jsonContent)
        : entry.jsonContent;

    return payload as ParsedContentEntry;
  } catch {
    return null;
  }
}

function fetchParsedEntries(force = false): Promise<ParsedContentEntry[]> {
  const now = Date.now();

  if (
    !force &&
    parsedEntriesCache &&
    now - parsedEntriesCacheAt < CONTENT_CACHE_TTL_MS
  ) {
    return Promise.resolve(parsedEntriesCache);
  }

  if (!parsedEntriesPromise || force) {
    parsedEntriesPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/content`, { cache: "no-store" });
        const data = response.ok ? ((await response.json()) as RawContentEntry[]) : [];
        const parsed = data
          .map(parseEntry)
          .filter((entry): entry is ParsedContentEntry => entry !== null);
        parsedEntriesCache = parsed;
        parsedEntriesCacheAt = Date.now();
        return parsed;
      } catch {
        return parsedEntriesCache ?? [];
      } finally {
        parsedEntriesPromise = null;
      }
    })();
  }

  return parsedEntriesPromise;
}

function findSection(entries: ParsedContentEntry[], sectionKey: string) {
  return entries.find((entry) => entry?._meta?.sectionKey === sectionKey);
}

function getByPath(obj: unknown, path: string[]): unknown {
  let current = obj;
  for (const key of path) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function applyClientContent<T>(sectionKey: string, content: T): T {
  return applyFinalClientFixes(
    sectionKey,
    reviseContentSection(sectionKey, content),
  );
}

/**
 * Fetches the freshest image URL for a given content sectionKey + JSON path,
 * bypassing the static build-time snapshot. Falls back to `initialSrc` until
 * the live value resolves (or if it can't be found).
 */
export function useLiveImage(
  sectionKey: string,
  imagePath: string[],
  initialSrc: string,
): string {
  const [src, setSrc] = useState(initialSrc);
  const pathKey = imagePath.join(".");

  useEffect(() => {
    let cancelled = false;

    const applyLatestImage = (force = false) => {
      void fetchParsedEntries(force)
        .then((entries) => {
          if (cancelled) return;

          const section = findSection(entries, sectionKey);
          if (!section) return;

          const value = getByPath(section, pathKey.split("."));
          if (typeof value === "string" && value.trim()) {
            setSrc(value.trim());
          }
        })
        .catch(() => undefined);
    };

    const refresh = () => applyLatestImage(true);

    applyLatestImage(true);
    const intervalId = window.setInterval(refresh, CONTENT_CACHE_TTL_MS);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [sectionKey, pathKey]);

  return src;
}

/**
 * Fetches the freshest full payload for a given content sectionKey,
 * bypassing the static build-time snapshot. Falls back to `initialData`
 * until the live value resolves (or if it can't be found), so the page
 * renders instantly and swaps in fresh data (including new image URLs)
 * once the client-side fetch completes.
 *
 * Client-requested content revisions are applied to both the initial static
 * payload and every live API refresh. This prevents legacy CMS copy from
 * reappearing after hydration while the backend data is being migrated.
 */
export function useLiveSection<T>(sectionKey: string, initialData: T): T {
  const [data, setData] = useState<T>(() =>
    applyClientContent(sectionKey, initialData),
  );

  useEffect(() => {
    let cancelled = false;

    const applyLatestSection = (force = false) => {
      void fetchParsedEntries(force)
        .then((entries) => {
          if (cancelled) return;

          const section = findSection(entries, sectionKey);
          if (section) {
            const orderedSection = applyLiveSectionOrdering(sectionKey, section);
            setData(applyClientContent(sectionKey, orderedSection) as T);
          }
        })
        .catch(() => undefined);
    };

    const refresh = () => applyLatestSection(true);

    applyLatestSection(true);
    const intervalId = window.setInterval(refresh, CONTENT_CACHE_TTL_MS);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [sectionKey]);

  return data;
}

/**
 * `fetchParsedEntries` returns raw DB order. Some sections need the same
 * ordering the build-time `buildSiteContent` applies (e.g. newest work
 * project first) so the live refresh doesn't silently undo it after hydration.
 */
function applyLiveSectionOrdering(
  sectionKey: string,
  section: ParsedContentEntry,
): ParsedContentEntry {
  if (sectionKey === "works_projects" && Array.isArray(section.projects)) {
    return { ...section, projects: [...section.projects].reverse() };
  }

  return section;
}
