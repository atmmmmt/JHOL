import {
  type ComponentType,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import type {
  FooterContent,
  HeaderContent,
  ImageAsset,
  NavigationItem,
} from "../../../lib/api";
import { Icons } from "../../constant/icons";
import { cn } from "../../lib/cn";
import {
  CART_OPEN_EVENT,
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  clearCartItems,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "../../lib/cart";
import { parsePriceAmount } from "../../lib/price";
import CtaLinkButton from "../common/cta-link-button";
import {
  HEADER_LINK_MASK_RADIUS,
  HEADER_LOGO_MASK_RADIUS,
} from "../common/cursor-mask-constants";
import { useCursorMask } from "../common/cursor-mask-context";
import Container from "../common/container";
import { useLiveImage, useLiveSection } from "../../lib/use-live-image";

type HeaderTheme = "dark" | "light";
type HeaderNavigationItem = NavigationItem & { theme: HeaderTheme };
type FixedSocialLink = {
  label: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
};

const CLIP =
  "circle(var(--mask-r, 0px) at var(--mask-x, 50%) var(--mask-y, 50%))";
const screenEase = [0.22, 1, 0.36, 1] as const;
const HEADER_LOGO_SHIFT_X = 8;
const HEADER_LOGO_SHIFT_Y = 6;
const HEADER_LOGO_WIDTH = 220;
const HEADER_LOGO_HEIGHT = 88;

const mobileMenuListVariants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.18,
      staggerChildren: 0.08,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

const mobileMenuItemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: screenEase,
    },
    y: 0,
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.22,
      ease: [0.4, 0, 1, 1] as const,
    },
    y: 18,
  },
};

const FIXED_SUBHEADER_PHONES = [
  "+966 58 323 9170",
  "+966 59 009 7538",
] as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatCartAddedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "تاريخ غير متوفر";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function isNavTargetActive(pathname: string, hash: string, to: string) {
  const [targetPath, targetHashSegment] = to.split("#");
  const normalizedPath = targetPath || "/";
  const normalizedHash = targetHashSegment ? `#${targetHashSegment}` : "";

  if (normalizedHash) {
    return pathname === normalizedPath && hash === normalizedHash;
  }

  return pathname === normalizedPath;
}

function isContactTarget(to: string) {
  return to === "/contact" || to.startsWith("/contact#");
}

function useCurrentHash(pathname: string) {
  const [hash, setHash] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncHash = () => {
      setHash(window.location.hash);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);

    return () => {
      window.removeEventListener("hashchange", syncHash);
    };
  }, [pathname]);

  return hash;
}

