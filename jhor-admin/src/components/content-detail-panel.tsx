import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog, type ConfirmDialogRequest } from './confirm-dialog'
import { HtmlEditor } from './html-editor'
import { ImageLibraryModal } from './image-library-modal'
import {
  deleteImageAsset,
  fetchImages,
  resolveImageAssetUrl,
  updateImageAsset,
  uploadImageAsset,
  uploadVideoAsset,
  uploadVideoAssetWithProgress,
} from '../lib/content-api'
import type { ImageAsset } from '../types/image'
import type {
  ContentBody,
  ContentDetail,
  JsonPrimitive,
  JsonValue,
} from '../types/content'
import {
  cn,
  isRecord,
  titleizeFieldLabel,
} from '../lib/utils'

type DetailStatus = 'idle' | 'loading' | 'success' | 'error'
type SaveStatus = 'idle' | 'saving' | 'success' | 'error'
type PathSegment = string | number
type ImageLibraryStatus = 'idle' | 'loading' | 'success' | 'error'
type ImageActionStatus =
  | 'idle'
  | 'uploading'
  | 'saving'
  | 'deleting'
  | 'success'
  | 'error'

interface ContentDetailPanelProps {
  content: ContentDetail | null
  draftBody: ContentBody | null
  homeHeroSlides?: JsonValue[]
  status: DetailStatus
  error: string | null
  saveStatus: SaveStatus
  saveMessage: string | null
  onRetry: () => void
  onDraftChange: (nextBody: ContentBody) => void
  onResetDraft: () => void
  onSave: () => void
  onToggleProjectInHomeHero?: (
    project: JsonValue,
    index: number,
    shouldInclude: boolean,
  ) => Promise<void>
}

interface EditableNodeProps {
  label: string
  fieldKey?: string
  path: PathSegment[]
  value: JsonValue
  depth?: number
  categoryOptions?: BlogCategoryOption[]
  onCreateBlogCategoryAndSelect?: (
    path: PathSegment[],
    name: string,
    selectedIds: string[],
  ) => void
  onChange: (path: PathSegment[], value: JsonValue) => void
  onAppendArrayItem: (path: PathSegment[], template?: JsonValue) => void
  onRemoveArrayItem: (path: PathSegment[], index: number) => void
  onOpenImageManager: (
    path: PathSegment[],
    label: string,
    mode?: 'field' | 'html',
  ) => void
  onRequestDeleteConfirmation: (request: ConfirmDialogRequest) => void
}

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

interface ImageLibraryState {
  status: ImageLibraryStatus
  items: ImageAsset[]
  error: string | null
}

interface ImageActionState {
  status: ImageActionStatus
  message: string | null
  imageId: string | null
}

interface ActiveImageField {
  path: PathSegment[]
  label: string
  mode: 'field' | 'html'
}

interface ProjectCardProps {
  title: string
  subtitle: string
  imageSrc: string | null
  showImagePlaceholder?: boolean
  metaItems?: Array<{
    label: string
    value: string
  }>
  editLabel?: string
  deleteLabel?: string
  extraAction?: ReactNode
  onEdit: () => void
  onDelete: () => void
}

interface BlogCategoryOption {
  id: string
  name: string
}

interface BlogCommentItem {
  id: string
  userName: string
  date: string
  comment: string
}

type CollectionRouteSegment =
  | 'project'
  | 'gallery-item'
  | 'slide'
  | 'post'
  | 'service'
  | 'package'

interface CollectionEditorConfig {
  itemPath: PathSegment[]
  routeSegment: CollectionRouteSegment
  sectionTitle: string
  sectionDescription: string
  listBadge: string
  listTitle: string
  itemCountLabel: (count: number) => string
  addButtonLabel: string
  emptyListMessage: string
  editButtonLabel: string
  deleteButtonLabel: string
  backButtonLabel: string
  deleteConfirmMessage: (index: number) => string
  editorBadge: string
  editorDescription: string
  imageCaption: string
  missingItemTitle: string
  missingItemDescription: string
  missingItemActionLabel: string
  detailFallbackTitle: string
  otherEntriesPlacement: 'before' | 'after'
  resolveTitle: (item: JsonValue, index: number) => string
  resolveSubtitle: (item: JsonValue) => string
  resolveImage: (item: JsonValue) => string | null
  buildDefaultItem: (template?: JsonValue) => JsonValue
}

interface PackageEditorSectionConfig {
  title: string
  badge: string
  description: string
  path: PathSegment[]
  value: JsonValue
  imageCaption: string
}

const textareaFieldHints = [
  'description',
  'summary',
  'overview',
  'support',
  'quote',
  'excerpt',
  'lead',
  'note',
  'paragraph',
  'headline',
]

const imageFieldKeys = new Set([
  'image',
  'src',
  'coverImage',
  'previewImage',
  'background',
  'mobileBackground',
  'gif',
])
const htmlFieldKeys = new Set(['content', 'html', 'htmlContent'])
const ltrFieldKeys = new Set(['phone', 'email', 'href', 'to', 'url', 'slug'])
const videoFieldKeys = new Set(['url', 'videoUrl', 'video'])
const hiddenFieldKeys = new Set([
  'id',
  'widthClass',
  'imageWidthClass',
  'gifWidthClass',
  'enterDelay',
  'notes',
])

const objectFieldOrder: Record<string, number> = {
  previewImage: 10,
  background: 20,
  mobileBackground: 21,
  gallery: 20,
}

function generateRandomItemId() {
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID()
  }

  return `id-${Math.random().toString(36).slice(2, 10)}`
}

function buildStableCategoryId(name: string) {
  let hash = 0

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0
  }

  return `cat-${hash.toString(36)}`
}

function isLikelyUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function shouldIgnoreCategoryName(name: string, id?: string) {
  const normalizedName = name.trim()
  const normalizedId = (id || '').trim()

  if (!normalizedName) {
    return true
  }

  if (!isLikelyUuid(normalizedName)) {
    return false
  }

  return normalizedId.length === 0 || isLikelyUuid(normalizedId)
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeBlogCategoryOption(entry: JsonValue): BlogCategoryOption | null {
  if (typeof entry === 'string') {
    const name = entry.trim()

    if (shouldIgnoreCategoryName(name)) {
      return null
    }

    return {
      id: buildStableCategoryId(name),
      name,
    }
  }

  if (isRecord(entry)) {
    const name = typeof entry.name === 'string' ? entry.name.trim() : ''
    const rawId =
      typeof entry.id === 'string' && entry.id.trim()
        ? entry.id.trim()
        : ''

    if (shouldIgnoreCategoryName(name, rawId)) {
      return null
    }

    const id = rawId || buildStableCategoryId(name)

    return {
      id,
      name,
    }
  }

  return null
}

function normalizeBlogCategoryOptionsArray(entries: JsonValue[]) {
  const usedIds = new Set<string>()
  const usedNames = new Set<string>()
  const options: BlogCategoryOption[] = []

  for (const entry of entries) {
    const option = normalizeBlogCategoryOption(entry)

    if (!option) {
      continue
    }

    const normalizedName = option.name.toLowerCase()

    if (usedNames.has(normalizedName)) {
      continue
    }

    let resolvedId = option.id

    if (usedIds.has(resolvedId)) {
      resolvedId = `${resolvedId}-${options.length + 1}`
    }

    usedNames.add(normalizedName)
    usedIds.add(resolvedId)
    options.push({
      id: resolvedId,
      name: option.name,
    })
  }

  return options
}

function normalizeBlogCommentItem(entry: JsonValue): BlogCommentItem | null {
  if (!isRecord(entry)) {
    return null
  }

  const id =
    typeof entry.id === 'string' && entry.id.trim()
      ? entry.id.trim()
      : generateRandomItemId()
  const userName =
    typeof entry.userName === 'string'
      ? entry.userName
      : typeof entry.name === 'string'
        ? entry.name
        : ''
  const comment =
    typeof entry.comment === 'string'
      ? entry.comment
      : typeof entry.text === 'string'
        ? entry.text
        : ''
  const rawDate =
    typeof entry.date === 'string'
      ? entry.date.trim()
      : typeof entry.publishDate === 'string'
        ? entry.publishDate.trim()
        : ''
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : getTodayIsoDate()

  return {
    id,
    userName: userName.trim(),
    date,
    comment: comment.trim(),
  }
}

function normalizeBlogCommentsArray(entries: JsonValue[]) {
  const usedIds = new Set<string>()
  const comments: BlogCommentItem[] = []

  for (const entry of entries) {
    const commentItem = normalizeBlogCommentItem(entry)

    if (!commentItem) {
      continue
    }

    let resolvedId = commentItem.id

    if (usedIds.has(resolvedId)) {
      resolvedId = `${resolvedId}-${comments.length + 1}`
    }

    usedIds.add(resolvedId)
    comments.push({
      ...commentItem,
      id: resolvedId,
    })
  }

  return comments
}

function looksLikeImageSource(value: string) {
  return /^(https?:\/\/|\/)/.test(value)
}

function normalizeComparableText(value: string) {
  return value.trim().toLocaleLowerCase('ar')
}

function normalizeComparableSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

function shouldUseLtrInput(fieldKey?: string) {
  return fieldKey ? ltrFieldKeys.has(fieldKey) : false
}

function resolvePrimitiveInputType(fieldKey?: string) {
  if (fieldKey === 'publishDate' || fieldKey === 'date') {
    return 'date'
  }

  if (fieldKey === 'phone') {
    return 'tel'
  }

  if (fieldKey === 'email') {
    return 'email'
  }

  if (
    fieldKey === 'href' ||
    fieldKey === 'to' ||
    fieldKey === 'url' ||
    fieldKey === 'link'
  ) {
    return 'url'
  }

  return 'text'
}

function isImageFieldKey(fieldKey?: string) {
  return fieldKey ? imageFieldKeys.has(fieldKey) : false
}

function isHtmlFieldKey(fieldKey?: string) {
  return fieldKey ? htmlFieldKeys.has(fieldKey) : false
}

function isVideoFieldKey(fieldKey?: string) {
  return fieldKey ? videoFieldKeys.has(fieldKey) : false
}

function resolveVideoPreview(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const youtubeWatchMatch = trimmedValue.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/i,
  )

  if (youtubeWatchMatch?.[1]) {
    return {
      type: 'embed' as const,
      src: `https://www.youtube.com/embed/${youtubeWatchMatch[1]}`,
    }
  }

  const youtubeEmbedMatch = trimmedValue.match(/youtube\.com\/embed\/([\w-]{6,})/i)

  if (youtubeEmbedMatch?.[1]) {
    return {
      type: 'embed' as const,
      src: `https://www.youtube.com/embed/${youtubeEmbedMatch[1]}`,
    }
  }

  const vimeoMatch = trimmedValue.match(/vimeo\.com\/(\d+)/i)

  if (vimeoMatch?.[1]) {
    return {
      type: 'embed' as const,
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    }
  }

  if (
    /^(https?:\/\/|\/)/i.test(trimmedValue) &&
    /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(trimmedValue)
  ) {
    return {
      type: 'file' as const,
      src: trimmedValue,
    }
  }

  return null
}

function shouldUseTextarea(value: string, fieldKey?: string) {
  const normalizedKey = fieldKey?.toLowerCase() ?? ''

  if (normalizedKey === 'excerpt') {
    return false
  }

  return (
    value.length > 80 ||
    value.includes('\n') ||
    textareaFieldHints.some((hint) => normalizedKey.includes(hint))
  )
}

function buildDefaultArrayItem(template?: JsonValue): JsonValue {
  if (Array.isArray(template)) {
    return []
  }

  if (isRecord(template)) {
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => [
        key,
        key === 'id' ? generateRandomItemId() : buildDefaultArrayItem(value as JsonValue),
      ]),
    ) as JsonValue
  }

  if (typeof template === 'number') {
    return 0
  }

  if (typeof template === 'boolean') {
    return false
  }

  return ''
}

function buildDefaultStoryBlockItem(): JsonValue {
  return {
    title: '',
    description: '',
    image: '',
    video: '',
  } as JsonValue
}

function buildDefaultProjectItem(template?: JsonValue): JsonValue {
  if (isRecord(template)) {
    const nextItem = buildDefaultArrayItem(template)

    if (isRecord(nextItem)) {
      nextItem.storyBlocks = [buildDefaultStoryBlockItem()]
    }

    return nextItem
  }

  return {
    slug: '',
    number: '',
    title: '',
    category: '',
    client: '',
    listingDescription: '',
    overview: '',
    supportText: '',
    coverImage: '',
    storyBlocks: [buildDefaultStoryBlockItem()],
  } as JsonValue
}

