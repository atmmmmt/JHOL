import { useEffect, useState } from 'react'
import { getSeoDescriptions, updateSeoDescriptions, type SeoDescriptions } from '../lib/content-api'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

const PAGES = [
  { path: '/', label: 'الصفحة الرئيسية' },
  { path: '/about', label: 'من نحن' },
  { path: '/services', label: 'خدماتنا' },
  { path: '/packages', label: 'الباقات' },
  { path: '/works', label: 'ملف الأعمال' },
  { path: '/blog', label: 'المدونة' },
  { path: '/contact', label: 'تواصل معنا' },
  { path: '/training-courses', label: 'دورات التدريب' },
]

export function SeoPage() {
  const [descriptions, setDescriptions] = useState<SeoDescriptions>({})
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [customPath, setCustomPath] = useState('')
  const [customDesc, setCustomDesc] = useState('')

  useEffect(() => {
    getSeoDescriptions()
      .then(setDescriptions)
      .finally(() => setLoading(false))
  }, [])

  function handleChange(path: string, value: string) {
    setDescriptions(prev => ({ ...prev, [path]: value }))
    if (saveStatus !== 'idle') { setSaveStatus('idle'); setSaveMessage(null) }
  }

  function handleAddCustom() {
    const key = customPath.trim()
    if (!key) return
    setDescriptions(prev => ({ ...prev, [key]: customDesc }))
    setCustomPath('')
    setCustomDesc('')
  }

  function handleRemove(path: string) {
    setDescriptions(prev => {
      const next = { ...prev }
      delete next[path]
      return next
    })
  }

  async function handleSave() {
    setSaveStatus('saving')
    setSaveMessage(null)
    try {
      // remove empty entries before saving
      const clean: SeoDescriptions = {}
      for (const [k, v] of Object.entries(descriptions)) {
        if (v.trim()) clean[k] = v.trim()
      }
      await updateSeoDescriptions(clean)
      setDescriptions(clean)
      setSaveStatus('success')
      setSaveMessage('تم الحفظ بنجاح')
    } catch (err) {
      setSaveStatus('error')
      setSaveMessage(err instanceof Error ? err.message : 'فشل الحفظ')
    }
  }

  const inputClass = 'w-full rounded-xl border border-[rgba(160,149,208,0.2)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-sm text-[var(--brand-text)] placeholder-[var(--brand-subtle)] outline-none transition focus:border-[rgba(160,149,208,0.5)] focus:bg-[rgba(255,255,255,0.07)] resize-none'
  const labelClass = 'text-xs font-semibold text-[var(--brand-muted)] mb-1.5 block'

  // dynamic pages already stored in descriptions (paths like /works/slug)
  const dynamicEntries = Object.entries(descriptions).filter(
    ([k]) => !PAGES.some(p => p.path === k)
  )

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Header */}
      <div>
        <p className="text-xs text-[var(--brand-subtle)] mt-1">
          النص الذي يظهر عند مشاركة الرابط على واتساب وتيليغرام وغيرها. إذا تركته فارغاً يُستخدم الوصف الافتراضي للصفحة.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-[var(--brand-muted)]">جارٍ التحميل...</div>
      ) : (
        <>
          {/* Static pages */}
          <div className="rounded-2xl border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(34,27,79,0.4),rgba(11,9,32,0.6))] p-5 space-y-4">
            <p className="text-sm font-semibold text-[var(--brand-text)] border-b border-[rgba(160,149,208,0.12)] pb-3">الصفحات الرئيسية</p>
            {PAGES.map(({ path, label }) => (
              <div key={path}>
                <label className={labelClass}>{label} <span className="font-normal text-[var(--brand-subtle)]">({path})</span></label>
                <textarea
                  rows={2}
                  className={inputClass}
                  placeholder="اتركه فارغاً للوصف الافتراضي (80–125 حرف مثالي)"
                  value={descriptions[path] ?? ''}
                  onChange={e => handleChange(path, e.target.value)}
                />
                {(descriptions[path]?.length ?? 0) > 0 && (
                  <p className={`text-[0.65rem] mt-0.5 ${(descriptions[path]?.length ?? 0) > 125 ? 'text-yellow-400' : 'text-[var(--brand-subtle)]'}`}>
                    {descriptions[path]?.length} حرف
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Dynamic pages (works / blog slugs) */}
          {dynamicEntries.length > 0 && (
            <div className="rounded-2xl border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(34,27,79,0.4),rgba(11,9,32,0.6))] p-5 space-y-4">
              <p className="text-sm font-semibold text-[var(--brand-text)] border-b border-[rgba(160,149,208,0.12)] pb-3">صفحات المشاريع والمقالات</p>
              {dynamicEntries.map(([path]) => (
                <div key={path}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[var(--brand-muted)]">{path}</label>
                    <button
                      type="button"
                      onClick={() => handleRemove(path)}
                      className="text-[0.65rem] text-red-400 hover:text-red-300"
                    >حذف</button>
                  </div>
                  <textarea
                    rows={2}
                    className={inputClass}
                    value={descriptions[path] ?? ''}
                    onChange={e => handleChange(path, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add custom path */}
          <div className="rounded-2xl border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(34,27,79,0.4),rgba(11,9,32,0.6))] p-5 space-y-3">
            <p className="text-sm font-semibold text-[var(--brand-text)] border-b border-[rgba(160,149,208,0.12)] pb-3">إضافة صفحة مشروع أو مقالة</p>
            <div>
              <label className={labelClass}>مسار الصفحة</label>
              <input
                type="text"
                className={inputClass}
                placeholder="مثال: /works/ruznia-real-estate-development"
                value={customPath}
                dir="ltr"
                onChange={e => setCustomPath(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>الوصف</label>
              <textarea
                rows={2}
                className={inputClass}
                placeholder="وصف مخصص لهذه الصفحة عند المشاركة"
                value={customDesc}
                onChange={e => setCustomDesc(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustom}
              disabled={!customPath.trim()}
              className="rounded-xl border border-[rgba(160,149,208,0.2)] px-4 py-2 text-sm text-[var(--brand-muted)] transition hover:bg-white/5 disabled:opacity-30"
            >+ إضافة</button>
          </div>

          {/* Save */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="rounded-xl bg-[#ee204d] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saveStatus === 'saving' ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
            </button>
            {saveMessage && (
              <p className={`text-sm ${saveStatus === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
