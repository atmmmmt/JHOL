"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import CtaLinkButton from "../components/common/cta-link-button";
import Container from "../components/common/container";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "../lib/cart";
import { parsePriceAmount } from "../lib/price";

function formatAddedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "تاريخ غير متوفر";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const refresh = () => {
      const cartItems = getCartItems().sort((a, b) => b.addedAt.localeCompare(a.addedAt));
      setItems(cartItems);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        refresh();
      }
    };

    refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const idsParam = useMemo(
    () => items.map((item) => item.id).join(","),
    [items],
  );

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(() => {
    if (items.length === 0) return null;
    let sum = 0;
    let allPriced = true;
    for (const item of items) {
      const amount = parsePriceAmount(item.price);
      if (amount === null) { allPriced = false; break; }
      sum += amount * item.quantity;
    }
    if (!allPriced) return null;
    return `${sum.toLocaleString("en-US")} SAR`;
  }, [items]);
  const contactHref = idsParam
    ? `/checkout?action=cart&items=${encodeURIComponent(idsParam)}`
    : "/checkout?action=cart";

  const handleRemove = (itemId: string) => {
    removeCartItem(itemId);
  };

  const handleQuantity = (itemId: string, delta: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const next = item.quantity + delta;
    if (next < 1) return;
    updateCartItemQuantity(itemId, next);
  };

  return (
    <section className="relative overflow-hidden bg-(--white-shades-01) pb-fluid-7 pt-[calc(var(--header-overlay-offset)+var(--space-fluid-5))]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[clamp(18rem,34vw,25rem)] bg-(--primary-shades-02)" />
        <div className="absolute right-[-10%] top-[-16%] h-72 w-72 rounded-full bg-(--secondary-shades-08)/10 blur-[120px]" />
        <div className="absolute bottom-[-16%] left-[-8%] h-72 w-72 rounded-full bg-(--primary-shades-04)/10 blur-[120px]" />
      </div>

      <Container className="relative z-10 space-y-fluid-5">
        <motion.header
          dir="rtl"
          className="text-right text-white"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-fluid-xs font-semibold text-white">
            <ShoppingCart className="h-4 w-4" />
            سلة الطلب
          </span>
          <h1 className="mt-2 text-[clamp(1.5rem,3vw,2.2rem)] font-semibold">
            العناصر المضافة
          </h1>
          <p className="mt-1 max-w-2xl text-fluid-sm leading-[1.85] text-white/72">
            راجع الباقات قبل إرسال الطلب النهائي، ويمكنك حذف أي عنصر أو تفريغ السلة بالكامل.
          </p>
        </motion.header>

        {items.length ? (
          <div className="grid gap-fluid-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <div className="space-y-3">
              {items.map((item, index) => (
                <motion.article
                  key={item.id}
                  dir="rtl"
                  className="rounded-xl border border-(--primary-shades-03)/10 bg-white p-fluid-3 text-right shadow-[0_12px_36px_rgba(34,27,79,0.07)]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: index * 0.04 }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-(--primary-shades-03)/12 bg-(--primary-shades-03)/6">
                        {item.previewImage ? (
                          <Image
                            src={item.previewImage}
                            alt={item.tierName}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-(--primary-shades-03)/45">
                            <ShoppingCart className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-fluid-base font-semibold text-(--primary-shades-03)">
                          {item.tierName}
                        </h2>
                        <p className="mt-1 truncate text-fluid-sm text-(--primary-shades-03)/70">
                          {item.packageTitle}
                        </p>
                        {item.price ? (
                          <p className="mt-1 text-fluid-sm font-semibold text-(--secondary-shades-08)" dir="ltr">
                            {(() => {
                              const amount = parsePriceAmount(item.price);
                              return amount !== null
                                ? `${(amount * item.quantity).toLocaleString("en-US")} SAR`
                                : item.price;
                            })()}
                          </p>
                        ) : null}
                        <p className="mt-1 text-fluid-xs text-(--primary-shades-03)/56">
                          أضيفت بتاريخ: {formatAddedAt(item.addedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-full border border-(--primary-shades-03)/14 bg-(--primary-shades-03)/4 px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => handleQuantity(item.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-(--primary-shades-03)/60 transition hover:bg-(--primary-shades-03)/10 hover:text-(--primary-shades-03)"
                        >
                          −
                        </button>
                        <span className="min-w-[1.5rem] text-center text-fluid-xs font-semibold text-(--primary-shades-03)">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantity(item.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-(--primary-shades-03)/60 transition hover:bg-(--primary-shades-03)/10 hover:text-(--primary-shades-03)"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-(--secondary-shades-08)/35 px-3 py-1.5 text-fluid-xs font-semibold text-(--secondary-shades-08) transition-colors hover:bg-(--secondary-shades-08)/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        حذف
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.aside
              dir="rtl"
              className="h-fit rounded-xl border border-(--primary-shades-03)/10 bg-(--primary-shades-02) p-fluid-3 text-right text-white shadow-[0_16px_38px_rgba(34,27,79,0.2)] lg:sticky lg:top-24"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.08 }}
            >
              <p className="text-fluid-sm text-white/75">عدد العناصر</p>
              <p className="mt-1 text-[clamp(1.55rem,3vw,2rem)] font-semibold">{totalQuantity}</p>
              {totalPrice && (
                <p className="mt-1 text-fluid-base font-bold text-white" dir="ltr">{totalPrice}</p>
              )}
              <p className="mt-2 text-fluid-xs leading-[1.75] text-white/72">
                عند المتابعة سيتم تجهيز الطلب بناءً على العناصر الموجودة في السلة.
              </p>

              <div className="mt-4 space-y-2.5">
                <a
                  href={contactHref}
                  className="flex w-full items-center justify-between rounded-full bg-(--secondary-shades-08) px-5 py-3 text-fluid-sm font-bold text-white shadow-[0_8px_24px_rgba(238,32,77,0.35)] transition hover:brightness-110 active:scale-95"
                >
                  <span>إتمام الطلب</span>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M7 17L17 7M17 7H7M17 7v10"/>
                    </svg>
                  </span>
                </a>
                <CtaLinkButton
                  href="/packages"
                  label="إضافة باقات أخرى"
                  surface="light"
                  hoverMatchDot
                  truncateLabel={false}
                  linkClassName="w-full"
                  shellClassName="w-full justify-between"
                />
              </div>
            </motion.aside>
          </div>
        ) : (
          <motion.div
            dir="rtl"
            className="rounded-xl border border-(--primary-shades-03)/10 bg-white p-fluid-5 text-center shadow-[0_16px_42px_rgba(34,27,79,0.07)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--primary-shades-04)/12 text-(--primary-shades-04)">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h2 className="mt-3 text-fluid-lg font-semibold text-(--primary-shades-03)">
              السلة فارغة حالياً
            </h2>
            <p className="mt-1 text-fluid-sm text-(--primary-shades-03)/68">
              أضف باقة من صفحة التفاصيل لتظهر هنا.
            </p>
            <div className="mt-4 flex justify-center">
              <CtaLinkButton
                href="/packages"
                label="استعرض الباقات"
                surface="light"
                hoverMatchDot
                truncateLabel={false}
              />
            </div>
          </motion.div>
        )}
      </Container>
    </section>
  );
}

export default CartPage;
