import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import type { FormField, HomeContactPreviewContent } from "../../../../lib/api";
import { fadeUp } from "../../../lib/motion";
import CtaSubmitButton from "../../common/cta-submit-button";
import Container from "../../common/container";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";
const HOME_SENDING_LABEL = "Ø¬Ø§Ø±Ù Ø§Ù„Ø¥Ø±Ø³Ø§Ù„...";
const HOME_SUCCESS_MESSAGE = "ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨Ùƒ Ø¨Ù†Ø¬Ø§Ø­ØŒ Ø³Ù†ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ù‚Ø±ÙŠØ¨Ù‹Ø§.";
const HOME_ERROR_MESSAGE =
  "ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ø£Ùˆ ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¹Ù„Ù‰ info@jhoragency.com.";

function renderField(field: FormField) {
  if (field.type === "textarea") {
    return (
      <textarea
        name={field.name}
        rows={4}
        required
        aria-required
        placeholder={field.placeholder}
        className="w-full min-h-28 resize-y rounded-2xl border border-(--primary-shades-03)/16 bg-white px-5 py-3.5 text-fluid-base text-(--primary-shades-03) outline-none transition-colors placeholder:text-(--primary-shades-03)/42 focus:border-(--secondary-shades-08)/58"
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
      className="w-full rounded-2xl border border-(--primary-shades-03)/16 bg-white px-5 py-3.5 text-fluid-base text-(--primary-shades-03) outline-none transition-colors placeholder:text-(--primary-shades-03)/42 focus:border-(--secondary-shades-08)/58"
    />
  );
}

function FormHome({ content }: { content: HomeContactPreviewContent }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );

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

    const emailField = content.fields.find((field) => field.type === "email");
    const nameField = content.fields.find(
      (field) => field.type === "text" || field.name === "name",
    );
    const projectField = content.fields.find(
      (field) => field.type === "textarea" || field.name === "project",
    );

    setStatus("sending");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          subject: "Ø·Ù„Ø¨ Ø§Ø³ØªØ´Ø§Ø±Ø© Ø¬Ø¯ÙŠØ¯ - Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© - Ø¬Ù‡ÙˆØ±",
          from_name: nameField ? String(formData.get(nameField.name) ?? "").trim() : "",
          reply_to: emailField ? String(formData.get(emailField.name) ?? "").trim() : "",
          service_of_interest: "",
          message: messageLines.join("\n"),
          project_details: projectField
            ? String(formData.get(projectField.name) ?? "").trim()
            : "",
        },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="bg-(--white-shades-01) py-fluid-8 text-(--primary-shades-02)">
      <Container>
        <motion.div
          className="mb-fluid-6 flex flex-wrap items-center justify-between gap-fluid-4"
          {...fadeUp(0.04, 28, 0.72)}
        >
          <div className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-(--primary-shades-03)/62">
            <span className="h-2 w-2 rounded-full bg-(--secondary-shades-08)" />
            <span>{content.label}</span>
          </div>

          <div className="h-px flex-1 bg-linear-to-l from-(--primary-shades-03)/12 to-transparent" />
        </motion.div>

        <motion.div className="max-w-3xl text-right" {...fadeUp(0.08, 34, 0.8)}>
          <h2 className="font-poppins text-[clamp(2rem,5.3vw,5.7rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-(--primary-shades-03)">
            {content.title}
          </h2>
          <p className="mt-fluid-5 text-fluid-lg leading-relaxed text-(--primary-shades-03)/62">
            {content.description}
          </p>
        </motion.div>

        <form
          className="mt-fluid-5 max-w-5xl text-right"
          dir="rtl"
          onSubmit={handleSubmit}
        >
          <div className="space-y-fluid-5">
            {content.fields.map((field) => (
              <motion.div key={field.name} className="group relative">
                <label className="mb-2.5 block text-fluid-sm font-medium text-(--primary-shades-03)/82">
                  {field.label}
                </label>
                {renderField(field)}
              </motion.div>
            ))}
          </div>

          {status === "success" ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-fluid-sm text-emerald-700">
              {HOME_SUCCESS_MESSAGE}
            </div>
          ) : null}

          {status === "error" ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-fluid-sm text-red-700">
              {HOME_ERROR_MESSAGE}
            </div>
          ) : null}

          <div className="mt-fluid-8 flex justify-start">
            <CtaSubmitButton
              label={status === "sending" ? HOME_SENDING_LABEL : content.submitButton}
              surface="light"
              disabled={status === "sending"}
            />
          </div>
        </form>
      </Container>
    </section>
  );
}

export default FormHome;