function HeaderLogoSticky({
  logo,
  theme,
}: {
  logo: ImageAsset;
  theme: HeaderTheme;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [shift, setShift] = useState({ x: 0, y: 0 });
  const { setMaskMode } = useCursorMask();

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const box = boxRef.current;
    if (!box) return;

    const rect = box.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    box.style.setProperty("--mask-x", `${mx}px`);
    box.style.setProperty("--mask-y", `${my}px`);

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const nx = (mx - cx) / Math.max(cx, 1);
    const ny = (my - cy) / Math.max(cy, 1);

    setShift({
      x: clamp(
        nx * HEADER_LOGO_SHIFT_X,
        -HEADER_LOGO_SHIFT_X,
        HEADER_LOGO_SHIFT_X,
      ),
      y: clamp(
        ny * HEADER_LOGO_SHIFT_Y,
        -HEADER_LOGO_SHIFT_Y,
        HEADER_LOGO_SHIFT_Y,
      ),
    });
  };

  const onEnter = (event: MouseEvent<HTMLDivElement>) => {
    setHovered(true);
    setMaskMode("hidden");
    onMove(event);
  };

  const onLeave = () => {
    setHovered(false);
    setMaskMode("none");
    setShift({ x: 0, y: 0 });

    const box = boxRef.current;
    if (!box) return;
    box.style.removeProperty("--mask-x");
    box.style.removeProperty("--mask-y");
  };

  const logoTransform = `translate(${shift.x}px, ${shift.y}px)`;
  const logoFilter =
    theme === "dark" ? "brightness(0) invert(1)" : "brightness(0)";
  const liveLogoSrc = useLiveImage("header_navigation", ["logo", "image"], logo.image);

  return (
    <Link
      href="/"
      scroll={false}
      className="relative shrink-0 max-lg:cursor-auto cursor-none"
    >
      <div
        ref={boxRef}
        className="header-local-mask relative flex h-18 w-34 max-w-[58vw] items-center justify-center overflow-hidden rounded-full sm:h-20 sm:w-40 sm:max-w-[50vw] lg:h-23 lg:w-46 lg:max-w-[46vw]"
        style={
          {
            "--mask-r": hovered ? `${HEADER_LOGO_MASK_RADIUS}px` : "0px",
          } as CSSProperties
        }
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <Image
          src={liveLogoSrc}
          alt={logo.alt}
          width={HEADER_LOGO_WIDTH}
          height={HEADER_LOGO_HEIGHT}
          priority
          draggable={false}
          sizes="(max-width: 640px) 136px, (max-width: 1024px) 160px, 184px"
          className="relative z-10 h-13 w-auto object-contain select-none sm:h-15 lg:h-18"
          style={{
            filter: logoFilter,
            transform: logoTransform,
            transition: hovered
              ? "transform 0.12s ease-out"
              : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-full"
          style={{
            WebkitClipPath: CLIP,
            clipPath: CLIP,
          }}
          aria-hidden
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              theme === "dark" ? "bg-white/10" : "bg-(--primary-shades-03)/8",
            )}
          />
          <Image
            src={liveLogoSrc}
            alt=""
            width={HEADER_LOGO_WIDTH}
            height={HEADER_LOGO_HEIGHT}
            draggable={false}
            sizes="(max-width: 640px) 136px, (max-width: 1024px) 160px, 184px"
            className="h-13 w-auto object-contain select-none sm:h-15 lg:h-18"
            style={{
              filter: logoFilter,
              transform: logoTransform,
              transition: hovered
                ? "transform 0.14s ease-out"
                : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
      </div>
    </Link>
  );
}

type HeaderMaskNavLinkProps = {
  pathname: string;
  hash: string;
  to: string;
  label: string;
  className?: string;
  theme: HeaderTheme;
};

function HeaderMaskNavLink({
  pathname,
  hash,
  to,
  label,
  className,
  theme,
}: HeaderMaskNavLinkProps) {
  const isActive = useMemo(
    () => isNavTargetActive(pathname, hash, to),
    [hash, pathname, to],
  );
  const [hovered, setHovered] = useState(false);
  const { setMaskMode } = useCursorMask();

  const onMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--mask-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--mask-y", `${event.clientY - rect.top}px`);
  };

  const onLeave = (event: MouseEvent<HTMLAnchorElement>) => {
    setHovered(false);
    setMaskMode("none");
    event.currentTarget.style.removeProperty("--mask-x");
    event.currentTarget.style.removeProperty("--mask-y");
  };

  return (
    <Link
      href={to}
      scroll={false}
      onMouseMove={onMove}
      onMouseEnter={() => {
        setHovered(true);
        setMaskMode("headerNav");
      }}
      onMouseLeave={onLeave}
      className={cn(
        "header-local-mask whitespace-nowrap relative isolate z-41 inline-flex max-lg:cursor-auto cursor-none origin-center items-center justify-center rounded-sm px-1.5 py-1 text-fluid-sm font-medium leading-tight transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        // hovered ? "scale-105" : "scale-100",
        className,
      )}
      style={
        {
          "--mask-r": hovered ? `${HEADER_LINK_MASK_RADIUS}px` : "0px",
        } as CSSProperties
      }
    >
      <span
        className={cn(
          "relative z-10 text-fluid-sm font-medium leading-tight",
          isActive
            ? "text-(--secondary-shades-09)"
            : theme === "light"
              ? "text-(--primary-shades-03)"
              : "text-(--white-shades-01)",
        )}
      >
        {label}
      </span>

      <span
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-visible"
        style={{
          WebkitClipPath: CLIP,
          clipPath: CLIP,
        }}
        aria-hidden
      >
        <span
          className="text-fluid-sm font-medium leading-tight"
          style={{ color: "var(--secondary-shades-09)" }}
        >
          {label}
        </span>
      </span>
    </Link>
  );
}

type HeaderSubContactLinkProps = {
  href: string;
  text: string;
  Icon: ComponentType<{ className?: string }>;
  dir?: "rtl" | "ltr";
};

function HeaderSubContactLink({
  href,
  text,
  Icon,
  dir = "rtl",
}: HeaderSubContactLinkProps) {
  const [hovered, setHovered] = useState(false);
  const { setMaskMode } = useCursorMask();

  const onMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--mask-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--mask-y", `${event.clientY - rect.top}px`);
  };

  const onEnter = (event: MouseEvent<HTMLAnchorElement>) => {
    setHovered(true);
    setMaskMode("headerNav");
    onMove(event);
  };

  const onLeave = (event: MouseEvent<HTMLAnchorElement>) => {
    setHovered(false);
    setMaskMode("none");
    event.currentTarget.style.removeProperty("--mask-x");
    event.currentTarget.style.removeProperty("--mask-y");
  };

  return (
    <a
      href={href}
      dir={dir}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "header-local-mask relative isolate inline-flex max-lg:cursor-auto cursor-none items-center justify-start overflow-hidden rounded-sm px-1 py-0.5 text-fluid-xs transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        // hovered ? "scale-105" : "scale-100",
      )}
      style={
        {
          "--mask-r": hovered ? `${HEADER_LINK_MASK_RADIUS}px` : "0px",
        } as CSSProperties
      }
    >
      <span className="relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap text-white/88 transition-colors duration-300">
        <Icon className="h-3.5 w-3.5" />
        <span style={{ unicodeBidi: "plaintext" }}>{text}</span>
      </span>

      <span
        className="pointer-events-none absolute inset-0 z-20 inline-flex items-center justify-start overflow-hidden px-1 py-0.5"
        style={{
          WebkitClipPath: CLIP,
          clipPath: CLIP,
        }}
        aria-hidden
      >
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-(--secondary-shades-09)">
          <Icon className="h-3.5 w-3.5" />
          <span style={{ unicodeBidi: "plaintext" }}>{text}</span>
        </span>
      </span>
    </a>
  );
}

