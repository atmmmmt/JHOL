"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
import Container from "../components/common/container";

const BACKEND = "https://johor-back.euphoria-motiva.com";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionType = "text" | "textarea" | "radio" | "checkbox" | "scale" | "logo_type";

type Question = {
  id: string;
  text: string;
  subtitle?: string;
  type: QuestionType;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
};

type Section = {
  id: string;
  title: string;
  subtitle?: string;
  questions: Question[];
};

type BriefData = {
  status: "pending" | "submitted";
  clientName: string;
  packageType: string;
  title: string;
  sections: Section[];
};

// ─── Hardcoded fallback templates ─────────────────────────────────────────────

const IDENTITY_SECTIONS: Section[] = [
  {
    id: "s1",
    title: "المشروع الخاص بك",
    subtitle: "نريد أن نفهم مشروعك بشكل كامل قبل أن نبدأ",
    questions: [
      { id: "project_name", text: "ما هو اسم المشروع أو العلامة التجارية التي سنعمل على تصميم هويتها؟", type: "text", required: true },
      { id: "project_status", text: "هل هذا المشروع جديد أم قائم؟ هل تعمل رسمياً؟ هل لديك موقع إلكتروني؟", type: "textarea", required: true },
      { id: "business_desc", text: "كيف توصف نشاطك التجاري أو خدماتك بإيجاز؟", type: "textarea", required: true },
      { id: "target_audience", text: "من هي الفئة المستهدفة في أعمالك؟ (عمر، جنس، اهتمامات)", type: "textarea", required: true },
      { id: "competitors", text: "من هم المنافسون الرئيسيون في السوق المحلية؟", type: "textarea" },
      { id: "preferred_style", text: "ما هو الأسلوب البصري المفضل لديك؟ (رسمي، عصري، بسيط، فاخر...)", type: "textarea" },
      { id: "need_icon", text: "هل تحتاج أيقونة أو رمز مميز مع شعارك؟", type: "radio", options: ["نعم", "لا", "أترك القرار لكم"] },
    ],
  },
  {
    id: "s2",
    title: "الشعار والهوية",
    subtitle: "تفاصيل الشعار الذي تريده",
    questions: [
      {
        id: "has_name",
        text: "هل لديك اسم تجاري محدد؟",
        type: "radio",
        required: true,
        options: ["نعم لدي اسم جاهز", "أريد منكم اقتراح اسم مناسب"],
      },
      { id: "business_name_if_any", text: "إذا كان لديك اسم — اكتبه هنا:", type: "text" },
      { id: "existing_icon", text: "هل لديك أيقونة أو رمز تجاري حالي؟ صفه أو اذكر مصدر إلهامك:", type: "textarea" },
      { id: "competitor_style", text: "هل توجد علامات تجارية أخرى تعجبك من حيث الشكل والأسلوب؟ اذكرها:", type: "textarea" },
      {
        id: "logo_type",
        text: "ما نوع الشعار الذي تفضله؟",
        type: "logo_type",
        options: ["Wordmark", "Lettermark", "Brandmark", "Combination mark"],
      },
      {
        id: "name_language",
        text: "تفضّل اسم الشعار بأي لغة؟",
        type: "radio",
        options: ["العربية", "الإنجليزية", "كلاهما"],
      },
      {
        id: "adult_content",
        text: "هل خدماتك أو منتجاتك موجهة للبالغين فقط؟",
        type: "radio",
        options: ["لا", "نعم"],
      },
      { id: "color_preference", text: "هل لديك ألوان معينة تريدها في الهوية، أو ألوان تريد تجنبها؟", type: "textarea" },
    ],
  },
  {
    id: "s3",
    title: "تقييم وضعك الحالي",
    subtitle: "ساعدنا نفهم نقطة انطلاقك (1 = ضعيف، 10 = ممتاز)",
    questions: [
      { id: "digital_presence", text: "كيف تقيّم حضورك الرقمي الحالي؟", type: "scale", min: 1, max: 10 },
      { id: "message_clarity", text: "كيف تقيّم وضوح رسالتك التسويقية لجمهورك؟", type: "scale", min: 1, max: 10 },
      { id: "identity_alignment", text: "كيف تقيّم مدى انعكاس هويتك الحالية لقيم مشروعك؟", type: "scale", min: 1, max: 10 },
      { id: "competitor_level", text: "كيف تقيّم مستوى هويتك مقارنةً بالمنافسين؟", type: "scale", min: 1, max: 10 },
      { id: "customer_recognition", text: "كيف تقيّم مدى تعرف العملاء على علامتك التجارية؟", type: "scale", min: 1, max: 10 },
    ],
  },
  {
    id: "s4",
    title: "ملاحظات إضافية",
    subtitle: "أي تفاصيل أخرى تريد مشاركتها",
    questions: [
      { id: "extra_notes", text: "هل هناك أي شيء آخر تريد إخبارنا به؟ توقعات، مخاوف، متطلبات خاصة:", type: "textarea" },
      { id: "deadline", text: "هل لديك موعد نهائي معين تريد الانتهاء قبله؟", type: "text" },
    ],
  },
];

