import { useEffect, useState } from 'react'
import {
  fetchContentList,
  fetchContentDetail,
  updateContentDetail,
} from '../lib/content-api'
import type { JsonValue } from '../types/content'

type Sector = {
  id: string
  title: string
  subtitle: string
  details: string[]
}

type SectorsBody = {
  label?: string
  heading?: string
  sectors: Sector[]
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

function generateId() {
  return `sector-${Math.random().toString(36).slice(2, 9)}`
}

function parseSectors(body: JsonValue): SectorsBody {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { sectors: [] }
  }
  const record = body as Record<string, JsonValue>
  const rawSectors = Array.isArray(record.sectors) ? record.sectors : []
  return {
    label: typeof record.label === 'string' ? record.label : 'تخصصاتنا',
    heading: typeof record.heading === 'string' ? record.heading : 'قطاعات نخدمها',
    sectors: rawSectors
      .filter((s): s is Record<string, JsonValue> => !!s && typeof s === 'object' && !Array.isArray(s))
      .map((s) => ({
        id: typeof s.id === 'string' ? s.id : generateId(),
        title: typeof s.title === 'string' ? s.title : '',
        subtitle: typeof s.subtitle === 'string' ? s.subtitle : '',
        details: Array.isArray(s.details)
          ? s.details.filter((d): d is string => typeof d === 'string')
          : [],
      })),
  }
}

const inputCls =
  'w-full rounded-xl border border-[rgba(160,149,208,0.2)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-sm text-[var(--brand-text)] placeholder-[var(--brand-subtle)] outline-none transition focus:border-[rgba(29,171,137,0.5)] focus:bg-[rgba(255,255,255,0.08)]'

const labelCls = 'mb-1.5 block text-xs font-medium text-[var(--brand-subtle)]'

