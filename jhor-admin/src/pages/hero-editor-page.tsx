import { useEffect, useState } from 'react'
import { fetchContentList, fetchContentDetail, updateContentDetail } from '../lib/content-api'
import type { JsonValue } from '../types/content'

type HeroHeadline = { line1: string; highlight: string; line2: string }
type HeroBody = {
  headline: HeroHeadline
  mobileHeadline: { line1: string; highlight: string; line2: string }
}

const DEFAULT: HeroBody = {
  headline: { line1: 'وكالة جهور للتسويق الالكتروني', highlight: 'جهور', line2: 'لنجاحك صوت جهور' },
  mobileHeadline: { line1: '', highlight: '', line2: '' },
}

function parseBody(raw: JsonValue): HeroBody {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT
  const r = raw as Record<string, JsonValue>
  const h = (r.headline as Record<string, JsonValue>) ?? {}
  const m = (r.mobileHeadline as Record<string, JsonValue>) ?? {}
  return {
    headline: {
      line1:     typeof h.line1     === 'string' ? h.line1     : DEFAULT.headline.line1,
      highlight: typeof h.highlight === 'string' ? h.highlight : DEFAULT.headline.highlight,
      line2:     typeof h.line2     === 'string' ? h.line2     : DEFAULT.headline.line2,
    },
    mobileHeadline: {
      line1:     typeof m.line1     === 'string' ? m.line1     : '',
      highlight: typeof m.highlight === 'string' ? m.highlight : '',
      line2:     typeof m.line2     === 'string' ? m.line2     : '',
    },
  }
}

const inputCls = 'w-full rounded-xl border border-[rgba(160,149,208,0.2)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-sm text-[var(--brand-text)] placeholder-[var(--brand-subtle)] outline-none transition focus:border-[rgba(29,171,137,0.5)] focus:bg-[rgba(255,255,255,0.08)]'
const labelCls = 'mb-1.5 block text-xs font-medium text-[var(--brand-subtle)]'

export function HeroEditorPage() {
  const [contentId, setContentId] = useState<string | null>(null)
  const [contentType, setContentType] = useState<number>(9003)
  const [fullBody, setFullBody] = useState<Record<string, JsonValue>>({})
  const [data, setData] = useState<HeroBody>(DEFAULT)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchContentList()
        const item = list.find(i => i.meta?.sectionKey === 'home_hero')
        if (item) {
          const detail = await fetchContentDetail(item.id)
          setContentId(item.id)
          setContentType(detail.contentType ?? 9003)
          const raw = detail.body as unknown as JsonValue
          setFullBody((raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}) as Record<string, JsonValue>)
          setData(parseBody(raw))
        } else {
          setData(DEFAULT)
        }
        setStatus('ready')
      } catch { setStatus('error') }
    }
    load()
  }, [])

  function setDesktop(field: keyof HeroHeadline, val: string) {
    setData(p => ({ ...p, headline: { ...p.headline, [field]: val } }))
  }
  function setMobile(field: keyof HeroHeadline, val: string) {
    setData(p => ({ ...p, mobileHeadline: { ...p.mobileHeadline, [field]: val } }))
  }

  async function handleSave() {
    if (!contentId) { setMsg({ text: 'لم يتم العثور على محتوى الهيرو.', ok: false }); return }
    setSaving(true); setMsg(null)
    try {
      const mergedBody: Record<string, JsonValue> = {
        ...fullBody,
        headline: data.headline as unknown as JsonValue,
        mobileHeadline: data.mobileHeadline as unknown as JsonValue,
      }
      await updateContentDetail(contentId, {
        contentType,
        body: mergedBody,
      })
      setFullBody(mergedBody)
      setMsg({ text: 'تم الحفظ بنجاح.', ok: true })
    } catch (err) {
      setMsg({ text: `تعذر الحفظ: ${String(err)}`, ok: false })
    } finally { setSaving(false) }
  }

  if (status === 'loading') return (
    <div className="flex h-full items-center justify-center text-[var(--brand-muted)]">جارٍ التحميل...</div>
  )
  if (status === 'error') return (
    <div className="rounded-2xl border border-[rgba(238,32,77,0.35)] bg-[rgba(238,32,77,0.08)] p-6 text-[var(--brand-text)]">
      تعذر التحميل.
    </div>
  )

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      <p className="text-xs text-[var(--brand-subtle)]">
        اترك حقول الموبايل فارغة لاستخدام نص الديسكتوب تلقائياً.
      </p>

      {/* Desktop */}
      <div className="rounded-2xl border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(34,27,79,0.4),rgba(11,9,32,0.6))] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--brand-violet)]">نص الديسكتوب / اللابتوب</h3>
        <div>
          <label className={labelCls}>السطر الأول (line1)</label>
          <input className={inputCls} value={data.headline.line1}
            onChange={e => setDesktop('line1', e.target.value)}
            placeholder="وكالة جهور للتسويق الالكتروني" />
        </div>
        <div>
          <label className={labelCls}>الكلمة المضيئة (highlight) — يجب أن تكون جزءاً من line1</label>
          <input className={inputCls} value={data.headline.highlight}
            onChange={e => setDesktop('highlight', e.target.value)}
            placeholder="جهور" />
        </div>
        <div>
          <label className={labelCls}>العبارة الثانية (tagline)</label>
          <input className={inputCls} value={data.headline.line2}
            onChange={e => setDesktop('line2', e.target.value)}
            placeholder="لنجاحك صوت جهور" />
        </div>
      </div>

      {/* Mobile */}
      <div className="rounded-2xl border border-[rgba(238,32,77,0.2)] bg-[linear-gradient(145deg,rgba(34,27,79,0.4),rgba(11,9,32,0.6))] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--brand-coral)]">نص الموبايل (اختياري)</h3>
        <div>
          <label className={labelCls}>السطر الأول</label>
          <input className={inputCls} value={data.mobileHeadline.line1}
            onChange={e => setMobile('line1', e.target.value)}
            placeholder="اتركه فارغاً لاستخدام نص الديسكتوب" />
        </div>
        <div>
          <label className={labelCls}>الكلمة المضيئة</label>
          <input className={inputCls} value={data.mobileHeadline.highlight}
            onChange={e => setMobile('highlight', e.target.value)}
            placeholder="جهور" />
        </div>
        <div>
          <label className={labelCls}>العبارة الثانية (tagline)</label>
          <input className={inputCls} value={data.mobileHeadline.line2}
            onChange={e => setMobile('line2', e.target.value)}
            placeholder="اتركه فارغاً لاستخدام نص الديسكتوب" />
        </div>
      </div>

      <div className="sticky bottom-4 flex items-center gap-3">
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex-1 rounded-2xl bg-[var(--brand-teal)] py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(29,171,137,0.35)] hover:brightness-110 disabled:opacity-50">
          {saving ? 'جارٍ الحفظ...' : 'حفظ نصوص الهيرو'}
        </button>
        {msg && <p className={`text-sm font-medium ${msg.ok ? 'text-[var(--brand-teal)]' : 'text-[var(--brand-coral)]'}`}>{msg.text}</p>}
      </div>
    </div>
  )
}