const CAMPAIGN_SECTIONS: Section[] = [
  {
    id: "s1",
    title: "معلومات الحملة",
    subtitle: "ساعدنا نفهم ما تريد تحقيقه من الحملة",
    questions: [
      { id: "campaign_goal", text: "ما هو الهدف الرئيسي من الحملة؟", type: "radio", required: true, options: ["زيادة المبيعات", "رفع الوعي بالعلامة", "توليد عملاء محتملين", "إطلاق منتج/خدمة جديدة", "هدف آخر"] },
      { id: "campaign_goal_other", text: "إذا كان الهدف آخر — حدده:", type: "text" },
      { id: "product_service", text: "ما المنتج أو الخدمة التي ستروّج لها الحملة؟", type: "textarea", required: true },
      { id: "unique_value", text: "ما الذي يميز منتجك أو خدمتك عن المنافسين؟", type: "textarea", required: true },
      { id: "target_audience", text: "من هو جمهورك المستهدف؟ (عمر، جنس، اهتمامات، موقع جغرافي)", type: "textarea", required: true },
    ],
  },
  {
    id: "s2",
    title: "ميزانية ومنصات الحملة",
    subtitle: "تفاصيل النشر والإنفاق",
    questions: [
      {
        id: "platforms",
        text: "على أي المنصات تريد تشغيل الحملة؟",
        type: "checkbox",
        options: ["سناب شات", "إنستغرام / فيسبوك (Meta)", "تيك توك", "جوجل", "يوتيوب", "تويتر/X"],
      },
      { id: "monthly_budget", text: "ما هي الميزانية الشهرية المخصصة للإعلانات (بالريال السعودي)؟", type: "text", required: true },
      { id: "campaign_duration", text: "كم المدة المتوقعة للحملة؟ (شهر، 3 أشهر، مستمر...)", type: "text" },
      {
        id: "has_content",
        text: "هل لديك محتوى بصري جاهز (صور/فيديوهات) للحملة؟",
        type: "radio",
        options: ["نعم لديّ محتوى جاهز", "لا، أحتاج مساعدة في إنتاج المحتوى", "لديّ بعضه وأحتاج المزيد"],
      },
    ],
  },
  {
    id: "s3",
    title: "الرسالة والأسلوب",
    subtitle: "كيف تريد ظهور إعلاناتك",
    questions: [
      { id: "message", text: "ما الرسالة الجوهرية التي تريد إيصالها للجمهور؟", type: "textarea", required: true },
      { id: "tone", text: "كيف تريد أسلوب التواصل في الحملة؟", type: "radio", options: ["رسمي ومهني", "ودي وقريب من الجمهور", "جريء ومباشر", "مرح وعصري"] },
      { id: "competitor_ads", text: "هل هناك حملات لمنافسين أو علامات أخرى أعجبتك؟ اذكرها:", type: "textarea" },
      { id: "avoid", text: "هل هناك كلمات أو صور أو أفكار تريد تجنبها؟", type: "textarea" },
    ],
  },
  {
    id: "s4",
    title: "تفاصيل إضافية",
    subtitle: "",
    questions: [
      { id: "previous_campaigns", text: "هل سبق أن شغّلت حملات إعلانية؟ ما النتائج؟", type: "textarea" },
      { id: "kpis", text: "كيف ستقيس نجاح الحملة؟ (مبيعات، متابعين، نقرات...)", type: "textarea" },
      { id: "extra_notes", text: "أي معلومات أخرى تريد مشاركتها:", type: "textarea" },
      { id: "start_date", text: "متى تريد أن تبدأ الحملة؟", type: "text" },
    ],
  },
];