function buildDefaultGalleryItem(template?: JsonValue): JsonValue {
  if (isRecord(template)) {
    return buildDefaultArrayItem(template)
  }

  return {
    id: crypto.randomUUID(),
    image: '',
    video: '',
  } as JsonValue
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildHtmlImageMarkup(imageUrl: string, altText?: string) {
  const escapedUrl = escapeHtmlAttribute(imageUrl)
  const escapedAlt = escapeHtmlAttribute(altText?.trim() || 'صورة')

  return `<p><img src="${escapedUrl}" alt="${escapedAlt}"></p>`
}

function buildDefaultBlogItem(template?: JsonValue): JsonValue {
  if (isRecord(template)) {
    const nextItem = buildDefaultArrayItem(template)

    if (isRecord(nextItem)) {
      if (
        !Object.prototype.hasOwnProperty.call(nextItem, 'category') ||
        !Array.isArray(nextItem.category)
      ) {
        nextItem.category = []
      }

      if (!Object.prototype.hasOwnProperty.call(nextItem, 'categoryIds')) {
        nextItem.categoryIds = []
      }

      if (!Object.prototype.hasOwnProperty.call(nextItem, 'publishDate')) {
        nextItem.publishDate = getTodayIsoDate()
      }

      if (!Object.prototype.hasOwnProperty.call(nextItem, 'tags')) {
        nextItem.tags = ''
      }
    }

    return nextItem
  }

  return {
    title: '',
    slug: '',
    category: [],
    categoryIds: [],
    publishDate: getTodayIsoDate(),
    excerpt: '',
    tags: '',
    coverImage: '',
    content: '<p></p>',
  } as JsonValue
}

function buildDefaultServiceItem(template?: JsonValue): JsonValue {
  if (isRecord(template)) {
    return buildDefaultArrayItem(template)
  }

  return {
    number: '',
    order: 0,
    title: '',
    description: '',
    image: '',
    chips: [],
    includesTitle: '',
    includes: [],
    closing: '',
  } as JsonValue
}

function applyValueAtPath(
  currentValue: ContentBody | JsonValue,
  path: PathSegment[],
  transform: (value: JsonValue) => JsonValue,
): ContentBody | JsonValue {
  if (path.length === 0) {
    return transform(currentValue as JsonValue)
  }

  const [segment, ...restPath] = path

  if (Array.isArray(currentValue) && typeof segment === 'number') {
    const nextValue = [...currentValue]
    const currentChild = (nextValue[segment] ?? '') as JsonValue

    nextValue[segment] =
      restPath.length === 0
        ? transform(currentChild)
        : (applyValueAtPath(currentChild, restPath, transform) as JsonValue)

    return nextValue
  }

  if (isRecord(currentValue) && typeof segment === 'string') {
    const nextValue = { ...currentValue }
    const currentChild = (nextValue[segment] ?? '') as JsonValue

    nextValue[segment] =
      restPath.length === 0
        ? transform(currentChild)
        : (applyValueAtPath(currentChild, restPath, transform) as JsonValue)

    return nextValue as ContentBody
  }

  return currentValue
}

function getValueAtPath(
  currentValue: ContentBody | JsonValue | null,
  path: PathSegment[],
): JsonValue | null {
  if (!currentValue) {
    return null
  }

  let pointer: ContentBody | JsonValue | null = currentValue

  for (const segment of path) {
    if (Array.isArray(pointer) && typeof segment === 'number') {
      pointer = (pointer[segment] ?? null) as JsonValue | null
      continue
    }

    if (isRecord(pointer) && typeof segment === 'string') {
      pointer = (pointer[segment] ?? null) as JsonValue | null
      continue
    }

    return null
  }

  return pointer as JsonValue | null
}

function resolveCollectionPathKey(path: PathSegment[]) {
  return path.map((segment) => String(segment)).join('.')
}

function resolveCollectionRootKey(path: PathSegment[]) {
  const [firstSegment] = path

  return typeof firstSegment === 'string' ? firstSegment : null
}


function ImageCard({
  src,
  alt,
  caption,
}: {
  src: string
  alt?: string
  caption: string
}) {
  return (
    <div className="max-w-[180px] overflow-hidden rounded-[20px] border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_14px_32px_rgba(5,5,19,0.18)]">
      <div className="aspect-[4/3] bg-[rgba(255,255,255,0.03)] p-1.5">
        <img
          src={src}
          alt={alt || caption}
          className="h-full w-full rounded-[14px] object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium text-[var(--brand-text)]">{caption}</p>
      </div>
    </div>
  )
}

function ProjectCard({
  title,
  subtitle,
  imageSrc,
  showImagePlaceholder = true,
  metaItems = [],
  editLabel = 'تعديل المشروع',
  deleteLabel = 'حذف',
  extraAction = null,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-[rgba(160,149,208,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_18px_45px_rgba(5,5,19,0.2)]">
      {imageSrc || showImagePlaceholder ? (
        <div className="aspect-[16/9] bg-[rgba(255,255,255,0.03)] p-2">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={title}
              className="h-full w-full rounded-[18px] object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-[18px] border border-dashed border-[color:var(--brand-border)] text-sm text-[var(--brand-subtle)]">
              لا توجد صورة
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--brand-text)]">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-7 text-[var(--brand-muted)]">
            {subtitle}
          </p>
        </div>

        {metaItems.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {metaItems.map((metaItem) => (
              <div
                key={`${metaItem.label}-${metaItem.value}`}
                className="rounded-[16px] border border-[rgba(160,149,208,0.14)] bg-black/10 px-3 py-2"
              >
                <p className="text-[11px] text-[var(--brand-subtle)]">
                  {metaItem.label}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--brand-text)]">
                  {metaItem.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-[16px] bg-[var(--brand-teal)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
          >
            {editLabel}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-[16px] border border-[rgba(238,32,77,0.28)] bg-[rgba(238,32,77,0.08)] px-4 py-2 text-sm font-medium text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.14)]"
          >
            {deleteLabel}
          </button>
          {extraAction}
        </div>
      </div>
    </article>
  )
}

function resolveProjectTitle(project: JsonValue, index: number) {
  if (isRecord(project) && typeof project.title === 'string' && project.title.trim()) {
    return project.title
  }

  return `مشروع ${index + 1}`
}

function resolveProjectSubtitle(project: JsonValue) {
  if (isRecord(project)) {
    const client =
      typeof project.client === 'string' && project.client.trim()
        ? project.client
        : null
    const category =
      typeof project.category === 'string' && project.category.trim()
        ? project.category
        : null

    if (client && category) {
      return `${client} • ${category}`
    }

    if (client || category) {
      return client || category || 'بيانات المشروع'
    }
  }

  return 'بيانات المشروع'
}

function resolveProjectImage(project: JsonValue) {
  if (!isRecord(project)) {
    return null
  }

  if (
    typeof project.coverImage === 'string' &&
    looksLikeImageSource(project.coverImage)
  ) {
    return project.coverImage
  }

  if (typeof project.image === 'string' && looksLikeImageSource(project.image)) {
    return project.image
  }

  if (Array.isArray(project.storyBlocks)) {
    for (const block of project.storyBlocks) {
      if (
        isRecord(block) &&
        typeof block.image === 'string' &&
        looksLikeImageSource(block.image)
      ) {
        return block.image
      }
    }
  }

  return null
}

function isProjectLinkedToHomeHeroSlide(project: JsonValue, slide: JsonValue) {
  if (!isRecord(project) || !isRecord(slide)) {
    return false
  }

  const projectSlugRaw =
    typeof project.slug === 'string' ? project.slug.trim() : ''
  const projectSlug = projectSlugRaw
    ? normalizeComparableSlug(projectSlugRaw)
    : ''
  const slideSourceSlugRaw =
    typeof slide.sourceProjectSlug === 'string' ? slide.sourceProjectSlug.trim() : ''
  const slideSourceSlug = slideSourceSlugRaw
    ? normalizeComparableSlug(slideSourceSlugRaw)
    : ''

  if (projectSlug && slideSourceSlug && projectSlug === slideSourceSlug) {
    return true
  }

  const projectImage = resolveProjectImage(project)
  const slideImage =
    typeof slide.image === 'string' && looksLikeImageSource(slide.image)
      ? slide.image.trim()
      : ''
  const projectTitle = normalizeComparableText(resolveProjectTitle(project, 0))
  const slideBrand =
    typeof slide.brand === 'string'
      ? normalizeComparableText(slide.brand)
      : ''

  if (projectImage && slideImage && projectImage.trim() === slideImage) {
    if (slideBrand && slideBrand === projectTitle) {
      return true
    }
  }

  return false
}

function isProjectInHomeHero(project: JsonValue, homeHeroSlides: JsonValue[]) {
  return homeHeroSlides.some((slide) =>
    isProjectLinkedToHomeHeroSlide(project, slide),
  )
}

function resolveGalleryTitle(item: JsonValue, index: number) {
  if (isRecord(item)) {
    if (typeof item.brand === 'string' && item.brand.trim()) {
      return item.brand
    }

    if (typeof item.subtitle === 'string' && item.subtitle.trim()) {
      return item.subtitle
    }

    if (typeof item.alt === 'string' && item.alt.trim()) {
      return item.alt
    }
  }

  return `عمل ${index + 1}`
}

function resolveGallerySubtitle(item: JsonValue) {
  if (isRecord(item)) {
    const subtitle =
      typeof item.subtitle === 'string' && item.subtitle.trim()
        ? item.subtitle
        : null
    const alt =
      typeof item.alt === 'string' && item.alt.trim()
        ? item.alt
        : null

    if (subtitle && alt && subtitle !== alt) {
      return `${subtitle} • ${alt}`
    }

    if (subtitle || alt) {
      return subtitle || alt || 'بيانات العمل'
    }
  }

  return 'بيانات العمل'
}

function resolveGalleryImage(item: JsonValue) {
  if (!isRecord(item)) {
    return null
  }

  if (typeof item.image === 'string' && looksLikeImageSource(item.image)) {
    return item.image
  }

  if (typeof item.src === 'string' && looksLikeImageSource(item.src)) {
    return item.src
  }

  return null
}

function normalizeGalleryEditorItem(item: JsonValue) {
  if (!isRecord(item)) {
    return item
  }

  const normalizedImage =
    typeof item.image === 'string'
      ? item.image
      : typeof item.src === 'string'
        ? item.src
        : ''

  const normalizedVideo = typeof item.video === 'string' ? item.video : ''

  return {
    id:
      typeof item.id === 'string' && item.id.trim()
        ? item.id
        : crypto.randomUUID(),
    image: normalizedImage,
    video: normalizedVideo,
  } as JsonValue
}

// Injects the optional per-stage link fields so they always appear in the
// editor (empty by default → no button shown on the site).
function normalizeStepEditorItem(item: JsonValue) {
  if (!isRecord(item)) {
    return item
  }

  return {
    ...item,
    link: typeof item.link === 'string' ? item.link : '',
    linkLabel: typeof item.linkLabel === 'string' ? item.linkLabel : '',
  } as JsonValue
}

function resolveBlogTitle(item: JsonValue, index: number) {
  if (isRecord(item)) {
    if (typeof item.title === 'string' && item.title.trim()) {
      return item.title
    }

    if (typeof item.slug === 'string' && item.slug.trim()) {
      return item.slug
    }
  }

  return `مقالة ${index + 1}`
}

function resolveBlogSubtitle(item: JsonValue) {
  if (isRecord(item)) {
    const slug =
      typeof item.slug === 'string' && item.slug.trim()
        ? `/${item.slug.trim()}`
        : null
    const category =
      Array.isArray(item.category) && item.category.length > 0
        ? `${item.category.length} تصنيف`
        : Array.isArray(item.categoryIds) && item.categoryIds.length > 0
          ? `${item.categoryIds.length} تصنيف`
          : null
    const excerpt =
      typeof item.excerpt === 'string' && item.excerpt.trim()
        ? item.excerpt.trim()
        : null
    const publishDate =
      typeof item.publishDate === 'string' && item.publishDate.trim()
        ? item.publishDate.trim()
        : null

    const parts = [slug, category, publishDate, excerpt].filter(
      (part): part is string => Boolean(part),
    )

    if (parts.length > 0) {
      return parts.join(' • ')
    }
  }

  return 'بيانات المقالة'
}

function resolveBlogImage(item: JsonValue) {
  if (!isRecord(item)) {
    return null
  }

  if (
    typeof item.coverImage === 'string' &&
    looksLikeImageSource(item.coverImage)
  ) {
    return item.coverImage
  }

  if (typeof item.image === 'string' && looksLikeImageSource(item.image)) {
    return item.image
  }

  return null
}

function resolveServiceTitle(item: JsonValue, index: number) {
  if (isRecord(item)) {
    if (typeof item.title === 'string' && item.title.trim()) {
      return item.title
    }

    if (typeof item.label === 'string' && item.label.trim()) {
      return item.label
    }
  }

  return `خدمة ${index + 1}`
}

function resolveServiceSubtitle(item: JsonValue) {
  if (!isRecord(item)) {
    return 'بيانات الخدمة'
  }

  const numberOrOrder =
    typeof item.number === 'string' && item.number.trim()
      ? `رقم ${item.number.trim()}`
      : typeof item.order === 'number'
        ? `ترتيب ${item.order}`
        : null

  const description =
    typeof item.description === 'string' && item.description.trim()
      ? item.description.trim()
      : null

  if (numberOrOrder && description) {
    return `${numberOrOrder} • ${description}`
  }

  return numberOrOrder || description || 'بيانات الخدمة'
}

function resolveServiceImage(item: JsonValue) {
  if (!isRecord(item)) {
    return null
  }

  if (typeof item.image === 'string' && looksLikeImageSource(item.image)) {
    return item.image
  }

  if (
    typeof item.coverImage === 'string' &&
    looksLikeImageSource(item.coverImage)
  ) {
    return item.coverImage
  }

  if (typeof item.gif === 'string' && looksLikeImageSource(item.gif)) {
    return item.gif
  }

  return null
}

function resolveGenericCardTitle(item: JsonValue, index: number, fallbackLabel: string) {
  if (isRecord(item)) {
    const keys = ['title', 'label', 'name', 'brand', 'headline', 'slug']

    for (const key of keys) {
      const value = item[key]

      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
  }

  if (typeof item === 'string' && item.trim()) {
    return item.trim()
  }

  if (typeof item === 'number') {
    return `${fallbackLabel} ${item}`
  }

  return `${fallbackLabel} ${index + 1}`
}

function resolveGenericCardSubtitle(item: JsonValue) {
  if (isRecord(item)) {
    const keys = ['description', 'subtitle', 'excerpt', 'summary', 'category']

    for (const key of keys) {
      const value = item[key]

      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }

    const childCount = Object.keys(item).length
    return `${childCount} حقل`
  }

  if (typeof item === 'string' && item.trim()) {
    return 'عنصر نصي قصير'
  }

  if (typeof item === 'number') {
    return `قيمة رقمية: ${item}`
  }

  if (typeof item === 'boolean') {
    return item ? 'القيمة: نعم' : 'القيمة: لا'
  }

  if (item === null) {
    return 'قيمة فارغة'
  }

  return 'بيانات العنصر'
}

function resolveGenericCardImage(item: JsonValue) {
  if (!isRecord(item)) {
    return null
  }

  const candidateKeys = ['image', 'src', 'coverImage', 'background']

  for (const key of candidateKeys) {
    const value = item[key]

    if (typeof value === 'string' && looksLikeImageSource(value)) {
      return value
    }
  }

  return null
}

function countNestedPackageCards(item: JsonValue): number {
  if (!isRecord(item)) {
    return 0
  }

  const saleTiers = Array.isArray(item.saleTiers)
    ? (item.saleTiers as JsonValue[])
    : null

  if (saleTiers) {
    return saleTiers.reduce<number>((total, tier) => {
      if (!isRecord(tier) || !Array.isArray(tier.cards)) {
        return total
      }

      return total + tier.cards.length
    }, 0)
  }

  return Array.isArray(item.cards) ? item.cards.length : 0
}

function countNestedPackageGalleryImages(item: JsonValue): number {
  if (!isRecord(item)) {
    return 0
  }

  const saleTiers = Array.isArray(item.saleTiers)
    ? (item.saleTiers as JsonValue[])
    : null

  if (saleTiers) {
    return saleTiers.reduce<number>((total, tier) => {
      if (!isRecord(tier) || !Array.isArray(tier.gallery)) {
        return total
      }

      return total + tier.gallery.length
    }, 0)
  }

  return Array.isArray(item.gallery) ? item.gallery.length : 0
}

function countPackageVideos(item: JsonValue): number {
  if (!isRecord(item)) {
    return 0
  }

  let total = Array.isArray(item.videos) ? item.videos.length : 0
  const saleTiers = Array.isArray(item.saleTiers)
    ? (item.saleTiers as JsonValue[])
    : null

  if (saleTiers) {
    total += saleTiers.reduce<number>((tierTotal, tier) => {
      if (!isRecord(tier) || !Array.isArray(tier.cards)) {
        return tierTotal
      }

      return (
        tierTotal +
        tier.cards.filter(
          (card) =>
            isRecord(card) &&
            typeof card.video === 'string' &&
            card.video.trim().length > 0,
        ).length
      )
    }, 0)
  }

  return total
}

function resolvePackageMetaItems(
  item: JsonValue,
): Array<{ label: string; value: string }> {
  if (!isRecord(item)) {
    return [] as Array<{ label: string; value: string }>
  }

  const packagePath =
    typeof item.path === 'string' && item.path.trim() ? item.path.trim() : null
  const plansCount = Array.isArray(item.saleTiersSummary)
    ? item.saleTiersSummary.length
    : Array.isArray(item.saleTiers)
      ? item.saleTiers.length
      : 0
  const cardsCount = countNestedPackageCards(item)
  const galleryCount = countNestedPackageGalleryImages(item)
  const videosCount = countPackageVideos(item)

  return [
    packagePath ? { label: 'المسار', value: packagePath } : null,
    plansCount > 0 ? { label: 'الخطط', value: `${plansCount}` } : null,
    cardsCount > 0 ? { label: 'الكروت', value: `${cardsCount}` } : null,
    galleryCount > 0 ? { label: 'الصور', value: `${galleryCount}` } : null,
    videosCount > 0 ? { label: 'الفيديوهات', value: `${videosCount}` } : null,
  ].filter(
    (metaItem): metaItem is { label: string; value: string } => metaItem !== null,
  )
}

function resolveBlogCollectionPath(body?: ContentBody) {
  const candidatePaths = ['posts', 'items', 'articles']

  for (const candidate of candidatePaths) {
    if (Array.isArray(body?.[candidate])) {
      return candidate
    }
  }

  return 'items'
}

function resolveBlogCategoryOptions(body?: ContentBody) {
  const categories = body?.categories
  const draftEntries: JsonValue[] = []

  if (Array.isArray(categories)) {
    draftEntries.push(...(categories as JsonValue[]))
  }

  const blogItems = body?.[resolveBlogCollectionPath(body)]

  if (Array.isArray(blogItems)) {
    for (const blogItem of blogItems) {
      if (!isRecord(blogItem)) {
        continue
      }

      if (Array.isArray(blogItem.category)) {
        draftEntries.push(...(blogItem.category as JsonValue[]))
        continue
      }

      if (typeof blogItem.category === 'string' && blogItem.category.trim()) {
        draftEntries.push({
          id: buildStableCategoryId(blogItem.category.trim()),
          name: blogItem.category.trim(),
        } as JsonValue)
        continue
      }

      if (isRecord(blogItem.category)) {
        draftEntries.push(blogItem.category as JsonValue)
      }
    }
  }

  return normalizeBlogCategoryOptionsArray(draftEntries)
}

function resolveCollectionEditorConfig(
  sectionKey?: string,
  body?: ContentBody,
): CollectionEditorConfig | null {
  if (sectionKey === 'works_projects') {
    return {
      itemPath: ['projects'],
      routeSegment: 'project',
      sectionTitle: 'إدارة المشاريع',
      sectionDescription:
        'قائمة كاردات للمشاريع مع إمكانية إضافة مشروع جديد أو فتح صفحة تعديل مستقلة لكل مشروع.',
      listBadge: 'المشاريع',
      listTitle: 'قائمة المشاريع',
      itemCountLabel: (count) =>
        count > 0
          ? `${count} مشروع جاهز للتعديل.`
          : 'لا توجد مشاريع حالياً، ويمكنك إضافة أول مشروع من هنا.',
      addButtonLabel: 'إضافة مشروع',
      emptyListMessage: 'أضف مشروعاً جديداً ليظهر هنا ضمن الكروت.',
      editButtonLabel: 'تعديل المشروع',
      deleteButtonLabel: 'حذف المشروع',
      backButtonLabel: 'العودة للمشاريع',
      deleteConfirmMessage: (index) =>
        `سيتم حذف المشروع رقم ${index + 1}. هل تريد المتابعة؟`,
      editorBadge: 'محرر المشروع',
      editorDescription:
        'صفحة تعديل مستقلة للمشروع الحالي. بعد الانتهاء اضغط حفظ التعديلات لتثبيت التغييرات على الخادم.',
      imageCaption: 'صورة المشروع',
      missingItemTitle: 'تعذر العثور على المشروع',
      missingItemDescription:
        'المشروع المطلوب غير موجود أو تم حذفه من القائمة.',
      missingItemActionLabel: 'العودة إلى المشاريع',
      detailFallbackTitle: 'المشروع',
      otherEntriesPlacement: 'after',
      resolveTitle: resolveProjectTitle,
      resolveSubtitle: resolveProjectSubtitle,
      resolveImage: resolveProjectImage,
      buildDefaultItem: buildDefaultProjectItem,
    }
  }

  if (sectionKey === 'works_gallery') {
    return {
      itemPath: ['items'],
      routeSegment: 'gallery-item',
      sectionTitle: 'إدارة معرض الأعمال',
      sectionDescription:
        'نفس منطق صفحة الأعمال: حقول تمهيدية للقسم ثم كروت للأعمال مع صفحة تعديل مستقلة لكل عنصر.',
      listBadge: 'معرض الأعمال',
      listTitle: 'بطاقات الأعمال',
      itemCountLabel: (count) =>
        count > 0
          ? `${count} عمل جاهز للتعديل.`
          : 'لا توجد أعمال حالياً، ويمكنك إضافة أول عمل من هنا.',
      addButtonLabel: 'إضافة عمل',
      emptyListMessage: 'أضف عملاً جديداً ليظهر هنا ضمن الكروت.',
      editButtonLabel: 'تعديل العمل',
      deleteButtonLabel: 'حذف العمل',
      backButtonLabel: 'العودة للمعرض',
      deleteConfirmMessage: (index) =>
        `سيتم حذف العمل رقم ${index + 1}. هل تريد المتابعة؟`,
      editorBadge: 'محرر العمل',
      editorDescription:
        'صفحة تعديل مستقلة لعنصر المعرض الحالي. بعد الانتهاء اضغط حفظ التعديلات لتثبيت التغييرات على الخادم.',
      imageCaption: 'صورة العمل',
      missingItemTitle: 'تعذر العثور على العمل',
      missingItemDescription:
        'العنصر المطلوب غير موجود أو تم حذفه من المعرض.',
      missingItemActionLabel: 'العودة إلى المعرض',
      detailFallbackTitle: 'العمل',
      otherEntriesPlacement: 'before',
      resolveTitle: resolveGalleryTitle,
      resolveSubtitle: resolveGallerySubtitle,
      resolveImage: resolveGalleryImage,
      buildDefaultItem: buildDefaultGalleryItem,
    }
  }

  if (sectionKey === 'blog_preview') {
    return {
      itemPath: [resolveBlogCollectionPath(body)],
      routeSegment: 'post',
      sectionTitle: 'إدارة مقالات المدونة',
      sectionDescription:
        'قائمة المقالات مع صفحة تعديل مستقلة لكل مقالة، تشمل slug ومحرر HTML احترافي للمحتوى.',
      listBadge: 'المقالات',
      listTitle: 'مقالات المدونة',
      itemCountLabel: (count) =>
        count > 0
          ? `${count} مقالة جاهزة للتعديل.`
          : 'لا توجد مقالات حالياً، ويمكنك إضافة أول مقالة من هنا.',
      addButtonLabel: 'إضافة مقالة',
      emptyListMessage: 'أضف مقالة جديدة لتظهر هنا ضمن قائمة المدونة.',
      editButtonLabel: 'تعديل المقالة',
      deleteButtonLabel: 'حذف المقالة',
      backButtonLabel: 'العودة للمقالات',
      deleteConfirmMessage: (index) =>
        `سيتم حذف المقالة رقم ${index + 1}. هل تريد المتابعة؟`,
      editorBadge: 'محرر المقالة',
      editorDescription:
        'عدّل عنوان المقالة و slug والمحتوى بصيغة HTML، ثم احفظ التغييرات لتثبيتها على الخادم.',
      imageCaption: 'صورة المقالة',
      missingItemTitle: 'تعذر العثور على المقالة',
      missingItemDescription:
        'المقالة المطلوبة غير موجودة أو تم حذفها من القائمة.',
      missingItemActionLabel: 'العودة للمقالات',
      detailFallbackTitle: 'المقالة',
      otherEntriesPlacement: 'before',
      resolveTitle: resolveBlogTitle,
      resolveSubtitle: resolveBlogSubtitle,
      resolveImage: resolveBlogImage,
      buildDefaultItem: buildDefaultBlogItem,
    }
  }

  if (sectionKey === 'home_hero') {
    return {
      itemPath: ['slides'],
      routeSegment: 'slide',
      sectionTitle: 'إدارة شرائح الهيرو',
      sectionDescription:
        'تمهيد الهيرو بالأعلى، وتحته نفس منطق الأعمال: كروت للشرائح مع صفحة تعديل مستقلة لكل شريحة.',
      listBadge: 'الشرائح',
      listTitle: 'شرائح هيرو الرئيسية',
      itemCountLabel: (count) =>
        count > 0
          ? `${count} شريحة جاهزة للتعديل.`
          : 'لا توجد شرائح حالياً، ويمكنك إضافة أول شريحة من هنا.',
      addButtonLabel: 'إضافة شريحة',
      emptyListMessage: 'أضف شريحة جديدة لتظهر هنا ضمن الكروت.',
      editButtonLabel: 'تعديل الشريحة',
      deleteButtonLabel: 'حذف الشريحة',
      backButtonLabel: 'العودة للشرائح',
      deleteConfirmMessage: (index) =>
        `سيتم حذف الشريحة رقم ${index + 1}. هل تريد المتابعة؟`,
      editorBadge: 'محرر الشريحة',
      editorDescription:
        'صفحة تعديل مستقلة للشريحة الحالية. بعد الانتهاء اضغط حفظ التعديلات لتثبيت التغييرات على الخادم.',
      imageCaption: 'صورة الشريحة',
      missingItemTitle: 'تعذر العثور على الشريحة',
      missingItemDescription:
        'الشريحة المطلوبة غير موجودة أو تم حذفها من القائمة.',
      missingItemActionLabel: 'العودة إلى الشرائح',
      detailFallbackTitle: 'الشريحة',
      otherEntriesPlacement: 'before',
      resolveTitle: resolveGalleryTitle,
      resolveSubtitle: resolveGallerySubtitle,
      resolveImage: resolveGalleryImage,
      buildDefaultItem: buildDefaultGalleryItem,
    }
  }

  if (sectionKey === 'home_services_reveal') {
    return {
      itemPath: ['serviceLines'],
      routeSegment: 'service',
      sectionTitle: 'إدارة سطور الخدمات المتحركة',
      sectionDescription:
        'تعديل مباشر على سطور الخدمات الخاصة بالسكشن التفاعلي في الصفحة الرئيسية، مع كارد مستقل لكل سطر.',
      listBadge: 'السطور',
      listTitle: 'سطور خدمات الهوم',
      itemCountLabel: (count) =>
        count > 0
          ? `${count} سطر جاهز للتعديل.`
          : 'لا توجد سطور حالياً، ويمكنك إضافة أول سطر من هنا.',
      addButtonLabel: 'إضافة سطر خدمة',
      emptyListMessage: 'أضف سطراً جديداً ليظهر هنا ضمن الكروت.',
      editButtonLabel: 'تعديل السطر',
      deleteButtonLabel: 'حذف السطر',
      backButtonLabel: 'العودة للسطور',
      deleteConfirmMessage: (index) =>
        `سيتم حذف السطر رقم ${index + 1}. هل تريد المتابعة؟`,
      editorBadge: 'محرر السطر',
      editorDescription:
        'عدّل النصوص والصورة والعبارات المتحركة لهذا السطر، ثم احفظ التغييرات.',
      imageCaption: 'صورة السطر',
      missingItemTitle: 'تعذر العثور على السطر',
      missingItemDescription:
        'السطر المطلوب غير موجود أو تم حذفه من القائمة.',
      missingItemActionLabel: 'العودة إلى السطور',
      detailFallbackTitle: 'السطر',
      otherEntriesPlacement: 'before',
      resolveTitle: resolveServiceTitle,
      resolveSubtitle: resolveServiceSubtitle,
      resolveImage: resolveServiceImage,
      buildDefaultItem: buildDefaultServiceItem,
    }
  }

  if (sectionKey === 'services_hero') {
    return {
      itemPath: ['servicesOverview', 'items'],
      routeSegment: 'service',
      sectionTitle: 'إدارة خدمات الصفحة',
      sectionDescription:
        'قائمة كروت للخدمات مع صفحة تعديل مستقلة لكل خدمة حتى تعدّل أو تضيف أي خدمة بشكل منفصل.',
      listBadge: 'الخدمات',
      listTitle: 'خدمات صفحة الخدمات',
      itemCountLabel: (count) =>
        count > 0
          ? `${count} خدمة جاهزة للتعديل.`
          : 'لا توجد خدمات حالياً، ويمكنك إضافة أول خدمة من هنا.',
      addButtonLabel: 'إضافة خدمة',
      emptyListMessage: 'أضف خدمة جديدة لتظهر هنا ضمن الكروت.',
      editButtonLabel: 'تعديل الخدمة',
      deleteButtonLabel: 'حذف الخدمة',
      backButtonLabel: 'العودة للخدمات',
      deleteConfirmMessage: (index) =>
        `سيتم حذف الخدمة رقم ${index + 1}. هل تريد المتابعة؟`,
      editorBadge: 'محرر الخدمة',
      editorDescription:
        'صفحة مستقلة لتعديل الخدمة الحالية. بعد الانتهاء اضغط حفظ التعديلات لتثبيت التغييرات.',
      imageCaption: 'صورة الخدمة',
      missingItemTitle: 'تعذر العثور على الخدمة',
      missingItemDescription:
        'الخدمة المطلوبة غير موجودة أو تم حذفها من القائمة.',
      missingItemActionLabel: 'العودة إلى الخدمات',
      detailFallbackTitle: 'الخدمة',
      otherEntriesPlacement: 'before',
      resolveTitle: resolveServiceTitle,
      resolveSubtitle: resolveServiceSubtitle,
      resolveImage: resolveServiceImage,
      buildDefaultItem: buildDefaultServiceItem,
    }
  }

  if (sectionKey === 'featured_services') {
    return {
      itemPath: ['items'],
      routeSegment: 'service',
      sectionTitle: 'إدارة الخدمات المشتركة',
      sectionDescription:
        'كروت للخدمات المشتركة مع إمكانية تعديل كل خدمة لوحدها بدل تعديل القائمة بالكامل.',
      listBadge: 'الخدمات المشتركة',
      listTitle: 'بطاقات الخدمات',
      itemCountLabel: (count) =>
        count > 0
          ? `${count} خدمة جاهزة للتعديل.`
          : 'لا توجد خدمات حالياً، ويمكنك إضافة أول خدمة من هنا.',
      addButtonLabel: 'إضافة خدمة',
      emptyListMessage: 'أضف خدمة جديدة لتظهر هنا ضمن الكروت.',
      editButtonLabel: 'تعديل الخدمة',
      deleteButtonLabel: 'حذف الخدمة',
      backButtonLabel: 'العودة للخدمات',
      deleteConfirmMessage: (index) =>
        `سيتم حذف الخدمة رقم ${index + 1}. هل تريد المتابعة؟`,
      editorBadge: 'محرر الخدمة',
      editorDescription:
        'تعديل مستقل للخدمة الحالية ضمن القسم المشترك. بعد الانتهاء احفظ التعديلات.',
      imageCaption: 'صورة الخدمة',
      missingItemTitle: 'تعذر العثور على الخدمة',
      missingItemDescription:
        'الخدمة المطلوبة غير موجودة أو تم حذفها من القائمة.',
      missingItemActionLabel: 'العودة إلى الخدمات',
      detailFallbackTitle: 'الخدمة',
      otherEntriesPlacement: 'before',
      resolveTitle: resolveServiceTitle,
      resolveSubtitle: resolveServiceSubtitle,
      resolveImage: resolveServiceImage,
      buildDefaultItem: buildDefaultServiceItem,
    }
  }

  if (sectionKey === 'packages_showcase') {
    const packageCollectionPath = Array.isArray(body?.packageDetails)
      ? (['packageDetails'] as PathSegment[])
      : (['items'] as PathSegment[])

    return {
      itemPath: packageCollectionPath,
      routeSegment: 'package',
      sectionTitle: 'إدارة الباقات',
      sectionDescription:
        'كل باقة قابلة للتعديل من صفحة مستقلة، مع إمكانية إضافة باقات جديدة أو حذف أي باقة.',
      listBadge: 'الباقات',
      listTitle: 'قائمة الباقات',
      itemCountLabel: (count) =>
        count > 0
          ? `${count} باقة جاهزة للتعديل.`
          : 'لا توجد باقات حالياً، ويمكنك إضافة أول باقة من هنا.',
      addButtonLabel: 'إضافة باقة',
      emptyListMessage: 'أضف باقة جديدة لتظهر هنا ضمن الكروت.',
      editButtonLabel: 'تعديل الباقة',
      deleteButtonLabel: 'حذف الباقة',
      backButtonLabel: 'العودة للباقات',
      deleteConfirmMessage: (index) =>
        `سيتم حذف الباقة رقم ${index + 1}. هل تريد المتابعة؟`,
      editorBadge: 'محرر الباقة',
      editorDescription:
        'تعديل مستقل للباقة الحالية. بعد الانتهاء اضغط حفظ التعديلات لتثبيت البيانات.',
      imageCaption: 'صورة الباقة',
      missingItemTitle: 'تعذر العثور على الباقة',
      missingItemDescription:
        'الباقة المطلوبة غير موجودة أو تم حذفها من القائمة.',
      missingItemActionLabel: 'العودة إلى الباقات',
      detailFallbackTitle: 'الباقة',
      otherEntriesPlacement: 'before',
      resolveTitle: (item, index) =>
        resolveGenericCardTitle(item, index, 'الباقة'),
      resolveSubtitle: resolveGenericCardSubtitle,
      resolveImage: resolveGenericCardImage,
      buildDefaultItem: buildDefaultArrayItem,
    }
  }

  return null
}

function FieldCard({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="rounded-[20px] border border-[rgba(160,149,208,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="mb-2 inline-flex rounded-full border border-[rgba(160,149,208,0.16)] bg-black/10 px-2.5 py-1 text-[11px] text-[var(--brand-violet)]">
        {label}
      </div>
      {children}
    </div>
  )
}

function resolvePackageEditorImage(value: JsonValue) {
  if (!isRecord(value)) {
    return null
  }

  const imageCandidates = ['coverImage', 'previewImage', 'image', 'background']

  for (const key of imageCandidates) {
    const candidate = value[key]
    if (typeof candidate === 'string' && looksLikeImageSource(candidate)) {
      return candidate
    }
  }

  return null
}

function CategoryDefinitionsEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: JsonValue[]
  onChange: (value: JsonValue) => void
}) {
  const [nextCategoryName, setNextCategoryName] = useState('')
  const categories = normalizeBlogCategoryOptionsArray(value)

  function handleAddCategory() {
    const trimmedName = nextCategoryName.trim()

    if (!trimmedName) {
      return
    }

    const existsByName = categories.some(
      (category) => category.name.toLowerCase() === trimmedName.toLowerCase(),
    )

    if (existsByName) {
      setNextCategoryName('')
      return
    }

    onChange(
      [
        ...categories,
        {
          id: generateRandomItemId(),
          name: trimmedName,
        },
      ] as unknown as JsonValue,
    )
    setNextCategoryName('')
  }

  function handleUpdateCategoryName(index: number, nextName: string) {
    const nextCategories = [...categories]
    nextCategories[index] = {
      ...nextCategories[index],
      name: nextName,
    }
    onChange(nextCategories as unknown as JsonValue)
  }

  function handleRemoveCategory(index: number) {
    onChange(
      categories.filter((_, itemIndex) => itemIndex !== index) as unknown as JsonValue,
    )
  }

  return (
    <FieldCard label={label}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={nextCategoryName}
            onChange={(event) => setNextCategoryName(event.target.value)}
            placeholder="اكتب اسم تصنيف جديد"
            className="min-w-[200px] flex-1 rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="rounded-[16px] border border-[rgba(29,171,137,0.3)] bg-[rgba(29,171,137,0.1)] px-3 py-2 text-xs font-medium text-[var(--brand-teal)] transition hover:bg-[rgba(29,171,137,0.16)]"
          >
            إضافة تصنيف
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[color:var(--brand-border)] px-3 py-2.5 text-xs text-[var(--brand-subtle)]">
            لا يوجد تصنيفات حالياً. أضف أول تصنيف من الحقل أعلاه.
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="flex flex-wrap items-center gap-2 rounded-[16px] border border-[rgba(160,149,208,0.14)] bg-black/10 px-2.5 py-2"
              >
                <input
                  type="text"
                  value={category.name}
                  onChange={(event) =>
                    handleUpdateCategoryName(index, event.target.value)
                  }
                  className="min-w-[160px] flex-1 rounded-[14px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(index)}
                  className="rounded-[14px] border border-[rgba(238,32,77,0.3)] bg-[rgba(238,32,77,0.08)] px-3 py-2 text-xs font-medium text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.14)]"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </FieldCard>
  )
}

function CategoryIdsEditor({
  label,
  value,
  categoryOptions,
  onCreateCategoryAndSelect,
  onChange,
}: {
  label: string
  value: JsonValue[]
  categoryOptions: BlogCategoryOption[]
  onCreateCategoryAndSelect?: (name: string, selectedIds: string[]) => void
  onChange: (value: JsonValue) => void
}) {
  const [categoryFilter, setCategoryFilter] = useState('')
  const selectedIds = Array.from(
    new Set(
      value
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter((entry) => entry.length > 0),
    ),
  )
  const knownIds = new Set(categoryOptions.map((option) => option.id))
  const mergedOptions = [
    ...categoryOptions,
    ...selectedIds
      .filter((selectedId) => !knownIds.has(selectedId))
      .map((selectedId) => ({
        id: selectedId,
        name: selectedId,
      })),
  ]
  const selectedSet = new Set(selectedIds)
  const selectedOptions = mergedOptions.filter((option) => selectedSet.has(option.id))
  const normalizedFilter = categoryFilter.trim().toLowerCase()
  const filteredOptions = normalizedFilter
    ? mergedOptions.filter((option) =>
        option.name.toLowerCase().includes(normalizedFilter),
      )
    : mergedOptions

  function handlePickCategory(categoryId: string) {
    if (!categoryId) {
      return
    }

    if (!selectedSet.has(categoryId)) {
      onChange([...selectedIds, categoryId] as JsonValue)
    }
  }

  function handleRemoveCategory(categoryId: string) {
    onChange(selectedIds.filter((selectedId) => selectedId !== categoryId) as JsonValue)
  }

  function handleCreateCategory() {
    if (!onCreateCategoryAndSelect) {
      return
    }

    onCreateCategoryAndSelect(categoryFilter, selectedIds)

    setCategoryFilter('')
  }

  const canCreateCategory =
    Boolean(onCreateCategoryAndSelect) &&
    categoryFilter.trim().length > 0 &&
    !mergedOptions.some(
      (option) => option.name.toLowerCase() === categoryFilter.trim().toLowerCase(),
    )

  return (
    <FieldCard label={label}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            placeholder="فلترة التصنيفات أو كتابة اسم جديد"
            className="min-w-[220px] flex-1 rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
          />
          {canCreateCategory ? (
            <button
              type="button"
              onClick={handleCreateCategory}
              className="rounded-[16px] border border-[rgba(29,171,137,0.3)] bg-[rgba(29,171,137,0.1)] px-3 py-2 text-xs font-medium text-[var(--brand-teal)] transition hover:bg-[rgba(29,171,137,0.16)]"
            >
              إضافة كاتيغوري جديد
            </button>
          ) : null}
        </div>

        {mergedOptions.length > 0 ? (
          <div className="space-y-2">
            <select
              value=""
              onChange={(event) => {
                handlePickCategory(event.target.value)
              }}
              className="w-full rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
            >
              <option value="" disabled>
                اختر كاتيغوري للإضافة
              </option>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}
                    disabled={selectedSet.has(option.id)}
                  >
                    {option.name}
                    {selectedSet.has(option.id) ? ' (مضاف)' : ''}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  لا يوجد نتائج مطابقة للفلتر
                </option>
              )}
            </select>
            <div className="rounded-[16px] border border-[rgba(160,149,208,0.14)] bg-black/10 px-3 py-2 text-xs leading-6 text-[var(--brand-subtle)]">
              اضغط على أي كاتيغوري من القائمة ليُضاف مباشرة.
            </div>
          </div>
        ) : (
          <div className="rounded-[16px] border border-dashed border-[color:var(--brand-border)] px-3 py-2.5 text-xs text-[var(--brand-subtle)]">
            لا يوجد تصنيفات مضافة بعد. أضف تصنيفات أولاً من حقل "التصنيفات".
          </div>
        )}

        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <div
                key={option.id}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(160,149,208,0.18)] bg-black/10 px-2.5 py-1.5 text-xs text-[var(--brand-text)]"
              >
                <span>{option.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(option.id)}
                  className="rounded-full border border-[rgba(238,32,77,0.3)] bg-[rgba(238,32,77,0.08)] px-2 py-0.5 text-[10px] text-[var(--brand-coral)]"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[16px] border border-[rgba(160,149,208,0.14)] bg-black/10 px-3 py-2 text-xs leading-6 text-[var(--brand-subtle)]">
            لم يتم اختيار أي تصنيف بعد.
          </div>
        )}
      </div>
    </FieldCard>
  )
}

function CommentsEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: JsonValue[]
  onChange: (value: JsonValue) => void
}) {
  const [nextUserName, setNextUserName] = useState('')
  const [nextComment, setNextComment] = useState('')
  const [nextDate, setNextDate] = useState(getTodayIsoDate())
  const comments = normalizeBlogCommentsArray(value)

  function handleAddComment() {
    const trimmedUserName = nextUserName.trim()
    const trimmedComment = nextComment.trim()

    if (!trimmedUserName || !trimmedComment) {
      return
    }

    onChange(
      [
        ...comments,
        {
          id: generateRandomItemId(),
          userName: trimmedUserName,
          date: /^\d{4}-\d{2}-\d{2}$/.test(nextDate) ? nextDate : getTodayIsoDate(),
          comment: trimmedComment,
        },
      ] as unknown as JsonValue,
    )
    setNextUserName('')
    setNextComment('')
    setNextDate(getTodayIsoDate())
  }

  function handleUpdateComment(
    index: number,
    key: 'userName' | 'date' | 'comment',
    nextValue: string,
  ) {
    const nextComments = [...comments]
    nextComments[index] = {
      ...nextComments[index],
      [key]: key === 'date' ? nextValue || getTodayIsoDate() : nextValue,
    }
    onChange(nextComments as unknown as JsonValue)
  }

  function handleRemoveComment(index: number) {
    onChange(
      comments.filter((_, itemIndex) => itemIndex !== index) as unknown as JsonValue,
    )
  }

  return (
    <FieldCard label={label}>
      <div className="space-y-3">
        <div className="space-y-2 rounded-[16px] border border-[rgba(160,149,208,0.14)] bg-black/10 p-2.5">
          <div className="grid gap-2 md:grid-cols-2">
            <input
              type="text"
              value={nextUserName}
              onChange={(event) => setNextUserName(event.target.value)}
              placeholder="اسم المستخدم"
              className="rounded-[14px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
            />
            <input
              type="date"
              value={nextDate}
              onChange={(event) => setNextDate(event.target.value)}
              className="rounded-[14px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
            />
          </div>

          <textarea
            rows={3}
            value={nextComment}
            onChange={(event) => setNextComment(event.target.value)}
            placeholder="التعليق"
            className="w-full rounded-[14px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2 text-sm leading-7 text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddComment}
              className="rounded-[16px] border border-[rgba(29,171,137,0.3)] bg-[rgba(29,171,137,0.1)] px-3 py-2 text-xs font-medium text-[var(--brand-teal)] transition hover:bg-[rgba(29,171,137,0.16)]"
            >
              إضافة تعليق
            </button>
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[color:var(--brand-border)] px-3 py-2.5 text-xs text-[var(--brand-subtle)]">
            لا يوجد تعليقات حالياً.
          </div>
        ) : (
          <div className="space-y-2">
            {comments.map((commentItem, index) => (
              <div
                key={commentItem.id}
                className="space-y-2 rounded-[16px] border border-[rgba(160,149,208,0.14)] bg-black/10 p-2.5"
              >
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    type="text"
                    value={commentItem.userName}
                    onChange={(event) =>
                      handleUpdateComment(index, 'userName', event.target.value)
                    }
                    placeholder="اسم المستخدم"
                    className="rounded-[14px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
                  />
                  <input
                    type="date"
                    value={commentItem.date}
                    onChange={(event) =>
                      handleUpdateComment(index, 'date', event.target.value)
                    }
                    className="rounded-[14px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
                  />
                </div>

                <textarea
                  rows={3}
                  value={commentItem.comment}
                  onChange={(event) =>
                    handleUpdateComment(index, 'comment', event.target.value)
                  }
                  placeholder="التعليق"
                  className="w-full rounded-[14px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2 text-sm leading-7 text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveComment(index)}
                    className="rounded-[14px] border border-[rgba(238,32,77,0.3)] bg-[rgba(238,32,77,0.08)] px-3 py-2 text-xs font-medium text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.14)]"
                  >
                    حذف التعليق
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FieldCard>
  )
}

function PrimitiveEditor({
  label,
  fieldKey,
  value,
  categoryOptions,
  onChange,
  onOpenImageManager,
}: {
  label: string
  fieldKey?: string
  value: JsonPrimitive
  categoryOptions?: BlogCategoryOption[]
  onChange: (value: JsonValue) => void
  onOpenImageManager?: () => void
}) {
  if (typeof value === 'boolean') {
    return (
      <FieldCard label={label}>
        <select
          value={value ? 'true' : 'false'}
          onChange={(event) => onChange(event.target.value === 'true')}
          className="w-full rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
        >
          <option value="true">نعم</option>
          <option value="false">لا</option>
        </select>
      </FieldCard>
    )
  }

  if (typeof value === 'number') {
    return (
      <FieldCard label={label}>
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value || 0))}
          className="w-full rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
        />
      </FieldCard>
    )
  }

  if (value === null) {
    return (
      <FieldCard label={label}>
        <div className="rounded-2xl border border-dashed border-[color:var(--brand-border)] px-4 py-3 text-sm text-[var(--brand-muted)]">
          هذه القيمة فارغة حالياً، ولا يوجد نوع محرر مخصص لها في هذا الإصدار.
        </div>
      </FieldCard>
    )
  }

  const isImageField = isImageFieldKey(fieldKey)
  const isHtmlField = isHtmlFieldKey(fieldKey)
  const isVideoField = isVideoFieldKey(fieldKey)
  const isCategoryField = fieldKey === 'category'
  const showImagePreview = isImageField && looksLikeImageSource(value)
  const [videoUploading, setVideoUploading] = useState(false)

  const handleVideoUpload = async (file: File) => {
    setVideoUploading(true)
    try {
      const url = await uploadVideoAsset(file)
      if (url) onChange(url)
    } catch (e) {
      console.error('فشل رفع الفيديو', e)
    } finally {
      setVideoUploading(false)
    }
  }
  const isLtrInput = shouldUseLtrInput(fieldKey)
  const inputAlignmentClass = isLtrInput ? 'text-left' : 'text-right'
  const normalizedCategoryOptions = isCategoryField
    ? Array.from(
        new Set(
          (categoryOptions || [])
            .map((option) => option.name.trim())
            .filter((option) => option.length > 0),
        ),
      )
    : []
  const categoryValue = isCategoryField ? value.trim() : ''
  const categoryChoices =
    isCategoryField && categoryValue && !normalizedCategoryOptions.includes(categoryValue)
      ? [...normalizedCategoryOptions, categoryValue]
      : normalizedCategoryOptions

  return (
    <FieldCard label={label}>
      <div className="space-y-3">
        {showImagePreview ? (
          <ImageCard src={value} alt={label} caption="معاينة الصورة" />
        ) : null}

        {isImageField ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenImageManager}
              className="rounded-[16px] border border-[rgba(29,171,137,0.32)] bg-[rgba(29,171,137,0.1)] px-3 py-2 text-xs font-medium text-[var(--brand-teal)] transition hover:bg-[rgba(29,171,137,0.16)]"
            >
              رفع أو اختيار صورة
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-[16px] border border-[rgba(238,32,77,0.3)] bg-[rgba(238,32,77,0.08)] px-3 py-2 text-xs font-medium text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.14)]"
            >
              إزالة الصورة
            </button>
          </div>
        ) : isHtmlField ? (
          <HtmlEditor
            value={value}
            onChange={(nextValue) => onChange(nextValue)}
            onRequestImage={onOpenImageManager}
          />
        ) : isCategoryField && categoryChoices.length > 0 ? (
          <div className="flex flex-wrap gap-2" dir="rtl">
            {categoryChoices.map((option) => {
              const selected = categoryValue.split(',').map(s => s.trim()).filter(Boolean).includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    const current = categoryValue.split(',').map(s => s.trim()).filter(Boolean)
                    const next = selected ? current.filter(c => c !== option) : [...current, option]
                    onChange(next.join(','))
                  }}
                  className="rounded-xl border px-3 py-1.5 text-sm transition"
                  style={{
                    borderColor: selected ? 'var(--brand-teal)' : 'var(--brand-border)',
                    background: selected ? 'rgba(29,171,137,0.15)' : 'transparent',
                    color: selected ? 'var(--brand-teal)' : 'var(--brand-subtle)',
                  }}
                >
                  {selected ? '✓ ' : ''}{option}
                </button>
              )
            })}
          </div>
        ) : (
          shouldUseTextarea(value, fieldKey) ? (
          <textarea
            rows={4}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            dir={isLtrInput ? 'ltr' : 'rtl'}
            className={cn(
              'w-full rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm leading-7 text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]',
              inputAlignmentClass,
            )}
          />
        ) : (
          <input
            type={resolvePrimitiveInputType(fieldKey)}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            dir={isLtrInput ? 'ltr' : 'rtl'}
            className={cn(
              'w-full rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]',
              inputAlignmentClass,
            )}
          />
          )
        )}

        {isImageField ? (
          <div className="rounded-[16px] border border-[rgba(160,149,208,0.14)] bg-black/10 px-3 py-2.5 text-xs leading-6 text-[var(--brand-subtle)]">
            {value
              ? 'تم تعيين صورة لهذا الحقل.'
              : 'لا توجد صورة مضافة لهذا الحقل حالياً.'}
          </div>
        ) : null}

        {isVideoField ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className={cn(
              'cursor-pointer rounded-[16px] border px-3 py-2 text-xs font-medium transition',
              videoUploading
                ? 'border-[rgba(29,171,137,0.2)] bg-[rgba(29,171,137,0.06)] text-[var(--brand-teal)]/50 cursor-not-allowed'
                : 'border-[rgba(29,171,137,0.32)] bg-[rgba(29,171,137,0.1)] text-[var(--brand-teal)] hover:bg-[rgba(29,171,137,0.16)]'
            )}>
              {videoUploading ? 'جاري الرفع...' : 'رفع فيديو من الجهاز'}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={videoUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleVideoUpload(file)
                }}
              />
            </label>
            {value ? (
              <span className="text-xs text-[var(--brand-subtle)] truncate max-w-[200px]" dir="ltr">{String(value)}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </FieldCard>
  )
}

