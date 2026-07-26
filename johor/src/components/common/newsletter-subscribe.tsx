import type { FormEvent } from "react";
import { cn } from "../../lib/cn";

type NewsletterSubscribeProps = {
  title: string;
  headingTone?: "primary" | "secondary" | "light";
  description?: string;
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitted?: boolean;
  surface?: "light" | "dark";
  className?: string;
  disabled?: boolean;
};

function NewsletterSubscribe({
  title,
  headingTone = "primary",
  description,
  email,
  onEmailChange,
  onSubmit,
  submitted = false,
  surface = "light",
  className,
  disabled = false,
}: NewsletterSubscribeProps) {
  const headingClass =
    headingTone === "secondary"
      ? "text-(--secondary-shades-08)"
      : headingTone === "light"
        ? "text-white/95"
        : "text-(--primary-shades-03)";

  const descriptionClass =
    surface === "dark"
      ? "text-white/70"
      : "text-(--primary-shades-03)/68";

  const inputClass =
    surface === "dark"
      ? "h-11 w-full rounded-xl border border-white/24 bg-white/8 px-3 text-fluid-sm text-white outline-none transition placeholder:text-white/45 focus:border-white/60 focus:bg-white/12"
      : "h-11 w-full rounded-xl border border-(--primary-shades-03)/14 bg-white px-3 text-fluid-sm text-(--primary-shades-03) outline-none transition placeholder:text-(--primary-shades-03)/42 focus:border-(--secondary-shades-09) focus:ring-2 focus:ring-(--secondary-shades-09)/18";

  const buttonClass =
    surface === "dark"
      ? "h-11 w-full rounded-xl bg-(--secondary-shades-08) px-4 text-fluid-sm font-semibold text-white transition hover:bg-(--secondary-shades-09)"
      : "h-11 w-full rounded-xl bg-(--secondary-shades-08) px-4 text-fluid-sm font-semibold text-white transition hover:bg-(--secondary-shades-09)";

  return (
    <div className={className}>
      <h3 className={cn("font-poppins text-fluid-xl font-semibold leading-[1.35] max-sm:leading-[1.45]", headingClass)}>{title}</h3>
      {description ? (
        <p className={cn("mt-2 text-fluid-sm leading-[1.9] max-sm:leading-[2]", descriptionClass)}>{description}</p>
      ) : null}

      <form className="mt-fluid-3 space-y-2.5" onSubmit={onSubmit}>
        <input
          type="email"
          required={!disabled}
          disabled={disabled}
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="name@email.com"
          className={inputClass}
        />
        <button type="submit" disabled={disabled} className={buttonClass}>
          اشتراك
        </button>
      </form>

      {submitted && !disabled ? (
        <p className="mt-2 text-xs font-medium text-(--secondary-shades-09)">
          تم إرسال طلب الاشتراك بنجاح.
        </p>
      ) : null}
    </div>
  );
}

export default NewsletterSubscribe;
