import { useEffect, useState } from 'react'
import { fetchContentList, fetchContentDetail, updateContentDetail, createContentDetail } from '../lib/content-api'
import type { JsonValue } from '../types/content'

type MarketingCard = { id: string; text: string; color: string }
type SliderCardsBody = { cards: MarketingCard[] }

const JOHOR_COLORS = [
  { hex: '#3B28CC', label: 'أزرق كهربائي' },
  { hex: '#ee204d', label: 'أحمر كاريولا' },
  { hex: '#221b4f', label: 'أزرق داكن' },
  { hex: '#a095d0', label: 'موف' },
]

const DEFAULT_CARDS: SliderCardsBody = {
  cards: [
    { id: 'mc-1', text: 'عقول\nمُبدعة',   color: '#3B28CC' },
    { id: 'mc-2', text: 'أفكار\nمُلهمة',   color: '#ee204d' },
    { id: 'mc-3', text: 'إبداع\nلا يتوقف', color: '#221b4f' },
  ],
}

function genId() { return `mc-${Math.random().toString(36).slice(2, 8)}` }

function parseBody(raw: JsonValue): SliderCardsBody {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT_CARDS
  const r = raw as Record<string, JsonValue>
  const rawCards = Array.isArray(r.cards) ? r.cards : []
  return {
    cards: rawCards
      .filter((c): c is Record<string, JsonValue> => !!c && typeof c === 'object' && !Array.isArray(c))
      .map(c => ({
        id:    typeof c.id    === 'string' ? c.id    : genId(),
        text:  typeof c.text  === 'string' ? c.text  : '',
        color: typeof c.color === 'string' ? c.color : '#221b4f',
      })),
  }
}

const inputCls = 'w-full rounded-xl border border-[rgba(160,149,208,0.2)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-sm text-[var(--brand-text)] placeholder-[var(--brand-subtle)] outline-none transition focus:border-[rgba(29,171,137,0.5)] focus:bg-[rgba(255,255,255,0.08)]'
const labelCls = 'mb-1.5 block text-xs font-medium text-[var(--brand-subtle)]'

