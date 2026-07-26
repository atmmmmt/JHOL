import { useEffect, useState } from 'react'
import {
  getCheckoutPrivacy,
  getCheckoutTerms,
  getSiteSettings,
  updateCheckoutPrivacy,
  updateCheckoutTerms,
  updateSiteSettings,
  type SiteSettings,
} from '../lib/content-api'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

function LegalTextEditor({
  title,
  description,
  fetchFn,
  saveFn,
}: {
  title: string
  description: string
  fetchFn: () => Promise<{ content: string }>
  saveFn: (v: { content: string }) => Promise<void>
}) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFn().then(d => {
      setText(d.content)
      setLoading(false)
    })
  }, [fetchFn])

  async function handleSave() {
    setStatus('saving')
    setError(null)
    try {
      await saveFn({ content: text })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2200)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    }
  }

  return (
    <div className="rounded-[18px] border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(23,18,57,0.9),rgba(10,8,29,0.92))] p-5 shadow-[0_18px_56px_rgba(5,5,19,0.32)]">
      <div className="mb-4">
        <p className="text-sm font-medium text-[var(--brand-text)]">{title}</p>
        <p className="mt-1 text-xs text-[var(--brand-muted)]">{description}</p>
      </div>

      {loading ? (
        <div className="h-32 animate-pulse rounded-xl bg-[rgba(160,149,208,0.1)]" />
      ) : (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={8}
          dir="rtl"
          className="w-full resize-y rounded-xl border border-[rgba(160,149,208,0.2)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--brand-text)] placeholder-[rgba(160,149,208,0.4)] outline-none transition focus:border-[rgba(29,171,137,0.45)] focus:bg-[rgba(29,171,137,0.03)]"
          placeholder="اكتب النص هنا..."
        />
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs">
          {status === 'success' && <span className="text-[rgb(29,171,137)]">✓ تم الحفظ بنجاح</span>}
          {status === 'error' && error && <span className="text-[var(--brand-coral)]">{error}</span>}
          {status === 'saving' && <span className="text-[var(--brand-muted)]">جاري الحفظ...</span>}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving' || loading}
          className="rounded-[12px] border border-[rgba(29,171,137,0.35)] bg-[rgba(29,171,137,0.12)] px-4 py-2 text-xs font-medium text-[rgb(29,171,137)] transition hover:bg-[rgba(29,171,137,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          حفظ التعديلات
        </button>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({ comingSoonEnabled: false })
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    getSiteSettings().then(s => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  async function handleToggle() {
    const next = { ...settings, comingSoonEnabled: !settings.comingSoonEnabled }
    setSettings(next)
    setSaveStatus('saving')
    setErrorMessage(null)
    try {
      await updateSiteSettings(next)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      setSaveStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'فشل الحفظ')
      setSettings(settings)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--brand-text)]">إعدادات الموقع</h2>
        <p className="mt-1 text-xs text-[var(--brand-muted)]">تحكم في حالة الموقع والنصوص القانونية.</p>
      </div>

      {/* وضع قريباً */}
      <div className="rounded-[18px] border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(23,18,57,0.9),rgba(10,8,29,0.92))] p-5 shadow-[0_18px_56px_rgba(5,5,19,0.32)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--brand-text)]">وضع "قريباً"</p>
            <p className="mt-1 text-xs text-[var(--brand-muted)]">
              عند التفعيل، يرى الزوار صفحة "قريباً" بدلاً من الموقع.
            </p>
          </div>
          {loading ? (
            <div className="h-7 w-12 animate-pulse rounded-full bg-[rgba(160,149,208,0.2)]" />
          ) : (
            <button
              type="button"
              onClick={handleToggle}
              disabled={saveStatus === 'saving'}
              aria-label="تبديل وضع قريباً"
              className={[
                'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200',
                settings.comingSoonEnabled
                  ? 'border-[rgba(29,171,137,0.6)] bg-[rgba(29,171,137,0.3)]'
                  : 'border-[rgba(160,149,208,0.3)] bg-[rgba(160,149,208,0.1)]',
                saveStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'pointer-events-none inline-block h-5 w-5 translate-y-[-1px] rounded-full shadow ring-0 transition duration-200',
                  settings.comingSoonEnabled
                    ? 'translate-x-[-1px] bg-[rgb(29,171,137)]'
                    : 'translate-x-[22px] bg-[rgba(160,149,208,0.6)]',
                ].join(' ')}
              />
            </button>
          )}
        </div>
        {saveStatus === 'success' && <p className="mt-3 text-xs text-[rgb(29,171,137)]">✓ تم الحفظ بنجاح</p>}
        {saveStatus === 'error' && errorMessage && <p className="mt-3 text-xs text-[var(--brand-coral)]">{errorMessage}</p>}
        {saveStatus === 'saving' && <p className="mt-3 text-xs text-[var(--brand-muted)]">جاري الحفظ...</p>}
      </div>

      {/* سياسة الخصوصية عند الشراء */}
      <LegalTextEditor
        title="سياسة الخصوصية عند الشراء"
        description="النص الذي يظهر في نافذة سياسة الخصوصية عند إتمام الدفع."
        fetchFn={getCheckoutPrivacy}
        saveFn={updateCheckoutPrivacy}
      />

      {/* شروط وأحكام الشراء */}
      <LegalTextEditor
        title="شروط وأحكام الشراء"
        description="النص الذي يظهر في نافذة الشروط والأحكام عند إتمام الدفع."
        fetchFn={getCheckoutTerms}
        saveFn={updateCheckoutTerms}
      />
    </div>
  )
}
