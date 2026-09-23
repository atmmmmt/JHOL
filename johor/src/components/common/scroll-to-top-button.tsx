"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CART_STORAGE_KEY,
  CART_TOAST_EVENT,
  CART_UPDATED_EVENT,
  type CartToastDetail,
  getCartItems,
  requestOpenCart,
} from "../../lib/cart";
import { useLiveSection } from "../../lib/use-live-image";

function normalizePhoneNumber(phone: string) {
  const digitsOnly = phone.replace(/\D+/g, "");

  if (digitsOnly.startsWith("00")) {
    return digitsOnly.slice(2);
  }

  return digitsOnly;
}

function ScrollToTopButton({ phone }: { phone?: string }) {
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dismissTimeoutRef = useRef<number | null>(null);

  // The site is a static export, so the build-time prop only seeds the number.
  // Read the footer live so a dashboard change lands without a rebuild.
  const liveFooter = useLiveSection<{ contact?: { phone?: string } }>(
    "footer_content",
    { contact: { phone } },
  );

  const livePhone = liveFooter?.contact?.phone?.trim() || phone;
  const normalized = normalizePhoneNumber(livePhone ?? "");

  useEffect(() => {
    const refreshCount = () => {
      setCartCount(getCartItems().length);
    };

    const onCartUpdated = () => {
      refreshCount();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        refreshCount();
      }
    };

    const onToast = (event: Event) => {
      const toastEvent = event as CustomEvent<CartToastDetail>;
      setToastMessage(toastEvent.detail?.message ?? "تم تحديث السلة.");
    };

    refreshCount();
    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated);
    window.addEventListener("storage", onStorage);
    window.addEventListener(CART_TOAST_EVENT, onToast as EventListener);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CART_TOAST_EVENT, onToast as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    if (dismissTimeoutRef.current) {
      window.clearTimeout(dismissTimeoutRef.current);
    }

    dismissTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);

    return () => {
      if (dismissTimeoutRef.current) {
        window.clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, [toastMessage]);

  return (
    <>
      <AnimatePresence>
        {toastMessage ? (
          <motion.div
            dir="rtl"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-38 right-6 z-[55] max-w-[18rem] rounded-xl border border-(--secondary-shades-08)/20 bg-(--primary-shades-02) px-3 py-2 text-fluid-sm font-medium text-white shadow-[0_16px_36px_rgba(34,27,79,0.28)] sm:bottom-40 sm:right-8"
          >
            {toastMessage}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
        <button
          type="button"
          aria-label="فتح السلة"
          aria-haspopup="dialog"
          aria-controls="header-cart-sidebar"
          onClick={requestOpenCart}
          className="relative flex h-13 w-13 items-center justify-center rounded-full bg-(--secondary-shades-08) text-white shadow-[0_18px_40px_rgba(238,32,77,0.34)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(238,32,77,0.44)]"
        >
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-(--secondary-shades-08) px-1 text-[11px] font-semibold leading-none text-white">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          ) : null}
        </button>

        {normalized ? (
          <motion.a
            href={`https://wa.me/${normalized}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            initial={{ opacity: 0, scale: 0.78, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_rgba(24,167,84,0.32)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(24,167,84,0.42)]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-6 w-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </motion.a>
        ) : null}
      </div>
    </>
  );
}

export default ScrollToTopButton;
