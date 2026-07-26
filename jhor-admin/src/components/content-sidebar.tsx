import type { SidebarGroup } from '../types/content'
import { cn } from '../lib/utils'

type SidebarStatus = 'idle' | 'loading' | 'success' | 'error'

interface ContentSidebarProps {
  groups: SidebarGroup[]
  isOpen: boolean
  selectedId?: string
  status: SidebarStatus
  error: string | null
  onClose: () => void
  onRetry: () => void
  onSelect: (routePath: string) => void
}

const HIDDEN_SIDEBAR_GROUP_KEYS = new Set(['ungrouped'])
const HIDDEN_SIDEBAR_TITLES = new Set(['فورم الرئيسية'])
const HIDDEN_SIDEBAR_TITLES_BY_GROUP: Record<string, Set<string>> = {
  home: new Set(['معرض الأعمال']),
}

function isHiddenSidebarItem(
  group: SidebarGroup,
  item: SidebarGroup['items'][number],
) {
  const title = item.sidebarTitle

  return (
    HIDDEN_SIDEBAR_TITLES.has(title) ||
    HIDDEN_SIDEBAR_TITLES_BY_GROUP[group.key]?.has(title) === true
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={`skeleton-group-${index}`} className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded-full bg-white/8" />
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((__, itemIndex) => (
              <div
                key={`skeleton-item-${index}-${itemIndex}`}
                className="h-18 animate-pulse rounded-[24px] border border-white/6 bg-white/4"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ContentSidebar({
  groups,
  isOpen,
  selectedId,
  status,
  error,
  onClose,
  onRetry,
  onSelect,
}: ContentSidebarProps) {
  const visibleGroups = groups
    .filter((group) => !HIDDEN_SIDEBAR_GROUP_KEYS.has(group.key))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !isHiddenSidebarItem(group, item)),
    }))
    .filter((group) => group.items.length > 0)

  const visibleItemCount = visibleGroups.reduce(
    (count, group) => count + group.items.length,
    0,
  )

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-[#050512]/70 backdrop-blur-sm transition lg:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-40 w-[min(23rem,88vw)] overflow-hidden border-l border-[color:var(--brand-border)] bg-[rgba(15,12,44,0.96)] p-4 shadow-[0_24px_80px_rgba(5,5,19,0.45)] backdrop-blur-2xl transition duration-300 lg:static lg:block lg:h-full lg:w-[332px] lg:flex-none lg:translate-x-0 lg:rounded-[30px] lg:border lg:border-[rgba(160,149,208,0.16)] lg:bg-[linear-gradient(180deg,rgba(34,27,79,0.54),rgba(11,9,32,0.96))] lg:p-4',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-4 rounded-[24px] border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.16em] text-[var(--brand-violet)]">
                  خريطة المحتوى
                </p>
                <h2 className="mt-1.5 text-lg font-semibold text-[var(--brand-text)]">
                  الأقسام والمجموعات
                </h2>
                <p className="mt-1.5 text-xs leading-6 text-[var(--brand-subtle)]">
                  تنقل سريع بين أقسام الموقع حسب ترتيبها الفعلي.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--brand-border)] bg-white/5 text-lg text-[var(--brand-text)] transition hover:border-[color:var(--brand-border-strong)] hover:bg-white/10 lg:hidden"
                aria-label="إغلاق القائمة"
              >
                ×
              </button>
            </div>
          </div>

          <div className="dashboard-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pe-1">
            {status === 'loading' && visibleItemCount === 0 ? <SidebarSkeleton /> : null}

            {status === 'error' && visibleItemCount === 0 ? (
              <div className="rounded-[24px] border border-[rgba(238,32,77,0.35)] bg-[rgba(238,32,77,0.08)] p-4">
                <h3 className="text-base font-semibold text-[var(--brand-text)]">
                  تعذر تحميل قائمة الأقسام
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-muted)]">
                  {error || 'حدث خطأ غير متوقع أثناء قراءة المحتوى.'}
                </p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-4 rounded-2xl bg-[var(--brand-coral)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : null}

            {status === 'success' && visibleItemCount === 0 ? (
              <div className="rounded-[24px] border border-[color:var(--brand-border)] bg-[var(--brand-panel-soft)] p-4 text-sm leading-7 text-[var(--brand-muted)]">
                لم يرجع الـ API أي أقسام حالياً.
              </div>
            ) : null}

            {visibleItemCount > 0 ? (
              <div className="space-y-3.5">
                {visibleGroups.map((group) => (
                  <section
                    key={group.key}
                    className="overflow-hidden rounded-[24px] border border-[rgba(160,149,208,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,rgba(160,149,208,0.12),rgba(255,255,255,0.03))] px-4 py-2.5">
                      <h3 className="text-[13px] font-semibold text-[var(--brand-violet)]">
                        {group.title}
                      </h3>
                      <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-black/10 px-2.5 py-1 text-[11px] text-[var(--brand-subtle)]">
                        {group.items.length}
                      </span>
                    </div>

                    <div className="p-2">
                      <div className="overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.06)] bg-[rgba(8,7,24,0.3)]">
                        {group.items.map((item) => {
                          const isActive = item.sidebarId === selectedId
                          const title = item.sidebarTitle

                          return (
                            <button
                              key={item.sidebarId}
                              type="button"
                              onClick={() => {
                                onSelect(item.routePath)
                                onClose()
                              }}
                              className={cn(
                                'flex w-full items-center justify-between gap-3 px-4 py-3 text-right transition not-last:border-b not-last:border-[rgba(255,255,255,0.06)]',
                                item.sidebarChild ? 'pe-8' : '',
                                isActive
                                  ? 'bg-[linear-gradient(135deg,rgba(29,171,137,0.2),rgba(29,171,137,0.08))]'
                                  : 'bg-transparent hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]',
                              )}
                            >
                              <p className="text-sm font-medium text-[var(--brand-text)]">
                                {title}
                              </p>
                              <span
                                className={cn(
                                  'h-2.5 w-2.5 rounded-full transition',
                                  isActive
                                    ? 'bg-[var(--brand-teal)] shadow-[0_0_16px_rgba(29,171,137,0.85)]'
                                    : 'bg-[rgba(160,149,208,0.45)]',
                                )}
                              />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  )
}