type HeaderSubSocialLinkProps = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

function HeaderSubSocialLink({ href, label, Icon }: HeaderSubSocialLinkProps) {
  const [hovered, setHovered] = useState(false);
  const { setMaskMode } = useCursorMask();

  const onMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--mask-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--mask-y", `${event.clientY - rect.top}px`);
  };

  const onEnter = (event: MouseEvent<HTMLAnchorElement>) => {
    setHovered(true);
    setMaskMode("headerNav");
    onMove(event);
  };

  const onLeave = (event: MouseEvent<HTMLAnchorElement>) => {
    setHovered(false);
    setMaskMode("none");
    event.currentTarget.style.removeProperty("--mask-x");
    event.currentTarget.style.removeProperty("--mask-y");
  };

  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "header-local-mask relative isolate inline-flex max-lg:cursor-auto cursor-none h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-white/30 text-white/82 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        // hovered ? "scale-110" : "scale-100",
      )}
      style={
        {
          "--mask-r": hovered ? `${HEADER_LINK_MASK_RADIUS}px` : "0px",
        } as CSSProperties
      }
    >
      <Icon className="relative z-10 h-3.5 w-3.5" />

      <span
        className="pointer-events-none absolute inset-0 z-20 inline-flex items-center justify-center overflow-hidden rounded-full"
        style={{
          WebkitClipPath: CLIP,
          clipPath: CLIP,
        }}
        aria-hidden
      >
        <span className="absolute inset-0 rounded-full border border-(--secondary-shades-09)" />
        <Icon className="h-3.5 w-3.5 text-(--secondary-shades-09)" />
      </span>
    </a>
  );
}

type MobileMenuOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: HeaderTheme;
  currentNavLabel: string;
  logo: ImageAsset;
  mobileMenuLabel: string;
  mobileMutedTextClass: string;
  mobileOverlayButtonClass: string;
  navItems: HeaderNavigationItem[];
  subHeaderEmail: string;
  subHeaderPhoneNumbers: string[];
  subHeaderSocials: FixedSocialLink[];
};

function MobileMenuOverlay({
  isOpen,
  onClose,
  currentTheme,
  currentNavLabel,
  logo,
  mobileMenuLabel,
  mobileMutedTextClass,
  mobileOverlayButtonClass,
  navItems,
  subHeaderEmail,
  subHeaderPhoneNumbers,
  subHeaderSocials,
}: MobileMenuOverlayProps) {
  const CloseIcon = Icons.X;
  const { Mail, Phone } = Icons;
  const pathname = usePathname();
  const hash = useCurrentHash(pathname);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[90] overflow-y-scroll overflow-x-hidden bg-(--primary-shades-02) text-white overscroll-contain lg:hidden"
          style={{ WebkitOverflowScrolling: "touch" } as CSSProperties}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.68, ease: screenEase }}
        >
          <Container className="relative flex h-full flex-col py-3 sm:py-fluid-6">
            <motion.div
              variants={mobileMenuItemVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex items-center justify-between gap-fluid-3 [direction:ltr]"
            >
              <HeaderLogoSticky logo={logo} theme={currentTheme} />

              <button
                type="button"
                aria-label="Close menu overlay"
                onClick={onClose}
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 sm:h-12 sm:w-12",
                  mobileOverlayButtonClass,
                )}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </motion.div>

            <motion.div
              variants={mobileMenuItemVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="mt-4 sm:mt-fluid-8"
            >
              <div
                className={cn(
                  "text-[11px] font-medium uppercase tracking-[0.28em]",
                  mobileMutedTextClass,
                )}
              >
                {mobileMenuLabel}
              </div>
              <p className="mt-3 m-0 max-w-[18rem] font-poppins text-fluid-3xl font-semibold leading-tight text-white">
                {currentNavLabel}
              </p>
            </motion.div>

            <motion.nav
              id="mobile-nav"
              className="mt-3 sm:mt-fluid-8 flex flex-col gap-1 sm:gap-fluid-3"
              variants={mobileMenuListVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {navItems.map((item, index) => {
                const isActive = isNavTargetActive(pathname, hash, item.to);

                return (
                  <motion.div key={item.to} variants={mobileMenuItemVariants}>
                    <Link
                      href={item.to}
                      scroll={false}
                      onClick={onClose}
                      className={cn(
                        "group flex items-center justify-between px-0 py-1.5 sm:py-fluid-2 transition-colors duration-300",
                        isActive
                          ? "text-white"
                          : "text-white/58 hover:text-white/84",
                      )}
                    >
                      <div className="space-y-1 text-right">
                        <div className="font-poppins text-fluid-xl font-semibold leading-tight">
                          {item.label}
                        </div>
                        <div
                          className={cn(
                            "text-[11px] font-medium tracking-[0.24em]",
                            isActive ? "text-white/62" : mobileMutedTextClass,
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>

                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full transition-transform duration-300",
                          isActive
                            ? "scale-100 bg-(--secondary-shades-09)"
                            : "scale-75 bg-white/18 group-hover:scale-100",
                        )}
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            <motion.div
              variants={mobileMenuItemVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="mt-auto pt-3 pb-1 flex flex-col items-center gap-2"
            >
              <div className="flex items-center justify-center gap-2.5">
                {subHeaderSocials.map((social) => (
                  <HeaderSubSocialLink
                    key={`mobile-${social.label}-${social.href}`}
                    href={social.href}
                    label={social.label}
                    Icon={social.Icon}
                  />
                ))}
              </div>

              <HeaderSubContactLink
                href={`mailto:${subHeaderEmail}`}
                text={subHeaderEmail}
                Icon={Mail}
                dir="ltr"
              />

              {subHeaderPhoneNumbers.map((phone, index) => (
                <HeaderSubContactLink
                  key={`mobile-${phone}-${index}`}
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  text={phone}
                  Icon={Phone}
                  dir="ltr"
                />
              ))}
            </motion.div>
          </Container>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

type CartSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  contactHref: string;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onClear: () => void;
};

function parsePrice(price?: string): number {
  return parsePriceAmount(price) ?? 0;
}

function CartSidebar({
  isOpen,
  onClose,
  items,
  contactHref,
  onRemoveItem,
  onUpdateQuantity,
  onClear: _onClear,
}: CartSidebarProps) {
  const CloseIcon = Icons.X;

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[95] [direction:ltr]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.button
            type="button"
            aria-label="إغلاق السلة"
            onClick={onClose}
            className="absolute inset-0 bg-(--primary-shades-02)/58 backdrop-blur-[2.5px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.aside
            id="header-cart-sidebar"
            dir="rtl"
            className="absolute right-0 top-0 flex h-[100dvh] w-full max-w-[min(34rem,100vw)] flex-col border-l border-(--primary-shades-03)/10 bg-white text-right text-(--primary-shades-03) shadow-[-22px_0_50px_rgba(34,27,79,0.2)]"
            initial={{ opacity: 0.96, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0.98, x: "100%" }}
            transition={{ duration: 0.5, ease: screenEase }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-(--primary-shades-03)/10 px-fluid-3 py-fluid-3">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-(--primary-shades-03)/7 px-3 py-1 text-fluid-xs font-semibold text-(--primary-shades-03)/72">
                  <ShoppingCart className="h-4 w-4" />
                  سلة الطلب
                </span>
                <h2 className="mt-2 text-fluid-xl font-semibold">العناصر المضافة</h2>
                <p className="mt-1 text-fluid-sm text-(--primary-shades-03)/62">
                  {items.length
                    ? `لديك ${items.length} عنصر في السلة.`
                    : "السلة فارغة حالياً، أضف باقة للبدء."}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close cart"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--primary-shades-03)/12 text-(--primary-shades-03) transition-colors duration-300 hover:bg-(--primary-shades-03)/6"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-fluid-3 py-fluid-3">
              {items.length ? (
                <div className="space-y-2.5">
                  {items.map((item, index) => (
                    <motion.article
                      key={item.id}
                      className="rounded-xl border border-(--primary-shades-03)/10 bg-(--white-shades-01) p-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, delay: index * 0.035 }}
                    >
                      <div className="flex items-start justify-between gap-2">
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
                            <h3 className="truncate text-fluid-base font-semibold text-(--primary-shades-03)">
                              {item.tierName}
                            </h3>
                            <p className="mt-1 truncate text-fluid-sm text-(--primary-shades-03)/72">
                              {item.packageTitle}
                            </p>
                            <p className="mt-1 text-fluid-xs text-(--primary-shades-03)/54">
                              أضيفت بتاريخ: {formatCartAddedAt(item.addedAt)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-(--secondary-shades-08)/28 px-2.5 py-1.5 text-fluid-xs font-semibold text-(--secondary-shades-08) transition-colors duration-300 hover:bg-(--secondary-shades-08)/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          حذف
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 rounded-full border border-(--primary-shades-03)/14 bg-(--white-shades-01) px-1 py-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-base font-bold text-(--primary-shades-03) transition hover:bg-(--primary-shades-03)/8"
                          >
                            −
                          </button>
                          <span className="min-w-[1.5rem] text-center text-fluid-sm font-semibold text-(--primary-shades-03)">
                            {item.quantity ?? 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-base font-bold text-(--primary-shades-03) transition hover:bg-(--primary-shades-03)/8"
                          >
                            +
                          </button>
                        </div>
                        {item.price ? (
                          <span className="text-fluid-sm font-semibold text-(--primary-shades-03)">
                            {parsePrice(item.price) > 0
                              ? `${(parsePrice(item.price) * (item.quantity ?? 1)).toLocaleString("en-US")} SAR`
                              : item.price}
                          </span>
                        ) : null}
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="flex h-full min-h-[17rem] flex-col items-center justify-center rounded-xl border border-dashed border-(--primary-shades-03)/16 bg-(--primary-shades-03)/[0.02] px-4 py-6 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--primary-shades-03)/10 text-(--primary-shades-03)">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-fluid-base font-semibold">
                    السلة فارغة حالياً
                  </h3>
                  <p className="mt-1 max-w-[18rem] text-fluid-sm text-(--primary-shades-03)/66">
                    اختر أي باقة من صفحة الباقات لتظهر هنا مباشرة.
                  </p>
                </motion.div>
              )}
            </div>

            <div className="border-t border-(--primary-shades-03)/10 bg-white px-fluid-3 py-fluid-3">
              <div className="space-y-2.5">
                <div onClick={onClose}>
                  <a
                    href={contactHref}
                    className="flex w-full items-center justify-center gap-2.5 rounded-full bg-(--secondary-shades-08) px-5 py-3 text-fluid-sm font-bold text-white shadow-[0_8px_24px_rgba(238,32,77,0.35)] transition hover:brightness-110 active:scale-95"
                  >
                    <span>إتمام الطلب</span>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M7 17L17 7M17 7H7M17 7v10"/>
                      </svg>
                    </span>
                  </a>
                </div>
                <div onClick={onClose}>
                  <a
                    href="/packages"
                    className="flex w-full items-center justify-center gap-2.5 rounded-full bg-(--primary-shades-02) px-5 py-3 text-fluid-sm font-bold text-white transition hover:brightness-110 active:scale-95"
                  >
                    <span>إضافة باقات أخرى</span>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M7 17L17 7M17 7H7M17 7v10"/>
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function Header({
  content,
  subHeader,
}: {
  content: HeaderContent;
  subHeader: FooterContent;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { Mail, Phone, Instagram, Music2, Behance, MessageCircle, X, Linkedin } =
    Icons;
  const MenuIcon = Icons.Menu;
  const pathname = usePathname();
  const hash = useCurrentHash(pathname);

  const liveHeader = useLiveSection<{ navigation?: typeof content.navigation }>(
    "header_navigation",
    { navigation: content.navigation },
  );
  const liveNavigation = liveHeader.navigation ?? content.navigation;

  const navItems = useMemo<HeaderNavigationItem[]>(
    () => liveNavigation.filter((item) => !item.archived).map((item) => ({ ...item, theme: "dark" })),
    [liveNavigation],
  );

  const currentNavItem = useMemo(
    () => navItems.find((item) => isNavTargetActive(pathname, hash, item.to)),
    [hash, navItems, pathname],
  );

  const contactNavItem = useMemo(
    () => navItems.find((item) => isContactTarget(item.to)),
    [navItems],
  );

  const contactCtaLabel = contactNavItem?.label ?? "Contact Us";
  const cartCount = cartItems.length;
  const cartCountLabel = cartCount > 99 ? "99+" : String(cartCount);
  const cartIdsParam = useMemo(
    () => cartItems.map((item) => item.id).join(","),
    [cartItems],
  );
  const cartContactHref = cartIdsParam
    ? `/checkout?action=cart&items=${encodeURIComponent(cartIdsParam)}`
    : "/checkout?action=cart";

  const subHeaderSocials = useMemo<FixedSocialLink[]>(
    () => [
      {
        label: "Instagram",
        href: "https://www.instagram.com/jhoragency/?hl=ar",
        Icon: Instagram,
      },
      {
        label: "TikTok",
        href: "https://www.tiktok.com/@jhoragency?lang=ar",
        Icon: Music2,
      },
      {
        label: "Behance",
        href: "https://www.behance.net/jhoragency",
        Icon: Behance,
      },
      {
        label: "WhatsApp",
        href: "https://wa.link/7cviei",
        Icon: MessageCircle,
      },
      {
        label: "X",
        href: "https://x.com/Jhoragency",
        Icon: X,
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/%D9%88%D9%83%D8%A7%D9%84%D8%A9-%D8%AC%D9%87%D9%88%D8%B1-%D9%84%D9%84%D8%AA%D8%B3%D9%88%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D9%84%D9%83%D8%AA%D8%B1%D9%88%D9%86%D9%8A",
        Icon: Linkedin,
      },
    ],
    [Behance, Instagram, Linkedin, MessageCircle, Music2, X],
  );

  const currentTheme = currentNavItem?.theme || "dark";
  const cursorSurface = currentTheme === "dark" ? "dark" : "light";

  const hasHeroUnderHeader =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/services" ||
    pathname === "/works" ||
    pathname.startsWith("/works/") ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/packages" ||
    pathname.startsWith("/packages/") ||
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname === "/payment-success" ||
    pathname.startsWith("/brief/") ||
    pathname === "/training-courses" ||
    pathname === "/contact" ||
    pathname === "/campaign-terms" ||
    pathname === "/identity-terms" ||
    pathname === "/privacy-policy" ||
    pathname === "/cookies-policy";

  const mobileButtonClass =
    currentTheme === "dark"
      ? "border-white/16 bg-white/[0.04] text-white hover:bg-white/[0.1]"
      : "border-(--primary-shades-03)/10 bg-(--primary-shades-03)/[0.03] text-(--primary-shades-03) hover:bg-(--primary-shades-03)/[0.06]";

  const mobileOverlayButtonClass =
    "border-white/16 bg-white/[0.04] text-white hover:bg-white/[0.1]";
  const mobileMutedTextClass = "text-white/48";
  const isAnyOverlayOpen = isOpen || isCartOpen;

  const openCartSidebar = () => {
    setIsOpen(false);
    setIsCartOpen(true);
  };

  const closeCartSidebar = () => {
    setIsCartOpen(false);
  };

  const handleRemoveCartItem = (itemId: string) => {
    removeCartItem(itemId);
  };

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;
    const next = (item.quantity ?? 1) + delta;
    if (next < 1) { removeCartItem(itemId); return; }
    updateCartItemQuantity(itemId, next);
    setCartItems(getCartItems().sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()));
  };

  const handleClearCart = () => {
    clearCartItems();
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const refreshCart = () => {
      const nextItems = getCartItems().sort((a, b) =>
        b.addedAt.localeCompare(a.addedAt),
      );
      setCartItems(nextItems);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        refreshCart();
      }
    };

    const onOpenCart = () => {
      setIsOpen(false);
      setIsCartOpen(true);
    };

    refreshCart();
    window.addEventListener(CART_UPDATED_EVENT, refreshCart);
    window.addEventListener("storage", onStorage);
    window.addEventListener(CART_OPEN_EVENT, onOpenCart);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refreshCart);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CART_OPEN_EVENT, onOpenCart);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || !isCartOpen) {
      return;
    }

    const scrollY = window.scrollY;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      document.body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isAnyOverlayOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || !isAnyOverlayOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isCartOpen) {
          setIsCartOpen(false);
          return;
        }

        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isAnyOverlayOpen, isCartOpen]);

  return (
    <header
      data-cursor-surface={cursorSurface}
      className={cn(
        "w-full font-inter transition-colors py-fluid-2 duration-500 bg-transparent text-white",
        hasHeroUnderHeader
          ? "absolute inset-x-0 top-0 z-[60]"
          : "relative z-30",
      )}
    >
      <Container className="hidden min-h-10 grid-cols-1 items-center gap-y-2 py-1 text-fluid-xs lg:grid lg:grid-cols-[1fr_auto_1fr] max-w-[100rem] lg:gap-x-fluid-4">
        <div className="flex items-center justify-start gap-2 max-md:justify-center">
          {subHeaderSocials.map((social) => (
            <HeaderSubSocialLink
              key={`${social.label}-${social.href}`}
              href={social.href}
              label={social.label}
              Icon={social.Icon}
            />
          ))}
        </div>

        <div className="flex items-center justify-center">
          <HeaderSubContactLink
            href={`mailto:${subHeader.contact.email}`}
            text={subHeader.contact.email}
            Icon={Mail}
            dir="ltr"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-y-1 max-md:justify-center">
          {FIXED_SUBHEADER_PHONES.map((phone, index) => (
            <div key={`${phone}-${index}`} className="flex items-center">
              <HeaderSubContactLink
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                text={phone}
                Icon={Phone}
                dir="ltr"
              />
              {index < FIXED_SUBHEADER_PHONES.length - 1 ? (
                <span className="mx-1 text-white/45">|</span>
              ) : null}
            </div>
          ))}
        </div>
      </Container>

      <div>
        <Container className="flex max-w-[100rem] items-center justify-between gap-fluid-3 py-fluid-2 [direction:ltr] sm:gap-fluid-4 lg:[direction:ltr] lg:gap-fluid-6">
          <HeaderLogoSticky logo={content.logo} theme={currentTheme} />

          <nav
            dir="rtl"
            className="hidden flex-1 items-center justify-center gap-fluid-4 xl:gap-fluid-5 lg:flex"
          >
            {navItems.map((item) => (
              <HeaderMaskNavLink
                key={item.to}
                pathname={pathname}
                hash={hash}
                to={item.to}
                label={item.label}
                theme={currentTheme}
              />
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <button
              type="button"
              aria-label="Open cart sidebar"
              aria-expanded={isCartOpen}
              aria-controls="header-cart-sidebar"
              onClick={openCartSidebar}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-(--secondary-shades-08) text-white shadow-[0_8px_24px_rgba(238,32,77,0.34)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_10px_28px_rgba(238,32,77,0.44)]"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-(--secondary-shades-08) px-1 text-[11px] font-semibold leading-none text-white">
                  {cartCountLabel}
                </span>
              ) : null}
            </button>

            <CtaLinkButton
              href="/contact"
              scroll={false}
              label={contactCtaLabel}
              surface={currentTheme}
              dotClassName="bg-(--secondary-shades-08)"
              hoverMatchDot
              linkClassName="max-lg:cursor-auto cursor-none"
            />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              aria-label="Open cart sidebar"
              aria-expanded={isCartOpen}
              aria-controls="header-cart-sidebar"
              onClick={openCartSidebar}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-(--secondary-shades-08) text-white shadow-[0_8px_24px_rgba(238,32,77,0.34)] transition-all duration-300 hover:brightness-110 sm:h-12 sm:w-12"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-(--secondary-shades-08) px-1 text-[11px] font-semibold leading-none text-white">
                  {cartCountLabel}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              onClick={() => {
                setIsCartOpen(false);
                setIsOpen(true);
              }}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 sm:h-12 sm:w-12",
                mobileButtonClass,
              )}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </Container>
      </div>

      <MobileMenuOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentTheme={currentTheme}
        currentNavLabel={currentNavItem?.label ?? navItems[0]?.label ?? ""}
        logo={content.logo}
        mobileMenuLabel={content.mobileMenu?.sectionLabel ?? "Navigation"}
        mobileMutedTextClass={mobileMutedTextClass}
        mobileOverlayButtonClass={mobileOverlayButtonClass}
        navItems={navItems}
        subHeaderEmail={subHeader.contact.email}
        subHeaderPhoneNumbers={[...FIXED_SUBHEADER_PHONES]}
        subHeaderSocials={subHeaderSocials}
      />
      <CartSidebar
        isOpen={isCartOpen}
        onClose={closeCartSidebar}
        items={cartItems}
        contactHref={cartContactHref}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onClear={handleClearCart}
      />
    </header>
  );
}

export default Header;