void PrimitiveEditor

function EnhancedPrimitiveEditor({
  label,
  fieldKey,
  value,
  categoryOptions,
  onChange,
  onOpenImageManager,
}: {
  label: string
  fieldKey?: string
  value: JsonPrimitive
  categoryOptions?: BlogCategoryOption[]
  onChange: (value: JsonValue) => void
  onOpenImageManager?: () => void
}) {
  if (typeof value === 'boolean') {
    return (
      <FieldCard label={label}>
        <select
          value={value ? 'true' : 'false'}
          onChange={(event) => onChange(event.target.value === 'true')}
          className="w-full rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
        >
          <option value="true">نعم</option>
          <option value="false">لا</option>
        </select>
      </FieldCard>
    )
  }

  if (typeof value === 'number') {
    return (
      <FieldCard label={label}>
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value || 0))}
          className="w-full rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
        />
      </FieldCard>
    )
  }

  if (value === null) {
    return (
      <FieldCard label={label}>
        <div className="rounded-2xl border border-dashed border-[color:var(--brand-border)] px-4 py-3 text-sm text-[var(--brand-muted)]">
          هذه القيمة فارغة حاليًا، ولا يوجد نوع محرر مخصص لها في هذا الإصدار.
        </div>
      </FieldCard>
    )
  }

  const isImageField = isImageFieldKey(fieldKey)
  const isHtmlField = isHtmlFieldKey(fieldKey)
  const isVideoField = isVideoFieldKey(fieldKey)
  const isCategoryField = fieldKey === 'category'
  const showImagePreview = isImageField && looksLikeImageSource(value)
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const videoPreview = isVideoField ? resolveVideoPreview(value) : null

  const handleVideoUpload = async (file: File) => {
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_VIDEO_SIZE) {
      alert('حجم الفيديو يتجاوز 50 ميغابايت. الرجاء اختيار ملف أصغر.')
      return
    }
    setVideoUploading(true)
    setVideoUploadProgress(0)
    try {
      const url = await uploadVideoAssetWithProgress(file, (pct) => setVideoUploadProgress(pct))
      if (url) onChange(url)
    } catch (error) {
      console.error('فشل رفع الفيديو', error)
    } finally {
      setVideoUploading(false)
      setVideoUploadProgress(0)
    }
  }

  const isLtrInput = shouldUseLtrInput(fieldKey) || isVideoField
  const inputAlignmentClass = isLtrInput ? 'text-left' : 'text-right'
  const normalizedCategoryOptions = isCategoryField
    ? Array.from(
        new Set(
          (categoryOptions || [])
            .map((option) => option.name.trim())
            .filter((option) => option.length > 0),
        ),
      )
    : []
  const categoryValue = isCategoryField ? value.trim() : ''
  const categoryChoices =
    isCategoryField && categoryValue && !normalizedCategoryOptions.includes(categoryValue)
      ? [...normalizedCategoryOptions, categoryValue]
      : normalizedCategoryOptions

  return (
    <FieldCard label={label}>
      <div className="space-y-3">
        {showImagePreview ? (
          <ImageCard src={value} alt={label} caption="معاينة الصورة" />
        ) : null}

        {isImageField ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenImageManager}
              className="rounded-[16px] border border-[rgba(29,171,137,0.32)] bg-[rgba(29,171,137,0.1)] px-3 py-2 text-xs font-medium text-[var(--brand-teal)] transition hover:bg-[rgba(29,171,137,0.16)]"
            >
              رفع أو اختيار صورة
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-[16px] border border-[rgba(238,32,77,0.3)] bg-[rgba(238,32,77,0.08)] px-3 py-2 text-xs font-medium text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.14)]"
            >
              إزالة الصورة
            </button>
          </div>
        ) : isHtmlField ? (
          <HtmlEditor
            value={value}
            onChange={(nextValue) => onChange(nextValue)}
            onRequestImage={onOpenImageManager}
          />
        ) : isVideoField ? (
          <div className="space-y-3">
            <div className="rounded-[18px] border border-[rgba(160,149,208,0.16)] bg-black/10 p-3">
              <p className="text-xs font-medium text-[var(--brand-text)]">
                رابط الفيديو
              </p>
              <p className="mt-1 text-xs leading-6 text-[var(--brand-subtle)]">
                الصق رابط YouTube أو Vimeo أو رابط ملف فيديو مباشر، أو استخدم الرفع من الجهاز.
              </p>
              <input
                type="url"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                dir="ltr"
                placeholder="https://youtube.com/watch?v=... أو https://example.com/video.mp4"
                className="mt-3 w-full rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-left text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                className={cn(
                  'cursor-pointer rounded-[16px] border px-3 py-2 text-xs font-medium transition',
                  videoUploading
                    ? 'cursor-not-allowed border-[rgba(29,171,137,0.2)] bg-[rgba(29,171,137,0.06)] text-[var(--brand-teal)]/50'
                    : 'border-[rgba(29,171,137,0.32)] bg-[rgba(29,171,137,0.1)] text-[var(--brand-teal)] hover:bg-[rgba(29,171,137,0.16)]',
                )}
              >
                {videoUploading ? `جاري الرفع... ${videoUploadProgress}%` : 'رفع فيديو من الجهاز'}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  disabled={videoUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ''
                    if (file) void handleVideoUpload(file)
                  }}
                />
              </label>

              <button
                type="button"
                onClick={onOpenImageManager}
                disabled={videoUploading}
                className="rounded-[16px] border border-[rgba(160,149,208,0.32)] bg-[rgba(160,149,208,0.1)] px-3 py-2 text-xs font-medium text-[var(--brand-violet)] transition hover:bg-[rgba(160,149,208,0.16)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                اختيار من المكتبة
              </button>

              <button
                type="button"
                onClick={() => onChange('')}
                className="rounded-[16px] border border-[rgba(238,32,77,0.3)] bg-[rgba(238,32,77,0.08)] px-3 py-2 text-xs font-medium text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.14)]"
              >
                إزالة الفيديو
              </button>
            </div>

            {videoUploading ? (
              <div className="space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(160,149,208,0.15)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand-teal)] transition-all duration-200"
                    style={{ width: `${videoUploadProgress}%` }}
                  />
                </div>
                <p className="text-right text-[11px] text-[var(--brand-subtle)]">
                  {videoUploadProgress < 100 ? `جاري الرفع ${videoUploadProgress}%` : 'اكتمل الرفع، جاري المعالجة...'}
                </p>
              </div>
            ) : null}

            {value ? (
              <div className="rounded-[16px] border border-[rgba(160,149,208,0.14)] bg-black/10 px-3 py-2.5 text-xs leading-6 text-[var(--brand-subtle)]">
                <span className="block text-[11px] text-[var(--brand-text)]">
                  الرابط الحالي
                </span>
                <span className="mt-1 block truncate" dir="ltr">
                  {value}
                </span>
              </div>
            ) : null}

            {videoPreview ? (
              <div className="overflow-hidden rounded-[20px] border border-[rgba(160,149,208,0.16)] bg-black/20">
                {videoPreview.type === 'embed' ? (
                  <iframe
                    src={videoPreview.src}
                    title={`${label} preview`}
                    className="aspect-video w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoPreview.src}
                    controls
                    preload="metadata"
                    className="aspect-video w-full bg-black"
                  />
                )}
              </div>
            ) : value ? (
              <div className="rounded-[16px] border border-[rgba(160,149,208,0.14)] bg-black/10 px-3 py-2.5 text-xs leading-6 text-[var(--brand-subtle)]">
                تمت إضافة رابط فيديو، لكن المعاينة المباشرة تدعم حاليًا YouTube وVimeo وروابط ملفات الفيديو المباشرة.
              </div>
            ) : null}
          </div>
        ) : isCategoryField && categoryChoices.length > 0 ? (
          <div className="flex flex-wrap gap-2" dir="rtl">
            {categoryChoices.map((option) => {
              const selected = categoryValue.split(',').map(s => s.trim()).filter(Boolean).includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    const current = categoryValue.split(',').map(s => s.trim()).filter(Boolean)
                    const next = selected ? current.filter(c => c !== option) : [...current, option]
                    onChange(next.join(','))
                  }}
                  className="rounded-xl border px-3 py-1.5 text-sm transition"
                  style={{
                    borderColor: selected ? 'var(--brand-teal)' : 'var(--brand-border)',
                    background: selected ? 'rgba(29,171,137,0.15)' : 'transparent',
                    color: selected ? 'var(--brand-teal)' : 'var(--brand-subtle)',
                  }}
                >
                  {selected ? '✓ ' : ''}{option}
                </button>
              )
            })}
          </div>
        ) : shouldUseTextarea(value, fieldKey) ? (
          <textarea
            rows={4}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            dir={isLtrInput ? 'ltr' : 'rtl'}
            className={cn(
              'w-full rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm leading-7 text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]',
              inputAlignmentClass,
            )}
          />
        ) : (
          <input
            type={resolvePrimitiveInputType(fieldKey)}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            dir={isLtrInput ? 'ltr' : 'rtl'}
            className={cn(
              'w-full rounded-[18px] border border-[color:var(--brand-border)] bg-[#0d0a25] px-3 py-2.5 text-sm text-[var(--brand-text)] outline-none transition focus:border-[var(--brand-teal)]',
              inputAlignmentClass,
            )}
          />
        )}

        {isImageField ? (
          <div className="rounded-[16px] border border-[rgba(160,149,208,0.14)] bg-black/10 px-3 py-2.5 text-xs leading-6 text-[var(--brand-subtle)]">
            {value
              ? 'تم تعيين صورة لهذا الحقل.'
              : 'لا توجد صورة مضافة لهذا الحقل حاليًا.'}
          </div>
        ) : null}
      </div>
    </FieldCard>
  )
}