const LOGO_TYPE_VISUALS: Record<string, { label: string; desc: string; example: string }> = {
  "Wordmark":        { label: "Wordmark",        desc: "الاسم كاملاً بخط مميز",          example: "Google • Coca-Cola" },
  "Lettermark":      { label: "Lettermark",      desc: "حرف أو حرفان فقط",              example: "IBM • HP" },
  "Brandmark":       { label: "Brandmark",       desc: "رمز أو أيقونة بدون نص",         example: "Apple • Nike ✓" },
  "Combination mark":{ label: "Combination",     desc: "رمز + اسم معاً",               example: "Adidas • Starbucks" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScaleInput({ value, onChange, min = 1, max = 10 }: { value: string; onChange: (v: string) => void; min?: number; max?: number }) {
  const num = Number(value) || 0;
  const steps = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return (
    <div className="mt-3">
      <div className="flex gap-1.5 flex-wrap">
        {steps.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(String(n))}
            className={[
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold border-2 transition-all",
              num === n
                ? "bg-(--secondary-shades-08) border-(--secondary-shades-08) text-white scale-110 shadow-[0_4px_14px_rgba(238,32,77,0.4)]"
                : "border-(--primary-shades-03)/15 bg-white text-(--primary-shades-03)/60 hover:border-(--secondary-shades-08)/40 hover:text-(--secondary-shades-08)",
            ].join(" ")}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-fluid-xs text-(--primary-shades-03)/40">
        <span>ضعيف</span><span>ممتاز</span>
      </div>
    </div>
  );
}

function LogoTypeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Object.entries(LOGO_TYPE_VISUALS).map(([key, info]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={[
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
            value === key
              ? "border-(--secondary-shades-08) bg-(--secondary-shades-08)/6 shadow-[0_4px_16px_rgba(238,32,77,0.2)]"
              : "border-(--primary-shades-03)/12 bg-white hover:border-(--primary-shades-03)/30",
          ].join(" ")}
        >
          <span className={`text-xl font-black font-mono ${value === key ? "text-(--secondary-shades-08)" : "text-(--primary-shades-03)/50"}`}>
            {key === "Wordmark" ? "ABC" : key === "Lettermark" ? "AB" : key === "Brandmark" ? "◆" : "◆ ABC"}
          </span>
          <span className="text-xs font-semibold text-(--primary-shades-03)">{info.label}</span>
          <span className="text-[10px] text-(--primary-shades-03)/45 leading-[1.4]">{info.desc}</span>
          <span className="text-[9px] text-(--primary-shades-03)/30">{info.example}</span>
        </button>
      ))}
    </div>
  );
}

