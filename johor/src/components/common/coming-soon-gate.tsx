"use client";

import { useEffect, useState } from "react";

const SETTINGS_CONTENT_TYPE = 9999;

export default function ComingSoonGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "live" | "coming-soon">("loading");

  useEffect(() => {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://johor-back.euphoria-motiva.com";

    fetch(`${apiBase}/api/content/type/${SETTINGS_CONTENT_TYPE}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json() as Promise<{ jsonContent: unknown }>;
      })
      .then((data) => {
        if (!data) { setStatus("live"); return; }
        const content =
          typeof data.jsonContent === "string"
            ? JSON.parse(data.jsonContent)
            : data.jsonContent;
        setStatus((content as { comingSoonEnabled?: boolean })?.comingSoonEnabled ? "coming-soon" : "live");
      })
      .catch(() => setStatus("live"));
  }, []);

  if (status === "loading") return null;
  if (status === "coming-soon") return <ComingSoonPage />;
  return <>{children}</>;
}

function ComingSoonPage() {
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07060f] text-center px-6"
    >
      <div className="mb-8 text-5xl font-black tracking-tight text-white">جهور</div>
      <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">قريباً</h1>
      <p className="max-w-md text-base text-[rgba(255,255,255,0.55)] leading-relaxed">
        نعمل على شيء مميز. سنكون جاهزين قريباً — ترقبونا.
      </p>
      <div className="mt-10 flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-2 w-2 rounded-full bg-[rgba(29,171,137,0.7)]"
            style={{ animationDelay: `${i * 0.2}s`, animation: "pulse 1.4s ease-in-out infinite" }}
          />
        ))}
      </div>
    </div>
  );
}