function EditableNode({
  label,
  fieldKey,
  path,
  value,
  depth = 0,
  categoryOptions,
  onCreateBlogCategoryAndSelect,
  onChange,
  onAppendArrayItem,
  onRemoveArrayItem,
  onOpenImageManager,
  onRequestDeleteConfirmation,
}: EditableNodeProps) {
  const baseSectionClass = cn(
    'rounded-[24px] border border-[rgba(160,149,208,0.13)] bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-4',
    depth === 0
      ? 'shadow-[0_20px_60px_rgba(5,5,19,0.2)]'
      : 'bg-[rgba(255,255,255,0.018)]',
  )
  const [activeArrayIndex, setActiveArrayIndex] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [storyMultiUploading, setStoryMultiUploading] = useState(false)

  async function handleStoryMultiUpload(files: File[]) {
    if (!files.length || !Array.isArray(value)) return
    setStoryMultiUploading(true)
    const newBlocks: JsonValue[] = []
    for (let i = 0; i < files.length; i++) {
      try {
        const uploaded = await uploadImageAsset(files[i])
        newBlocks.push({ ...(buildDefaultStoryBlockItem() as Record<string, unknown>), image: uploaded.publicUrl ?? uploaded.filePath ?? '' } as JsonValue)
      } catch { /* skip failed */ }
    }
    if (newBlocks.length > 0) {
      onChange(path, [...(value as JsonValue[]), ...newBlocks])
    }
    setStoryMultiUploading(false)
  }

  function confirmRemoveItem(index: number) {
    onRequestDeleteConfirmation({
      title: `حذف ${label} ${index + 1}`,
      description: `سيتم حذف "${label} ${index + 1}" نهائياً من هذه القائمة. تأكد أنك لا تحتاجه قبل المتابعة.`,
      confirmLabel: 'تأكيد الحذف',
      onConfirm: () => onRemoveArrayItem(path, index),
    })
  }

  if (fieldKey === 'categories' && Array.isArray(value)) {
    return (
      <CategoryDefinitionsEditor
        label={label}
        value={value as JsonValue[]}
        onChange={(nextValue) => onChange(path, nextValue)}
      />
    )
  }

  if (fieldKey === 'categoryIds' && Array.isArray(value)) {
    return (
      <CategoryIdsEditor
        label={label}
        value={value as JsonValue[]}
        categoryOptions={categoryOptions || []}
        onCreateCategoryAndSelect={(name, selectedIds) =>
          onCreateBlogCategoryAndSelect?.(path, name, selectedIds)
        }
        onChange={(nextValue) => onChange(path, nextValue)}
      />
    )
  }

  if (fieldKey === 'comments' && Array.isArray(value)) {
    return (
      <CommentsEditor
        label={label}
        value={value as JsonValue[]}
        onChange={(nextValue) => onChange(path, nextValue)}
      />
    )
  }

  if (Array.isArray(value)) {
    const hasValidActiveArrayIndex =
      activeArrayIndex !== null &&
      Number.isInteger(activeArrayIndex) &&
      activeArrayIndex >= 0 &&
      activeArrayIndex < value.length
    const activeArrayValue = hasValidActiveArrayIndex
      ? (value[activeArrayIndex!] as JsonValue)
      : null
    const activeArrayTitle =
      hasValidActiveArrayIndex && activeArrayValue !== null
        ? resolveGenericCardTitle(activeArrayValue, activeArrayIndex!, label)
        : `${label} 1`

    return (
      <section className={baseSectionClass}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full border border-[rgba(160,149,208,0.16)] bg-black/10 px-2.5 py-1 text-[11px] text-[var(--brand-violet)]">
              قائمة
            </div>
            <h3 className="mt-2 text-base font-semibold text-[var(--brand-text)]">
              {label}
            </h3>
            <p className="mt-1 text-xs text-[var(--brand-subtle)]">
              {value.length} عنصر
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {hasValidActiveArrayIndex ? (
              <button
                type="button"
                onClick={() => setActiveArrayIndex(null)}
                className="rounded-[16px] border border-[color:var(--brand-border)] px-3 py-2 text-xs font-medium text-[var(--brand-muted)] transition hover:border-[color:var(--brand-border-strong)] hover:bg-white/6"
              >
                العودة للقائمة
              </button>
            ) : null}

            {fieldKey === 'storyBlocks' && !hasValidActiveArrayIndex ? (
              <label className={cn(
                'cursor-pointer rounded-[16px] border px-3 py-2 text-xs font-medium transition',
                storyMultiUploading
                  ? 'cursor-not-allowed border-[rgba(160,149,208,0.2)] bg-[rgba(160,149,208,0.06)] text-[var(--brand-violet)]/50'
                  : 'border-[rgba(160,149,208,0.32)] bg-[rgba(160,149,208,0.1)] text-[var(--brand-violet)] hover:bg-[rgba(160,149,208,0.16)]'
              )}>
                {storyMultiUploading ? 'جاري الرفع...' : '+ رفع صور متعددة'}
                <input
                  type="file"
                  accept="image/*,image/gif"
                  multiple
                  className="hidden"
                  disabled={storyMultiUploading}
                  onChange={(e) => {
                    const selected = e.target.files ? Array.from(e.target.files) : []
                    e.target.value = ''
                    if (selected.length) void handleStoryMultiUpload(selected)
                  }}
                />
              </label>
            ) : null}

            <button
              type="button"
              onClick={() => {
                const newItemTemplate =
                  fieldKey === 'videos' && value.length === 0
                    ? { id: '', url: '', title: '' }
                    : fieldKey === 'gallery' && value.length === 0
                      ? buildDefaultGalleryItem()
                      : value[0]
                onAppendArrayItem(path, newItemTemplate)
              }}
              className="rounded-[16px] border border-[rgba(29,171,137,0.3)] bg-[rgba(29,171,137,0.1)] px-3 py-2 text-xs font-medium text-[var(--brand-teal)] transition hover:bg-[rgba(29,171,137,0.16)]"
            >
              إضافة عنصر
            </button>
          </div>
        </div>

        {value.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-[color:var(--brand-border)] px-4 py-4 text-sm text-[var(--brand-muted)]">
            القائمة فارغة حالياً، يمكنك إضافة أول عنصر.
          </div>
        ) : hasValidActiveArrayIndex && activeArrayValue !== null ? (
          <section className="rounded-[20px] border border-[rgba(160,149,208,0.14)] bg-[rgba(8,7,24,0.36)] p-3.5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="inline-flex rounded-full border border-[rgba(160,149,208,0.16)] bg-black/10 px-2.5 py-1 text-[11px] text-[var(--brand-violet)]">
                  محرر العنصر
                </div>
                <h4 className="mt-2 text-base font-semibold text-[var(--brand-text)]">
                  {activeArrayTitle}
                </h4>
                <p className="mt-1 text-xs text-[var(--brand-subtle)]">
                  {resolveGenericCardSubtitle(activeArrayValue)}
                </p>
              </div>

              {resolveGenericCardImage(activeArrayValue) ? (
                <ImageCard
                  src={resolveGenericCardImage(activeArrayValue)!}
                  alt={activeArrayTitle}
                  caption="صورة العنصر"
                />
              ) : null}
            </div>

            <EditableNode
              label={activeArrayTitle}
              fieldKey={fieldKey}
              value={
                fieldKey === 'gallery'
                  ? normalizeGalleryEditorItem(activeArrayValue)
                  : fieldKey === 'steps'
                    ? normalizeStepEditorItem(activeArrayValue)
                    : activeArrayValue
              }
              path={[...path, activeArrayIndex!]}
              depth={depth + 1}
              categoryOptions={categoryOptions}
              onCreateBlogCategoryAndSelect={onCreateBlogCategoryAndSelect}
              onChange={onChange}
              onAppendArrayItem={onAppendArrayItem}
              onRemoveArrayItem={onRemoveArrayItem}
              onOpenImageManager={onOpenImageManager}
              onRequestDeleteConfirmation={onRequestDeleteConfirmation}
            />

            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveArrayIndex(null)}
                className="rounded-[14px] border border-[color:var(--brand-border)] px-3 py-2 text-xs font-medium text-[var(--brand-muted)] transition hover:border-[color:var(--brand-border-strong)] hover:bg-white/6"
              >
                العودة للقائمة
              </button>
              <button
                type="button"
                onClick={() => confirmRemoveItem(activeArrayIndex!)}
                className="rounded-[14px] border border-[rgba(238,32,77,0.28)] bg-[rgba(238,32,77,0.08)] px-3 py-2 text-xs font-medium text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.14)]"
              >
                حذف العنصر
              </button>
            </div>
          </section>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {value.map((item, index) => (
              <div
                key={
                  isRecord(item) && typeof item.id === 'string' && item.id.trim()
                    ? item.id
                    : `${label}-${index}`
                }
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedIndex === null || draggedIndex === index) return
                  const next = [...value] as JsonValue[]
                  const [moved] = next.splice(draggedIndex, 1)
                  next.splice(index, 0, moved)
                  onChange(path, next)
                  setDraggedIndex(null)
                }}
                onDragEnd={() => setDraggedIndex(null)}
                style={{ opacity: draggedIndex === index ? 0.45 : 1, cursor: 'grab' }}
              >
                <ProjectCard
                  title={resolveGenericCardTitle(item as JsonValue, index, label)}
                  subtitle={resolveGenericCardSubtitle(item as JsonValue)}
                  imageSrc={resolveGenericCardImage(item as JsonValue)}
                  showImagePlaceholder={false}
                  editLabel="تعديل العنصر"
                  deleteLabel="حذف العنصر"
                  onEdit={() => setActiveArrayIndex(index)}
                  onDelete={() => confirmRemoveItem(index)}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  if (isRecord(value)) {
    const entries = Object.entries(value).filter(
      ([entryKey]) =>
        !hiddenFieldKeys.has(entryKey) &&
        !(entryKey === 'category' && Object.prototype.hasOwnProperty.call(value, 'categoryIds')),
    ).sort(([leftKey], [rightKey]) => {
      const leftPriority = objectFieldOrder[leftKey] ?? 1000
      const rightPriority = objectFieldOrder[rightKey] ?? 1000

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority
      }

      return 0
    })

    return (
      <section className={baseSectionClass}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full border border-[rgba(160,149,208,0.16)] bg-black/10 px-2.5 py-1 text-[11px] text-[var(--brand-violet)]">
              مجموعة حقول
            </div>
            <h3 className="mt-2 text-base font-semibold text-[var(--brand-text)]">
              {label}
            </h3>
          </div>
          <span className="rounded-full border border-[color:var(--brand-border)] bg-white/5 px-2.5 py-1 text-[11px] text-[var(--brand-subtle)]">
            {entries.length} حقل
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-[color:var(--brand-border)] px-4 py-4 text-sm text-[var(--brand-muted)]">
            لا توجد بيانات داخل هذا الكائن.
          </div>
        ) : (
          <div className="space-y-2.5">
            {entries.map(([entryKey, entryValue]) => (
              <EditableNode
                key={entryKey}
                label={titleizeFieldLabel(entryKey)}
                fieldKey={entryKey}
                value={entryValue as JsonValue}
                path={[...path, entryKey]}
                depth={depth + 1}
                categoryOptions={categoryOptions}
                onCreateBlogCategoryAndSelect={onCreateBlogCategoryAndSelect}
                onChange={onChange}
                onAppendArrayItem={onAppendArrayItem}
                onRemoveArrayItem={onRemoveArrayItem}
                onOpenImageManager={onOpenImageManager}
                onRequestDeleteConfirmation={onRequestDeleteConfirmation}
              />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <EnhancedPrimitiveEditor
      label={label}
      fieldKey={fieldKey}
      value={value}
      categoryOptions={categoryOptions}
      onChange={(nextValue) => onChange(path, nextValue)}
      onOpenImageManager={
        isImageFieldKey(fieldKey) || isHtmlFieldKey(fieldKey) || isVideoFieldKey(fieldKey)
          ? () =>
              onOpenImageManager(
                path,
                label,
                isHtmlFieldKey(fieldKey) ? 'html' : 'field',
              )
          : undefined
      }
    />
  )
}

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="animate-pulse rounded-[30px] border border-white/6 bg-white/4 p-6">
        <div className="h-5 w-40 rounded-full bg-white/8" />
        <div className="mt-4 h-8 w-3/4 rounded-full bg-white/8" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 rounded-[22px] bg-white/6" />
          ))}
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-52 animate-pulse rounded-[28px] border border-white/6 bg-white/4"
        />
      ))}
    </div>
  )
}

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[34px] border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-6 py-12 text-center shadow-[0_24px_80px_rgba(5,5,19,0.25)]">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs tracking-[0.16em] text-[var(--brand-violet)]">
          محرر المحتوى
        </p>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--brand-text)]">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--brand-muted)] sm:text-base">
          {description}
        </p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  )
}

