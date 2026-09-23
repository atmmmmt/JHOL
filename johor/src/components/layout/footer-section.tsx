import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { Fragment } from "react";
import Image from "next/image";
import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { FooterContent } from "../../../lib/api";
import { Icons } from "../../constant/icons";
import { cn } from "../../lib/cn";
import { fadeIn, fadeUp } from "../../lib/motion";
import Container from "../common/container";
import NewsletterSubscribe from "../common/newsletter-subscribe";
import { useLiveImage, useLiveSection } from "../../lib/use-live-image";
import { LegalModal, type LegalModalType } from "../common/legal-modal";
import { PartnerBadges } from "../common/partner-badges";


const logoImgClass =
  "h-auto w-[clamp(160px,28vw,360px)] lg:w-full object-contain pointer-events-none select-none";
const FOOTER_LOGO_WIDTH = 650;
const FOOTER_LOGO_HEIGHT = 220;

const FOOTER_PHONE_NUMBERS = ["+966 58 323 9170", "+966 59 009 7538"] as const;
const NEWSLETTER_TITLE = "اشترك بالنشرة البريدية ليصلك كل جديد";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
// Falls back to the main contact template when no dedicated newsletter template is set.
const EMAILJS_NEWSLETTER_TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_NEWSLETTER_TEMPLATE_ID ??
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ??
  "";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";

const FOOTER_FIXED_SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/jhoragency/?hl=ar",
    Icon: Icons.Instagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@jhoragency?lang=ar",
    Icon: Icons.Music2,
  },
  {
    label: "Behance",
    href: "https://www.behance.net/jhoragency",
    Icon: Icons.Behance,
  },
  {
    label: "WhatsApp",
    href: "https://wa.link/7cviei",
    Icon: Icons.MessageCircle,
  },
  {
    label: "X",
    href: "https://x.com/Jhoragency",
    Icon: Icons.X,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/%D9%88%D9%83%D8%A7%D9%84%D8%A9-%D8%AC%D9%87%D9%88%D8%B1-%D9%84%D9%84%D8%AA%D8%B3%D9%88%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D9%84%D9%83%D8%AA%D8%B1%D9%88%D9%86%D9%8A",
    Icon: Icons.Linkedin,
  },
] as const;

function FooterLogoColumn({
  content,
}: {
  content: FooterContent;
}) {
  const liveLogoSrc = useLiveImage(
    "footer_content",
    ["logo", "image"],
    content.logo.image,
  );

  return (
    <div className="flex h-full flex-col items-center justify-start text-center max-md:items-center">
      <motion.div
        className="relative isolate flex items-center justify-center"
        initial={false}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className={`${logoImgClass} relative z-0`}
          {...fadeIn(0.12 * 0.04, 0.45)}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={liveLogoSrc}
            alt={content.logo.alt}
            width={FOOTER_LOGO_WIDTH}
            height={FOOTER_LOGO_HEIGHT}
            className="h-auto w-full object-contain"
            sizes="(max-width: 768px) 250px, (max-width: 1280px) 420px, 650px"
          />
        </motion.div>
      </motion.div>

      <p
        dir="rtl"
        className="mt-fluid-2 text-center text-fluid-sm leading-relaxed text-white/88"
      >
        مؤسسة جهور للتسويق الإلكتروني
        <br />
        <a href="tel:7034418165" className="hover:underline">الرقم الموحد 7034418165</a>
      </p>

      <PartnerBadges
        logos={content.partnerLogos}
        className="mt-fluid-3 grid grid-cols-2 items-center justify-center gap-2.5 sm:gap-3"
        itemClassName="flex min-w-0 items-center justify-center"
        imageClassName="h-auto max-h-14 w-full max-w-[140px] object-contain [filter:drop-shadow(0_0_0_1.5px_rgba(255,255,255,0.22))]"
      />

    </div>
  );
}

const LEGAL_HREFS = new Set(["/terms", "/terms-and-conditions", "/privacy-policy"]);

