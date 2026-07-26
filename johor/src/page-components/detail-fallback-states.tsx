"use client";

import type { ReactNode } from "react";

/**
 * Full-height loading state shown while a work/blog detail page resolves its
 * content on the client (used for routes served via the `.htaccess` fallback).
 */
export function DetailLoadingState() {
  return (
    <div
      data-cursor-surface="dark"
      className="flex min-h-[55vh] items-center justify-center bg-(--primary-shades-02) text-white"
    >
      <span
        className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white"
        aria-hidden
      />
    </div>
  );
}

type DetailNotFoundStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DetailNotFoundState({
  title,
  description,
  action,
}: DetailNotFoundStateProps) {
  return (
    <div
      data-cursor-surface="dark"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-(--primary-shades-02) px-6 text-center text-white"
    >
      <p className="text-fluid-2xl font-semibold">{title}</p>
      {description ? (
        <p className="max-w-md text-fluid-sm text-white/70">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-2 text-fluid-sm text-(--brand-violet) underline underline-offset-4">
          {action}
        </div>
      ) : null}
    </div>
  );
}
