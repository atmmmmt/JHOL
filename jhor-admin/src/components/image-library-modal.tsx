import { useMemo, useRef, useState } from 'react'
import { resolveImageAssetUrl } from '../lib/content-api'
import { cn, formatTimestamp } from '../lib/utils'
import type { ImageAsset } from '../types/image'

type ImageLibraryStatus = 'idle' | 'loading' | 'success' | 'error'
type ImageActionStatus =
  | 'idle'
  | 'uploading'
  | 'saving'
  | 'deleting'
  | 'success'
  | 'error'

interface ImageLibraryModalProps {
  isOpen: boolean
  fieldLabel: string
  selectedImageValue: string | null
  images: ImageAsset[]
  status: ImageLibraryStatus
  error: string | null
  actionStatus: ImageActionStatus
  actionMessage: string | null
  actionImageId: string | null
  onClose: () => void
  onRetry: () => void
  onUpload: (file: File) => void
  onSelect: (image: ImageAsset) => void
  onRename: (imageId: string, originalFileName: string) => void
  onDelete: (image: ImageAsset) => void
  onClearSelection: () => void
  clearActionLabel?: string
}

function ImageLibrarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[24px] border border-white/6 bg-white/4 p-3"
        >
          <div className="aspect-[4/3] rounded-[18px] bg-white/8" />
          <div className="mt-3 h-4 w-2/3 rounded-full bg-white/8" />
          <div className="mt-2 h-3 w-1/2 rounded-full bg-white/8" />
          <div className="mt-4 h-10 rounded-[16px] bg-white/8" />
        </div>
      ))}
    </div>
  )
}

