"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CART_STORAGE_KEY,
  CART_TOAST_EVENT,
  CART_UPDATED_EVENT,
  type CartToastDetail,
  getCartItems,
  requestOpenCart,
} from "../../lib/cart";

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
  const normalized = normalizePhoneNumber(phone ?? "");

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
      setToastMessage(toastEvent.detail?.message ?? "طھظ… طھط­ط¯ظٹط« ط§ظ„ط³ظ„ط©.");
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
          aria-label="ظپطھط­ ط§ظ„ط³ظ„ط©"
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
            <MessageCircle className="h-6 w-6" />
          </motion.a>
        ) : null}
      </div>
    </>
  );
}

export default ScrollToTopButton;
