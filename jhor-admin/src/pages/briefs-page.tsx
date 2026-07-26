import { useEffect, useState } from 'react'

const API_BASE = 'https://johor-back.euphoria-motiva.com'
const SITE_BASE = 'https://jhoragency.com.sa'

type Submission = {
  id: string
  token: string
  clientName: string
  clientEmail: string
  packageType: string
  status: 'pending' | 'submitted'
  submittedAt?: string
  createdAt: string
  templateTitle?: string
}

type SubmissionDetail = Submission & {
  answers?: Record<string, unknown>
  sections?: Array<{ id: string; title: string; questions: Array<{ id: string; text: string }> }>
}

function formatDate(iso: string) {
  try { return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) }
  catch { return iso }
}

function statusBadge(status: string) {
  return status === 'submitted'
    ? <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/12 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">مُرسَل</span>
    : <span className="inline-flex items-center rounded-full border border-yellow-500/25 bg-yellow-500/12 px-2.5 py-0.5 text-xs font-semibold text-yellow-400">بانتظار العميل</span>
}

function typeBadge(type: string) {
  return type === 'campaign'
    ? <span className="inline-flex items-center rounded-full border border-blue-400/25 bg-blue-400/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">حملة إعلانية</span>
    : <span className="inline-flex items-center rounded-full border border-purple-400/25 bg-purple-400/10 px-2 py-0.5 text-[10px] font-semibold text-purple-300">هوية بصرية</span>
}

// ─── Template Types ────────────────────────────────────────────────────────

type TQuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'scale' | 'logo_type'

type TQuestion = {
  id: string
  text: string
  type: TQuestionType
  required?: boolean
  options?: string[]
  min?: number
  max?: number
}

type TSection = {
  id: string
  title: string
  subtitle?: string
  questions: TQuestion[]
}

type Template = {
  id: string
  title: string
  type: 'identity' | 'campaign'
  sections: TSection[]
  isActive: boolean
  createdAt: string
  tierKeys: string[]
}

