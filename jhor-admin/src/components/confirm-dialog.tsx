import { useEffect } from 'react'

export interface ConfirmDialogRequest {
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
}

interface ConfirmDialogProps {
  request: ConfirmDialogRequest | null
  isProcessing: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  request,
  isProcessing,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!request || isProcessing) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [request, isProcessing, onCancel])

  if (!request) {
    return null
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-[#050512]/80 backdrop-blur-sm"
        onClick={isProcessing ? undefined : onCancel}
      />

      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          className="w-full max-w-xl overflow-hidden rounded-[32px] border border-[rgba(238,32,77,0.18)] bg-[linear-gradient(145deg,rgba(23,18,57,0.98),rgba(10,8,29,0.98))] shadow-[0_35px_120px_rgba(5,5,19,0.58)]"
        >
          <div className="border-b border-[rgba(255,255,255,0.08)] px-6 py-6 sm:px-7">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-none items-center justify-center rounded-[22px] border border-[rgba(238,32,77,0.28)] bg-[rgba(238,32,77,0.12)] text-2xl text-[var(--brand-coral)]">
                !
              </div>

              <div className="min-w-0">
                <p className="text-xs tracking-[0.16em] text-[var(--brand-coral)]">
                  تأكيد الحذف
                </p>
                <h2
                  id="confirm-dialog-title"
                  className="mt-2 text-xl font-semibold text-[var(--brand-text)] sm:text-2xl"
                >
                  {request.title}
                </h2>
                <p
                  id="confirm-dialog-description"
                  className="mt-3 text-sm leading-7 text-[var(--brand-muted)] sm:text-base"
                >
                  {request.description}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 sm:px-7">
            <div className="rounded-[22px] border border-[rgba(238,32,77,0.2)] bg-[rgba(238,32,77,0.07)] px-4 py-3 text-sm leading-7 text-[var(--brand-muted)]">
              لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="rounded-[18px] border border-[color:var(--brand-border)] px-5 py-3 text-sm font-medium text-[var(--brand-muted)] transition hover:border-[color:var(--brand-border-strong)] hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {request.cancelLabel || 'إلغاء'}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isProcessing}
                className="rounded-[18px] border border-[rgba(238,32,77,0.34)] bg-[linear-gradient(135deg,rgba(238,32,77,0.9),rgba(173,20,54,0.95))] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessing ? 'جاري التنفيذ...' : request.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
