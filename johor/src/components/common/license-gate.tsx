"use client";

import { useEffect, useState } from "react";

const BACKEND = "https://johor-back.euphoria-motiva.com";

export default function LicenseGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ok" | "locked">("checking");

  useEffect(() => {
    fetch(`${BACKEND}/api/license`)
      .then((r) => (r.ok ? setStatus("ok") : setStatus("locked")))
      .catch(() => setStatus("locked"));
  }, []);

  if (status === "checking") return null;

  if (status === "locked") {
    return (
      <div
        dir="rtl"
        style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "#0f0d1f",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "'Readex Pro', Arial, sans-serif",
          color: "white", textAlign: "center", padding: "24px",
        }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(230,57,70,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24, fontSize: 32,
        }}>
          🔒
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>النظام غير مرخّص</h1>
        <p style={{ marginTop: 12, color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.8, maxWidth: 320 }}>
          هذا النظام محمي. تواصل مع مالك النظام للحصول على مفتاح التفعيل.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
