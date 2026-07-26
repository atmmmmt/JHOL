import { useState, type InputHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  fieldLabel?: string
  wrapperClassName?: string
  inputClassName?: string
}

function PasswordVisibilityIcon({ isVisible }: { isVisible: boolean }) {
  if (isVisible) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M3 3l18 18" />
        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
        <path d="M9.36 5.37A10.94 10.94 0 0 1 12 5c5.05 0 9.27 3.11 10 7-.29 1.53-1.19 2.95-2.54 4.1" />
        <path d="M6.23 6.23C4.23 7.5 2.74 9.55 2 12c.73 3.89 4.95 7 10 7 1.74 0 3.38-.37 4.84-1.03" />
      </svg>
    )
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M2 12s3.64-7 10-7 10 7 10 7-3.64 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function PasswordInput({
  fieldLabel = 'كلمة المرور',
  wrapperClassName,
  inputClassName,
  disabled,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)
  const buttonLabel = `${isVisible ? 'إخفاء' : 'إظهار'} ${fieldLabel}`

  return (
    <div className={cn('relative', wrapperClassName)}>
      <input
        {...props}
        disabled={disabled}
        type={isVisible ? 'text' : 'password'}
        className={cn(inputClassName, 'pr-14')}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        disabled={disabled}
        className="absolute inset-y-0 right-3 my-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl  hover:bg-white/10 hover:text-[var(--brand-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(29,171,137,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={buttonLabel}
        title={buttonLabel}
      >
        <span className="sr-only">{buttonLabel}</span>
        <PasswordVisibilityIcon isVisible={isVisible} />
      </button>
    </div>
  )
}