export function SliderCardsEditorPage() {
  const [contentId, setContentId] = useState<string | null>(null)
  const [data, setData] = useState<SliderCardsBody>(DEFAULT_CARDS)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchContentList()
        const item = list.find(i => i.meta?.sectionKey === 'home_slider_cards')
        if (item) {
          const detail = await fetchContentDetail(item.id)
          setContentId(item.id)
          setData(parseBody(detail.body as unknown as JsonValue))
        } else {
          setData(DEFAULT_CARDS)
        }
        setStatus('ready')
      } catch { setStatus('error') }
    }
    load()
  }, [])

  const META = {
    tabLabel: 'بطاقات السلايدر',
    sectionKey: 'home_slider_cards',
    sectionType: 'slider_cards',
    assignToPages: ['home'],
    tabOrder: 99,
  }

  async function handleSave() {
    setSaving(true); setMsg(null)
    try {
      const bodyWithMeta = { _meta: META, ...data } as unknown as Record<string, JsonValue>
      if (contentId) {
        await updateContentDetail(contentId, { contentType: 9003, body: bodyWithMeta })
      } else {
        const created = await createContentDetail({
          contentType: 9003,
          contentTypeName: 'بطاقات السلايدر',
          jsonContent: JSON.stringify(bodyWithMeta),
        })
        setContentId(created.id)
      }
      setMsg({ text: 'تم الحفظ بنجاح.', ok: true })
    } catch (err) { console.error('Save error:', err); setMsg({ text: `تعذر الحفظ: ${String(err)}`, ok: false }) }
    finally { setSaving(false) }
  }

  function addCard() {
    setData(p => ({ cards: [...p.cards, { id: genId(), text: '', color: JOHOR_COLORS[0].hex }] }))
  }
  function remove(id: string) { setData(p => ({ cards: p.cards.filter(c => c.id !== id) })) }
  function update(id: string, patch: Partial<MarketingCard>) {
    setData(p => ({ cards: p.cards.map(c => c.id === id ? { ...c, ...patch } : c) }))
  }

  if (status === 'loading') return (
    <div className="flex h-full items-center justify-center text-[var(--brand-muted)]">جارٍ التحميل...</div>
  )
  if (status === 'error') return (
    <div className="rounded-2xl border border-[rgba(238,32,77,0.35)] bg-[rgba(238,32,77,0.08)] p-6 text-[var(--brand-text)]">
      تعذر التحميل. تأكد من وجود عنصر محتوى بمفتاح <code>home_slider_cards</code>.
    </div>
  )

  return (
    <div className="space-y-5 pb-20" dir="rtl">
      <p className="text-xs text-[var(--brand-subtle)]">
        هذه البطاقات تظهر بين كل مشروعين في سلايدر الأعمال. تُكرَّر بالترتيب.
      </p>

      {data.cards.map((card, idx) => (
        <div key={card.id} className="rounded-2xl border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(34,27,79,0.4),rgba(11,9,32,0.6))] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--brand-violet)]">بطاقة {idx + 1}</h3>
            <button type="button" onClick={() => remove(card.id)}
              className="rounded-xl border border-[rgba(238,32,77,0.3)] bg-[rgba(238,32,77,0.08)] px-3 py-1.5 text-xs text-[var(--brand-coral)] hover:bg-[rgba(238,32,77,0.15)]">
              حذف
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>النص (سطر جديد = سطر جديد)</label>
              <textarea
                className={`${inputCls} min-h-[80px] resize-none`}
                value={card.text}
                onChange={e => update(card.id, { text: e.target.value })}
                placeholder={'عقول\nمُبدعة'}
              />
            </div>
            <div>
              <label className={labelCls}>لون الخلفية</label>
              <div className="flex flex-wrap gap-2">
                {JOHOR_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => update(card.id, { color: c.hex })}
                    title={c.label}
                    className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition"
                    style={{
                      borderColor: card.color === c.hex ? c.hex : 'rgba(160,149,208,0.2)',
                      background:  card.color === c.hex ? `${c.hex}22` : 'transparent',
                      color:       card.color === c.hex ? c.hex : 'var(--brand-subtle)',
                    }}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ background: c.hex }} />
                    {c.label}
                  </button>
                ))}
                {/* Custom hex */}
                <div className="flex items-center gap-1">
                  <input type="color" value={card.color}
                    onChange={e => update(card.id, { color: e.target.value })}
                    className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                    title="لون مخصص"
                  />
                  <span className="text-xs text-[var(--brand-subtle)]">{card.color}</span>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-3 flex items-end rounded-xl p-3"
                style={{ background: card.color, minHeight: 72 }}>
                <p className="font-bold leading-tight text-white" style={{ fontSize: 18, whiteSpace: 'pre-line' }}>
                  {card.text || 'معاينة النص'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addCard}
        className="w-full rounded-2xl border border-dashed border-[rgba(160,149,208,0.3)] py-4 text-sm font-medium text-[var(--brand-violet)] hover:border-[rgba(160,149,208,0.5)] hover:bg-[rgba(160,149,208,0.06)]">
        + إضافة بطاقة جديدة
      </button>

      <div className="sticky bottom-4 flex items-center gap-3">
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex-1 rounded-2xl bg-[var(--brand-teal)] py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(29,171,137,0.35)] hover:brightness-110 disabled:opacity-50">
          {saving ? 'جارٍ الحفظ...' : 'حفظ البطاقات'}
        </button>
        {msg && <p className={`text-sm font-medium ${msg.ok ? 'text-[var(--brand-teal)]' : 'text-[var(--brand-coral)]'}`}>{msg.text}</p>}
      </div>
    </div>
  )
}
