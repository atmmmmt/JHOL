import type { ReactNode } from 'react'

interface DashboardShellProps {
  username: string
  onOpenSidebar: () => void
  onOpenCredentials: () => void
  onOpenSettings: () => void
  onLogout: () => void
  sidebar: ReactNode
  children: ReactNode
}

export function DashboardShell({
  onOpenSidebar,
  onOpenCredentials,
  onOpenSettings,
  onLogout,
  sidebar,
  children,
}: DashboardShellProps) {
  return (
    <div className="h-[100svh] overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1800px] flex-col p-3 sm:p-4 lg:p-5">
        <header className="mb-3 shrink-0 rounded-[22px] border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(23,18,57,0.9),rgba(10,8,29,0.92))] p-3 shadow-[0_18px_56px_rgba(5,5,19,0.32)] sm:p-3.5">
          <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={onOpenSidebar}
                className="inline-flex h-9 items-center gap-2 rounded-[14px] border border-[rgba(160,149,208,0.24)] bg-[linear-gradient(135deg,rgba(34,27,79,0.94),rgba(15,12,44,0.96))] px-3 text-xs font-medium text-[var(--brand-text)] shadow-[0_12px_28px_rgba(5,5,19,0.3)] transition hover:border-[rgba(29,171,137,0.45)] hover:shadow-[0_16px_38px_rgba(29,171,137,0.16)] lg:hidden"
                aria-label="فتح قائمة الأقسام"
              >
                <span className="text-lg leading-none">☰</span>
                <span>القائمة</span>
              </button>

              <div>
              
                <h1 className="mt-1 text-base font-semibold text-[var(--brand-text)] sm:text-lg">
                  إدارة المحتوى
                </h1>
                <p className="mt-1 text-xs leading-6 text-[var(--brand-muted)]">
                  تحكم بالمحتوى، الصور، وبيانات الدخول من نفس المساحة.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
             
              <button
                type="button"
                onClick={onOpenSettings}
                className="rounded-[14px] border border-[rgba(29,171,137,0.28)] bg-[rgba(29,171,137,0.08)] px-3 py-2 text-xs font-medium text-[rgb(29,171,137)] transition hover:bg-[rgba(29,171,137,0.14)]"
              >
                الإعدادات
              </button>

              <button
                type="button"
                onClick={onOpenCredentials}
                className="rounded-[14px] border border-[rgba(160,149,208,0.24)] bg-[rgba(160,149,208,0.1)] px-3 py-2 text-xs font-medium text-[var(--brand-violet)] transition hover:bg-[rgba(160,149,208,0.16)]"
              >
                تعديل بيانات الدخول
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="rounded-[14px] border border-[rgba(238,32,77,0.28)] bg-[rgba(238,32,77,0.08)] px-3 py-2 text-xs font-medium text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.14)]"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 lg:flex lg:flex-row-reverse lg:gap-6">
          {sidebar}
          <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <div className="dashboard-scroll h-full overflow-y-auto overscroll-contain pe-1">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
