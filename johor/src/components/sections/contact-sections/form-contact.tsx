import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { useRef, useState, type FormEvent } from "react";
import type { ContactFormContent, FormField } from "../../../../lib/api";
import CtaSubmitButton from "../../common/cta-submit-button";
import Container from "../../common/container";

const CONTACT_RIGHT_TITLE = "ابدأ مشروعك وخلي صوتك يوصل";
const CONTACT_SUBMIT_LABEL = "احصل على استشارتك الآن";
const CONTACT_SENDING_LABEL = "جارٍ الإرسال...";
const CONTACT_SUCCESS_MESSAGE = "تم إرسال طلبك بنجاح، سنتواصل معك قريباً.";
const CONTACT_ERROR_MESSAGE =
  "تعذر إرسال الطلب، حاول مرة أخرى أو تواصل معنا مباشرة على info@jhoragency.com.";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";
const COMPANY_MAP_EMBED_URL =
  "https://maps.google.com/maps?q=28.4335048,36.5647518&z=17&output=embed";
const COMPANY_MAP_LINK =
  "https://www.google.com/maps/place/%D9%88%D9%83%D8%A7%D9%84%D8%A9+%D8%AC%D9%87%D9%88%D8%B1+%D9%84%D9%84%D8%AA%D8%B3%D9%88%D9%8A%D9%82+%D8%A7%D9%84%D8%A7%D9%84%D9%83%D8%AA%D8%B1%D9%88%D9%86%D9%8A%E2%80%AD/@28.4335943,36.5648581,17z/data=!4m6!3m5!1s0x15a9b3807824af71:0x9655a057a8ee06f!8m2!3d28.4335048!4d36.5647518!16s%2Fg%2F11nbmf2y69?authuser=0&entry=ttu&g_ep=EgoyMDI2MDQyMS4wIKXMDSoASAFQAw%3D%3D";

type FormContactProps = {
  content: ContactFormContent;
};

function renderField(field: FormField) {
  if (field.type === "textarea") {
    return (
      <textarea
        name={field.name}
        rows={4}
        required
        aria-required
        placeholder={field.placeholder}
        className="w-full min-h-24 resize-y rounded-xl border border-white/20 bg-white/7 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/42 focus:border-white/75 focus:bg-white/12"
      />
    );
  }

  return (
    <input
      name={field.name}
      type={field.type}
      required
      aria-required
      placeholder={field.placeholder}
      dir={field.type === "email" ? "ltr" : undefined}
      className="w-full rounded-xl border border-white/20 bg-white/7 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/42 focus:border-white/75 focus:bg-white/12"
    />
  );
}

type SubmitStatus = "idle" | "sending" | "success" | "error";

