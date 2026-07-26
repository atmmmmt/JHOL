import { useEffect, useState } from 'react'
import { PasswordInput } from './password-input'
import { cn } from '../lib/utils'
import type { AuthCredentials } from '../types/auth'

interface CredentialsDialogProps {
  isOpen: boolean
  currentUsername: string
  status: 'idle' | 'saving' | 'success' | 'error'
  message: string | null
  onClose: () => void
  onSubmit: (credentials: AuthCredentials) => Promise<void> | void
}

export function CredentialsDialog({
  isOpen,
  currentUsername,
  status,
  message,
  onClose,
  onSubmit,
}: CredentialsDialogProps) {
  const [username, setUsername] = useState(currentUsername)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || status === 'saving') {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, status, onClose])

  if (!isOpen) {
    return null
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextUsername = username.trim()

    if (!nextUsername || !password || !confirmPassword) {
      setLocalError('املأ اسم المستخدم وكلمة المرور الجديدة وتأكيدها.')
      return
    }

    if (password.length < 6) {
      setLocalError('يفضل أن تكون كلمة المرور 6 أحرف على الأقل.')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('تأكيد كلمة المرور غير مطابق.')
      return
    }

    setLocalError(null)
    void onSubmit({
      username: nextUsername,
      password,
    })
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-[#050512]/80 backdrop-blur-sm"
        onClick={status === 'saving' ? undefined : onClose}
      />

      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl overflow-hidden rounded-[34px] border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(23,18,57,0.98),rgba(10,8,29,0.98))] shadow-[0_35px_120px_rgba(5,5,19,0.58)]">
          <div className="border-b border-[rgba(255,255,255,0.08)] px-6 py-6 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.16em] text-[var(--brand-violet)]">
                  بيانات الدخول
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--brand-text)]">
                  تحديث اسم المستخدم وكلمة المرور
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-muted)]">
                  سيتم تطبيق البيانات الجديدة مباشرة على حسابك الحالي مع الحفاظ
                  على نفس الجلسة النشطة.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={status === 'saving'}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--brand-border)] bg-white/5 text-lg text-[var(--brand-text)] transition hover:border-[color:var(--brand-border-strong)] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="إغلاق نافذة تعديل بيانات الدخول"
              >
                ×
              </button>
            </div>
          </div>

          <form className="px-6 py-6 sm:px-7" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-[var(--brand-text)]">
                  اسم المستخدم
                </span>
                <input
                  type="text"
                  dir="ltr"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value)
                    setLocalError(null)
                  }}
                  className="w-full rounded-[22px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-4 py-3 text-left text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--brand-text)]">
                  كلمة المرور الجديدة
                </span>
                <PasswordInput
                  fieldLabel="كلمة المرور الجديدة"
                  dir="ltr"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setLocalError(null)
                  }}
                  disabled={status === 'saving'}
                  inputClassName="w-full rounded-[22px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-4 py-3 text-left text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
                  placeholder="••••••••"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--brand-text)]">
                  تأكيد كلمة المرور
                </span>
                <PasswordInput
                  fieldLabel="تأكيد كلمة المرور"
                  dir="ltr"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    setLocalError(null)
                  }}
                  disabled={status === 'saving'}
                  inputClassName="w-full rounded-[22px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-4 py-3 text-left text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
                  placeholder="••••••••"
                />
              </label>
            </div>

            {localError || message ? (
              <div
                className={cn(
                  'mt-5 rounded-[20px] border px-4 py-3 text-sm leading-7',
                  status === 'success'
                    ? 'border-[rgba(29,171,137,0.24)] bg-[rgba(29,171,137,0.08)] text-[var(--brand-teal)]'
                    : 'border-[rgba(238,32,77,0.28)] bg-[rgba(238,32,77,0.08)] text-[var(--brand-coral)]',
                )}
              >
                {localError || message}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={status === 'saving'}
                className="rounded-[20px] border border-[color:var(--brand-border)] px-5 py-3 text-sm font-medium text-[var(--brand-muted)] transition hover:border-[color:var(--brand-border-strong)] hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={status === 'saving'}
                className="rounded-[20px] bg-[linear-gradient(135deg,var(--brand-violet),#7f73be)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'saving' ? 'جاري التحديث...' : 'حفظ بيانات الدخول'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
