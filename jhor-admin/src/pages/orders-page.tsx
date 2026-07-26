import { useEffect, useState } from 'react'

const API_BASE = 'https://johor-back.euphoria-motiva.com'
const PAGE_SIZE = 10

type OrderItem = {
  name?: string
  price?: string
  qty?: number
}

type Order = {
  id: string
  paymentId: string
  customerName: string
  email: string
  phone: string
  company?: string
  items: string | OrderItem[]
  totalSAR?: number
  status: string
  createdAt: string
  paymentMode: 'full' | 'split'
  amountPaidNow?: number
  amountDueLater: number
  secondPaymentStatus: 'not_applicable' | 'pending' | 'collected'
}

function parseItems(raw: string | OrderItem[]): OrderItem[] {
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw) as OrderItem[] } catch { return [] }
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    failed: 'bg-red-500/15 text-red-400 border-red-500/25',
  }
  const labels: Record<string, string> = { paid: 'مدفوع', pending: 'معلّق', failed: 'فشل' }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-white/10 text-white/60 border-white/15'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch { return iso }
}

export function OrdersPage({ token }: { token: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [collecting, setCollecting] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  async function load() {
    try {
      const res = await fetch(`${API_BASE}/api/orders?pageSize=500`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('unauthorized')
      const data = await res.json() as Order[]
      setOrders(data)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => { load() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  async function collectSecondPayment(orderId: string) {
    setCollecting(orderId)
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/second-payment`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, secondPaymentStatus: 'collected' } : o))
      }
    } finally {
      setCollecting(null)
    }
  }

  async function deleteOrder(orderId: string) {
    setDeleting(orderId)
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId))
        setConfirmDelete(null)
        setExpanded(null)
      }
    } finally {
      setDeleting(null)
    }
  }

  const pendingSecondPayments = orders.filter(o => o.secondPaymentStatus === 'pending').length
  const remainingRevenue = orders
    .filter(o => o.secondPaymentStatus === 'pending')
    .reduce((s, o) => s + (o.amountDueLater ?? 0), 0)

  if (status === 'loading') return (
    <div className="flex h-full items-center justify-center text-[var(--brand-muted)]">جارٍ التحميل...</div>
  )
  if (status === 'error') return (
    <div className="rounded-2xl border border-[rgba(238,32,77,0.35)] bg-[rgba(238,32,77,0.08)] p-6 text-[var(--brand-text)]">
      تعذّر تحميل الطلبات.
    </div>
  )

  const totalRevenue = orders
    .filter(o => o.status === 'paid' && o.totalSAR != null)
    .reduce((s, o) => s + (o.totalSAR ?? 0), 0)

  const totalPages = Math.ceil(orders.length / PAGE_SIZE)
  const paginated = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-5 pb-10" dir="rtl">
      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[rgba(238,32,77,0.3)] bg-[#0f0d1f] p-6 text-center">
            <p className="text-base font-semibold text-[var(--brand-text)]">حذف الطلب؟</p>
            <p className="mt-2 text-sm text-[var(--brand-subtle)]">هذا الإجراء لا يمكن التراجع عنه.</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-[rgba(160,149,208,0.2)] py-2.5 text-sm text-[var(--brand-muted)] transition hover:bg-white/5"
              >إلغاء</button>
              <button
                onClick={() => deleteOrder(confirmDelete)}
                disabled={deleting === confirmDelete}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >{deleting === confirmDelete ? 'جارٍ الحذف...' : 'تأكيد الحذف'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'إجمالي الطلبات', value: orders.length },
          { label: 'طلبات مدفوعة', value: orders.filter(o => o.status === 'paid').length },
          { label: 'الإيرادات المحصّلة', value: `${totalRevenue.toLocaleString('en-US')} SAR` },
          { label: 'دفعات ثانية معلّقة', value: pendingSecondPayments > 0 ? `${pendingSecondPayments} · ${remainingRevenue.toLocaleString('en-US')} SAR` : '0', warn: pendingSecondPayments > 0 },
        ].map(s => (
          <div
            key={s.label}
            className={[
              'rounded-2xl border p-4 text-center',
              s.warn
                ? 'border-yellow-500/25 bg-[linear-gradient(145deg,rgba(120,90,10,0.25),rgba(11,9,32,0.7))]'
                : 'border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(34,27,79,0.5),rgba(11,9,32,0.7))]',
            ].join(' ')}
          >
            <p className={`text-lg font-bold ${s.warn ? 'text-yellow-400' : 'text-[var(--brand-text)]'}`}>{s.value}</p>
            <p className="mt-0.5 text-xs text-[var(--brand-subtle)]">{s.label}</p>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-[rgba(160,149,208,0.16)] bg-[rgba(255,255,255,0.03)] p-10 text-center text-[var(--brand-subtle)]">
          لا توجد طلبات بعد.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map(order => {
              const items = parseItems(order.items)
              const isOpen = expanded === order.id
              return (
                <div key={order.id} className="rounded-2xl border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(34,27,79,0.4),rgba(11,9,32,0.6))]">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 p-4 text-right"
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                  >
                    <div className="flex items-center gap-3">
                      {statusBadge(order.status)}
                      {order.secondPaymentStatus === 'pending' && (
                        <span className="inline-flex items-center rounded-full border border-yellow-500/25 bg-yellow-500/12 px-2.5 py-0.5 text-xs font-medium text-yellow-400" dir="ltr">
                          مستحق: {order.amountDueLater.toLocaleString('en-US')} SAR
                        </span>
                      )}
                      {order.secondPaymentStatus === 'collected' && (
                        <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/12 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          الدفعة الثانية محصّلة
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[var(--brand-text)]">{order.customerName}</p>
                        <p className="text-xs text-[var(--brand-subtle)]" dir="ltr">{order.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.totalSAR != null && (
                        <span className="text-sm font-bold text-[var(--brand-teal)]" dir="ltr">
                          {order.totalSAR.toLocaleString('en-US')} SAR
                        </span>
                      )}
                      <span className="text-xs text-[var(--brand-muted)]">{formatDate(order.createdAt)}</span>
                      <span className="text-[var(--brand-subtle)]">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-[rgba(160,149,208,0.12)] px-4 pb-4 pt-3">
                      <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <span className="text-[var(--brand-subtle)]">الهاتف: </span>
                          <span className="text-[var(--brand-text)]" dir="ltr">{order.phone}</span>
                        </div>
                        {order.company && (
                          <div>
                            <span className="text-[var(--brand-subtle)]">الشركة: </span>
                            <span className="text-[var(--brand-text)]">{order.company}</span>
                          </div>
                        )}
                        <div className="sm:col-span-2">
                          <span className="text-[var(--brand-subtle)]">رقم العملية: </span>
                          <span className="font-mono text-[var(--brand-muted)]" dir="ltr">{order.paymentId}</span>
                        </div>
                      </div>

                      {items.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-1.5 text-xs font-medium text-[var(--brand-subtle)]">الباقات:</p>
                          <div className="space-y-1.5">
                            {items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs">
                                <span className="text-[var(--brand-text)]">{item.name ?? '-'}</span>
                                <span className="text-[var(--brand-teal)]" dir="ltr">{item.price ?? ''} {item.qty && item.qty > 1 ? `× ${item.qty}` : ''}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.paymentMode === 'split' && (
                        <div className="mt-3 rounded-xl border border-[rgba(160,149,208,0.16)] bg-[rgba(255,255,255,0.03)] p-3">
                          <p className="mb-2 text-xs font-medium text-[var(--brand-subtle)]">نظام الدفع المرحلي</p>
                          <div className="grid gap-1.5 text-xs sm:grid-cols-2">
                            <div className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.04)] px-3 py-2">
                              <span className="text-[var(--brand-subtle)]">الدفعة الأولى (مدفوعة)</span>
                              <span className="font-semibold text-emerald-400" dir="ltr">
                                {(order.amountPaidNow ?? 0).toLocaleString('en-US')} SAR
                              </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.04)] px-3 py-2">
                              <span className="text-[var(--brand-subtle)]">الدفعة الثانية</span>
                              <span className={`font-semibold ${order.secondPaymentStatus === 'collected' ? 'text-emerald-400' : 'text-yellow-400'}`} dir="ltr">
                                {order.amountDueLater.toLocaleString('en-US')} SAR
                              </span>
                            </div>
                          </div>
                          {order.secondPaymentStatus === 'pending' && (
                            <button
                              type="button"
                              onClick={() => collectSecondPayment(order.id)}
                              disabled={collecting === order.id}
                              className="mt-2.5 w-full rounded-lg bg-[#ee204d] py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                            >
                              {collecting === order.id ? 'جاري التحديث...' : 'تأكيد تحصيل الدفعة الثانية'}
                            </button>
                          )}
                          {order.secondPaymentStatus === 'collected' && (
                            <p className="mt-2.5 text-center text-xs text-emerald-400">✓ تم تحصيل كامل المبلغ</p>
                          )}
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(order.id)}
                        className="mt-4 flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/15"
                      >
                        🗑 حذف الطلب
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[rgba(160,149,208,0.2)] px-3 py-1.5 text-xs text-[var(--brand-muted)] transition hover:bg-white/5 disabled:opacity-30"
              >السابق</button>
              <span className="text-xs text-[var(--brand-subtle)]">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-[rgba(160,149,208,0.2)] px-3 py-1.5 text-xs text-[var(--brand-muted)] transition hover:bg-white/5 disabled:opacity-30"
              >التالي</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
