import { useState } from 'react'
import { PasswordInput } from './password-input'
import { cn } from '../lib/utils'
import type { AuthCredentials } from '../types/auth'

interface LoginScreenProps {
  status: 'idle' | 'submitting' | 'error'
  error: string | null
  notice: string | null
  onSubmit: (credentials: AuthCredentials) => Promise<void> | void
}

export function LoginScreen({
  status,
  error,
  notice,
  onSubmit,
}: LoginScreenProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextUsername = username.trim()

    if (!nextUsername || !password) {
      setLocalError('أدخل اسم المستخدم وكلمة المرور للمتابعة.')
      return
    }

    setLocalError(null)
    void onSubmit({
      username: nextUsername,
      password,
    })
  }

  return (
    <div className="flex min-h-[100svh] items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(23,18,57,0.9),rgba(10,8,29,0.94))] shadow-[0_32px_120px_rgba(5,5,19,0.52)] lg:grid-cols-[1.15fr_0.95fr]">
        <section className="relative overflow-hidden border-b border-[rgba(255,255,255,0.08)] p-6 sm:p-8 lg:border-b-0 lg:border-l">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,171,137,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(238,32,77,0.14),transparent_30%)]" />
          <div className="relative">
            <div className="inline-flex rounded-full border border-[rgba(29,171,137,0.22)] bg-[rgba(29,171,137,0.1)] px-3 py-1 text-[11px] text-[var(--brand-teal)]">
              لوحة إدارة المحتوى
            </div>
            <h1 className="mt-5 max-w-xl text-3xl font-semibold leading-tight text-[var(--brand-text)] sm:text-4xl">
              دخول آمن إلى لوحة التحكم وتحرير المحتوى من مكان واحد
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--brand-muted)] sm:text-base">
              سجّل الدخول أولاً للوصول إلى الأقسام، إدارة الصور، وتحديث المحتوى
              المباشر عبر الـ API ضمن واجهة عربية واضحة ومتناسقة.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-8">
          <div className="mx-auto max-w-md">
            <p className="text-xs tracking-[0.16em] text-[var(--brand-violet)]">
              تسجيل الدخول
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--brand-text)]">
              مرحبًا بعودتك
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--brand-muted)]">
              أدخل بياناتك للوصول إلى لوحة الإدارة.
            </p>

            {notice ? (
              <div className="mt-6 rounded-[20px] border border-[rgba(29,171,137,0.24)] bg-[rgba(29,171,137,0.08)] px-4 py-3 text-sm leading-7 text-[var(--brand-teal)]">
                {notice}
              </div>
            ) : null}

            {error || localError ? (
              <div className="mt-4 rounded-[20px] border border-[rgba(238,32,77,0.28)] bg-[rgba(238,32,77,0.08)] px-4 py-3 text-sm leading-7 text-[var(--brand-coral)]">
                {localError || error}
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
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
                  placeholder="username"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--brand-text)]">
                  كلمة المرور
                </span>
                <PasswordInput
                  fieldLabel="كلمة المرور"
                  dir="ltr"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setLocalError(null)
                  }}
                  inputClassName="w-full rounded-[22px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-4 py-3 text-left text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
                  placeholder="••••••••"
                />
              </label>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className={cn(
                  'mt-2 inline-flex w-full items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,var(--brand-teal),#139c7c)] px-5 py-3.5 text-sm font-semibold text-white transition hover:brightness-110',
                  status === 'submitting' ? 'cursor-not-allowed opacity-60' : '',
                )}
              >
                {status === 'submitting' ? 'جاري تسجيل الدخول...' : 'دخول إلى اللوحة'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
