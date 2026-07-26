import { motion } from "framer-motion";
import { Mail, MapPin, PhoneCall } from "lucide-react";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import { useCursorMask } from "../../common/cursor-mask-context";

const SUBHEADER_PHONES = ["+966 58 323 9170", "+966 59 009 7538"];
const SUBHEADER_EMAIL = "info@jhoragency.com";

type InfoItem = {
  icon: typeof Mail;
  title: string;
  lines: string[];
  href?: string;
  isPhone?: boolean;
};

const infoItems: InfoItem[] = [
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    lines: [SUBHEADER_EMAIL],
    href: `mailto:${SUBHEADER_EMAIL}`,
  },
  {
    icon: PhoneCall,
    title: "رقم الجوال",
    lines: SUBHEADER_PHONES,
    isPhone: true,
  },
  {
    icon: MapPin,
    title: "موقع المكتب",
    lines: ["المملكة العربية السعودية", "تبوك"],
  },
];

function ContactDirectInfoSection() {
  const { setMaskMode } = useCursorMask();

  return (
    <section className="relative overflow-hidden bg-white py-fluid-8 text-(--primary-shades-03)">
      <div className="pointer-events-none absolute left-[-8%] top-[12%] h-52 w-52 rounded-full bg-(--secondary-shades-08)/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[8%] right-[-7%] h-56 w-56 rounded-full bg-(--secondary-shades-09)/10 blur-[120px]" />

      <Container className="relative">

        <motion.div
          className="relative z-10 overflow-hidden rounded-[2.5rem] border border-(--primary-shades-03)/10 bg-linear-to-br from-white via-(--white-shades-01) to-(--secondary-shades-09)/6 px-fluid-4 py-fluid-5 shadow-[0_24px_64px_rgba(34,27,79,0.12)]"
          {...fadeUp(0.08, 28, 0.66)}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--secondary-shades-08)/40 to-transparent" />
          <div className="pointer-events-none absolute left-[-4%] top-[-14%] h-36 w-36 rounded-full bg-(--secondary-shades-08)/10 blur-[90px]" />
          <div className="pointer-events-none absolute bottom-[-18%] right-[-2%] h-40 w-40 rounded-full bg-(--secondary-shades-09)/10 blur-[95px]" />

          <div className="mb-fluid-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-(--primary-shades-03)/10 bg-white/80 px-4 py-2 text-[11px] font-medium tracking-[0.28em] text-(--primary-shades-03)/58 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-(--secondary-shades-08)" />
              <span>معلومات التواصل المباشر</span>
            </div>
          </div>

          <div className="grid gap-fluid-4 md:grid-cols-3">
            {infoItems.map((item, index) => {
              const Icon = item.icon;
              const content = (
                <div className="relative flex h-full flex-col items-center rounded-[1.45rem] border border-(--primary-shades-03)/10 bg-white/75 px-fluid-4 py-fluid-5 text-center backdrop-blur-sm">
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-(--secondary-shades-08)/40 to-transparent" />
                  <div className="mb-fluid-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-(--secondary-shades-08) to-(--secondary-shades-09) text-white shadow-[0_12px_28px_rgba(34,27,79,0.18)]">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="text-fluid-lg font-semibold uppercase tracking-[0.08em] text-(--primary-shades-03)">
                    {item.title}
                  </h3>

                  <div className="mt-fluid-3 w-full space-y-1 border-t border-(--secondary-shades-08)/28 pt-fluid-3 text-fluid-base leading-relaxed text-(--primary-shades-03)/78">
                    {item.lines.map((line) =>
                      item.isPhone ? (
                        <a
                          key={line}
                          href={`tel:${line.replace(/[^\d+]/g, "")}`}
                          dir="ltr"
                          className="block font-semibold tracking-[0.02em] text-(--primary-shades-03) hover:text-(--secondary-shades-09)"
                          style={{ unicodeBidi: "plaintext" }}
                        >
                          {line}
                        </a>
                      ) : (
                        <p key={line} className="text-(--primary-shades-03)/80">
                          {line}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={item.title}
                  className="h-full max-lg:cursor-auto cursor-none"
                  {...fadeUp(0.12 + index * 0.05, 24, 0.62)}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setMaskMode("cta")}
                  onMouseLeave={() => setMaskMode("none")}
                  onFocus={() => setMaskMode("cta")}
                  onBlur={() => setMaskMode("none")}
                >
                  {item.href ? (
                    <a href={item.href} className="block h-full transition hover:opacity-95">
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export default ContactDirectInfoSection;