const QUESTION_TYPE_LABELS: Record<TQuestionType, string> = {
  text: 'نص قصير',
  textarea: 'نص طويل',
  radio: 'اختيار واحد',
  checkbox: 'اختيار متعدد',
  scale: 'مقياس رقمي',
  logo_type: 'نمط الشعار (بالصور)',
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

const darkOptionStyle = { backgroundColor: '#221b4f', color: '#fff' } as const

// ─── Template Editor Modal ─────────────────────────────────────────────────

function TemplateEditorModal({ token, template, onClose }: { token: string; template: Template | null; onClose: () => void }) {
  const [title, setTitle] = useState(template?.title ?? '')
  const [type, setType] = useState<'identity' | 'campaign'>(template?.type ?? 'identity')
  const [isActive, setIsActive] = useState(template?.isActive ?? true)
  const [tierKeys, setTierKeys] = useState<string[]>(template?.tierKeys ?? [])
  const [sections, setSections] = useState<TSection[]>(
    template?.sections?.length ? template.sections : [{ id: `s_${uid()}`, title: '', subtitle: '', questions: [] }],
  )
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [err, setErr] = useState('')

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
  const smallInputCls = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-white/25"
  const labelCls = "mb-1 block text-xs font-medium text-white/50"

  function toggleTier(tk: string) {
    setTierKeys(prev => prev.includes(tk) ? prev.filter(t => t !== tk) : [...prev, tk])
  }

  function updateSection(si: number, patch: Partial<TSection>) {
    setSections(prev => prev.map((s, i) => i === si ? { ...s, ...patch } : s))
  }

  function updateQuestion(si: number, qi: number, patch: Partial<TQuestion>) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s,
      questions: s.questions.map((q, j) => j === qi ? { ...q, ...patch } : q),
    }))
  }

  function addQuestion(si: number) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s,
      questions: [...s.questions, { id: `q_${uid()}`, text: '', type: 'textarea' as TQuestionType }],
    }))
  }

  function removeQuestion(si: number, qi: number) {
    setSections(prev => prev.map((s, i) => i !== si ? s : { ...s, questions: s.questions.filter((_, j) => j !== qi) }))
  }

  async function handleSave() {
    if (!title.trim()) { setErr('عنوان القالب مطلوب'); return }
    if (tierKeys.length === 0) { setErr('اختر باقة واحدة على الأقل'); return }
    const cleanSections = sections
      .filter(s => s.title.trim() || s.questions.length > 0)
      .map(s => ({ ...s, questions: s.questions.filter(q => q.text.trim()) }))
    if (cleanSections.every(s => s.questions.length === 0)) { setErr('أضف سؤالاً واحداً على الأقل'); return }
    setErr('')
    setState('saving')
    try {
      const body = JSON.stringify({
        title,
        type,
        isActive,
        tierKeys,
        sections: JSON.stringify(cleanSections),
      })
      const res = template
        ? await fetch(`${API_BASE}/api/brief/templates/${template.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body,
          })
        : await fetch(`${API_BASE}/api/brief/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body,
          })
      if (!res.ok) throw new Error()
      onClose()
    } catch {
      setErr('حدث خطأ أثناء الحفظ')
      setState('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1440] shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#1a1440] p-5">
          <h2 className="font-bold text-white">{template ? 'تعديل قالب البريف' : 'قالب بريف جديد'}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-white/40 hover:bg-white/8 hover:text-white transition">✕</button>
        </div>

        <div className="space-y-5 p-5">
          {/* Basics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>عنوان القالب *</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: بريف تصميم الشعار والهوية البصرية" />
            </div>
            <div>
              <label className={labelCls}>النوع</label>
              <select className={inputCls} style={{ colorScheme: 'dark' }} value={type} onChange={(e) => setType(e.target.value as 'identity' | 'campaign')}>
                <option value="identity" style={darkOptionStyle}>هوية بصرية</option>
                <option value="campaign" style={darkOptionStyle}>حملة إعلانية</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-[#ee204d]" />
                القالب مفعّل (يُرسل تلقائياً بعد الشراء)
              </label>
            </div>
          </div>

          {/* Tier linking */}
          <div>
            <label className={labelCls}>الباقات المرتبطة * <span className="text-white/30">(اختر باقة أو أكثر — عند شراء أي منها يُرسل هذا البريف)</span></label>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {TIER_OPTIONS.map(t => (
                <label
                  key={t.tierKey}
                  className={[
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition',
                    tierKeys.includes(t.tierKey)
                      ? 'border-[#ee204d]/60 bg-[#ee204d]/12 text-white'
                      : 'border-white/10 bg-white/4 text-white/55 hover:border-white/20',
                  ].join(' ')}
                >
                  <input type="checkbox" className="h-3.5 w-3.5 accent-[#ee204d]" checked={tierKeys.includes(t.tierKey)} onChange={() => toggleTier(t.tierKey)} />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-white/60">الأقسام والأسئلة</h3>
              <button
                type="button"
                onClick={() => setSections(prev => [...prev, { id: `s_${uid()}`, title: '', subtitle: '', questions: [] }])}
                className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/14"
              >
                + إضافة قسم
              </button>
            </div>

            {sections.map((sec, si) => (
              <div key={sec.id} className="rounded-xl border border-white/10 bg-white/3 p-4">
                <div className="mb-3 flex items-start gap-2">
                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                    <input className={smallInputCls} value={sec.title} onChange={(e) => updateSection(si, { title: e.target.value })} placeholder={`عنوان القسم ${si + 1} — مثال: المشروع الخاص بالعميل`} />
                    <input className={smallInputCls} value={sec.subtitle ?? ''} onChange={(e) => updateSection(si, { subtitle: e.target.value })} placeholder="وصف قصير (اختياري)" />
                  </div>
                  {sections.length > 1 && (
                    <button type="button" onClick={() => setSections(prev => prev.filter((_, i) => i !== si))} className="mt-1 shrink-0 rounded-full p-1 text-white/30 hover:bg-red-500/15 hover:text-red-400 transition" title="حذف القسم">✕</button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {sec.questions.map((q, qi) => (
                    <div key={q.id} className="rounded-lg border border-white/8 bg-white/4 p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <input className={smallInputCls} value={q.text} onChange={(e) => updateQuestion(si, qi, { text: e.target.value })} placeholder={`نص السؤال ${qi + 1}`} />
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] text-white outline-none"
                              style={{ colorScheme: 'dark' }}
                              value={q.type}
                              onChange={(e) => updateQuestion(si, qi, { type: e.target.value as TQuestionType })}
                            >
                              {(Object.keys(QUESTION_TYPE_LABELS) as TQuestionType[]).map(qt => (
                                <option key={qt} value={qt} style={darkOptionStyle}>{QUESTION_TYPE_LABELS[qt]}</option>
                              ))}
                            </select>
                            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-white/55">
                              <input type="checkbox" className="h-3 w-3 accent-[#ee204d]" checked={q.required ?? false} onChange={(e) => updateQuestion(si, qi, { required: e.target.checked })} />
                              إجباري
                            </label>
                            {(q.type === 'radio' || q.type === 'checkbox') && (
                              <input
                                className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] text-white placeholder-white/25 outline-none"
                                value={(q.options ?? []).join('، ')}
                                onChange={(e) => updateQuestion(si, qi, { options: e.target.value.split(/[،,]/).map(o => o.trim()).filter(Boolean) })}
                                placeholder="الخيارات مفصولة بفاصلة: نعم، لا، غير متأكد"
                              />
                            )}
                            {q.type === 'scale' && (
                              <span className="flex items-center gap-1 text-[11px] text-white/55">
                                من <input type="number" className="w-12 rounded border border-white/10 bg-white/5 px-1 py-1 text-center text-white outline-none" value={q.min ?? 1} onChange={(e) => updateQuestion(si, qi, { min: Number(e.target.value) })} />
                                إلى <input type="number" className="w-12 rounded border border-white/10 bg-white/5 px-1 py-1 text-center text-white outline-none" value={q.max ?? 10} onChange={(e) => updateQuestion(si, qi, { max: Number(e.target.value) })} />
                              </span>
                            )}
                          </div>
                        </div>
                        <button type="button" onClick={() => removeQuestion(si, qi)} className="shrink-0 rounded-full p-1 text-white/30 hover:bg-red-500/15 hover:text-red-400 transition" title="حذف السؤال">✕</button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addQuestion(si)}
                    className="w-full rounded-lg border border-dashed border-white/15 py-2 text-xs text-white/40 transition hover:border-white/30 hover:text-white/70"
                  >
                    + إضافة سؤال
                  </button>
                </div>
              </div>
            ))}
          </div>

          {err && <p className="text-sm text-red-400">{err}</p>}

          <div className="flex gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={state === 'saving'}
              className="flex-1 rounded-full bg-[#ee204d] py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {state === 'saving' ? 'جاري الحفظ...' : template ? 'حفظ التعديلات' : 'إنشاء القالب'}
            </button>
            <button type="button" onClick={onClose} className="rounded-full bg-white/8 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/14">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Create Instance Modal ─────────────────────────────────────────────────

const TIER_OPTIONS = [
  { tierKey: 'package-2/basic',             label: 'هوية بصرية — الباقة الأساسية',       packageType: 'identity' },
  { tierKey: 'package-2/advanced',          label: 'هوية بصرية — الباقة الشاملة',        packageType: 'identity' },
  { tierKey: 'package-2/cafes-restaurants', label: 'هوية بصرية — باقة المقاهي والمطاعم', packageType: 'identity' },
  { tierKey: 'package-1/snapchat',          label: 'حملات — سناب شات',                   packageType: 'campaign' },
  { tierKey: 'package-1/meta',              label: 'حملات — إنستغرام وفيسبوك',           packageType: 'campaign' },
  { tierKey: 'package-1/tiktok',            label: 'حملات — تيك توك',                    packageType: 'campaign' },
  { tierKey: 'package-1/all-platforms',     label: 'حملات — جميع المنصات',               packageType: 'campaign' },
]

function CreateInstanceModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [form, setForm] = useState({ clientName: '', clientEmail: '', tierKey: 'package-2/basic', orderId: '' })
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ briefUrl?: string } | null>(null)
  const [err, setErr] = useState('')

  async function handleCreate() {
    if (!form.clientName.trim() || !form.clientEmail.trim()) { setErr('الاسم والبريد الإلكتروني مطلوبان'); return }
    setState('loading')
    const selected = TIER_OPTIONS.find(t => t.tierKey === form.tierKey)
    try {
      const res = await fetch(`${API_BASE}/api/brief/instances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          tierKey: form.tierKey,
          packageType: selected?.packageType ?? 'identity',
          orderId: form.orderId || undefined,
        }),
      })
      if (!res.ok) throw new Error('فشل الإنشاء')
      const data = await res.json() as { briefUrl?: string }
      setResult(data)
      setState('done')
    } catch {
      setErr('حدث خطأ أثناء إنشاء البريف')
      setState('error')
    }
  }

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
  const labelCls = "mb-1 block text-xs font-medium text-white/50"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#221b4f] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-5 text-lg font-bold text-white">إرسال رابط بريف لعميل</h2>

        {state === 'done' && result?.briefUrl ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-center">
              <p className="text-sm font-semibold text-emerald-400 mb-2">تم إنشاء البريف وإرسال الرابط ✓</p>
              <p className="text-xs text-white/50 mb-3">تم إرسال الرابط على البريد الإلكتروني تلقائياً</p>
              <div className="rounded-lg bg-white/5 p-3 break-all text-xs text-white/70 font-mono">{result.briefUrl}</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(result.briefUrl ?? '')}
                className="flex-1 rounded-xl bg-white/8 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/12"
              >نسخ الرابط</button>
              <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-[#ee204d] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>اسم العميل *</label>
                <input className={inputCls} value={form.clientName} onChange={(e) => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="أحمد محمد" />
              </div>
              <div>
                <label className={labelCls}>البريد الإلكتروني *</label>
                <input className={inputCls} type="email" dir="ltr" value={form.clientEmail} onChange={(e) => setForm(f => ({ ...f, clientEmail: e.target.value }))} placeholder="client@email.com" />
              </div>
              <div>
                <label className={labelCls}>الباقة</label>
                <select className={inputCls} style={{ colorScheme: 'dark' }} value={form.tierKey} onChange={(e) => setForm(f => ({ ...f, tierKey: e.target.value }))}>
                  <optgroup label="هوية بصرية وشعارات" style={{ backgroundColor: '#221b4f', color: 'rgba(255,255,255,0.5)' }}>
                    {TIER_OPTIONS.filter(t => t.packageType === 'identity').map(t => (
                      <option key={t.tierKey} value={t.tierKey} style={{ backgroundColor: '#221b4f', color: '#fff' }}>{t.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="إطلاق حملات إعلانية" style={{ backgroundColor: '#221b4f', color: 'rgba(255,255,255,0.5)' }}>
                    {TIER_OPTIONS.filter(t => t.packageType === 'campaign').map(t => (
                      <option key={t.tierKey} value={t.tierKey} style={{ backgroundColor: '#221b4f', color: '#fff' }}>{t.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className={labelCls}>رقم الطلب (اختياري)</label>
                <input className={inputCls} dir="ltr" value={form.orderId} onChange={(e) => setForm(f => ({ ...f, orderId: e.target.value }))} placeholder="payment_xxx" />
              </div>
            </div>
            {err && <p className="mt-3 text-xs text-[#ee204d]">{err}</p>}
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-white/8 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/12">إلغاء</button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={state === 'loading'}
                className="flex-1 rounded-xl bg-[#ee204d] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {state === 'loading' ? 'جاري الإنشاء...' : 'إنشاء وإرسال الرابط'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Submission Detail Modal ───────────────────────────────────────────────

function SubmissionDetailModal({ id, token, onClose }: { id: string; token: string; onClose: () => void }) {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/brief/submissions/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setDetail(d as SubmissionDetail); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id, token])

  function getQuestionText(qid: string): string {
    if (!detail?.sections) return qid
    for (const s of detail.sections) {
      const q = s.questions.find(q => q.id === qid)
      if (q) return q.text
    }
    return qid
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1440] shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#1a1440] p-5">
          <h2 className="font-bold text-white">تفاصيل البريف</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-white/40 hover:bg-white/8 hover:text-white transition">✕</button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-12 text-white/40 text-sm">جاري التحميل...</div>
          ) : !detail ? (
            <p className="text-white/40 text-sm text-center py-8">تعذّر تحميل البيانات</p>
          ) : (
            <div className="space-y-5">
              {/* Header info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-white/40 mb-0.5">العميل</p>
                  <p className="text-sm font-semibold text-white">{detail.clientName}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-white/40 mb-0.5">البريد</p>
                  <p className="text-sm text-white/80" dir="ltr">{detail.clientEmail}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-white/40 mb-0.5">النوع</p>
                  {typeBadge(detail.packageType)}
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-white/40 mb-0.5">تاريخ الإرسال</p>
                  <p className="text-xs text-white/70">{detail.submittedAt ? formatDate(detail.submittedAt) : '—'}</p>
                </div>
              </div>

              {/* Answers */}
              {detail.answers && Object.keys(detail.answers).length > 0 ? (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-white/60 border-b border-white/10 pb-2">الإجابات</h3>
                  <div className="space-y-3">
                    {Object.entries(detail.answers).map(([qid, val]) => (
                      <div key={qid} className="rounded-xl border border-white/8 bg-white/4 p-3">
                        <p className="text-xs text-white/45 mb-1.5 leading-[1.5]">{getQuestionText(qid)}</p>
                        <p className="text-sm text-white leading-[1.6]">
                          {Array.isArray(val) ? val.join('، ') : String(val) || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-white/30 text-sm text-center py-4">لا توجد إجابات بعد</p>
              )}

              {/* Brief link */}
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-white/40 mb-1.5">رابط البريف</p>
                <p className="text-xs text-white/50 font-mono break-all">{SITE_BASE}/brief/{detail.token}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────

function tierLabelsForTemplate(tierKeys: string[]): string {
  if (!tierKeys?.length) return 'غير مرتبط بأي باقة'
  return tierKeys
    .map(tk => TIER_OPTIONS.find(t => t.tierKey === tk)?.label ?? tk)
    .join('، ')
}

function TemplatesPanel({ token }: { token: string }) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [editing, setEditing] = useState<Template | null | 'new'>(null)

  async function load() {
    setLoadState('loading')
    try {
      const res = await fetch(`${API_BASE}/api/brief/templates`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      setTemplates(await res.json() as Template[])
      setLoadState('ready')
    } catch {
      setLoadState('error')
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleActive(t: Template) {
    try {
      await fetch(`${API_BASE}/api/brief/templates/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: t.title,
          type: t.type,
          isActive: !t.isActive,
          tierKeys: t.tierKeys,
          sections: JSON.stringify(t.sections),
        }),
      })
      load()
    } catch {
      // ignore
    }
  }

  return (
    <div>
      {editing && (
        <TemplateEditorModal
          token={token}
          template={editing === 'new' ? null : editing}
          onClose={() => { setEditing(null); load() }}
        />
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-white/40">القوالب هي ما يُرسل تلقائياً للعميل بعد شراء باقة مرتبطة بها</p>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-full bg-[#ee204d] px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(238,32,77,0.3)] transition hover:opacity-90 active:scale-95"
        >
          + قالب بريف جديد
        </button>
      </div>

      {loadState === 'loading' ? (
        <div className="flex justify-center py-20 text-white/30 text-sm">جاري التحميل...</div>
      ) : loadState === 'error' ? (
        <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm text-red-400">تعذّر تحميل القوالب</div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/4 py-16 text-center">
          <p className="text-white/30 text-sm">لا توجد قوالب بعد</p>
          <button type="button" onClick={() => setEditing('new')} className="mt-4 text-xs text-[#ee204d] underline underline-offset-2 hover:no-underline">
            إنشاء أول قالب
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map(t => (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/4 p-4 transition hover:border-white/16 hover:bg-white/6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">{t.title}</p>
                  {typeBadge(t.type)}
                  {t.isActive ? (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/12 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">مفعّل</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/6 px-2.5 py-0.5 text-xs font-semibold text-white/40">معطّل</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-white/40">{tierLabelsForTemplate(t.tierKeys)}</p>
                <p className="mt-0.5 text-xs text-white/30">
                  {(t.sections ?? []).length} أقسام · {(t.sections ?? []).reduce((n, s) => n + (s.questions?.length ?? 0), 0)} سؤال
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(t)}
                  className="rounded-full border border-white/14 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/30 hover:text-white"
                >
                  {t.isActive ? 'تعطيل' : 'تفعيل'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(t)}
                  className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/14"
                >
                  تعديل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const BRIEFS_PAGE_SIZE = 10

export function BriefsPage({ token }: { token: string }) {
  const [tab, setTab] = useState<'submissions' | 'templates'>('submissions')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  async function load() {
    setLoadState('loading')
    try {
      const url = filter === 'all' ? `${API_BASE}/api/brief/submissions` : `${API_BASE}/api/brief/submissions?status=${filter}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      setSubmissions(await res.json() as Submission[])
      setLoadState('ready')
    } catch {
      setLoadState('error')
    }
  }

  useEffect(() => { if (tab === 'submissions') load() }, [filter, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  async function deleteBrief(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`${API_BASE}/api/brief/submissions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== id))
        setConfirmDelete(null)
      }
    } finally {
      setDeleting(null)
    }
  }

  const filtered = filter === 'all' ? submissions : submissions.filter(s => s.status === filter)
  const pendingCount = submissions.filter(s => s.status === 'pending').length
  const submittedCount = submissions.filter(s => s.status === 'submitted').length

  const totalBriefPages = Math.ceil(filtered.length / BRIEFS_PAGE_SIZE)
  const paginatedBriefs = filtered.slice((page - 1) * BRIEFS_PAGE_SIZE, page * BRIEFS_PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#0f0c2c] p-6 text-white" dir="rtl">
      {showCreate && <CreateInstanceModal token={token} onClose={() => { setShowCreate(false); load() }} />}
      {detailId && <SubmissionDetailModal id={detailId} token={token} onClose={() => setDetailId(null)} />}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#0f0d1f] p-6 text-center">
            <p className="text-base font-semibold text-white">حذف البريف؟</p>
            <p className="mt-2 text-sm text-white/50">هذا الإجراء لا يمكن التراجع عنه.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm text-white/50 transition hover:bg-white/5">إلغاء</button>
              <button onClick={() => deleteBrief(confirmDelete)} disabled={deleting === confirmDelete} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50">
                {deleting === confirmDelete ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">إدارة البريفات</h1>
          <p className="mt-0.5 text-sm text-white/40">استعراض وإرسال استمارات العملاء، وإدارة قوالب الأسئلة</p>
        </div>
        {tab === 'submissions' && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#ee204d] px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(238,32,77,0.3)] transition hover:opacity-90 active:scale-95"
          >
            + إرسال بريف لعميل
          </button>
        )}
      </div>

      {/* Main tabs */}
      <div className="mb-5 flex gap-2 border-b border-white/10 pb-3">
        {([
          { key: 'submissions' as const, label: 'الطلبات المُرسَلة' },
          { key: 'templates' as const, label: 'قوالب الأسئلة' },
        ]).map(tb => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              tab === tb.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70',
            ].join(' ')}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'templates' ? (
        <TemplatesPanel token={token} />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              { label: 'إجمالي البريفات', value: submissions.length, color: 'text-white' },
              { label: 'بانتظار العميل', value: pendingCount, color: 'text-yellow-400' },
              { label: 'مُرسَلة', value: submittedCount, color: 'text-emerald-400' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-white/8 bg-white/4 p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-white/45 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="mb-4 flex gap-2">
            {(['all', 'pending', 'submitted'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={[
                  'rounded-full px-4 py-1.5 text-xs font-semibold transition',
                  filter === f ? 'bg-[#ee204d] text-white' : 'bg-white/6 text-white/50 hover:bg-white/10',
                ].join(' ')}
              >
                {f === 'all' ? 'الكل' : f === 'pending' ? 'بانتظار العميل' : 'مُرسَلة'}
              </button>
            ))}
          </div>

          {/* Table */}
          {loadState === 'loading' ? (
            <div className="flex justify-center py-20 text-white/30 text-sm">جاري التحميل...</div>
          ) : loadState === 'error' ? (
            <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm text-red-400">تعذّر تحميل البريفات</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-white/8 bg-white/4 py-16 text-center">
              <p className="text-white/30 text-sm">لا توجد بريفات</p>
              <button type="button" onClick={() => setShowCreate(true)} className="mt-4 text-xs text-[#ee204d] underline underline-offset-2 hover:no-underline">
                إرسال أول بريف
              </button>
            </div>
          ) : (
            <>
            <div className="space-y-2">
              {paginatedBriefs.map(s => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/4 p-4 transition hover:border-white/16 hover:bg-white/6"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{s.clientName}</p>
                      {typeBadge(s.packageType)}
                      {statusBadge(s.status)}
                    </div>
                    <p className="mt-0.5 text-xs text-white/40" dir="ltr">{s.clientEmail}</p>
                    <p className="mt-0.5 text-xs text-white/30">
                      {s.status === 'submitted' && s.submittedAt
                        ? `أُرسل بتاريخ: ${formatDate(s.submittedAt)}`
                        : `أُنشئ بتاريخ: ${formatDate(s.createdAt)}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {s.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(`${SITE_BASE}/brief/${s.token}`)}
                        className="rounded-full border border-white/14 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/30 hover:text-white"
                      >
                        نسخ الرابط
                      </button>
                    )}
                    {s.status === 'submitted' && (
                      <button
                        type="button"
                        onClick={() => setDetailId(s.id)}
                        className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/14"
                      >
                        عرض الإجابات
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(s.id)}
                      className="rounded-full border border-red-500/25 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {totalBriefPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-3">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/5 disabled:opacity-30">السابق</button>
                <span className="text-xs text-white/40">{page} / {totalBriefPages}</span>
                <button onClick={() => setPage(p => Math.min(totalBriefPages, p + 1))} disabled={page === totalBriefPages} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/5 disabled:opacity-30">التالي</button>
              </div>
            )}
            </>
          )}
        </>
      )}
    </div>
  )
}
