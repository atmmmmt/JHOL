import { useEffect, useState } from 'react'
import { fetchContentList, fetchContentDetail, updateContentDetail } from '../lib/content-api'
import type { JsonValue } from '../types/content'

type HeroHeadline = { line1: string; highlight: string; line2: string }
type HeroCta = { enabled: boolean; label: string; href: string }
type HeroFontSize = { desktopVw: number; mobilePx: number }
type HeroAlign = 'right' | 'center' | 'left'
const HERO_ALIGNS: { value: HeroAlign; label: string }[] = [
  { value: 'right', label: 'يمين' },
  { value: 'center', label: 'وسط' },
  { value: 'left', label: 'يسار' },
]
type HeroBody = {
  headline: HeroHeadline
  mobileHeadline: { line1: string; highlight: string; line2: string }
  cta: HeroCta
  fontSize: HeroFontSize
  align: HeroAlign
}

const DEFAULT: HeroBody = {
  headline: { line1: 'وكالة جهور للتسويق الالكتروني', highlight: 'جهور', line2: 'لنجاحك صوت جهور' },
  mobileHeadline: { line1: '', highlight: '', line2: '' },
  cta: { enabled: true, label: 'ابني علامتك التجارية الان', href: '/packages' },
  fontSize: { desktopVw: 6, mobilePx: 68 },
  align: 'right',
}

function parseBody(raw: JsonValue): HeroBody {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT
  const r = raw as Record<string, JsonValue>
  const h = (r.headline as Record<string, JsonValue>) ?? {}
  const m = (r.mobileHeadline as Record<string, JsonValue>) ?? {}
  const c = (r.cta as Record<string, JsonValue>) ?? {}
  const f = (r.fontSize as Record<string, JsonValue>) ?? {}
  const rawAlign = r.align
  return {
    align: rawAlign === 'right' || rawAlign === 'center' || rawAlign === 'left'
      ? rawAlign
      : DEFAULT.align,
    fontSize: {
      desktopVw: typeof f.desktopVw === 'number' ? f.desktopVw : DEFAULT.fontSize.desktopVw,
      mobilePx:  typeof f.mobilePx  === 'number' ? f.mobilePx  : DEFAULT.fontSize.mobilePx,
    },
    cta: {
      enabled: typeof c.enabled === 'boolean' ? c.enabled : DEFAULT.cta.enabled,
      label:   typeof c.label   === 'string'  ? c.label   : DEFAULT.cta.label,
      href:    typeof c.href    === 'string'  ? c.href    : DEFAULT.cta.href,
    },
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
        cta: data.cta as unknown as JsonValue,
        fontSize: data.fontSize as unknown as JsonValue,
        align: data.align as unknown as JsonValue,
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

      {/* Headline font size */}
      <div className="rounded-2xl border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(34,27,79,0.4),rgba(11,9,32,0.6))] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--brand-violet)]">حجم خط العنوان</h3>
        <div>
          <label className={labelCls}>
            الديسكتوب / اللابتوب — {data.fontSize.desktopVw}vw (الافتراضي 6)
          </label>
          <input type="range" min={2} max={10} step={0.25} className="w-full accent-[var(--brand-teal)]"
            value={data.fontSize.desktopVw}
            onChange={e => setData(p => ({ ...p, fontSize: { ...p.fontSize, desktopVw: Number(e.target.value) } }))} />
          <p className="mt-1 text-[11px] text-[var(--brand-subtle)]">الحجم نسبي لعرض الشاشة، فيتناسق على كل المقاسات.</p>
        </div>
        <div>
          <label className={labelCls}>
            الموبايل — {data.fontSize.mobilePx}px (الافتراضي 68)
          </label>
          <input type="range" min={24} max={90} step={1} className="w-full accent-[var(--brand-coral)]"
            value={data.fontSize.mobilePx}
            onChange={e => setData(p => ({ ...p, fontSize: { ...p.fontSize, mobilePx: Number(e.target.value) } }))} />
        </div>
      </div>

      {/* Headline alignment */}
      <div className="rounded-2xl border border-[rgba(29,171,137,0.22)] bg-[linear-gradient(145deg,rgba(34,27,79,0.4),rgba(11,9,32,0.6))] p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--brand-teal)]">محاذاة العنوان</h3>
        <p className="text-[11px] text-[var(--brand-subtle)]">على الموبايل يبقى العنوان في الوسط دائماً.</p>
        <div className="flex gap-2">
          {HERO_ALIGNS.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => setData(p => ({ ...p, align: opt.value }))}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                data.align === opt.value
                  ? 'border-[rgba(29,171,137,0.5)] bg-[rgba(29,171,137,0.15)] text-[var(--brand-teal)]'
                  : 'border-[rgba(160,149,208,0.2)] bg-[rgba(255,255,255,0.05)] text-[var(--brand-subtle)]'
              }`}>
              {data.align === opt.value ? '✓ ' : ''}{opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA button */}
      <div className="rounded-2xl border border-[rgba(29,171,137,0.22)] bg-[linear-gradient(145deg,rgba(34,27,79,0.4),rgba(11,9,32,0.6))] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--brand-teal)]">زر الهيرو (CTA)</h3>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--brand-text)]">
          <input type="checkbox" checked={data.cta.enabled}
            onChange={e => setData(p => ({ ...p, cta: { ...p.cta, enabled: e.target.checked } }))} />
          إظهار الزر في الصفحة الرئيسية
        </label>
        <div>
          <label className={labelCls}>نص الزر</label>
          <input className={inputCls} value={data.cta.label} disabled={!data.cta.enabled}
            onChange={e => setData(p => ({ ...p, cta: { ...p.cta, label: e.target.value } }))}
            placeholder="ابني علامتك التجارية الان" />
        </div>
        <div>
          <label className={labelCls}>رابط الزر</label>
          <input className={inputCls} value={data.cta.href} disabled={!data.cta.enabled} dir="ltr"
            onChange={e => setData(p => ({ ...p, cta: { ...p.cta, href: e.target.value } }))}
            placeholder="/packages" />
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