export function ImageLibraryModal({
  isOpen,
  fieldLabel,
  selectedImageValue,
  images,
  status,
  error,
  actionStatus,
  actionMessage,
  actionImageId,
  onClose,
  onRetry,
  onUpload,
  onSelect,
  onRename,
  onDelete,
  onClearSelection,
  clearActionLabel = 'تفريغ الحقل الحالي',
}: ImageLibraryModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [renameDrafts,] = useState<Record<string, string>>({})
  const filteredImages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return images
    }

    return images.filter((image) => {
      const searchableParts = [
        image.originalFileName,
        image.fileName,
        image.publicUrl,
        image.filePath,
      ]

      return searchableParts.some(
        (value) =>
          typeof value === 'string' && value.toLowerCase().includes(normalizedQuery),
      )
    })
  }, [images, searchQuery])

  if (!isOpen) {
    return null
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#050512]/78 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-x-3 top-3 bottom-3 z-50 mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[34px] border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(23,18,57,0.98),rgba(10,8,29,0.98))] shadow-[0_30px_90px_rgba(5,5,19,0.55)] backdrop-blur-xl sm:inset-x-6 sm:top-6 sm:bottom-6">
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--brand-border)] px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs tracking-[0.16em] text-[var(--brand-violet)]">
              إدارة الصور
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--brand-text)]">
              مكتبة الصور
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--brand-muted)]">
              اختر صورة للحقل:
              <span className="me-1 text-[var(--brand-text)]">{fieldLabel}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--brand-border)] bg-white/5 text-lg text-[var(--brand-text)] transition hover:border-[color:var(--brand-border-strong)] hover:bg-white/10"
            aria-label="إغلاق مكتبة الصور"
          >
            ×
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-[color:var(--brand-border)] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={actionStatus === 'uploading'}
            className="rounded-2xl bg-[var(--brand-teal)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionStatus === 'uploading' ? 'جاري الرفع...' : 'رفع صورة جديدة'}
          </button>

          <button
            type="button"
            onClick={onClearSelection}
            className="rounded-2xl border border-[color:var(--brand-border)] px-4 py-2.5 text-sm text-[var(--brand-muted)] transition hover:border-[color:var(--brand-border-strong)] hover:bg-white/8"
          >
            {clearActionLabel}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]

              if (file) {
                onUpload(file)
              }

              event.target.value = ''
            }}
          />

          <div className="min-w-[240px] flex-1">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              dir="ltr"
              placeholder="ابحث عن صورة..."
              className="w-full rounded-[18px] border border-[rgba(160,149,208,0.16)] bg-black/10 px-4 py-3 text-sm text-[var(--brand-text)] outline-none transition placeholder:text-[var(--brand-subtle)] focus:border-[rgba(29,171,137,0.45)] focus:bg-[rgba(29,171,137,0.04)]"
            />
          </div>

          {selectedImageValue ? (
            <div className="min-w-0 flex-1 rounded-[18px] border border-[rgba(160,149,208,0.14)] bg-black/10 px-4 py-3 text-xs leading-6 text-[var(--brand-subtle)]">
              توجد صورة محددة لهذا الحقل حالياً.
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-[rgba(160,149,208,0.18)] px-4 py-3 text-xs text-[var(--brand-subtle)]">
              لا توجد صورة مضافة لهذا الحقل حالياً.
            </div>
          )}
        </div>

        {actionMessage ? (
          <div
            className={cn(
              'mx-5 mt-4 rounded-[18px] border px-4 py-3 text-sm sm:mx-6',
              actionStatus === 'error'
                ? 'border-[rgba(238,32,77,0.35)] bg-[rgba(238,32,77,0.1)] text-[var(--brand-coral)]'
                : 'border-[rgba(29,171,137,0.26)] bg-[rgba(29,171,137,0.08)] text-[var(--brand-teal)]',
            )}
          >
            {actionMessage}
          </div>
        ) : null}

        <div className="dashboard-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {status === 'loading' ? <ImageLibrarySkeleton /> : null}

          {status === 'error' ? (
            <div className="rounded-[26px] border border-[rgba(238,32,77,0.35)] bg-[rgba(238,32,77,0.08)] p-5">
              <h3 className="text-lg font-semibold text-[var(--brand-text)]">
                تعذر تحميل الصور
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--brand-muted)]">
                {error || 'حدث خطأ أثناء قراءة مكتبة الصور.'}
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

          {status === 'success' && images.length === 0 ? (
            <div className="rounded-[26px] border border-[color:var(--brand-border)] bg-[rgba(255,255,255,0.03)] p-5 text-sm leading-7 text-[var(--brand-muted)]">
              لا توجد صور مرفوعة بعد. ارفع أول صورة ليتم استخدامها في الحقول.
            </div>
          ) : null}

          {status === 'success' && images.length > 0 && filteredImages.length === 0 ? (
            <div className="rounded-[26px] border border-[color:var(--brand-border)] bg-[rgba(255,255,255,0.03)] p-5 text-sm leading-7 text-[var(--brand-muted)]">
              لا توجد نتائج مطابقة للبحث الحالي.
            </div>
          ) : null}

          {status === 'success' && filteredImages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredImages.map((image) => {
                const imageUrl = resolveImageAssetUrl(image)
                const isSelected = selectedImageValue === imageUrl
                const renameValue =
                  renameDrafts[image.id] ?? image.originalFileName ?? ''
                const isVideo =
                  (image.contentType?.startsWith('video/') ?? false) ||
                  /\.(mp4|webm|mov|m4v|avi)$/i.test(imageUrl ?? '')

                return (
                  <article
                    key={image.id}
                    className={cn(
                      'rounded-[26px] border p-3 shadow-[0_16px_40px_rgba(5,5,19,0.22)]',
                      isSelected
                        ? 'border-[rgba(29,171,137,0.45)] bg-[linear-gradient(145deg,rgba(29,171,137,0.14),rgba(255,255,255,0.03))]'
                        : 'border-[rgba(160,149,208,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]',
                    )}
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-[20px] bg-[rgba(255,255,255,0.03)] p-2">
                      {imageUrl && isVideo ? (
                        <video
                          src={imageUrl}
                          className="h-full w-full rounded-[16px] object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={image.originalFileName || 'صورة'}
                          className="h-full w-full rounded-[16px] object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-[16px] border border-dashed border-[color:var(--brand-border)] text-sm text-[var(--brand-subtle)]">
                          لا توجد معاينة
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-semibold text-[var(--brand-text)]">
                        {image.originalFileName || 'صورة بدون اسم'}
                      </p>
                      <p className="mt-1 text-xs text-[var(--brand-subtle)]">
                        أضيفت في {formatTimestamp(image.createdAt)}
                      </p>
                    </div>

                    

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => onSelect(image)}
                        className={cn(
                          'rounded-2xl px-4 py-2.5 text-sm font-medium transition',
                          isSelected
                            ? 'bg-[var(--brand-teal)] text-white'
                            : 'border border-[rgba(29,171,137,0.3)] bg-[rgba(29,171,137,0.1)] text-[var(--brand-teal)] hover:bg-[rgba(29,171,137,0.16)]',
                        )}
                      >
                        {isSelected ? 'مستخدمة حالياً' : 'استخدام الصورة'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onRename(image.id, renameValue.trim())}
                        disabled={
                          !renameValue.trim() ||
                          renameValue.trim() === (image.originalFileName ?? '') ||
                          (actionStatus === 'saving' && actionImageId === image.id)
                        }
                        className="rounded-2xl border border-[rgba(160,149,208,0.26)] bg-[rgba(160,149,208,0.08)] px-4 py-2.5 text-sm font-medium text-[var(--brand-violet)] transition hover:bg-[rgba(160,149,208,0.14)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionStatus === 'saving' && actionImageId === image.id
                          ? 'جاري التعديل...'
                          : 'تعديل الاسم'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(image)}
                        disabled={actionStatus === 'deleting' && actionImageId === image.id}
                        className="sm:col-span-2 rounded-2xl border border-[rgba(238,32,77,0.3)] bg-[rgba(238,32,77,0.08)] px-4 py-2.5 text-sm font-medium text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.14)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionStatus === 'deleting' && actionImageId === image.id
                          ? 'جاري الحذف...'
                          : 'حذف الصورة'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
