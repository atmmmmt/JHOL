import { motion } from "framer-motion";
import { MessageCircleMore, ShieldCheck } from "lucide-react";
import type { ContactHeroContent } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";
import { useCursorMask } from "../../common/cursor-mask-context";

type ContactContentSectionsProps = {
  content: ContactHeroContent;
};

function ContactContentSections({ content }: ContactContentSectionsProps) {
  const { setMaskMode } = useCursorMask();
  const hasTalkAboutProject =
    !!content.talkAboutProject?.title ||
    !!content.talkAboutProject?.intro ||
    (content.talkAboutProject?.services?.length ?? 0) > 0 ||
    !!content.talkAboutProject?.closing;
  const hasWhyContactUs =
    !!content.whyContactUs?.title ||
    !!content.whyContactUs?.intro ||
    (content.whyContactUs?.benefits?.length ?? 0) > 0 ||
    !!content.whyContactUs?.closing;

  if (!hasTalkAboutProject && !hasWhyContactUs) {
    return null;
  }

  return (
    <motion.section className="bg-white py-fluid-8 text-(--primary-shades-03)" {...fadeUp(0, 36, 0.68)}>
      <Container>
        <div dir="rtl" className="space-y-fluid-6">
          {hasTalkAboutProject ? (
            <motion.article
              className="relative overflow-hidden rounded-[2rem] border border-(--primary-shades-03)/12 bg-linear-to-br from-(--primary-shades-04)/10 via-(--white-shades-01) to-(--secondary-shades-08)/12 p-fluid-5 shadow-[0_24px_72px_rgba(34,27,79,0.12)]"
              {...fadeUp(0.08, 28, 0.7)}
              whileHover={{ y: -4, scale: 1.005 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setMaskMode("cta")}
              onMouseLeave={() => setMaskMode("none")}
              onFocus={() => setMaskMode("cta")}
              onBlur={() => setMaskMode("none")}
            >
              <div className="pointer-events-none absolute left-[-10%] top-[-18%] h-36 w-36 rounded-full bg-(--secondary-shades-08)/16 blur-[92px]" />
              {content.talkAboutProject?.title ? (
                <motion.div className="relative z-10 mb-fluid-4 flex items-center gap-3" {...fadeUp(0.1, 18, 0.55)}>
                  <motion.span
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--secondary-shades-08)/26 bg-(--secondary-shades-08)/10 text-(--secondary-shades-08)"
                    animate={{ y: [0, -2, 0], rotate: [0, 2, 0, -2, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <MessageCircleMore className="h-5 w-5" strokeWidth={1.9} />
                  </motion.span>
                  <h2 className="text-fluid-xl font-semibold leading-[1.6] text-(--secondary-shades-08)">
                    {content.talkAboutProject.title}
                  </h2>
                </motion.div>
              ) : null}

              {content.talkAboutProject?.intro ? (
                <p className="relative z-10 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
                  {content.talkAboutProject.intro}
                </p>
              ) : null}

              {(content.talkAboutProject?.services?.length ?? 0) > 0 ? (
                <ul className="relative z-10 mt-fluid-3 grid gap-2 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80 md:grid-cols-2">
                  {content.talkAboutProject?.services?.map((service, index) => (
                    <motion.li
                      key={service}
                      className="flex items-center gap-2 rounded-xl border border-(--primary-shades-03)/10 bg-linear-to-br from-(--primary-shades-04)/10 to-(--secondary-shades-08)/12 px-3 py-2"
                      {...fadeUp(0.14 + index * 0.035, 14, 0.5)}
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-(--secondary-shades-08)" />
                      <span>{service}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : null}

              {content.talkAboutProject?.closing ? (
                <p className="relative z-10 mt-fluid-3 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
                  {content.talkAboutProject.closing}
                </p>
              ) : null}
            </motion.article>
          ) : null}

          {hasWhyContactUs ? (
            <motion.article
              className="relative overflow-hidden rounded-[2rem] border border-(--primary-shades-03)/12 bg-linear-to-br from-(--primary-shades-04)/10 via-(--white-shades-01) to-(--secondary-shades-09)/12 p-fluid-5 shadow-[0_22px_66px_rgba(34,27,79,0.12)]"
              {...fadeUp(0.14, 28, 0.72)}
              whileHover={{ y: -4, scale: 1.005 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setMaskMode("cta")}
              onMouseLeave={() => setMaskMode("none")}
              onFocus={() => setMaskMode("cta")}
              onBlur={() => setMaskMode("none")}
            >
              <div className="pointer-events-none absolute bottom-[-18%] right-[-10%] h-36 w-36 rounded-full bg-(--secondary-shades-09)/16 blur-[92px]" />
              {content.whyContactUs?.title ? (
                <motion.div className="relative z-10 mb-fluid-4 flex items-center gap-3" {...fadeUp(0.16, 18, 0.55)}>
                  <motion.span
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--secondary-shades-09)/26 bg-(--secondary-shades-09)/10 text-(--secondary-shades-09)"
                    animate={{ y: [0, -2, 0], scale: [1, 1.03, 1] }}
                    transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ShieldCheck className="h-5 w-5" strokeWidth={1.9} />
                  </motion.span>
                  <h2 className="text-fluid-xl font-semibold leading-[1.6] text-(--secondary-shades-08)">
                    {content.whyContactUs.title}
                  </h2>
                </motion.div>
              ) : null}

              {content.whyContactUs?.intro ? (
                <p className="relative z-10 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
                  {content.whyContactUs.intro}
                </p>
              ) : null}

              {(content.whyContactUs?.benefits?.length ?? 0) > 0 ? (
                <ul className="relative z-10 mt-fluid-3 grid gap-2 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80 md:grid-cols-2">
                  {content.whyContactUs?.benefits?.map((benefit, index) => (
                    <motion.li
                      key={benefit}
                      className="flex items-center gap-2 rounded-xl border border-(--primary-shades-03)/10 bg-linear-to-br from-(--primary-shades-04)/10 to-(--secondary-shades-08)/12 px-3 py-2"
                      {...fadeUp(0.2 + index * 0.035, 14, 0.5)}
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-(--secondary-shades-09)" />
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : null}

              {content.whyContactUs?.closing ? (
                <p className="relative z-10 mt-fluid-3 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
                  {content.whyContactUs.closing}
                </p>
              ) : null}
            </motion.article>
          ) : null}
        </div>
      </Container>
    </motion.section>
  );
}

export default ContactContentSections;