function FormContact({ content }: FormContactProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const toggleService = (service: string) => {
    setSelectedService((previous) => (previous === service ? null : service));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "sending") {
      return;
    }

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      setStatus("error");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const messageLines = content.fields.map((field) => {
      const value = String(formData.get(field.name) ?? "").trim();
      return `${field.label}: ${value}`;
    });

    if (selectedService) {
      messageLines.push(`${content.interestTitle}: ${selectedService}`);
    }

    const emailField = content.fields.find((field) => field.type === "email");
    const nameField = content.fields.find((field) => field.type !== "email");

    const templateParams = {
      subject: "طلب استشارة جديدة - جهور",
      from_name: nameField ? String(formData.get(nameField.name) ?? "").trim() : "",
      reply_to: emailField ? String(formData.get(emailField.name) ?? "").trim() : "",
      service_of_interest: selectedService ?? "",
      message: messageLines.join("\n"),
    };

    setStatus("sending");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        { publicKey: EMAILJS_PUBLIC_KEY },
      );
      setStatus("success");
      form.reset();
      setSelectedService(null);
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-(--primary-shades-02) py-fluid-6 md:py-fluid-7 text-(--white-shades-01)">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[16%] h-60 w-60 rounded-full bg-(--secondary-shades-09)/14 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-8%] h-70 w-70 rounded-full bg-(--secondary-shades-08)/14 blur-[130px]" />
      </div>
      <Container>
        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:[direction:ltr] lg:items-start">
          <aside className="order-1 text-right lg:order-2 lg:[direction:rtl]">
            <h2 className="font-poppins text-[clamp(1.35rem,3vw,2.05rem)] font-semibold leading-[1.2] text-(--secondary-shades-09)">
              {CONTACT_RIGHT_TITLE}
            </h2>
            <h3 className="mt-3 text-fluid-base font-medium leading-[1.65] text-white/92">
              {content.title || "احصل على استشارة مجانية ونحدد لك أفضل حل يناسب مشروعك خلال 24 ساعة"}
            </h3>
            <p className="mb-5 mt-3 text-fluid-sm font-normal leading-[1.8] text-white/78">
              {content.description ||
                "في جهور، نساعدك على تحويل فكرتك إلى علامة واضحة ومؤثرة في السوق. سواء كنت تبدأ مشروعك أو تطور علامتك الحالية، فريقنا جاهز يقدم لك الحل المناسب بخطوات مدروسة ونتائج حقيقية."}
            </p>

            <motion.div
              className="w-full overflow-hidden rounded-2xl border border-white/22 bg-white/6 shadow-[0_16px_34px_rgba(0,0,0,0.2)]"
              {...{
                animate: { y: [0, -3, 0] },
                transition: { duration: 6.5, ease: "easeInOut", repeat: Infinity },
              }}
            >
              <iframe
                src={COMPANY_MAP_EMBED_URL}
                title="موقع وكالة جهور على الخريطة"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full border-0 sm:h-80 lg:h-96"
                allowFullScreen
              />
              <a
                href={COMPANY_MAP_LINK}
                target="_blank"
                rel="noreferrer"
                className="block border-t border-white/16 px-3 py-2 text-center text-fluid-sm font-medium text-white/88 transition-colors hover:text-white"
              >
                فتح الموقع في خرائط Google
              </a>
            </motion.div>
          </aside>

          <form
            ref={formRef}
            dir="rtl"
            onSubmit={handleSubmit}
            className="order-2 lg:order-1"
          >
            <div className="mb-4 hidden md:block">
              <h3 className="mb-2 font-poppins text-fluid-xl font-medium text-white/96">
                {content.interestTitle}
              </h3>
              <div className="flex items-center flex-wrap gap-3">
                {content.services.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`rounded-full border px-3.5 py-2 text-xs sm:text-sm text-right transition-all duration-300 ${
                      selectedService === service
                        ? "border-white bg-white text-(--primary-shades-02)"
                        : "border-white/24 bg-transparent text-white hover:border-white/60 hover:bg-white/6"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {content.fields.map((field) => (
                <motion.div key={field.name} className="group relative">
                  <label className="mb-2 block text-fluid-sm font-medium text-white/86">
                    {field.label}
                  </label>
                  {renderField(field)}
                </motion.div>
              ))}
            </div>

            {status === "success" ? (
              <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-400/12 px-4 py-3 text-fluid-sm text-emerald-200">
                {CONTACT_SUCCESS_MESSAGE}
              </div>
            ) : null}

            {status === "error" ? (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-400/12 px-4 py-3 text-fluid-sm text-red-200">
                {CONTACT_ERROR_MESSAGE}
              </div>
            ) : null}

            <div className="mt-5 flex justify-start sm:mt-6">
              <CtaSubmitButton
                label={status === "sending" ? CONTACT_SENDING_LABEL : CONTACT_SUBMIT_LABEL}
                surface="dark"
                buttonClassName="w-full sm:w-full"
                shellClassName="w-full justify-between sm:w-full"
                disabled={status === "sending"}
              />
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}

export default FormContact;
