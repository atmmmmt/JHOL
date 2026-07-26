"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://johor-back.euphoria-motiva.com";

const DEFAULT_PRIVACY = `نحن في جهور نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.\n\nنجمع البيانات التي تقدمها عند إتمام عملية الشراء مثل الاسم، البريد الإلكتروني، رقم الهاتف، وبيانات الدفع.\n\nتُستخدم البيانات حصراً لمعالجة طلبك وتقديم الخدمة، ولن يتم مشاركتها مع أي طرف ثالث.\n\nنستخدم تشفير SSL لحماية جميع البيانات المرسلة خلال عملية الدفع.`;
const DEFAULT_TERMS = `باستخدامك لخدمات جهور فإنك توافق على الشروط والأحكام التالية.\n\nيتم الدفع مسبقاً قبل بدء تنفيذ الخدمة. جميع الأسعار شاملة للضريبة.\n\nيمكن إلغاء الطلب خلال 24 ساعة من تأكيده واسترداد المبلغ كاملاً. بعد ذلك لا يحق استرداد المبلغ.\n\nتنتقل ملكية جميع المخرجات إلى العميل بعد إتمام الدفع الكامل.`;

async function fetchLegalText(contentType: number, fallback: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/content/type/${contentType}`);
    if (!res.ok) return fallback;
    const data = (await res.json()) as { jsonContent: unknown };
    const parsed =
      typeof data.jsonContent === "string" ? JSON.parse(data.jsonContent) : data.jsonContent;
    return (parsed as { content?: string })?.content || fallback;
  } catch {
    return fallback;
  }
}

function renderLegalParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export type LegalModalType = "terms" | "privacy" | null;

export function LegalModal({
  type,
  onClose,
}: {
  type: LegalModalType;
  onClose: () => void;
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!type) return;
    if (type === "terms") {
      fetchLegalText(9998, DEFAULT_TERMS).then(setText);
    } else {
      fetchLegalText(9997, DEFAULT_PRIVACY).then(setText);
    }
  }, [type]);

  if (!type) return null;

  const title = type === "terms" ? "الشروط والأحكام" : "سياسة الخصوصية";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" dir="rtl">
      <motion.div
        className="absolute inset-0 bg-(--primary-shades-02)/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-(--primary-shades-03)/12 bg-white shadow-[0_32px_80px_rgba(34,27,79,0.18)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="flex items-center justify-between border-b border-(--primary-shades-03)/10 px-5 py-4">
          <h2 className="text-base font-semibold text-(--primary-shades-03)">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-(--primary-shades-03)/12 text-(--primary-shades-03)/50 transition hover:bg-(--primary-shades-03)/6"
          >
            ×
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <div className="space-y-3 text-sm leading-relaxed text-(--primary-shades-03)/80">
            {renderLegalParagraphs(text).map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