function QuestionBlock({
  question,
  value,
  onChange,
  index,
}: {
  question: Question;
  value: string | string[];
  onChange: (v: string | string[]) => void;
  index: number;
}) {
  const inputClass =
    "w-full rounded-xl border border-(--primary-shades-03)/14 bg-(--white-shades-01) px-4 py-3 text-sm text-(--primary-shades-03) placeholder-(--primary-shades-03)/30 outline-none transition focus:border-(--secondary-shades-08)/40 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--secondary-shades-08)_10%,transparent)]";

  return (
    <div className="space-y-1">
      <p className="text-fluid-sm font-semibold leading-[1.5] text-(--primary-shades-03)">
        <span className="text-(--secondary-shades-08) ml-1">{index + 1}.</span>
        {question.text}
        {question.required && <span className="mr-1 text-(--secondary-shades-08)">*</span>}
      </p>
      {question.subtitle && (
        <p className="text-fluid-xs text-(--primary-shades-03)/50">{question.subtitle}</p>
      )}

      {question.type === "text" && (
        <input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} mt-2`}
          placeholder="اكتب إجابتك هنا..."
        />
      )}

      {question.type === "textarea" && (
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${inputClass} mt-2 resize-none`}
          placeholder="اكتب إجابتك هنا..."
        />
      )}

      {question.type === "radio" && question.options && (
        <div className="mt-2 flex flex-col gap-2">
          {question.options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-xl border border-(--primary-shades-03)/12 bg-white px-4 py-3 transition hover:border-(--secondary-shades-08)/30 hover:bg-(--secondary-shades-08)/3">
              <div className={[
                "h-4 w-4 shrink-0 rounded-full border-2 transition flex items-center justify-center",
                value === opt ? "border-(--secondary-shades-08) bg-(--secondary-shades-08)" : "border-(--primary-shades-03)/30",
              ].join(" ")}>
                {value === opt && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-(--primary-shades-03)">{opt}</span>
              <input type="radio" className="sr-only" checked={value === opt} onChange={() => onChange(opt)} />
            </label>
          ))}
        </div>
      )}

      {question.type === "checkbox" && question.options && (
        <div className="mt-2 flex flex-col gap-2">
          {question.options.map((opt) => {
            const arr = Array.isArray(value) ? value : [];
            const checked = arr.includes(opt);
            return (
              <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-xl border border-(--primary-shades-03)/12 bg-white px-4 py-3 transition hover:border-(--secondary-shades-08)/30 hover:bg-(--secondary-shades-08)/3">
                <div className={[
                  "h-4 w-4 shrink-0 rounded-md border-2 transition flex items-center justify-center",
                  checked ? "border-(--secondary-shades-08) bg-(--secondary-shades-08)" : "border-(--primary-shades-03)/30",
                ].join(" ")}>
                  {checked && (
                    <svg viewBox="0 0 10 8" fill="none" className="w-2.5">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-(--primary-shades-03)">{opt}</span>
                <input type="checkbox" className="sr-only" checked={checked}
                  onChange={() => onChange(checked ? arr.filter((v) => v !== opt) : [...arr, opt])} />
              </label>
            );
          })}
        </div>
      )}

      {question.type === "scale" && (
        <ScaleInput
          value={value as string}
          onChange={onChange as (v: string) => void}
          min={question.min}
          max={question.max}
        />
      )}

      {question.type === "logo_type" && (
        <LogoTypeInput value={value as string} onChange={onChange as (v: string) => void} />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BriefPageClient() {
  const [token, setToken] = useState<string | null>(null);
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "not_found" | "submitted" | "error">("loading");
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  // Extract token from URL client-side (static export)
  // In dev mode: use ?t=TOKEN query param since dynamic routes require generateStaticParams
  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const t = parts[parts.length - 1];
    if (t && t !== "__shell__") {
      setToken(t);
    } else {
      const q = new URLSearchParams(window.location.search).get("t");
      if (q) setToken(q);
      else setLoadState("not_found");
    }
  }, []);

  // Fetch brief data
  useEffect(() => {
    if (!token) return;
    setLoadState("loading");
    fetch(`${BACKEND}/api/brief/${token}`)
      .then(async (res) => {
        if (!res.ok) { setLoadState("not_found"); return; }
        const data = await res.json() as BriefData & { sections?: Section[] };
        if (data.status === "submitted") { setLoadState("submitted"); return; }

        // Use backend sections or fallback to hardcoded
        const sections = (data.sections && Array.isArray(data.sections) && data.sections.length > 0)
          ? data.sections
          : data.packageType === "campaign" ? CAMPAIGN_SECTIONS : IDENTITY_SECTIONS;

        setBrief({ ...data, sections });
        setLoadState("ready");
      })
      .catch(() => {
        // Backend unreachable — use hardcoded fallback for demo
        const packageType = "identity";
        setBrief({ status: "pending", clientName: "", packageType, title: "بريف الهوية البصرية", sections: IDENTITY_SECTIONS });
        setLoadState("ready");
      });
  }, [token]);

  const sections = brief?.sections ?? [];
  const section = sections[currentSection];
  const totalSections = sections.length;

  function setAnswer(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function getAnswer(qid: string): string | string[] {
    return answers[qid] ?? "";
  }

  function canProceed(): boolean {
    if (!section) return false;
    return section.questions.every((q) => {
      if (!q.required) return true;
      const v = answers[q.id];
      if (Array.isArray(v)) return v.length > 0;
      return typeof v === "string" && v.trim().length > 0;
    });
  }

  async function handleSubmit() {
    if (!token || !canProceed()) return;
    setSubmitState("submitting");
    setSubmitError("");
    try {
      const res = await fetch(`${BACKEND}/api/brief/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "حدث خطأ");
      }
      setSubmitState("done");
    } catch (err) {
      setSubmitState("error");
      setSubmitError(err instanceof Error ? err.message : "حدث خطأ أثناء الإرسال");
    }
  }

  const progress = totalSections > 0 ? ((currentSection) / totalSections) * 100 : 0;
  const isLastSection = currentSection === totalSections - 1;

  // ── Render: Loading ───────────────────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--white-shades-01)">
        <div className="flex flex-col items-center gap-4 text-(--primary-shades-03)/50">
          <Loader2 className="h-10 w-10 animate-spin text-(--secondary-shades-08)" />
          <p className="text-sm">جاري تحميل البريف...</p>
        </div>
      </div>
    );
  }

  // ── Render: Not Found ─────────────────────────────────────────────────────
  if (loadState === "not_found") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--white-shades-01) p-6" dir="rtl">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-(--secondary-shades-08)/10">
            <AlertCircle className="h-10 w-10 text-(--secondary-shades-08)" />
          </div>
          <h1 className="text-xl font-bold text-(--primary-shades-03)">الرابط غير صالح</h1>
          <p className="mt-2 text-sm text-(--primary-shades-03)/60 leading-relaxed">
            هذا الرابط غير موجود أو منتهي الصلاحية. تواصل مع فريق جهور لتجديده.
          </p>
        </div>
      </div>
    );
  }

  // ── Render: Already Submitted ─────────────────────────────────────────────
  if (loadState === "submitted" || submitState === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--white-shades-01) p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle className="h-12 w-12 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-(--primary-shades-03)">
            {loadState === "submitted" ? "تم إرسال البريف مسبقاً ✓" : "وصل البريف بنجاح! 🎉"}
          </h1>
          <p className="mt-3 text-sm text-(--primary-shades-03)/65 leading-[1.8]">
            {loadState === "submitted"
              ? "لقد أرسلت هذا البريف من قبل. تواصل مع فريق جهور إذا كنت تريد تعديل معلوماتك."
              : "استلمنا بريفك وسيراجعه فريقنا قريباً. ستصلك رسالة تأكيد على بريدك الإلكتروني."}
          </p>
          <a
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-(--primary-shades-02) px-6 py-3 text-sm font-semibold text-white transition hover:opacity-88"
          >
            العودة للرئيسية
          </a>
        </motion.div>
      </div>
    );
  }

  if (!brief || !section) return null;

  const packageLabel = brief.packageType === "campaign" ? "إطلاق الحملات الإعلانية" : "تصميم الهوية البصرية";

  // ── Render: Form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-(--white-shades-01)" dir="rtl">
      {/* Header */}
      <div className="bg-(--primary-shades-02) pb-12 pt-44">
        <Container>
          <div className="mx-auto max-w-2xl text-right text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              جهور للتسويق الإبداعي
            </span>
            <h1 className="mt-3 text-2xl font-bold">
              {brief.title || `بريف ${packageLabel}`}
            </h1>
            {brief.clientName && (
              <p className="mt-1 text-sm text-white/60">مرحباً {brief.clientName} — يرجى تعبئة الاستمارة بدقة لنبدأ معك بأفضل شكل</p>
            )}

            {/* Progress bar */}
            <div className="mt-6">
              <div className="mb-1.5 flex items-center justify-between text-xs text-white/50">
                <span>القسم {currentSection + 1} من {totalSections}</span>
                <span>{Math.round(progress)}٪ مكتمل</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <motion.div
                  className="h-full rounded-full bg-(--secondary-shades-08)"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <div className="mt-2 flex gap-1.5">
                {sections.map((_, i) => (
                  <div
                    key={i}
                    className={[
                      "h-1 flex-1 rounded-full transition-all",
                      i < currentSection ? "bg-(--secondary-shades-08)" : i === currentSection ? "bg-white/60" : "bg-white/15",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Form Body */}
      <Container className="-mt-6">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-(--primary-shades-03)/10 bg-white p-fluid-4 shadow-[0_20px_56px_rgba(34,27,79,0.08)]"
            >
              {/* Section header */}
              <div className="mb-6 border-b border-(--primary-shades-03)/8 pb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--secondary-shades-08) text-sm font-bold text-white">
                    {currentSection + 1}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-(--primary-shades-03)">{section.title}</h2>
                    {section.subtitle && (
                      <p className="text-xs text-(--primary-shades-03)/50 mt-0.5">{section.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-7">
                {section.questions.map((q, i) => (
                  <QuestionBlock
                    key={q.id}
                    question={q}
                    value={getAnswer(q.id)}
                    onChange={(v) => setAnswer(q.id, v)}
                    index={i}
                  />
                ))}
              </div>

              {/* Submit error */}
              {submitState === "error" && (
                <div className="mt-6 rounded-xl bg-(--secondary-shades-08)/8 p-3 text-sm text-(--secondary-shades-08)">
                  {submitError}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-(--primary-shades-03)/8 pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentSection((s) => Math.max(0, s - 1))}
                  disabled={currentSection === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-(--primary-shades-03)/14 bg-white px-5 py-2.5 text-sm font-medium text-(--primary-shades-03) transition hover:bg-(--primary-shades-03)/4 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </button>

                {!isLastSection ? (
                  <button
                    type="button"
                    onClick={() => { if (canProceed()) setCurrentSection((s) => s + 1); }}
                    disabled={!canProceed()}
                    className="inline-flex items-center gap-2 rounded-full bg-(--secondary-shades-08) px-6 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(238,32,77,0.35)] transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    التالي
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canProceed() || submitState === "submitting"}
                    className="inline-flex items-center gap-2 rounded-full bg-(--secondary-shades-08) px-6 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(238,32,77,0.35)] transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitState === "submitting" ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> جاري الإرسال...</>
                    ) : (
                      <><Send className="h-4 w-4" /> إرسال البريف</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Section dots */}
          <div className="mt-5 flex justify-center gap-2 pb-10">
            {sections.map((_s, i) => (
              <div
                key={i}
                className={[
                  "h-2 rounded-full transition-all",
                  i === currentSection ? "w-6 bg-(--secondary-shades-08)" : i < currentSection ? "w-2 bg-(--secondary-shades-08)/50" : "w-2 bg-(--primary-shades-03)/15",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
