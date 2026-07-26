import { useEffect, useRef, useState } from 'react'
import { updateContentDetail, uploadVideoAssetWithProgress } from '../lib/content-api'
import { isRecord } from '../lib/utils'
import type { ContentListItem, JsonValue } from '../types/content'

interface VideoItem {
  id: string
  url: string
  title: string
}

interface PackageVideoGroup {
  packageIndex: number
  packageTitle: string
  videos: VideoItem[]
}

interface UploadState {
  groupIndex: number
  fileName: string
  percent: number
}

function normalizeVideos(raw: unknown): VideoItem[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((entry, i) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return []
    const r = entry as Record<string, unknown>
    return [{
      id: typeof r.id === 'string' ? r.id : `v-${i}`,
      url: typeof r.url === 'string' ? r.url : '',
      title: typeof r.title === 'string' ? r.title : '',
    }]
  })
}

function generateId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `vid-${Math.random().toString(36).slice(2, 10)}`
}

interface VideoManagerPageProps {
  packagesShowcaseItem: ContentListItem | null
  onCatalogUpdate: (updated: ContentListItem) => void
}

export function VideoManagerPage({ packagesShowcaseItem, onCatalogUpdate }: VideoManagerPageProps) {
  const [groups, setGroups] = useState<PackageVideoGroup[]>([])
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [upload, setUpload] = useState<UploadState | null>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!packagesShowcaseItem) return
    const rawItems = packagesShowcaseItem.body.items
    if (!Array.isArray(rawItems)) return
    setGroups(
      rawItems.flatMap((entry, index) => {
        if (!isRecord(entry)) return []
        const packageTitle =
          typeof entry.title === 'string' && entry.title.trim()
            ? entry.title.trim()
            : `الباقة ${index + 1}`
        return [{ packageIndex: index, packageTitle, videos: normalizeVideos(entry.videos) }]
      }),
    )
  }, [packagesShowcaseItem])

  async function handleUpload(groupIndex: number, file: File) {
    setUpload({ groupIndex, fileName: file.name, percent: 0 })
    try {
      const url = await uploadVideoAssetWithProgress(file, (percent) => {
        setUpload((prev) => prev ? { ...prev, percent } : prev)
      })
      setGroups((prev) =>
        prev.map((group, i) =>
          i !== groupIndex
            ? group
            : {
                ...group,
                videos: [
                  ...group.videos,
                  { id: generateId(), url, title: file.name.replace(/\.[^.]+$/, '') },
                ],
              },
        ),
      )
    } catch (err) {
      setSaveMessage({ text: err instanceof Error ? err.message : 'فشل رفع الفيديو', ok: false })
    } finally {
      setUpload(null)
    }
  }

  function handleRemoveVideo(groupIndex: number, videoIndex: number) {
    setGroups((prev) =>
      prev.map((group, i) =>
        i !== groupIndex
          ? group
          : { ...group, videos: group.videos.filter((_, vi) => vi !== videoIndex) },
      ),
    )
  }

  function handleTitleChange(groupIndex: number, videoIndex: number, title: string) {
    setGroups((prev) =>
      prev.map((group, i) =>
        i !== groupIndex
          ? group
          : {
              ...group,
              videos: group.videos.map((v, vi) => (vi === videoIndex ? { ...v, title } : v)),
            },
      ),
    )
  }

  async function handleSave() {
    if (!packagesShowcaseItem) return
    setSaving(true)
    setSaveMessage(null)
    try {
      const rawItems = packagesShowcaseItem.body.items
      if (!Array.isArray(rawItems)) throw new Error('بيانات الباقات غير صالحة')
      const nextItems = (rawItems as JsonValue[]).map((entry, index) => {
        if (!isRecord(entry)) return entry as JsonValue
        const group = groups.find((g) => g.packageIndex === index)
        return {
          ...entry,
          videos: group ? (group.videos as unknown as JsonValue) : (entry.videos ?? ([] as unknown as JsonValue)),
        } as JsonValue
      })
      // Also update packageDetails so the frontend useLiveSection picks up the videos
      const rawPkgDetails = packagesShowcaseItem.body.packageDetails
      const nextPkgDetails = Array.isArray(rawPkgDetails)
        ? (rawPkgDetails as JsonValue[]).map((entry, index) => {
            if (!isRecord(entry)) return entry as JsonValue
            const group = groups.find((g) => g.packageIndex === index)
            return {
              ...entry,
              videos: group ? (group.videos as unknown as JsonValue) : (entry.videos ?? ([] as unknown as JsonValue)),
            } as JsonValue
          })
        : rawPkgDetails
      const nextBody = ({
        ...packagesShowcaseItem.body,
        items: nextItems as unknown as JsonValue,
        ...(nextPkgDetails !== undefined ? { packageDetails: nextPkgDetails as unknown as JsonValue } : {}),
      }) as unknown as typeof packagesShowcaseItem.body
      const updated = await updateContentDetail(packagesShowcaseItem.id, {
        contentType: packagesShowcaseItem.contentType,
        body: nextBody,
      })
      onCatalogUpdate(updated)
      setSaveMessage({ text: 'تم حفظ الفيديوهات بنجاح.', ok: true })
    } catch (err) {
      setSaveMessage({ text: err instanceof Error ? err.message : 'تعذر حفظ الفيديوهات.', ok: false })
    } finally {
      setSaving(false)
    }
  }

  if (!packagesShowcaseItem) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm" style={{ color: 'var(--brand-subtle)' }}>
        لم يتم العثور على بيانات الباقات.
      </div>
    )
  }

  return (
    <div
      className="flex flex-1 flex-col gap-6 overflow-y-auto p-6"
      dir="rtl"
      style={{ color: 'var(--brand-text)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-4 border-b pb-4"
        style={{ borderColor: 'var(--brand-border)' }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Alexandria, sans-serif', color: 'var(--brand-text)' }}>
            الفيديوهات
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--brand-subtle)' }}>
            أضف أو احذف فيديوهات الباقات
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg px-5 py-2 text-sm font-semibold transition disabled:opacity-50"
          style={{ background: 'var(--brand-teal)', color: '#fff' }}
        >
          {saving ? 'جاري الحفظ…' : 'حفظ'}
        </button>
      </div>

      {/* Save message */}
      {saveMessage ? (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{
            background: saveMessage.ok ? 'rgba(29,171,137,0.12)' : 'rgba(238,32,77,0.12)',
            color: saveMessage.ok ? 'var(--brand-teal)' : 'var(--brand-coral)',
            border: `1px solid ${saveMessage.ok ? 'rgba(29,171,137,0.25)' : 'rgba(238,32,77,0.25)'}`,
          }}
        >
          {saveMessage.text}
        </div>
      ) : null}

      {/* Upload progress */}
      {upload ? (
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--brand-panel-strong)', border: '1px solid var(--brand-border)' }}
        >
          <div className="mb-2 flex items-center justify-between text-sm">
            <span style={{ color: 'var(--brand-muted)' }}>جاري رفع: {upload.fileName}</span>
            <span className="font-semibold" style={{ color: 'var(--brand-violet)' }}>{upload.percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${upload.percent}%`, background: 'var(--brand-violet)' }}
            />
          </div>
        </div>
      ) : null}

      {/* Package groups */}
      {groups.map((group, groupIndex) => (
        <div
          key={group.packageIndex}
          className="rounded-xl p-5"
          style={{
            background: 'var(--brand-panel)',
            border: '1px solid var(--brand-border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <h2
            className="mb-4 text-base font-semibold"
            style={{ fontFamily: 'Alexandria, sans-serif', color: 'var(--brand-text)' }}
          >
            {group.packageTitle}
          </h2>

          <div className="mb-4 flex flex-col gap-3">
            {group.videos.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--brand-subtle)' }}>
                لا توجد فيديوهات لهذه الباقة.
              </p>
            ) : null}

            {group.videos.map((video, videoIndex) => (
              <div
                key={video.id}
                className="flex items-center gap-3 rounded-lg p-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--brand-border)' }}
              >
                {/* Video icon */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
                  style={{ background: 'rgba(160,149,208,0.12)', color: 'var(--brand-violet)' }}
                >
                  ▶
                </div>

                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  <input
                    type="text"
                    value={video.title}
                    onChange={(e) => handleTitleChange(groupIndex, videoIndex, e.target.value)}
                    placeholder="عنوان الفيديو"
                    className="w-full rounded-md border px-2 py-1 text-sm outline-none transition focus:ring-1"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--brand-border)',
                      color: 'var(--brand-text)',
                    }}
                  />
                  <span className="truncate text-xs" style={{ color: 'var(--brand-subtle)' }}>
                    {video.url || '(بدون رابط)'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveVideo(groupIndex, videoIndex)}
                  className="shrink-0 rounded-md px-2 py-1 text-xs font-medium transition hover:opacity-80"
                  style={{ background: 'rgba(238,32,77,0.12)', color: 'var(--brand-coral)' }}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>

          <input
            ref={(el) => { fileInputRefs.current[groupIndex] = el }}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleUpload(groupIndex, file)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            disabled={upload !== null}
            onClick={() => fileInputRefs.current[groupIndex]?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 text-sm font-medium transition hover:opacity-80 disabled:opacity-40"
            style={{ borderColor: 'var(--brand-violet)', color: 'var(--brand-violet)', background: 'rgba(160,149,208,0.08)' }}
          >
            <span>+</span>
            <span>رفع فيديو من الجهاز</span>
          </button>
        </div>
      ))}
    </div>
  )
}