export function SectorsEditorPage() {
  const [contentId, setContentId] = useState<string | null>(null)
  const [data, setData] = useState<SectorsBody>({ sectors: [] })
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchContentList()
        const item = list.find((i) => i.meta?.sectionKey === 'home_sectors')
        if (item) {
          const detail = await fetchContentDetail(item.id)
          setContentId(item.id)
          setData(parseSectors(detail.body))
        } else {
          setData({ label: 'تخصصاتنا', heading: 'قطاعات نخدمها', sectors: [] })
        }
        setStatus('ready')
      } catch {
        setStatus('error')
      }
    }
    load()
  }, [])

  async function handleSave() {
    if (!contentId) return
    setSaveStatus('saving')
    setSaveMessage(null)
    try {
      await updateContentDetail(contentId, {
        contentType: 0,
        body: data as unknown as Record<string, JsonValue>,
      })
      setSaveStatus('success')
      setSaveMessage('تم حفظ القطاعات بنجاح.')
    } catch {
      setSaveStatus('error')
      setSaveMessage('تعذر الحفظ، حاول مرة أخرى.')
    }
  }

  function addSector() {
    setData((prev) => ({
      ...prev,
      sectors: [
        ...prev.sectors,
        { id: generateId(), title: '', subtitle: '', details: [''] },
      ],
    }))
  }

  function removeSector(id: string) {
    setData((prev) => ({
      ...prev,
      sectors: prev.sectors.filter((s) => s.id !== id),
    }))
  }

  function updateSector(id: string, patch: Partial<Sector>) {
    setData((prev) => ({
      ...prev,
      sectors: prev.sectors.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  }

  function addDetail(sectorId: string) {
    setData((prev) => ({
      ...prev,
      sectors: prev.sectors.map((s) =>
        s.id === sectorId ? { ...s, details: [...s.details, ''] } : s,
      ),
    }))
  }

  function updateDetail(sectorId: string, index: number, value: string) {
    setData((prev) => ({
      ...prev,
      sectors: prev.sectors.map((s) => {
        if (s.id !== sectorId) return s
        const details = [...s.details]
        details[index] = value
        return { ...s, details }
      }),
    }))
  }

  function removeDetail(sectorId: string, index: number) {
    setData((prev) => ({
      ...prev,
      sectors: prev.sectors.map((s) => {
        if (s.id !== sectorId) return s
        return { ...s, details: s.details.filter((_, i) => i !== index) }
      }),
    }))
  }

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center text-[var(--brand-muted)]">
        جارٍ التحميل...
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-[rgba(238,32,77,0.35)] bg-[rgba(238,32,77,0.08)] p-6 text-[var(--brand-text)]">
        تعذر تحميل بيانات القطاعات. تأكد من أن عنصر المحتوى <code>home_sectors</code> موجود في قاعدة البيانات.
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-20" dir="rtl">
      <div className="rounded-2xl border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(34,27,79,0.5),rgba(11,9,32,0.7))] p-5">
        <h2 className="mb-4 text-lg font-semibold text-[var(--brand-text)]">إعدادات القسم</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>تسمية القسم (صغيرة)</label>
            <input
              className={inputCls}
              value={data.label ?? ''}
              onChange={(e) => setData((p) => ({ ...p, label: e.target.value }))}
              placeholder="تخصصاتنا"
            />
          </div>
          <div>
            <label className={labelCls}>عنوان القسم الكبير</label>
            <input
              className={inputCls}
              value={data.heading ?? ''}
              onChange={(e) => setData((p) => ({ ...p, heading: e.target.value }))}
              placeholder="قطاعات نخدمها"
            />
          </div>
        </div>
      </div>

      {data.sectors.map((sector, sIdx) => (
        <div
          key={sector.id}
          className="rounded-2xl border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(34,27,79,0.4),rgba(11,9,32,0.6))] p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--brand-violet)]">
              قطاع {sIdx + 1}
            </h3>
            <button
              type="button"
              onClick={() => removeSector(sector.id)}
              className="rounded-xl border border-[rgba(238,32,77,0.3)] bg-[rgba(238,32,77,0.08)] px-3 py-1.5 text-xs text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.15)]"
            >
              حذف
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>اسم القطاع</label>
              <input
                className={inputCls}
                value={sector.title}
                onChange={(e) => updateSector(sector.id, { title: e.target.value })}
                placeholder="الضيافة"
              />
            </div>
            <div>
              <label className={labelCls}>النوع الفرعي</label>
              <input
                className={inputCls}
                value={sector.subtitle}
                onChange={(e) => updateSector(sector.id, { subtitle: e.target.value })}
                placeholder="مقاهي · مطاعم"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className={labelCls}>التفاصيل</label>
            <div className="space-y-2">
              {sector.details.map((detail, dIdx) => (
                <div key={dIdx} className="flex gap-2">
                  <input
                    className={`${inputCls} flex-1`}
                    value={detail}
                    onChange={(e) => updateDetail(sector.id, dIdx, e.target.value)}
                    placeholder="هويّات المطاعم والمقاهي"
                  />
                  <button
                    type="button"
                    onClick={() => removeDetail(sector.id, dIdx)}
                    className="shrink-0 rounded-xl border border-[rgba(238,32,77,0.25)] bg-[rgba(238,32,77,0.07)] px-2.5 py-1.5 text-xs text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.14)]"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addDetail(sector.id)}
                className="mt-1 rounded-xl border border-[rgba(160,149,208,0.2)] px-3 py-1.5 text-xs text-[var(--brand-violet)] transition hover:bg-[rgba(160,149,208,0.08)]"
              >
                + إضافة تفصيل
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSector}
        className="w-full rounded-2xl border border-dashed border-[rgba(160,149,208,0.3)] py-4 text-sm font-medium text-[var(--brand-violet)] transition hover:border-[rgba(160,149,208,0.5)] hover:bg-[rgba(160,149,208,0.06)]"
      >
        + إضافة قطاع جديد
      </button>

      {/* Save */}
      <div className="sticky bottom-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === 'saving' || !contentId}
          className="flex-1 rounded-2xl bg-[var(--brand-teal)] py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(29,171,137,0.35)] transition hover:brightness-110 disabled:opacity-50"
        >
          {saveStatus === 'saving' ? 'جارٍ الحفظ...' : 'حفظ القطاعات'}
        </button>
        {saveMessage && (
          <p
            className={`text-sm font-medium ${saveStatus === 'success' ? 'text-[var(--brand-teal)]' : 'text-[var(--brand-coral)]'}`}
          >
            {saveMessage}
          </p>
        )}
      </div>
    </div>
  )
}
