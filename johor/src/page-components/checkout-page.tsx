"use client";

import { motion } from "framer-motion";
import { Package, ShoppingBag, Trash2, User } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Container from "../components/common/container";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  getCartItems,
  removeCartItem,
  computePaymentSplit,
  type CartItem,
} from "../lib/cart";
import { parsePriceAmount } from "../lib/price";
import { LegalModal, type LegalModalType } from "../components/common/legal-modal";

declare global {
  interface Window {
    Moyasar?: {
      init: (config: Record<string, unknown>) => void;
    };
  }
}

const MOYASAR_PUBLISHABLE_KEY = "pk_test_RdS1ybBA6P6ydNPm8ZGPaTBQikh5HX4vpsHHoPun";

function OrderItem({ item, onRemove }: { item: CartItem; onRemove: (id: string) => void }) {
  const typeLabel = item.packageType === "identity"
    ? { text: "هوية بصرية - 60% مقدماً", color: "bg-(--primary-shades-04)/14 text-(--primary-shades-04)" }
    : item.packageType === "campaign"
    ? { text: "حملة ممولة - دفعة واحدة", color: "bg-emerald-500/12 text-emerald-700" }
    : null;

  return (
    <motion.div
      className="relative flex items-start gap-3 rounded-xl border border-(--primary-shades-03)/10 bg-(--white-shades-01) p-3"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.22 }}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-(--primary-shades-03)/10 bg-(--primary-shades-03)/6">
        {item.previewImage ? (
          <Image src={item.previewImage} alt={item.tierName} fill className="object-cover" sizes="56px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-(--primary-shades-04)/50">
            <Package className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-right">
        <p className="text-fluid-sm font-semibold leading-[1.35] text-(--primary-shades-03)">{item.tierName}</p>
        <p className="mt-0.5 text-fluid-xs leading-[1.5] text-(--primary-shades-03)/60">{item.packageTitle}</p>
        {item.price && (
          <p className="mt-1 text-fluid-xs font-semibold text-(--secondary-shades-08)" dir="ltr">{item.price}</p>
        )}
        {typeLabel && (
          <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${typeLabel.color}`}>
            {typeLabel.text}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="shrink-0 rounded-full p-1.5 text-(--primary-shades-03)/40 transition hover:bg-(--secondary-shades-08)/8 hover:text-(--secondary-shades-08)"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

type ModalType = LegalModalType;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.34, delay },
});

export default function CheckoutPageClient() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [agreed, setAgreed] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formError, setFormError] = useState("");
  const [infoConfirmed, setInfoConfirmed] = useState(false);
  const moyasarMounted = useRef(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
  });

  const totalSAR = useMemo(() => {
    if (cartItems.length === 0) return null;
    let sum = 0;
    for (const item of cartItems) {
      const amount = parsePriceAmount(item.price);
      if (amount === null) return null;
      sum += amount * item.quantity;
    }
    return sum;
  }, [cartItems]);

  const split = useMemo(
    () => (totalSAR !== null ? computePaymentSplit(cartItems, totalSAR) : null),
    [cartItems, totalSAR],
  );

  const totalDisplay = totalSAR !== null
    ? `${totalSAR.toLocaleString("en-US")} SAR`
    : null;

  useEffect(() => {
    const refresh = () => setCartItems(getCartItems());
    refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    const onStorage = (e: StorageEvent) => { if (e.key === CART_STORAGE_KEY) refresh(); };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Load Moyasar assets
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.moyasar.com/mpf/1.7.3/moyasar.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.moyasar.com/mpf/1.7.3/moyasar.js";
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  // Keep latest form + cart in refs so Moyasar closure always reads fresh data
  const formRef = useRef(form);
  const cartRef = useRef(cartItems);
  const splitRef = useRef(split);
  const totalRef = useRef(totalSAR);
  useEffect(() => { formRef.current = form; }, [form]);
  useEffect(() => { cartRef.current = cartItems; }, [cartItems]);
  useEffect(() => { splitRef.current = split; }, [split]);
  useEffect(() => { totalRef.current = totalSAR; }, [totalSAR]);

  const initMoyasar = useCallback(() => {
    if (moyasarMounted.current) return;
    if (!window.Moyasar) { setTimeout(initMoyasar, 300); return; }
    if (!document.querySelector(".mysr-form")) { setTimeout(initMoyasar, 100); return; }
    moyasarMounted.current = true;

    const f = formRef.current;
    const items = cartRef.current;
    const sp = splitRef.current;
    const total = totalRef.current;
    const amountDueNow = sp !== null ? sp.amountDueNow : (total ?? 0);
    const halalas = Math.round(amountDueNow * 100) || 100;
    const description = items.map(i => i.tierName).join(" + ") || "طلب باقة جهور";

    sessionStorage.setItem("johor_pending_order", JSON.stringify({
      customerName: `${f.firstName} ${f.lastName}`.trim(),
      email: f.email,
      phone: f.phone,
      company: f.company,
      items: items.map(i => ({
        tierName: i.tierName, packageTitle: i.packageTitle,
        price: i.price, quantity: i.quantity,
        packageType: i.packageType, packageId: i.packageId, tierId: i.tierId,
      })),
      totalSAR: total,
      paymentMode: sp?.mode ?? "full",
      amountPaidNow: amountDueNow,
      amountDueLater: sp?.amountDueLater ?? 0,
      createdAt: new Date().toISOString(),
    }));

    window.Moyasar.init({
      element: ".mysr-form",
      amount: halalas,
      currency: "SAR",
      description,
      publishable_api_key: MOYASAR_PUBLISHABLE_KEY,
      callback_url: `${window.location.origin}/payment-success`,
      methods: ["creditcard"],
      supported_networks: ["visa", "mastercard", "mada"],
      language: "ar",
      translations: {
        ar: {
          "button.pay": "ادفع",
          "form.name_on_card": "الاسم على البطاقة",
          "form.card_info": "معلومات البطاقة",
        },
      },
      metadata: {
        customer_name: `${f.firstName} ${f.lastName}`.trim(),
        email: f.email,
        phone: f.phone,
        company: f.company || "",
        items: JSON.stringify(items.map(i => ({
          name: `${i.tierName} - ${i.packageTitle}`,
          price: i.price, qty: i.quantity,
        }))),
        payment_mode: sp?.mode ?? "full",
        amount_due_later: String(sp?.amountDueLater ?? 0),
        source: "johor-website",
      },
    });

    // Moyasar's own stylesheet caps the form at 340px with !important;
    // an inline important declaration is the only reliable override.
    const widen = () => {
      const el = document.querySelector<HTMLElement>(".mysr-form-moyasarForm");
      if (!el) { setTimeout(widen, 200); return; }
      el.style.setProperty("max-width", "100%", "important");
    };
    widen();
  }, []);

  function validateForm(): boolean {
    if (!form.firstName.trim() || !form.lastName.trim()) { setFormError("يرجى إدخال الاسم الكامل"); return false; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setFormError("يرجى إدخال بريد إلكتروني صحيح"); return false; }
    if (!form.phone.trim()) { setFormError("يرجى إدخال رقم الهاتف"); return false; }
    if (!form.company.trim()) { setFormError("يرجى إدخال اسم الشركة أو المشروع"); return false; }
    if (cartItems.length === 0) { setFormError("السلة فارغة، يرجى إضافة باقة أولاً"); return false; }
    setFormError("");
    return true;
  }

  // Payment form only mounts after the customer's info is validated —
  // Moyasar's metadata is a one-time snapshot on init, so mounting early
  // (before the fields are filled) would silently ship an empty name/phone.
  function handleConfirmInfo() {
    if (!agreed) { setFormError("يرجى الموافقة على الشروط والأحكام"); return; }
    if (!validateForm()) return;
    setInfoConfirmed(true);
    initMoyasar();
    setTimeout(() => {
      document.querySelector(".mysr-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError("");
  }

  const inputClass =
    "w-full rounded-xl border border-(--primary-shades-03)/14 bg-white px-4 py-3 text-sm text-(--primary-shades-03) placeholder-[color:var(--primary-shades-04)]/40 outline-none transition focus:border-(--secondary-shades-08)/40 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--secondary-shades-08)_10%,transparent)] disabled:cursor-not-allowed disabled:bg-(--white-shades-01) disabled:text-(--primary-shades-03)/50";

  const labelClass = "mb-1.5 block text-xs font-medium text-(--primary-shades-03)/55";

  return (
    <>
      <section
        className="relative overflow-hidden bg-(--white-shades-01) pb-fluid-7 pt-[calc(var(--header-overlay-offset)+var(--space-fluid-7))]"
        dir="rtl"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[clamp(20rem,38vw,28rem)] bg-(--primary-shades-02)" />
          <div className="absolute right-[-6%] top-[-10%] h-80 w-80 rounded-full bg-(--secondary-shades-08)/7 blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-6%] h-80 w-80 rounded-full bg-(--primary-shades-04)/10 blur-[140px]" />
        </div>

        <Container className="relative z-10">
          <motion.header className="mb-fluid-4 text-right text-white" {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-fluid-xs font-semibold">
              <ShoppingBag className="h-3.5 w-3.5" />
              إتمام الطلب
            </span>
            <h1 className="mt-2 text-[clamp(1.5rem,3vw,2.2rem)] font-semibold">أكمل بيانات طلبك</h1>
            <p className="mt-1 max-w-lg text-fluid-sm leading-[1.85] text-white/68">
              أدخل بياناتك الشخصية وادفع بأمان عبر بوابة ميسر.
            </p>
          </motion.header>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">

            {/* Main column */}
            <div className="space-y-4">

              {/* Customer info */}
              <motion.div
                className="rounded-2xl border border-(--primary-shades-03)/10 bg-white p-fluid-4 shadow-[0_16px_48px_rgba(34,27,79,0.07)]"
                {...fadeUp(0.06)}
              >
                <div className="mb-5 flex items-center justify-between gap-2.5 border-b border-(--primary-shades-03)/8 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary-shades-02)/8 text-(--primary-shades-02)">
                      <User className="h-4 w-4" />
                    </span>
                    <h2 className="text-fluid-base font-semibold text-(--primary-shades-03)">بيانات العميل</h2>
                  </div>
                  {infoConfirmed && (
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="text-fluid-xs text-(--primary-shades-03)/55 underline underline-offset-2 hover:text-(--primary-shades-03)"
                    >
                      تعديل البيانات
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>الاسم الأول</label>
                    <input type="text" placeholder="أحمد" value={form.firstName} disabled={infoConfirmed}
                      onChange={(e) => handleChange("firstName", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>اسم العائلة</label>
                    <input type="text" placeholder="محمد" value={form.lastName} disabled={infoConfirmed}
                      onChange={(e) => handleChange("lastName", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>البريد الإلكتروني</label>
                    <input type="email" placeholder="example@email.com" value={form.email} disabled={infoConfirmed}
                      onChange={(e) => handleChange("email", e.target.value)} className={inputClass} dir="ltr" />
                  </div>
                  <div>
                    <label className={labelClass}>رقم الهاتف</label>
                    <input type="tel" placeholder="+966 5X XXX XXXX" value={form.phone} disabled={infoConfirmed}
                      onChange={(e) => handleChange("phone", e.target.value)} className={inputClass} dir="ltr" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>اسم الشركة / المشروع</label>
                    <input type="text" placeholder="شركة أو مشروع..." value={form.company} disabled={infoConfirmed}
                      onChange={(e) => handleChange("company", e.target.value)} className={inputClass} />
                  </div>
                </div>

                {formError && (
                  <p className="mt-3 text-sm text-(--secondary-shades-08)">{formError}</p>
                )}

                {!infoConfirmed && (
                  <button
                    type="button"
                    onClick={handleConfirmInfo}
                    disabled={cartItems.length === 0}
                    className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--primary-shades-02),color-mix(in_srgb,var(--primary-shades-02)_78%,#000))] py-3.5 text-fluid-sm font-semibold text-white shadow-[0_10px_28px_color-mix(in_srgb,var(--primary-shades-02)_38%,transparent)] transition hover:shadow-[0_14px_34px_color-mix(in_srgb,var(--primary-shades-02)_46%,transparent)] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0"
                  >
                    <span>متابعة إلى الدفع</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1" aria-hidden>
                      <path d="M14 7l-5 5 5 5" />
                    </svg>
                  </button>
                )}
              </motion.div>

              {/* Moyasar payment form — appears only once customer info is confirmed */}
              <motion.div
                className="rounded-2xl border border-(--primary-shades-03)/10 bg-white p-fluid-4 shadow-[0_16px_48px_rgba(34,27,79,0.07)]"
                {...fadeUp(0.12)}
              >
                <div className="mb-4 border-b border-(--primary-shades-03)/8 pb-4">
                  <h2 className="text-fluid-base font-semibold text-(--primary-shades-03)">تفاصيل الدفع</h2>
                </div>
                {infoConfirmed ? (
                  <div className="mysr-form min-h-[12rem]" />
                ) : (
                  <div className="flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-xl bg-(--white-shades-01) px-4 py-8 text-center">
                    <p className="text-fluid-sm font-medium text-(--primary-shades-03)/60">أكمل بيانات العميل أعلاه أولاً</p>
                    <p className="text-fluid-xs text-(--primary-shades-03)/40">خيارات الدفع ستظهر هنا بعد تأكيد بياناتك</p>
                  </div>
                )}
                <style>{`
                  .mysr-form-moyasarForm {
                    font-family: inherit !important;
                  }
                  .mysr-form-moyasarForm.mysr-form-fixedWidth {
                    max-width: 100% !important;
                    transition: none !important;
                  }
                  .mysr-form-button::before {
                    content: "ادفع";
                    font-size: 1rem;
                  }
                  .mysr-form-label {
                    color: color-mix(in srgb, var(--primary-shades-03) 55%, transparent) !important;
                    font-size: 0.75rem !important;
                    font-weight: 500 !important;
                    margin-bottom: 0.375rem !important;
                  }
                  .mysr-form-inputGroup {
                    margin-bottom: 1rem !important;
                  }
                  .mysr-form-input,
                  .mysr-form-mysrFieldset {
                    border: 1px solid color-mix(in srgb, var(--primary-shades-03) 14%, transparent) !important;
                    border-radius: 0.75rem !important;
                    background: #fff !important;
                    transition: border-color 0.2s, box-shadow 0.2s !important;
                  }
                  .mysr-form-input {
                    padding: 0.75rem 1rem !important;
                    font-size: 0.875rem !important;
                    color: var(--primary-shades-03) !important;
                  }
                  .mysr-form-input::placeholder {
                    color: color-mix(in srgb, var(--primary-shades-04) 40%, transparent) !important;
                  }
                  .mysr-form-input:focus {
                    border-color: color-mix(in srgb, var(--secondary-shades-08) 45%, transparent) !important;
                    box-shadow: 0 0 0 3px color-mix(in srgb, var(--secondary-shades-08) 10%, transparent) !important;
                    outline: none !important;
                  }
                  .mysr-form-mysrFieldset {
                    border: none !important;
                    background: transparent !important;
                    box-shadow: none !important;
                  }
                  .mysr-form-mysrFieldset .mysr-form-input {
                    border: 1px solid color-mix(in srgb, var(--primary-shades-03) 14%, transparent) !important;
                    border-radius: 0.75rem !important;
                    background: #fff !important;
                  }
                  .mysr-form-cardInfo {
                    gap: 0.75rem !important;
                  }
                  .mysr-form-ccInputGroup {
                    width: 100% !important;
                  }
                  .mysr-form-cardInfoHalfWidth {
                    flex: 0 0 calc(50% - 0.375rem) !important;
                    max-width: calc(50% - 0.375rem) !important;
                    min-width: 0 !important;
                    box-sizing: border-box !important;
                  }
                  .mysr-form-submitGroup {
                    text-align: center !important;
                  }
                  .mysr-form-button {
                    background: linear-gradient(135deg, var(--secondary-shades-08), color-mix(in srgb, var(--secondary-shades-08) 78%, #7c0e2e)) !important;
                    border: none !important;
                    border-radius: 0.85rem !important;
                    padding: 0.9rem 1rem !important;
                    width: 30% !important;
                    min-width: 160px !important;
                    margin-inline: auto !important;
                    display: block !important;
                    font-size: 0 !important;
                    font-weight: 700 !important;
                    font-family: inherit !important;
                    text-align: center !important;
                    box-shadow: 0 10px 28px color-mix(in srgb, var(--secondary-shades-08) 38%, transparent) !important;
                    transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s !important;
                  }
                  .mysr-form-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 14px 34px color-mix(in srgb, var(--secondary-shades-08) 46%, transparent) !important;
                  }
                  .mysr-form-button:active {
                    transform: translateY(0);
                  }
                  .mysr-form-footer {
                    margin-top: 0.75rem;
                    opacity: 0.75;
                  }
                `}</style>
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.aside
              className="flex flex-col gap-4 lg:sticky lg:top-24"
              {...fadeUp(0.14)}
            >
              {/* Cart items */}
              <div className="rounded-2xl border border-(--primary-shades-03)/10 bg-white p-fluid-3 shadow-[0_16px_48px_rgba(34,27,79,0.07)]">
                <h3 className="mb-3 flex items-center gap-2 border-b border-(--primary-shades-03)/8 pb-3 text-fluid-sm font-semibold text-(--primary-shades-03)">
                  <Package className="h-4 w-4 text-(--primary-shades-04)" />
                  الباقات المختارة
                  {cartItems.length > 0 && (
                    <span className="mr-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--primary-shades-02) text-[0.65rem] font-bold text-white">
                      {cartItems.length}
                    </span>
                  )}
                </h3>
                {cartItems.length > 0 ? (
                  <div className="space-y-2.5">
                    {cartItems.map((item) => (
                      <OrderItem key={item.id} item={item} onRemove={removeCartItem} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--primary-shades-03)/6 text-(--primary-shades-04)">
                      <Package className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-fluid-xs text-(--primary-shades-03)/55">
                      لا توجد باقات في السلة
                    </p>
                  </div>
                )}
              </div>

              {/* Summary + proceed */}
              <div className="rounded-2xl border border-(--primary-shades-03)/10 bg-(--primary-shades-02) p-fluid-3 text-white shadow-[0_20px_56px_rgba(34,27,79,0.24)]">
                <h3 className="mb-3 border-b border-white/12 pb-3 text-fluid-sm font-semibold">
                  ملخص الطلب
                </h3>
                <div className="space-y-2 text-fluid-xs">
                  <div className="flex items-center justify-between text-white/60">
                    <span>عدد الباقات</span>
                    <span className="font-semibold text-white">{cartItems.length}</span>
                  </div>
                  {totalDisplay && (
                    <div className="flex items-center justify-between text-white/60">
                      <span>إجمالي الطلب</span>
                      <span className="font-semibold text-white" dir="ltr">{totalDisplay}</span>
                    </div>
                  )}
                  {split && split.mode === "split" && (
                    <>
                      <div className="mt-1 rounded-xl bg-white/8 px-3 py-2.5 text-fluid-xs space-y-1.5">
                        <p className="font-semibold text-white/80">نظام الدفع المرحلي</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/55">الدفعة الأولى (60%)</span>
                          <span className="font-bold text-white" dir="ltr">{split.amountDueNow.toLocaleString("en-US")} SAR</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/55">الدفعة الثانية (40%)</span>
                          <span className="font-semibold text-white/70" dir="ltr">{split.amountDueLater.toLocaleString("en-US")} SAR</span>
                        </div>
                      </div>
                    </>
                  )}
                  {split && split.mode === "full" && totalDisplay && (
                    <div className="flex items-center justify-between border-t border-white/12 pt-2">
                      <span className="text-white/60">المبلغ المستحق الآن</span>
                      <span className="text-base font-bold text-white" dir="ltr">{totalDisplay}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-start gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setAgreed((v) => !v)}
                    className={[
                      "mt-0.5 h-5 w-5 shrink-0 rounded-[5px] border-2 transition",
                      agreed ? "border-white bg-white" : "border-white/30 bg-transparent",
                    ].join(" ")}
                    aria-checked={agreed}
                    role="checkbox"
                  >
                    {agreed && (
                      <svg viewBox="0 0 12 10" fill="none" className="w-full p-0.5">
                        <path d="M1 5l3 3 7-7" stroke="var(--primary-shades-02)"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <p className="text-fluid-xs leading-relaxed text-white/55">
                    أوافق على{" "}
                    <button type="button" onClick={() => setActiveModal("terms")}
                      className="text-white underline underline-offset-2 hover:no-underline">
                      الشروط والأحكام
                    </button>{" "}
                    و{" "}
                    <button type="button" onClick={() => setActiveModal("privacy")}
                      className="text-white underline underline-offset-2 hover:no-underline">
                      سياسة الخصوصية
                    </button>
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!agreed || cartItems.length === 0}
                  onClick={() => {
                    if (infoConfirmed) {
                      document.querySelector(".mysr-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
                      return;
                    }
                    handleConfirmInfo();
                  }}
                  className={[
                    "mt-4 w-full rounded-xl py-3.5 text-fluid-sm font-semibold text-center transition",
                    agreed && cartItems.length > 0
                      ? "bg-(--secondary-shades-08) text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--secondary-shades-08)_40%,transparent)] hover:opacity-90 cursor-pointer"
                      : "bg-white/14 text-white/30 cursor-not-allowed",
                  ].join(" ")}
                >
                  {split?.mode === "split" && split.amountDueNow
                    ? `دفع ${split.amountDueNow.toLocaleString("en-US")} SAR - الدفعة الأولى`
                    : split?.amountDueNow
                    ? `دفع ${split.amountDueNow.toLocaleString("en-US")} SAR وإتمام الطلب`
                    : "متابعة للدفع"}
                </button>

                {split?.mode === "split" && (
                  <div className="mt-3 rounded-xl bg-white/8 px-3 py-2.5 text-fluid-xs">
                    <p className="font-semibold text-white/80">أنت تدفع الدفعة الأولى</p>
                    <p className="mt-0.5 text-white/55">
                      الدفعة الثانية ({split.amountDueLater.toLocaleString("en-US")} SAR) تُسدَّد عند تسليم الهوية البصرية.
                    </p>
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        </Container>
      </section>

      <LegalModal type={activeModal} onClose={() => setActiveModal(null)} />
    </>
  );
}
