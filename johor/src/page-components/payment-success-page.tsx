"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Package, ArrowRight, Mail, Users, FileText, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Container from "../components/common/container";
import { clearCartItems } from "../lib/cart";

type OrderItem = {
  tierName: string;
  packageTitle: string;
  price: string;
  quantity: number;
  packageType?: string;
  packageId?: string;
  tierId?: string;
};

type PendingOrder = {
  customerName: string;
  email: string;
  phone: string;
  company: string;
  items: OrderItem[];
  totalSAR: number | null;
  paymentMode?: "full" | "split";
  amountPaidNow?: number;
  amountDueLater?: number;
  createdAt: string;
};

const BACKEND_URL = "https://johor-back.euphoria-motiva.com";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("id");
  const status = searchParams.get("status");
  const [order, setOrder] = useState<PendingOrder | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyPaymentId() {
    if (!paymentId) return;
    navigator.clipboard.writeText(paymentId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const isPaid = status === "paid";

  useEffect(() => {
    const raw = sessionStorage.getItem("johor_pending_order");
    if (raw) {
      try {
        setOrder(JSON.parse(raw) as PendingOrder);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!isPaid || !paymentId || !order || submitted) return;

    setSubmitted(true);
    clearCartItems();
    sessionStorage.removeItem("johor_pending_order");

    // Notify backend to record order and send emails
    fetch(`${BACKEND_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentId,
        customerName: order.customerName,
        email: order.email,
        phone: order.phone,
        company: order.company,
        items: order.items.map((i) => ({
          name: `${i.tierName} - ${i.packageTitle}`,
          price: i.price,
          qty: i.quantity,
          packageType: i.packageType,
          packageId: i.packageId,
          tierId: i.tierId,
        })),
        totalSAR: order.totalSAR,
        paymentMode: order.paymentMode ?? "full",
        amountPaidNow: order.amountPaidNow,
        amountDueLater: order.amountDueLater,
        createdAt: order.createdAt,
      }),
    }).catch(() => {
      // silently fail — webhook will also record the order
    });
  }, [isPaid, paymentId, order, submitted]);

  const nextSteps = [
    { icon: Mail, text: "راجع بريدك الإلكتروني — أرسلنا لك تأكيداً بتفاصيل طلبك" },
    { icon: Users, text: "فريقنا سيتواصل معك خلال 24 ساعة لبدء العمل" },
    { icon: FileText, text: "تابع الرابط الذي وصلك لتعبئة بريف المشروع" },
  ];

  return (
    <section
      className="relative overflow-hidden bg-(--white-shades-01) pb-fluid-8"
      dir="rtl"
    >
      {/* Hero band */}
      <div className="relative overflow-hidden pt-[calc(var(--header-overlay-offset)+var(--space-fluid-5))] pb-fluid-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-(--primary-shades-02)" />
          <div className="absolute right-[-6%] top-[-12%] h-72 w-72 rounded-full bg-(--secondary-shades-08)/10 blur-[130px]" />
          <div className="absolute bottom-[-15%] left-[-8%] h-80 w-80 rounded-full bg-(--primary-shades-04)/12 blur-[140px]" />
        </div>

        <Container className="relative z-10">
          <div className="mx-auto max-w-xl text-center">
            {/* Status icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
              className={[
                "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full",
                isPaid ? "bg-emerald-500/15" : "bg-(--secondary-shades-08)/12",
              ].join(" ")}
            >
              {isPaid ? (
                <CheckCircle className="h-10 w-10 text-emerald-500" strokeWidth={1.75} />
              ) : (
                <XCircle className="h-10 w-10 text-(--secondary-shades-08)" strokeWidth={1.75} />
              )}
            </motion.div>

            <motion.h1
              className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-white"
              {...fadeUp(0.15)}
            >
              {isPaid ? "تمّت عملية الدفع بنجاح" : "لم تتم عملية الدفع"}
            </motion.h1>
            <motion.p
              className="mx-auto mt-3 max-w-md text-fluid-sm leading-[1.85] text-white/65"
              {...fadeUp(0.2)}
            >
              {isPaid
                ? "شكراً لثقتك بنا. استلمنا طلبك وسيتواصل معك فريقنا قريباً لبدء العمل."
                : "حدث خطأ أثناء معالجة الدفع. لم يتم خصم أي مبلغ من بطاقتك، ويمكنك إعادة المحاولة."}
            </motion.p>

            {paymentId && (
              <motion.button
                type="button"
                onClick={copyPaymentId}
                className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-fluid-xs text-white/55 transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white/80"
                {...fadeUp(0.25)}
              >
                <span dir="ltr">رقم العملية: {paymentId}</span>
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </motion.button>
            )}
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container className="relative z-10">
        <motion.div
          className="mx-auto -mt-fluid-6 max-w-2xl"
          {...fadeUp(0.3)}
        >
          {/* Order summary */}
          {isPaid && order && (
            <div className="overflow-hidden rounded-2xl border border-(--primary-shades-03)/10 bg-white shadow-[0_24px_64px_rgba(34,27,79,0.12)]">
              <div className="flex items-center gap-2.5 border-b border-(--primary-shades-03)/8 bg-(--white-shades-01) px-fluid-4 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--primary-shades-02)/8 text-(--primary-shades-02)">
                  <Package className="h-4 w-4" />
                </span>
                <h2 className="text-fluid-base font-semibold text-(--primary-shades-03)">ملخص طلبك</h2>
              </div>

              <div className="p-fluid-4">
                <div className="mb-4 grid gap-2 text-fluid-xs sm:grid-cols-2">
                  <div className="rounded-xl bg-(--white-shades-01) px-3.5 py-2.5">
                    <p className="text-(--primary-shades-03)/45">الاسم</p>
                    <p className="mt-0.5 font-medium text-(--primary-shades-03)">{order.customerName || "—"}</p>
                  </div>
                  <div className="rounded-xl bg-(--white-shades-01) px-3.5 py-2.5">
                    <p className="text-(--primary-shades-03)/45">البريد الإلكتروني</p>
                    <p className="mt-0.5 font-medium text-(--primary-shades-03)" dir="ltr">{order.email || "—"}</p>
                  </div>
                  {order.company && (
                    <div className="rounded-xl bg-(--white-shades-01) px-3.5 py-2.5 sm:col-span-2">
                      <p className="text-(--primary-shades-03)/45">الشركة / المشروع</p>
                      <p className="mt-0.5 font-medium text-(--primary-shades-03)">{order.company}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t border-(--primary-shades-03)/8 pt-4">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 rounded-xl border border-(--primary-shades-03)/8 px-3.5 py-3 text-fluid-xs"
                    >
                      <div className="text-right">
                        <p className="font-medium text-(--primary-shades-03)">{item.tierName}</p>
                        <p className="mt-0.5 text-(--primary-shades-03)/50">{item.packageTitle}</p>
                      </div>
                      <div className="shrink-0 text-left">
                        {item.price && (
                          <p className="font-semibold text-(--secondary-shades-08)" dir="ltr">{item.price}</p>
                        )}
                        {item.quantity > 1 && (
                          <p className="mt-0.5 text-(--primary-shades-03)/45">× {item.quantity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.paymentMode === "split" ? (
                  <div className="mt-4 space-y-2">
                    {order.totalSAR !== null && (
                      <div className="flex items-center justify-between px-1 text-fluid-xs">
                        <span className="text-(--primary-shades-03)/50">إجمالي الطلب</span>
                        <span className="font-medium text-(--primary-shades-03)/70" dir="ltr">
                          {order.totalSAR.toLocaleString("en-US")} SAR
                        </span>
                      </div>
                    )}
                    <div className="rounded-xl bg-(--primary-shades-02) px-4 py-3 text-fluid-xs">
                      <p className="mb-2 font-semibold text-white/80">نظام الدفع المرحلي — أنت دفعت الدفعة الأولى</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/55">الدفعة الأولى (مدفوعة الآن — 60%)</span>
                        <span className="font-bold text-emerald-400" dir="ltr">
                          {(order.amountPaidNow ?? 0).toLocaleString("en-US")} SAR
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between border-t border-white/10 pt-1.5">
                        <span className="text-white/55">الدفعة الثانية (40%)</span>
                        <span className="font-semibold text-yellow-400" dir="ltr">
                          {(order.amountDueLater ?? 0).toLocaleString("en-US")} SAR
                        </span>
                      </div>
                      <p className="mt-2 text-[0.7rem] leading-[1.6] text-white/40">
                        تُسدَّد الدفعة الثانية عند تسليم الهوية البصرية.
                      </p>
                    </div>
                  </div>
                ) : (
                  order.totalSAR !== null && (
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-(--primary-shades-02) px-4 py-3.5 text-fluid-sm">
                      <span className="text-white/65">الإجمالي المدفوع</span>
                      <span className="text-fluid-base font-bold text-white" dir="ltr">
                        {order.totalSAR.toLocaleString("en-US")} SAR
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Next steps */}
          {isPaid && (
            <div className="mt-5 rounded-2xl border border-(--primary-shades-03)/10 bg-white p-fluid-4 shadow-[0_16px_48px_rgba(34,27,79,0.06)]">
              <h3 className="mb-3.5 text-fluid-sm font-semibold text-(--primary-shades-03)">الخطوات التالية</h3>
              <div className="space-y-3">
                {nextSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--primary-shades-04)/10 text-(--primary-shades-04)">
                      <step.icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <p className="mt-1.5 text-fluid-xs leading-[1.7] text-(--primary-shades-03)/70">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {isPaid ? (
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-(--primary-shades-02) px-7 py-3.5 text-fluid-sm font-semibold text-white shadow-[0_10px_28px_color-mix(in_srgb,var(--primary-shades-02)_35%,transparent)] transition hover:opacity-90"
              >
                العودة للرئيسية
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/checkout"
                  className="inline-flex items-center gap-2 rounded-full bg-(--secondary-shades-08) px-7 py-3.5 text-fluid-sm font-semibold text-white shadow-[0_10px_28px_color-mix(in_srgb,var(--secondary-shades-08)_35%,transparent)] transition hover:opacity-90"
                >
                  المحاولة مجدداً
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 rounded-full border border-(--primary-shades-03)/14 bg-white px-7 py-3.5 text-fluid-sm font-semibold text-(--primary-shades-03) transition hover:bg-(--primary-shades-03)/4"
                >
                  العودة للباقات
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