function FooterQuickLinksColumn({
  content,
  tone,
  onLegalClick,
}: {
  content: FooterContent;
  tone: "light" | "secondary";
  onLegalClick: (type: LegalModalType) => void;
}) {
  const isLight = tone === "light";
  const EXCLUDED_HREFS = new Set([
    "/campaign-terms", "/identity-terms", "/cookies-policy",
    "/terms", "/terms-and-conditions", "/privacy-policy",
  ]);
  const dbLinks = content.quickLinks.filter((link) => !EXCLUDED_HREFS.has(link.href));
  const allQuickLinks = [
    ...dbLinks,
    { text: "شروط والأحكام", href: "/terms" },
    { text: "سياسة الخصوصية", href: "/privacy-policy" },
  ];
  const midpoint = Math.ceil(allQuickLinks.length / 2);
  const firstColumn = allQuickLinks.slice(0, midpoint);
  const secondColumn = allQuickLinks.slice(midpoint);

  const linkClass = cn(
    "text-fluid-sm opacity-90 transition-opacity hover:opacity-100 cursor-pointer",
    isLight ? "text-white/90" : "text-(--secondary-shades-08)",
  );

  return (
    <div className="flex h-full flex-col text-right rtl max-sm:items-center max-sm:text-center">
      <h3
        className={cn(
          "mb-fluid-2 text-lg font-semibold",
          isLight ? "text-white/95" : "text-(--secondary-shades-08)",
        )}
      >
        {content.quickLinksTitle}
      </h3>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-center sm:gap-x-6 sm:text-right">
        {[firstColumn, secondColumn].map((column, columnIndex) => (
          <ul key={`quick-links-col-${columnIndex}`} className="space-y-2.5 sm:space-y-3">
            {column.map((link) => (
              <li key={`${link.text}-${link.href}`}>
                {LEGAL_HREFS.has(link.href) ? (
                  <button
                    type="button"
                    onClick={() =>
                      onLegalClick(link.href === "/privacy-policy" ? "privacy" : "terms")
                    }
                    className={linkClass}
                  >
                    {link.text}
                  </button>
                ) : (
                  <a href={link.href} className={linkClass}>
                    {link.text}
                  </a>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>

      <div className="mt-fluid-3">
        <h4
          className={cn(
            "mb-fluid-2 text-base font-medium",
            isLight ? "text-white/95" : "text-(--secondary-shades-08)",
          )}
        >
          تابعنا
        </h4>

        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start sm:gap-fluid-2">
          {FOOTER_FIXED_SOCIALS.map((social) => {
            const Icon = social.Icon;

            return isLight ? (
              <a
                key={`${social.label}-${social.href}`}
                href={social.href}
                aria-label={social.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white/80 transition hover:border-white/60 hover:text-white max-lg:cursor-auto cursor-none sm:h-10 sm:w-10"
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
            ) : (
              <div
                key={`${social.label}-${social.href}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--secondary-shades-08)/40 text-(--secondary-shades-08) sm:h-10 sm:w-10"
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

function FooterContactInfo({
  content,
  tone,
}: {
  content: FooterContent;
  tone: "light" | "secondary";
}) {
  const { Phone, Mail } = Icons;
  const isLight = tone === "light";

  return (
    <ul className="flex flex-col gap-1.5 max-sm:items-center">
      <li className="flex flex-wrap items-center justify-center gap-2 sm:gap-fluid-2">
        <Phone
          className={cn(
            "h-5 w-5 shrink-0",
            isLight ? "text-white/90" : "text-(--secondary-shades-08)",
          )}
        />
        <span
          className={cn(
            "hidden h-8 w-px shrink-0 sm:block",
            isLight ? "bg-white/35" : "bg-(--secondary-shades-08)/40",
          )}
        />
        <span className="flex items-center gap-1 text-fluid-sm" dir="ltr">
          {FOOTER_PHONE_NUMBERS.map((num, i) => (
            <Fragment key={num}>
              <a
                href={`tel:${num.replace(/\s/g, "")}`}
                className={cn(
                  "hover:underline",
                  isLight ? "text-white/90" : "text-(--secondary-shades-08)",
                )}
              >
                {num}
              </a>
              {i < FOOTER_PHONE_NUMBERS.length - 1 && (
                <span className={isLight ? "text-white/90" : "text-(--secondary-shades-08)"}> | </span>
              )}
            </Fragment>
          ))}
        </span>
      </li>

      <li className="flex flex-wrap items-center justify-center gap-2 sm:gap-fluid-2">
        <Mail
          className={cn(
            "h-5 w-5 shrink-0",
            isLight ? "text-white/90" : "text-(--secondary-shades-08)",
          )}
        />
        <span
          className={cn(
            "hidden h-8 w-px shrink-0 sm:block",
            isLight ? "bg-white/35" : "bg-(--secondary-shades-08)/40",
          )}
        />
        <a
          href={`mailto:${content.contact.email}`}
          className={cn(
            "break-all text-fluid-sm sm:break-normal",
            isLight ? "text-white/90" : "text-(--secondary-shades-08)",
          )}
        >
          {content.contact.email}
        </a>
      </li>
    </ul>
  );
}

function FooterNewsletterColumn({
  newsletterEmail,
  newsletterSubmitted,
  onEmailChange,
  onSubmit,
}: {
  newsletterEmail: string;
  newsletterSubmitted: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="mt-fluid-2 border-t border-white/16 pt-fluid-4">
      <NewsletterSubscribe
        title={NEWSLETTER_TITLE}
        headingTone="secondary"
        description="أدخل بريدك الإلكتروني ليصلك كل جديد من جهور."
        email={newsletterEmail}
        onEmailChange={onEmailChange}
        onSubmit={onSubmit}
        submitted={newsletterSubmitted}
        surface="dark"
      />
    </div>
  );
}

function FooterMaskZone({
  className,
  children,
}: {
  className?: string;
  mirror: ReactNode;
  children: ReactNode;
}) {
  return <div className={cn("relative", className)}>{children}</div>;
}

export default function FooterSection({ content }: { content: FooterContent }) {
  const liveFooter = useLiveSection("footer_content", content);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) return;

    // Optimistic UI: show the thank-you state immediately.
    setNewsletterSubmitted(true);
    setNewsletterEmail("");

    if (EMAILJS_SERVICE_ID && EMAILJS_NEWSLETTER_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      void emailjs
        .send(
          EMAILJS_SERVICE_ID,
          EMAILJS_NEWSLETTER_TEMPLATE_ID,
          {
            subject: "اشتراك جديد بالنشرة البريدية - جهور",
            from_name: "مشترك النشرة البريدية",
            reply_to: email,
            service_of_interest: "النشرة البريدية",
            message: `بريد إلكتروني جديد اشترك بالنشرة البريدية: ${email}`,
          },
          { publicKey: EMAILJS_PUBLIC_KEY },
        )
        .catch(() => {
          // Subscription intent is already acknowledged in the UI; ignore failures.
        });
    }

    window.setTimeout(() => {
      setNewsletterSubmitted(false);
    }, 2500);
  };

  return (
    <>
    <motion.footer
      className="relative overflow-hidden bg-(--primary-shades-02) py-[clamp(2.2rem,4vw,3.4rem)] text-white max-sm:pb-32"
      {...fadeUp(0, 40, 0.75)}
    >
      <Container className="w-full">
        <motion.div
          className="grid grid-cols-1 gap-fluid-6 sm:grid-cols-2 lg:grid-cols-3"
          {...fadeUp(0.06, 34, 0.7)}
        >
          <motion.div {...fadeUp(0.1, 24, 0.55)} className="sm:col-span-2 lg:col-span-1">
            <FooterLogoColumn content={liveFooter} />
          </motion.div>

          <motion.div {...fadeUp(0.14, 24, 0.55)}>
            <FooterMaskZone
              mirror={
                <FooterQuickLinksColumn content={liveFooter} tone="secondary" onLegalClick={setLegalModal} />
              }
            >
              <FooterQuickLinksColumn content={liveFooter} tone="light" onLegalClick={setLegalModal} />
            </FooterMaskZone>
          </motion.div>

          <motion.div
            {...fadeUp(0.18, 24, 0.55)}
            className="flex h-full flex-col gap-fluid-2"
          >
            <FooterMaskZone
              mirror={<FooterContactInfo content={liveFooter} tone="secondary" />}
            >
              <FooterContactInfo content={liveFooter} tone="light" />
            </FooterMaskZone>

            <FooterNewsletterColumn
              newsletterEmail={newsletterEmail}
              newsletterSubmitted={newsletterSubmitted}
              onEmailChange={setNewsletterEmail}
              onSubmit={handleNewsletterSubmit}
            />
          </motion.div>
        </motion.div>
      </Container>
    </motion.footer>
    <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </>
  );
}