export function ContentDetailPanel({
  content,
  draftBody,
  homeHeroSlides = [],
  status,
  error,
  saveStatus,
  saveMessage,
  onRetry,
  onDraftChange,
  onResetDraft,
  onSave,
  onToggleProjectInHomeHero,
}: ContentDetailPanelProps) {
  const navigate = useNavigate()
  const { projectId, galleryItemId, slideId, postId, serviceId, packageId } = useParams<{
    contentId?: string
    projectId?: string
    galleryItemId?: string
    slideId?: string
    postId?: string
    serviceId?: string
    packageId?: string
  }>()
  const [activeImageField, setActiveImageField] = useState<ActiveImageField | null>(
    null,
  )
  const [imageLibrary, setImageLibrary] = useState<ImageLibraryState>({
    status: 'idle',
    items: [],
    error: null,
  })
  const [imageActionState, setImageActionState] = useState<ImageActionState>({
    status: 'idle',
    message: null,
    imageId: null,
  })
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<ConfirmDialogRequest | null>(null)
  const [isDeleteConfirming, setDeleteConfirming] = useState(false)
  const [multiUploadState, setMultiUploadState] = useState<{ uploading: boolean; done: number; total: number }>({ uploading: false, done: 0, total: 0 })
  const multiUploadRef = useRef<HTMLInputElement>(null)
  const [projectHeroActionState, setProjectHeroActionState] = useState<{
    status: 'idle' | 'saving' | 'success' | 'error'
    index: number | null
    message: string | null
  }>({
    status: 'idle',
    index: null,
    message: null,
  })

  useEffect(() => {
    if (!activeImageField) {
      return
    }

    const controller = new AbortController()

    async function loadImageLibrary() {
      setImageLibrary((current) => ({
        ...current,
        status: 'loading',
        error: null,
      }))

      try {
        const items = await fetchImages(controller.signal)

        setImageLibrary({
          status: 'success',
          items,
          error: null,
        })
      } catch (loadError) {
        if (controller.signal.aborted) {
          return
        }

        setImageLibrary({
          status: 'error',
          items: [],
          error:
            loadError instanceof Error
              ? loadError.message
              : 'تعذر قراءة مكتبة الصور.',
        })
      }
    }

    void loadImageLibrary()

    return () => {
      controller.abort()
    }
  }, [activeImageField])

  // Kept ABOVE the early returns so the number of hooks stays stable across the
  // loading → loaded transition. Placing it after the guards below caused
  // "Rendered more hooks than during the previous render" and a blank page.
  useEffect(() => {
    if (status !== 'success' || !content || !draftBody) {
      return
    }

    const config = resolveCollectionEditorConfig(content.meta.sectionKey, draftBody)
    if (
      !config ||
      config.routeSegment !== 'package' ||
      content.meta.sectionKey !== 'packages_showcase'
    ) {
      return
    }

    const index = packageId !== undefined ? Number(packageId) : null
    if (index !== 0) {
      return
    }

    const rawItems = getValueAtPath(draftBody, config.itemPath)
    const list = Array.isArray(rawItems) ? rawItems : []
    const activeValue = list[index] as JsonValue | undefined
    const process = isRecord(activeValue)
      ? (activeValue as Record<string, unknown>).process
      : undefined
    const steps = isRecord(process)
      ? (process as Record<string, unknown>).steps
      : undefined

    if (!Array.isArray(steps) || steps.length === 0) {
      return
    }

    onDraftChange(
      applyValueAtPath(
        draftBody,
        [...config.itemPath, index, 'process', 'steps'],
        () => [] as unknown as JsonValue,
      ) as ContentBody,
    )
  }, [status, content, draftBody, onDraftChange, packageId])

  if (status === 'loading') {
    return <LoadingState />
  }

  if (status === 'error') {
    return (
      <EmptyState
        title="تعذر تحميل تفاصيل القسم"
        description={error || 'حدث خطأ أثناء قراءة بيانات القسم المختار.'}
        action={
          <button
            type="button"
            onClick={onRetry}
            className="rounded-2xl bg-[var(--brand-coral)] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
          >
            إعادة المحاولة
          </button>
        }
      />
    )
  }

  if (status === 'idle' || !content || !draftBody) {
    return (
      <EmptyState
        title="اختر قسماً من السايدبار"
        description="بمجرد اختيار أي عنصر من القائمة ستظهر هنا حقوله القابلة للتعديل مع حفظ مباشر على الـ API."
      />
    )
  }

  const currentContent = content
  const isBlogPreviewSection = currentContent.meta.sectionKey === 'blog_preview'
  const isWorksSection = currentContent.meta.sectionKey === 'works_projects'
  const blogCategoryOptions = isBlogPreviewSection
    ? resolveBlogCategoryOptions(draftBody)
    : []
  const workCategoryOptions: BlogCategoryOption[] = isWorksSection
    ? (Array.isArray((draftBody as Record<string, unknown>).workCategories)
        ? ((draftBody as Record<string, unknown>).workCategories as string[])
            .filter((c) => typeof c === 'string' && c.trim())
            .map((c) => ({ id: c.trim(), name: c.trim() }))
        : [])
    : []
  const effectiveCategoryOptions = isWorksSection ? workCategoryOptions : blogCategoryOptions
  const hasCategoriesField = Object.prototype.hasOwnProperty.call(
    draftBody,
    'categories',
  )
  const hasCommentsField = Object.prototype.hasOwnProperty.call(
    draftBody,
    'comments',
  )
  const isPackagesSection = currentContent.meta.sectionKey === 'packages_showcase'
  const isHeaderNavSection = currentContent.meta.sectionKey === 'header_navigation'
  const isBrandStorySection = currentContent.meta.sectionKey === 'brand_story'
  const previewEntries = Object.entries(draftBody)
    .filter(
      ([key]) =>
        key !== '_meta' &&
        !hiddenFieldKeys.has(key) &&
        !(isPackagesSection && key === 'image') &&
        !(isPackagesSection && (key === 'items' || key === 'packageDetails')),
    )
    .map(([key, value]) => {
      if (isHeaderNavSection && key === 'navigation' && Array.isArray(value)) {
        const normalized = value.map((item) =>
          item && typeof item === 'object' && !Array.isArray(item) && !('archived' in item)
            ? { ...(item as object), archived: false }
            : item
        )
        return [key, normalized] as [string, JsonValue]
      }
      return [key, value as JsonValue] as [string, JsonValue]
    })
  if (isBrandStorySection && !Object.prototype.hasOwnProperty.call(draftBody, 'image')) {
    previewEntries.push(['image', ''] as [string, JsonValue])
  }

  if (isBlogPreviewSection && !hasCategoriesField) {
    previewEntries.push(['categories', blogCategoryOptions as unknown as JsonValue])
  }
  if (isBlogPreviewSection && !hasCommentsField) {
    previewEntries.push(['comments', [] as unknown as JsonValue])
  }
  const collectionConfig = resolveCollectionEditorConfig(
    currentContent.meta.sectionKey,
    draftBody,
  )
  const isWorksProjectsSection = currentContent.meta.sectionKey === 'works_projects'
  const canToggleProjectHero =
    isWorksProjectsSection && typeof onToggleProjectInHomeHero === 'function'
  const collectionRouteId =
    collectionConfig?.routeSegment === 'project'
      ? projectId
      : collectionConfig?.routeSegment === 'gallery-item'
        ? galleryItemId
        : collectionConfig?.routeSegment === 'slide'
          ? slideId
          : collectionConfig?.routeSegment === 'post'
          ? postId
          : collectionConfig?.routeSegment === 'service'
            ? serviceId
            : collectionConfig?.routeSegment === 'package'
              ? packageId
              : undefined
  const collectionValue = collectionConfig
    ? getValueAtPath(draftBody, collectionConfig.itemPath)
    : null
  const collectionItems = Array.isArray(collectionValue) ? collectionValue : []
  const collectionPathKey = collectionConfig
    ? resolveCollectionPathKey(collectionConfig.itemPath)
    : null
  const collectionRootKey = collectionConfig
    ? resolveCollectionRootKey(collectionConfig.itemPath)
    : null
  const isCollectionSection = collectionConfig !== null
  const isCollectionEditorRoute =
    isCollectionSection && collectionRouteId !== undefined
  const activeCollectionIndex =
    isCollectionEditorRoute && collectionRouteId !== undefined
      ? Number(collectionRouteId)
      : null
  const hasValidCollectionIndex =
    activeCollectionIndex !== null &&
    Number.isInteger(activeCollectionIndex) &&
    activeCollectionIndex >= 0 &&
    activeCollectionIndex < collectionItems.length
  const activeCollectionValue = hasValidCollectionIndex
    ? (collectionItems[activeCollectionIndex!] as JsonValue)
    : null
  const packageCardCollection = isPackagesSection && Array.isArray((draftBody as Record<string, JsonValue>).items)
    ? (((draftBody as Record<string, JsonValue>).items as JsonValue[]))
    : []
  const packageDetailCollection = isPackagesSection && Array.isArray((draftBody as Record<string, JsonValue>).packageDetails)
    ? (((draftBody as Record<string, JsonValue>).packageDetails as JsonValue[]))
    : []
  const activePackageCardValue =
    isPackagesSection && hasValidCollectionIndex
      ? packageCardCollection[activeCollectionIndex!] ?? null
      : null
  const activePackageDetailValue =
    isPackagesSection && hasValidCollectionIndex
      ? packageDetailCollection[activeCollectionIndex!] ?? null
      : null
  const activeCollectionTitle =
    collectionConfig && hasValidCollectionIndex
      ? collectionConfig.resolveTitle(
          activeCollectionValue as JsonValue,
          activeCollectionIndex!,
        )
      : collectionConfig?.detailFallbackTitle || 'العنصر'
  const isDirty = JSON.stringify(currentContent.body) !== JSON.stringify(draftBody)
  const activeImageValue = activeImageField
    ? getValueAtPath(draftBody, activeImageField.path)
    : null
  const selectedImageValue =
    activeImageField?.mode === 'field' && typeof activeImageValue === 'string'
      ? activeImageValue
      : null
  const saveToneClass =
    saveStatus === 'saving'
      ? 'border-[rgba(160,149,208,0.34)] bg-[rgba(160,149,208,0.12)]'
      : saveStatus === 'error'
        ? 'border-[rgba(238,32,77,0.35)] bg-[rgba(238,32,77,0.1)]'
        : saveStatus === 'success' || !isDirty
          ? 'border-[rgba(29,171,137,0.35)] bg-[rgba(29,171,137,0.12)]'
          : 'border-[rgba(255,190,92,0.34)] bg-[rgba(255,190,92,0.1)]'
  const saveDotToneClass =
    saveStatus === 'saving'
      ? 'bg-[var(--brand-violet)] shadow-[0_0_18px_rgba(160,149,208,0.85)]'
      : saveStatus === 'error'
        ? 'bg-[var(--brand-coral)] shadow-[0_0_18px_rgba(238,32,77,0.8)]'
        : saveStatus === 'success' || !isDirty
          ? 'bg-[var(--brand-teal)] shadow-[0_0_18px_rgba(29,171,137,0.8)]'
          : 'bg-[#ffbe5c] shadow-[0_0_18px_rgba(255,190,92,0.78)]'
  const saveStatusLabel =
    saveStatus === 'saving'
      ? 'جاري حفظ التعديلات'
      : saveStatus === 'error'
        ? 'تعذر حفظ التعديلات'
        : saveStatus === 'success' || !isDirty
          ? 'كل شيء محفوظ'
          : 'يوجد تغييرات بانتظار الحفظ'

  function handleValueChange(path: PathSegment[], nextValue: JsonValue) {
    const changedKey = path[path.length - 1]
    let nextBody = applyValueAtPath(draftBody, path, () => nextValue) as ContentBody

    if (changedKey === 'title' && typeof nextValue === 'string' && path.length >= 1) {
      const slugPath = [...path.slice(0, -1), 'slug']
      const currentSlug = getValueAtPath(nextBody, slugPath)
      if (!currentSlug || currentSlug === '') {
        const generated = normalizeComparableSlug(nextValue)
        if (generated) {
          nextBody = applyValueAtPath(nextBody, slugPath, () => generated) as ContentBody
        }
      }
    }

    onDraftChange(nextBody)
  }

  function handleCreateBlogCategoryAndSelect(
    path: PathSegment[],
    name: string,
    selectedIds: string[],
  ) {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    const matchedCategory = blogCategoryOptions.find(
      (category) => category.name.toLowerCase() === trimmedName.toLowerCase(),
    )
    const categoryId = matchedCategory?.id || generateRandomItemId()

    const nextBodyWithCategories = applyValueAtPath(
      draftBody,
      ['categories'],
      (currentValue) => {
        const currentCategories = Array.isArray(currentValue)
          ? normalizeBlogCategoryOptionsArray(currentValue as JsonValue[])
          : []
        const alreadyExists = currentCategories.some(
          (category) =>
            category.name.toLowerCase() === trimmedName.toLowerCase(),
        )

        if (alreadyExists) {
          return currentCategories as unknown as JsonValue
        }

        return [
          ...currentCategories,
          {
            id: categoryId,
            name: trimmedName,
          },
        ] as unknown as JsonValue
      },
    ) as ContentBody

    const normalizedSelectedIds = Array.from(
      new Set(
        [...selectedIds, categoryId]
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0),
      ),
    )

    onDraftChange(
      applyValueAtPath(
        nextBodyWithCategories,
        path,
        () => normalizedSelectedIds as unknown as JsonValue,
      ) as ContentBody,
    )
  }

  async function handleMultiImageUpload(files: File[]) {
    if (!files.length || !isRecord(activeCollectionValue)) return
    setMultiUploadState({ uploading: true, done: 0, total: files.length })
    const newBlocks: JsonValue[] = []
    for (let i = 0; i < files.length; i++) {
      try {
        const uploaded = await uploadImageAsset(files[i])
        newBlocks.push({ ...(buildDefaultStoryBlockItem() as Record<string, unknown>), image: uploaded.publicUrl ?? uploaded.filePath ?? '' } as JsonValue)
      } catch { /* skip failed */ }
      setMultiUploadState({ uploading: true, done: i + 1, total: files.length })
    }
    if (newBlocks.length > 0) {
      const storyBlocksPath = [...(collectionConfig?.itemPath ?? []), activeCollectionIndex!, 'storyBlocks']
      onDraftChange(
        applyValueAtPath(draftBody, storyBlocksPath, (currentValue) => {
          const existing = Array.isArray(currentValue) ? currentValue : []
          return [...existing, ...newBlocks]
        }) as ContentBody,
      )
    }
    setMultiUploadState({ uploading: false, done: 0, total: 0 })
  }

  function handleAppendArrayItem(path: PathSegment[], template?: JsonValue) {
    onDraftChange(
      applyValueAtPath(draftBody, path, (currentValue) => {
        if (!Array.isArray(currentValue)) {
          return currentValue
        }

        if (template === undefined && path[path.length - 1] === 'storyBlocks') {
          return [...currentValue, buildDefaultStoryBlockItem()]
        }

        return [...currentValue, buildDefaultArrayItem(template)]
      }) as ContentBody,
    )
  }

  function handleRemoveArrayItem(path: PathSegment[], index: number) {
    onDraftChange(
      applyValueAtPath(draftBody, path, (currentValue) => {
        if (!Array.isArray(currentValue)) {
          return currentValue
        }

        return currentValue.filter((_, itemIndex) => itemIndex !== index)
      }) as ContentBody,
    )
  }

  function requestDeleteConfirmation(request: ConfirmDialogRequest) {
    setDeleteConfirmation(request)
    setDeleteConfirming(false)
  }

  function closeDeleteConfirmation() {
    if (isDeleteConfirming) {
      return
    }

    setDeleteConfirmation(null)
  }

  async function confirmDeleteAction() {
    if (!deleteConfirmation) {
      return
    }

    setDeleteConfirming(true)

    try {
      await deleteConfirmation.onConfirm()
      setDeleteConfirmation(null)
    } finally {
      setDeleteConfirming(false)
    }
  }

  function navigateToCollectionList() {
    navigate(`/content/${currentContent.id}`)
  }

  function navigateToCollectionItem(index: number) {
    if (!collectionConfig) {
      return
    }

    navigate(`/content/${currentContent.id}/${collectionConfig.routeSegment}/${index}`)
  }

  function handleCreateCollectionItem() {
    if (!collectionConfig) {
      return
    }

    const nextItem = collectionConfig.buildDefaultItem(collectionItems[0])
    const nextIndex = collectionItems.length

    onDraftChange(
      applyValueAtPath(draftBody, collectionConfig.itemPath, (currentValue) => {
        if (!Array.isArray(currentValue)) {
          return [nextItem]
        }

        return [...currentValue, nextItem]
      }) as ContentBody,
    )

    navigateToCollectionItem(nextIndex)
  }

  function handleDeleteCollectionItem(index: number) {
    if (!collectionConfig) {
      return
    }

    requestDeleteConfirmation({
      title: collectionConfig.deleteButtonLabel,
      description: collectionConfig.deleteConfirmMessage(index),
      confirmLabel: collectionConfig.deleteButtonLabel,
      onConfirm: () => {
        handleRemoveArrayItem(collectionConfig.itemPath, index)

        if (activeCollectionIndex === index) {
          navigateToCollectionList()
        }
      },
    })
  }

  async function handleToggleProjectHero(
    project: JsonValue,
    index: number,
    shouldInclude: boolean,
  ) {
    if (!onToggleProjectInHomeHero) {
      return
    }

    setProjectHeroActionState({
      status: 'saving',
      index,
      message: null,
    })

    try {
      await onToggleProjectInHomeHero(project, index, shouldInclude)
      setProjectHeroActionState({
        status: 'success',
        index,
        message: shouldInclude
          ? 'تمت إضافة المشروع إلى سلايدر هيرو الصفحة الرئيسية.'
          : 'تمت إزالة المشروع من سلايدر هيرو الصفحة الرئيسية.',
      })
    } catch (toggleError) {
      setProjectHeroActionState({
        status: 'error',
        index,
        message:
          toggleError instanceof Error
            ? toggleError.message
            : 'تعذر تعديل حالة ظهور المشروع في هيرو الصفحة الرئيسية.',
      })
    }
  }

  function renderStandardEditor(entries: Array<[string, JsonValue]>) {
    if (entries.length === 0) {
      return (
        <EmptyState
          title="لا توجد حقول قابلة للتعديل"
          description="القسم الحالي يحتوي فقط على بيانات تعريفية داخل `_meta` بدون محتوى إضافي."
        />
      )
    }

    return (
      <div className="space-y-4">
        {entries.map(([entryKey, entryValue]) => (
          <EditableNode
            key={entryKey}
            label={titleizeFieldLabel(entryKey)}
            fieldKey={entryKey}
            path={[entryKey]}
            value={entryValue as JsonValue}
            categoryOptions={effectiveCategoryOptions}
            onCreateBlogCategoryAndSelect={handleCreateBlogCategoryAndSelect}
            onChange={handleValueChange}
            onAppendArrayItem={handleAppendArrayItem}
            onRemoveArrayItem={handleRemoveArrayItem}
            onOpenImageManager={openImageManager}
            onRequestDeleteConfirmation={requestDeleteConfirmation}
          />
        ))}
      </div>
    )
  }

  function renderPackageEditorSection(config: PackageEditorSectionConfig) {
    const sectionImage = resolvePackageEditorImage(config.value)

    return (
      <section className="rounded-[24px] border border-[rgba(160,149,208,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_50px_rgba(5,5,19,0.18)]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full border border-[rgba(160,149,208,0.16)] bg-black/10 px-2.5 py-1 text-[11px] text-[var(--brand-violet)]">
              {config.badge}
            </div>
            <h3 className="mt-2 text-lg font-semibold text-[var(--brand-text)]">
              {config.title}
            </h3>
            <p className="mt-1 text-sm leading-7 text-[var(--brand-muted)]">
              {config.description}
            </p>
          </div>

          {sectionImage ? (
            <ImageCard
              src={sectionImage}
              alt={config.title}
              caption={config.imageCaption}
            />
          ) : null}
        </div>

        <EditableNode
          label={config.title}
          path={config.path}
          value={config.value}
          categoryOptions={effectiveCategoryOptions}
          onCreateBlogCategoryAndSelect={handleCreateBlogCategoryAndSelect}
          onChange={handleValueChange}
          onAppendArrayItem={handleAppendArrayItem}
          onRemoveArrayItem={handleRemoveArrayItem}
          onOpenImageManager={openImageManager}
          onRequestDeleteConfirmation={requestDeleteConfirmation}
        />
      </section>
    )
  }

  function openImageManager(
    path: PathSegment[],
    label: string,
    mode: 'field' | 'html' = 'field',
  ) {
    setActiveImageField({
      path,
      label,
      mode,
    })
    setImageActionState({
      status: 'idle',
      message: null,
      imageId: null,
    })
  }

  function closeImageManager() {
    setActiveImageField(null)
    setImageActionState({
      status: 'idle',
      message: null,
      imageId: null,
    })
  }

  function retryImageLibrary() {
    setImageLibrary((current) => ({
      ...current,
      status: 'loading',
      error: null,
    }))

    void fetchImages()
      .then((items) => {
        setImageLibrary({
          status: 'success',
          items,
          error: null,
        })
      })
      .catch((loadError) => {
        setImageLibrary({
          status: 'error',
          items: [],
          error:
            loadError instanceof Error
              ? loadError.message
              : 'تعذر قراءة مكتبة الصور.',
        })
      })
  }

  function clearActiveImageField() {
    if (!activeImageField) {
      return
    }

    if (activeImageField.mode === 'html') {
      closeImageManager()
      return
    }

    handleValueChange(activeImageField.path, '')
    setImageActionState({
      status: 'success',
      message: 'تمت إزالة الصورة من الحقل الحالي.',
      imageId: null,
    })
  }

  function assignImageToActiveField(image: ImageAsset) {
    if (!activeImageField) {
      return
    }

    const imageUrl = resolveImageAssetUrl(image)

    if (!imageUrl) {
      setImageActionState({
        status: 'error',
        message: 'تعذر تجهيز الصورة الحالية للاستخدام.',
        imageId: image.id,
      })
      return
    }

    if (activeImageField.mode === 'html') {
      const currentValue = getValueAtPath(draftBody, activeImageField.path)
      const currentHtml = typeof currentValue === 'string' ? currentValue.trim() : ''
      const imageMarkup = buildHtmlImageMarkup(
        imageUrl,
        image.originalFileName || activeImageField.label,
      )
      const nextHtml = currentHtml ? `${currentHtml}\n${imageMarkup}` : imageMarkup

      handleValueChange(activeImageField.path, nextHtml)
      setImageActionState({
        status: 'success',
        message: 'تم إدراج الصورة داخل محتوى المقال. لا تنس حفظ التعديلات.',
        imageId: image.id,
      })
      closeImageManager()
      return
    }

    handleValueChange(activeImageField.path, imageUrl)
    setImageActionState({
      status: 'success',
      message: 'تم تعيين الصورة للحقل الحالي. لا تنس حفظ التعديلات على القسم.',
      imageId: image.id,
    })
  }

  async function handleUploadImage(file: File) {
    setImageActionState({
      status: 'uploading',
      message: 'جاري رفع الصورة وتعيينها للحقل الحالي...',
      imageId: null,
    })

    try {
      const uploadedImage = await uploadImageAsset(file)

      setImageLibrary((current) => ({
        status: 'success',
        items: [
          uploadedImage,
          ...current.items.filter((item) => item.id !== uploadedImage.id),
        ],
        error: null,
      }))
      assignImageToActiveField(uploadedImage)
    } catch (uploadError) {
      setImageActionState({
        status: 'error',
        message:
          uploadError instanceof Error
            ? uploadError.message
            : 'تعذر رفع الصورة الحالية.',
        imageId: null,
      })
    }
  }

  async function handleRenameImage(imageId: string, originalFileName: string) {
    setImageActionState({
      status: 'saving',
      message: 'جاري تعديل اسم الصورة...',
      imageId,
    })

    try {
      const updatedImage = await updateImageAsset(imageId, originalFileName)

      setImageLibrary((current) => ({
        status: 'success',
        items: current.items.map((item) =>
          item.id === imageId ? updatedImage : item,
        ),
        error: null,
      }))
      setImageActionState({
        status: 'success',
        message: 'تم تعديل اسم الصورة.',
        imageId,
      })
    } catch (renameError) {
      setImageActionState({
        status: 'error',
        message:
          renameError instanceof Error
            ? renameError.message
            : 'تعذر تعديل بيانات الصورة.',
        imageId,
      })
    }
  }

  async function handleDeleteImage(image: ImageAsset) {
    requestDeleteConfirmation({
      title: 'حذف الصورة',
      description: `سيتم حذف الصورة "${image.originalFileName || 'بدون اسم'}" من المكتبة نهائياً. إذا كانت مستخدمة في أي مكان ستحتاج إلى تعيين بديل لها يدوياً.`,
      confirmLabel: 'حذف الصورة',
      onConfirm: async () => {
        setImageActionState({
          status: 'deleting',
          message: 'جاري حذف الصورة...',
          imageId: image.id,
        })

        try {
          await deleteImageAsset(image.id)

          setImageLibrary((current) => ({
            status: 'success',
            items: current.items.filter((item) => item.id !== image.id),
            error: null,
          }))

          if (selectedImageValue === resolveImageAssetUrl(image)) {
            clearActiveImageField()
          } else {
            setImageActionState({
              status: 'success',
              message: 'تم حذف الصورة من المكتبة.',
              imageId: image.id,
            })
          }
        } catch (deleteError) {
          setImageActionState({
            status: 'error',
            message:
              deleteError instanceof Error
                ? deleteError.message
                : 'تعذر حذف الصورة الحالية.',
            imageId: image.id,
          })
        }
      },
    })
  }

  let sectionTitle =
    currentContent.meta.tabLabel ||
    currentContent.meta.sectionKey ||
    currentContent.contentTypeName
  let sectionDescription =
    'تعديل مباشر على الحقول مع حفظ فوري على الخادم، ضمن واجهة عربية أوضح وأسهل في التعامل.'
  let extraHeaderActions: ReactNode = null
  let sectionBody: ReactNode = renderStandardEditor(previewEntries)

  if (collectionConfig && !isCollectionEditorRoute) {
    const isBlogPreviewCollection =
      currentContent.meta.sectionKey === 'blog_preview'
    const otherEntries = previewEntries.filter(
      ([entryKey]) =>
        entryKey !== (collectionRootKey || collectionPathKey || ''),
    )
    const commentEntries = isBlogPreviewCollection
      ? otherEntries.filter(([entryKey]) => entryKey === 'comments')
      : []
    const nonCommentEntries = isBlogPreviewCollection
      ? otherEntries.filter(([entryKey]) => entryKey !== 'comments')
      : otherEntries
    const orderedNonCommentEntries = isBlogPreviewCollection
      ? [...nonCommentEntries].sort(([leftKey], [rightKey]) => {
          const priority: Record<string, number> = {
            categories: 1,
            label: 2,
            title: 3,
            description: 4,
          }

          const leftPriority = priority[leftKey] ?? 100
          const rightPriority = priority[rightKey] ?? 100

          return leftPriority - rightPriority
        })
      : nonCommentEntries
    const otherEntriesEditor =
      orderedNonCommentEntries.length > 0
        ? renderStandardEditor(orderedNonCommentEntries)
        : null
    const commentEntriesEditor =
      commentEntries.length > 0 ? renderStandardEditor(commentEntries) : null
    const collectionListSection = (
      <section className="rounded-[24px] border border-[rgba(160,149,208,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_50px_rgba(5,5,19,0.18)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full border border-[rgba(160,149,208,0.16)] bg-black/10 px-2.5 py-1 text-[11px] text-[var(--brand-violet)]">
              {collectionConfig.listBadge}
            </div>
            <h3 className="mt-2 text-lg font-semibold text-[var(--brand-text)]">
              {collectionConfig.listTitle}
            </h3>
            <p className="mt-1 text-sm text-[var(--brand-muted)]">
              {collectionConfig.itemCountLabel(collectionItems.length)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateCollectionItem}
            className="rounded-[16px] bg-[var(--brand-teal)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            {collectionConfig.addButtonLabel}
          </button>
        </div>

        {isPackagesSection ? (
          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="rounded-[18px] border border-[rgba(29,171,137,0.18)] bg-[rgba(29,171,137,0.08)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--brand-text)]">
                تعديل مرتب للباقات
              </p>
              <p className="mt-1 text-sm leading-7 text-[var(--brand-muted)]">
                كل باقة هنا تعرض لك المسار وعدد الخطط والكروت والوسائط، وبعد الضغط على
                تعديل تنتقل مباشرة إلى نفس الباقة فقط.
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(160,149,208,0.14)] bg-black/10 px-4 py-3">
              <p className="text-sm font-semibold text-[var(--brand-text)]">
                إعدادات الصفحة العامة
              </p>
              <p className="mt-1 text-sm leading-7 text-[var(--brand-muted)]">
                الحقول خارج هذه القائمة تبقى خاصة بعنوان صفحة الباقات ووصفها العام، وليس
                بمحتوى الباقة نفسها.
              </p>
            </div>
          </div>
        ) : null}

        {canToggleProjectHero && projectHeroActionState.message ? (
          <div
            className={cn(
              'mb-4 rounded-[16px] border px-3 py-2 text-sm',
              projectHeroActionState.status === 'error'
                ? 'border-[rgba(238,32,77,0.35)] bg-[rgba(238,32,77,0.08)] text-[var(--brand-coral)]'
                : 'border-[rgba(29,171,137,0.35)] bg-[rgba(29,171,137,0.1)] text-[var(--brand-text)]',
            )}
          >
            {projectHeroActionState.message}
          </div>
        ) : null}

        {collectionItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {collectionItems.map((item, index) => {
              const isProjectAddedToHero =
                canToggleProjectHero && isProjectInHomeHero(item, homeHeroSlides)
              const isHeroActionSaving =
                projectHeroActionState.status === 'saving' &&
                projectHeroActionState.index === index

              return (
                <ProjectCard
                  key={`${collectionPathKey || 'collection'}-${index}`}
                  title={collectionConfig.resolveTitle(item, index)}
                  subtitle={collectionConfig.resolveSubtitle(item)}
                  imageSrc={collectionConfig.resolveImage(item)}
                  metaItems={
                    isPackagesSection ? resolvePackageMetaItems(item) : undefined
                  }
                  editLabel={collectionConfig.editButtonLabel}
                  deleteLabel={collectionConfig.deleteButtonLabel}
                  extraAction={
                    canToggleProjectHero ? (
                      <button
                        type="button"
                        onClick={() => {
                          void handleToggleProjectHero(
                            item,
                            index,
                            !isProjectAddedToHero,
                          )
                        }}
                        disabled={isHeroActionSaving}
                        className={cn(
                          'rounded-[16px] border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
                          isProjectAddedToHero
                            ? 'border-[rgba(29,171,137,0.32)] bg-[rgba(29,171,137,0.14)] text-[var(--brand-teal)] hover:bg-[rgba(29,171,137,0.2)]'
                            : 'border-[color:var(--brand-border)] bg-white/5 text-[var(--brand-muted)] hover:border-[color:var(--brand-border-strong)] hover:bg-white/10',
                        )}
                      >
                        {isHeroActionSaving
                          ? 'جاري التحديث...'
                          : isProjectAddedToHero
                            ? 'مضاف للهيرو'
                            : 'إضافة للهيرو'}
                      </button>
                    ) : null
                  }
                  onEdit={() => navigateToCollectionItem(index)}
                  onDelete={() => handleDeleteCollectionItem(index)}
                />
              )
            })}
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-[color:var(--brand-border)] px-4 py-5 text-sm text-[var(--brand-muted)]">
            {collectionConfig.emptyListMessage}
          </div>
        )}
      </section>
    )

    sectionTitle = collectionConfig.sectionTitle
    sectionDescription = collectionConfig.sectionDescription
    if (isBlogPreviewCollection) {
      sectionBody = (
        <div className="space-y-5">
          {otherEntriesEditor}
          {collectionListSection}
          {commentEntriesEditor}
        </div>
      )
    } else {
      sectionBody = (
        <div className="space-y-5">
          {collectionConfig.otherEntriesPlacement === 'before'
            ? otherEntriesEditor
            : null}
          {collectionListSection}
          {collectionConfig.otherEntriesPlacement === 'after'
            ? otherEntriesEditor
            : null}
        </div>
      )
    }
  } else if (collectionConfig && isCollectionEditorRoute) {
    const isProjectEditorRoute =
      canToggleProjectHero &&
      hasValidCollectionIndex &&
      activeCollectionValue !== null
    const isActiveProjectAddedToHero =
      isProjectEditorRoute
        ? isProjectInHomeHero(activeCollectionValue as JsonValue, homeHeroSlides)
        : false

    extraHeaderActions = (
      <div className="flex flex-wrap gap-3">
        {isProjectEditorRoute ? (
          <button
            type="button"
            onClick={() => {
              void handleToggleProjectHero(
                activeCollectionValue as JsonValue,
                activeCollectionIndex!,
                !isActiveProjectAddedToHero,
              )
            }}
            disabled={
              projectHeroActionState.status === 'saving' &&
              projectHeroActionState.index === activeCollectionIndex
            }
            className={cn(
              'rounded-[16px] border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
              isActiveProjectAddedToHero
                ? 'border-[rgba(29,171,137,0.32)] bg-[rgba(29,171,137,0.14)] text-[var(--brand-teal)] hover:bg-[rgba(29,171,137,0.2)]'
                : 'border-[color:var(--brand-border)] text-[var(--brand-muted)] hover:border-[color:var(--brand-border-strong)] hover:bg-white/6',
            )}
          >
            {projectHeroActionState.status === 'saving' &&
            projectHeroActionState.index === activeCollectionIndex
              ? 'جاري التحديث...'
              : isActiveProjectAddedToHero
                ? 'مضاف للهيرو'
                : 'إضافة للهيرو'}
          </button>
        ) : null}
        <button
          type="button"
          onClick={navigateToCollectionList}
          className="rounded-[16px] border border-[color:var(--brand-border)] px-4 py-2.5 text-sm font-medium text-[var(--brand-muted)] transition hover:border-[color:var(--brand-border-strong)] hover:bg-white/6"
        >
          {collectionConfig.backButtonLabel}
        </button>
        {hasValidCollectionIndex ? (
          <button
            type="button"
            onClick={() => handleDeleteCollectionItem(activeCollectionIndex!)}
            className="rounded-[16px] border border-[rgba(238,32,77,0.28)] bg-[rgba(238,32,77,0.08)] px-4 py-2.5 text-sm font-medium text-[var(--brand-coral)] transition hover:bg-[rgba(238,32,77,0.14)]"
          >
            {collectionConfig.deleteButtonLabel}
          </button>
        ) : null}
      </div>
    )

    if (!hasValidCollectionIndex || !isRecord(activeCollectionValue)) {
      sectionTitle = collectionConfig.missingItemTitle
      sectionDescription = collectionConfig.missingItemDescription
      sectionBody = (
        <EmptyState
          title={collectionConfig.missingItemTitle}
          description={collectionConfig.missingItemDescription}
          action={
            <button
              type="button"
              onClick={navigateToCollectionList}
              className="rounded-2xl bg-[var(--brand-teal)] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
            >
              {collectionConfig.missingItemActionLabel}
            </button>
          }
        />
      )
    } else {
      sectionTitle = activeCollectionTitle
      sectionDescription = collectionConfig.editorDescription
      sectionBody = (
        <section className="rounded-[24px] border border-[rgba(160,149,208,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_50px_rgba(5,5,19,0.18)]">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex rounded-full border border-[rgba(160,149,208,0.16)] bg-black/10 px-2.5 py-1 text-[11px] text-[var(--brand-violet)]">
                {collectionConfig.editorBadge}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-[var(--brand-text)]">
                {activeCollectionTitle}
              </h3>
              <p className="mt-1 text-sm leading-7 text-[var(--brand-muted)]">
                {collectionConfig.resolveSubtitle(activeCollectionValue)}
              </p>
            </div>

            {collectionConfig.resolveImage(activeCollectionValue) ? (
              <ImageCard
                src={collectionConfig.resolveImage(activeCollectionValue)!}
                alt={activeCollectionTitle}
                caption={collectionConfig.imageCaption}
              />
            ) : null}
          </div>

          {isWorksProjectsSection ? (
            <div className="mb-4">
              <input
                ref={multiUploadRef}
                type="file"
                accept="image/*,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files ? Array.from(e.target.files) : []
                  e.target.value = ''
                  if (selected.length) void handleMultiImageUpload(selected)
                }}
              />
              {multiUploadState.uploading ? (
                <div className="rounded-xl border border-[rgba(160,149,208,0.2)] bg-[rgba(160,149,208,0.08)] px-4 py-3 text-sm" style={{ color: 'var(--brand-violet)' }}>
                  جاري رفع الصور... {multiUploadState.done}/{multiUploadState.total}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => multiUploadRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
                  style={{ borderColor: 'var(--brand-violet)', color: 'var(--brand-violet)', background: 'rgba(160,149,208,0.07)' }}
                >
                  <span>+</span>
                  <span>رفع صور متعددة للمشاهد</span>
                </button>
              )}
            </div>
          ) : null}

          {isPackagesSection ? (
            <div className="space-y-5">
              {isRecord(activePackageCardValue)
                ? renderPackageEditorSection({
                    title: `${activeCollectionTitle} - البطاقة الخارجية`,
                    badge: 'واجهة الباقة',
                    description:
                      'هذا القسم خاص بما يظهر في كرت الباقة داخل صفحة الباقات: صورة الغلاف، العنوان، الوصف المختصر، السعر، الزر، والمحتوى الخارجي.',
                    path: ['items', activeCollectionIndex!],
                    value: activePackageCardValue,
                    imageCaption: 'صورة البطاقة',
                  })
                : null}
              {isRecord(activePackageDetailValue)
                ? renderPackageEditorSection({
                    title: `${activeCollectionTitle} - تفاصيل الصفحة الداخلية`,
                    badge: 'تفاصيل الباقة',
                    description:
                      'هذا القسم خاص بما يظهر داخل صفحة الباقة نفسها: الهيرو، النصوص الداخلية، خطوات العمل، الصور، الفيديوهات، والغالبية الكاملة للمحتوى.',
                    path: ['packageDetails', activeCollectionIndex!],
                    value: (() => {
                      const detailBase = {
                        ...activePackageDetailValue,
                      } as Record<string, JsonValue>
                      if (!Object.prototype.hasOwnProperty.call(detailBase, 'videos')) detailBase.videos = []
                      if (!Object.prototype.hasOwnProperty.call(detailBase, 'categoryTag')) detailBase.categoryTag = ''
                      return detailBase as JsonValue
                    })(),
                    imageCaption: 'صورة التفاصيل',
                  })
                : null}
              {!isRecord(activePackageCardValue) && !isRecord(activePackageDetailValue) ? (
                <EmptyState
                  title="تعذر العثور على بيانات الباقة"
                  description="لا توجد بيانات كافية لهذه الباقة داخل البطاقة الخارجية أو تفاصيل الصفحة الداخلية."
                />
              ) : null}
            </div>
          ) : (
          <EditableNode
            label={activeCollectionTitle}
            path={[...collectionConfig.itemPath, activeCollectionIndex!]}
            value={
              isBlogPreviewSection && isRecord(activeCollectionValue)
                  ? {
                      ...activeCollectionValue,
                      ...(!Object.prototype.hasOwnProperty.call(activeCollectionValue, 'tags') ? { tags: '' } : {}),
                    }
                  : activeCollectionValue
            }
            categoryOptions={effectiveCategoryOptions}
            onCreateBlogCategoryAndSelect={handleCreateBlogCategoryAndSelect}
            onChange={handleValueChange}
            onAppendArrayItem={handleAppendArrayItem}
            onRemoveArrayItem={handleRemoveArrayItem}
            onOpenImageManager={openImageManager}
            onRequestDeleteConfirmation={requestDeleteConfirmation}
          />)}
        </section>
      )
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-[rgba(160,149,208,0.16)] bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_20px_70px_rgba(5,5,19,0.3)] sm:p-5">
        <div className="flex flex-col gap-4 border-b border-[color:var(--brand-border)] pb-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-[rgba(29,171,137,0.22)] bg-[rgba(29,171,137,0.1)] px-3 py-1 text-[11px] text-[var(--brand-teal)]">
              القسم الحالي
            </div>
            <p className="mt-2.5 text-sm text-[var(--brand-subtle)]">
              {currentContent.meta.tabLabel ||
                currentContent.meta.sectionKey ||
                currentContent.contentTypeName}
            </p>
            <h2 className="mt-1.5 text-xl font-semibold text-[var(--brand-text)] sm:text-2xl">
              {sectionTitle}
            </h2>
            <p className="mt-2.5 max-w-3xl text-sm leading-7 text-[var(--brand-muted)]">
              {sectionDescription}
            </p>
          </div>

          <div className="w-full xl:max-w-[320px]">
            <div
              className={cn(
                'rounded-[20px] border px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
                saveToneClass,
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn('inline-block h-3 w-3 rounded-full', saveDotToneClass)} />
                <div>
                  <p className="text-xs tracking-[0.12em] text-[var(--brand-subtle)]">
                    حالة الحفظ
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--brand-text)]">
                    {saveStatusLabel}
                  </p>
                </div>
              </div>
              <p className="mt-2.5 text-sm leading-7 text-[var(--brand-text)]">
                {saveMessage
                  ? saveMessage
                  : isDirty
                    ? 'يوجد تعديلات غير محفوظة بعد، اضغط حفظ التعديلات لتثبيتها على الخادم.'
                    : 'جميع التعديلات محفوظة حالياً.'}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 xl:justify-end">
              {extraHeaderActions}
              <button
                type="button"
                onClick={onResetDraft}
                disabled={!isDirty || saveStatus === 'saving'}
                className="rounded-[16px] border border-[color:var(--brand-border)] px-4 py-2.5 text-sm font-medium text-[var(--brand-muted)] transition hover:border-[color:var(--brand-border-strong)] hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-50"
              >
                تراجع عن التعديلات
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={!isDirty || saveStatus === 'saving'}
                className="rounded-[16px] bg-[var(--brand-teal)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveStatus === 'saving' ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {sectionBody}

      <ImageLibraryModal
        isOpen={Boolean(activeImageField)}
        fieldLabel={
          activeImageField?.mode === 'html'
            ? `إدراج صورة داخل ${activeImageField.label}`
            : activeImageField?.label || 'الصورة'
        }
        selectedImageValue={selectedImageValue}
        images={imageLibrary.items}
        status={imageLibrary.status}
        error={imageLibrary.error}
        actionStatus={imageActionState.status}
        actionMessage={imageActionState.message}
        actionImageId={imageActionState.imageId}
        onClose={closeImageManager}
        onRetry={retryImageLibrary}
        onUpload={handleUploadImage}
        onSelect={assignImageToActiveField}
        onRename={handleRenameImage}
        onDelete={handleDeleteImage}
        onClearSelection={clearActiveImageField}
        clearActionLabel={
          activeImageField?.mode === 'html' ? 'إلغاء الإدراج' : undefined
        }
      />

      <ConfirmDialog
        request={deleteConfirmation}
        isProcessing={isDeleteConfirming}
        onCancel={closeDeleteConfirmation}
        onConfirm={confirmDeleteAction}
      />
    </div>
  )
}
