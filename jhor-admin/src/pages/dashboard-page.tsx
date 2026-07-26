import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ContentDetailPanel } from '../components/content-detail-panel'
import { ContentSidebar } from '../components/content-sidebar'
import { DashboardShell } from '../components/dashboard-shell'
import { ErrorBoundary } from '../components/error-boundary'
import { OrdersPage } from './orders-page'
import { BriefsPage } from './briefs-page'
import { PackagesEditorPage } from './packages-editor-page'
import { SectorsEditorPage } from './sectors-editor-page'
import { SliderCardsEditorPage } from './slider-cards-editor-page'
import { HeroEditorPage } from './hero-editor-page'
import { SettingsPage } from './settings-page'
import { VideoManagerPage } from './video-manager-page'
import {
  buildSidebarGroups,
  fetchContentDetail,
  fetchContentList,
  updateContentDetail,
} from '../lib/content-api'
import { cloneJsonValue, isRecord, normalizeSlugValue } from '../lib/utils'
import type {
  ContentBody,
  ContentDetail,
  ContentListItem,
  JsonValue,
  SidebarGroup,
  SidebarItem,
} from '../types/content'

interface DashboardPageProps {
  username: string
  onLogout: () => void
  onOpenCredentials: () => void
  settingsMode?: boolean
  videosMode?: boolean
  packagesMode?: boolean
  sectorsMode?: boolean
  sliderCardsMode?: boolean
  heroMode?: boolean
  ordersMode?: boolean
  briefsMode?: boolean
  authToken?: string
}

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

const removableLegacyFieldKeys = new Set([
  'widthClass',
  'imageWidthClass',
  'gifWidthClass',
  'enterDelay',
])

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

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10)
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

function resolveBlogCollectionPath(body: ContentBody) {
  const candidatePaths = ['posts', 'items', 'articles'] as const

  for (const candidate of candidatePaths) {
    if (Array.isArray(body[candidate])) {
      return candidate
    }
  }

  return 'items'
}

function normalizeBlogCategoryDefinitions(value: JsonValue | undefined) {
  if (!Array.isArray(value)) {
    return [] as BlogCategoryOption[]
  }

  const usedIds = new Set<string>()
  const usedNames = new Set<string>()
  const options: BlogCategoryOption[] = []

  for (const entry of value) {
    let option: BlogCategoryOption | null = null

    if (typeof entry === 'string') {
      const name = entry.trim()

      if (name && !shouldIgnoreCategoryName(name)) {
        option = {
          id: buildStableCategoryId(name),
          name,
        }
      }
    } else if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      const name = typeof entry.name === 'string' ? entry.name.trim() : ''

      const rawId =
        typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : ''

      if (name && !shouldIgnoreCategoryName(name, rawId)) {
        option = {
          id: rawId || buildStableCategoryId(name),
          name,
        }
      }
    }

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

function normalizePostCategoryValue(value: JsonValue | undefined) {
  if (Array.isArray(value)) {
    return normalizeBlogCategoryDefinitions(value as JsonValue[])
  }

  if (typeof value === 'string' || (value && typeof value === 'object')) {
    return normalizeBlogCategoryDefinitions([value as JsonValue])
  }

  return [] as BlogCategoryOption[]
}

function normalizeBlogComments(value: JsonValue | undefined) {
  if (!Array.isArray(value)) {
    return [] as BlogCommentItem[]
  }

  const comments: BlogCommentItem[] = []
  const usedIds = new Set<string>()

  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      continue
    }

    let id =
      typeof entry.id === 'string' && entry.id.trim()
        ? entry.id.trim()
        : generateRandomItemId()

    if (usedIds.has(id)) {
      id = `${id}-${comments.length + 1}`
    }

    usedIds.add(id)

    const userName =
      typeof entry.userName === 'string'
        ? entry.userName.trim()
        : typeof entry.name === 'string'
          ? entry.name.trim()
          : ''
    const comment =
      typeof entry.comment === 'string'
        ? entry.comment.trim()
        : typeof entry.text === 'string'
          ? entry.text.trim()
          : ''
    const rawDate =
      typeof entry.date === 'string' ? entry.date.trim() : ''
    const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : getTodayIsoDate()

    comments.push({
      id,
      userName,
      date,
      comment,
    })
  }

  return comments
}

function ensureBlogPreviewBodyShape(body: ContentBody): ContentBody {
  const nextBody = cloneJsonValue(body)
  const blogCollectionPath = resolveBlogCollectionPath(nextBody)
  const blogItemsRaw = nextBody[blogCollectionPath]
  const categoryDefinitions = normalizeBlogCategoryDefinitions(
    nextBody.categories as JsonValue | undefined,
  )
  const knownNames = new Set(
    categoryDefinitions.map((category) => category.name.toLowerCase()),
  )
  const knownByName = new Map(
    categoryDefinitions.map((category) => [category.name.toLowerCase(), category.id]),
  )
  const knownById = new Map(
    categoryDefinitions.map((category) => [category.id, category.name]),
  )

  if (Array.isArray(blogItemsRaw)) {
    for (const postEntry of blogItemsRaw) {
      if (
        postEntry &&
        typeof postEntry === 'object' &&
        !Array.isArray(postEntry)
      ) {
        const postCategories = normalizePostCategoryValue(
          postEntry.category as JsonValue | undefined,
        )

        for (const categoryOption of postCategories) {
          const normalizedCategoryName = categoryOption.name.toLowerCase()

          if (!knownNames.has(normalizedCategoryName)) {
            const nextCategory = {
              id: categoryOption.id || buildStableCategoryId(categoryOption.name),
              name: categoryOption.name,
            }

            categoryDefinitions.push(nextCategory)
            knownNames.add(normalizedCategoryName)
            knownByName.set(normalizedCategoryName, nextCategory.id)
            knownById.set(nextCategory.id, nextCategory.name)
          }
        }
      }
    }
  }

  nextBody.categories = categoryDefinitions as unknown as JsonValue
  nextBody.comments = normalizeBlogComments(
    nextBody.comments as JsonValue | undefined,
  ) as unknown as JsonValue

  if (Array.isArray(blogItemsRaw)) {
    nextBody[blogCollectionPath] = blogItemsRaw.map((postEntry) => {
      if (!postEntry || typeof postEntry !== 'object' || Array.isArray(postEntry)) {
        return postEntry as JsonValue
      }

      const nextPost = { ...postEntry } as Record<string, JsonValue>
      const selectedCategoryIds: string[] = []

      if (Array.isArray(nextPost.categoryIds)) {
        for (const categoryId of nextPost.categoryIds) {
          if (typeof categoryId === 'string' && categoryId.trim()) {
            selectedCategoryIds.push(categoryId.trim())
          }
        }
      }

      if (Object.prototype.hasOwnProperty.call(nextPost, 'category')) {
        const legacyCategories = normalizePostCategoryValue(
          nextPost.category as JsonValue | undefined,
        )

        for (const legacyCategory of legacyCategories) {
          const legacyCategoryName = legacyCategory.name.toLowerCase()
          let matchedCategoryId = knownByName.get(legacyCategoryName)

          if (!matchedCategoryId) {
            const nextCategory = {
              id: legacyCategory.id || buildStableCategoryId(legacyCategory.name),
              name: legacyCategory.name,
            }

            categoryDefinitions.push(nextCategory)
            knownNames.add(legacyCategoryName)
            knownByName.set(legacyCategoryName, nextCategory.id)
            knownById.set(nextCategory.id, nextCategory.name)
            matchedCategoryId = nextCategory.id
          }

          if (matchedCategoryId) {
            selectedCategoryIds.push(matchedCategoryId)
          }
        }
      }

      const uniqueKnownCategoryIds = Array.from(
        new Set(selectedCategoryIds),
      ).filter((categoryId) => knownById.has(categoryId))

      nextPost.categoryIds = uniqueKnownCategoryIds as JsonValue

      const selectedCategories = uniqueKnownCategoryIds.map((categoryId) => ({
        id: categoryId,
        name: knownById.get(categoryId) || categoryId,
      }))

      nextPost.category = selectedCategories as unknown as JsonValue

      if (
        typeof nextPost.publishDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(nextPost.publishDate.trim())
      ) {
        nextPost.publishDate = getTodayIsoDate() as JsonValue
      } else {
        nextPost.publishDate = nextPost.publishDate.trim() as JsonValue
      }

      return nextPost as JsonValue
    }) as JsonValue
  }

  return nextBody
}

function buildStablePackageId(title: string, index: number) {
  const seed = title.trim() || `package-${index + 1}`
  let hash = 0

  for (let position = 0; position < seed.length; position += 1) {
    hash = (hash * 31 + seed.charCodeAt(position)) >>> 0
  }

  return `pkg-${index + 1}-${hash.toString(36)}`
}

function resolvePackageDetailsTitle(title: string, index: number) {
  if (title.includes('الحملات')) {
    return 'باقات الحملات'
  }

  if (title.includes('الهوية') || title.includes('الشعارات')) {
    return 'باقات الهوية البصرية'
  }

  return `تفاصيل الباقة ${index + 1}`
}

function normalizePackageDetails(value: JsonValue | undefined) {
  if (!Array.isArray(value)) {
    return [] as JsonValue[]
  }

  const details: JsonValue[] = []

  for (const entry of value) {
    if (typeof entry === 'string') {
      const detailText = entry.trim()

      if (detailText) {
        details.push(detailText as JsonValue)
      }

      continue
    }

    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      details.push(entry as JsonValue)
    }
  }

  return details
}

function ensurePackageTierCoverFields(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => ensurePackageTierCoverFields(item as JsonValue))
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const nextValue = Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      ensurePackageTierCoverFields(entryValue as JsonValue),
    ]),
  ) as Record<string, JsonValue>

  const cardsValue = nextValue.cards
  const hasPackageTierShape =
    typeof nextValue.id === 'string' &&
    typeof nextValue.name === 'string' &&
    Array.isArray(cardsValue)

  if (
    hasPackageTierShape &&
    !Object.prototype.hasOwnProperty.call(nextValue, 'previewImage')
  ) {
    nextValue.previewImage = ''
  }

  return nextValue as JsonValue
}

function ensurePackagesShowcaseBodyShape(body: ContentBody): ContentBody {
  const nextBody = ensurePackageTierCoverFields(
    cloneJsonValue(body) as JsonValue,
  ) as ContentBody
  const rawItems = nextBody.items

  if (!Array.isArray(rawItems)) {
    return nextBody
  }

  nextBody.items = rawItems.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return entry as JsonValue
    }

    const nextItem = { ...entry } as Record<string, JsonValue>
    const packageTitle =
      typeof nextItem.title === 'string' ? nextItem.title.trim() : ''

    if (typeof nextItem.id !== 'string' || !nextItem.id.trim()) {
      nextItem.id = buildStablePackageId(packageTitle, index) as JsonValue
    }

    if (
      typeof nextItem.detailsTitle !== 'string' ||
      !nextItem.detailsTitle.trim()
    ) {
      nextItem.detailsTitle = resolvePackageDetailsTitle(
        packageTitle,
        index,
      ) as JsonValue
    }

    if (!Array.isArray(nextItem.details)) {
      nextItem.details = normalizePackageDetails(
        nextItem.includes as JsonValue | undefined,
      ) as JsonValue
    } else {
      nextItem.details = normalizePackageDetails(
        nextItem.details as JsonValue | undefined,
      ) as JsonValue
    }

    return nextItem as JsonValue
  }) as JsonValue

  return nextBody
}

interface CatalogState {
  status: LoadStatus
  items: ContentListItem[]
  error: string | null
}

interface DetailState {
  status: LoadStatus
  content: ContentDetail | null
  error: string | null
}

interface SaveState {
  status: 'idle' | 'saving' | 'success' | 'error'
  message: string | null
}

function normalizeBodySlugs(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeBodySlugs(item as JsonValue))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        key === 'slug' && typeof entryValue === 'string'
          ? normalizeSlugValue(entryValue)
          : normalizeBodySlugs(entryValue as JsonValue),
      ]),
    ) as JsonValue
  }

  return value
}

function stripLegacyFields(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => stripLegacyFields(item as JsonValue))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !removableLegacyFieldKeys.has(key))
        .map(([key, entryValue]) => [key, stripLegacyFields(entryValue as JsonValue)]),
    ) as JsonValue
  }

  return value
}

function assignMissingItemIds(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => assignMissingItemIds(item as JsonValue))
  }

  if (value && typeof value === 'object') {
    const nextValue = Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        assignMissingItemIds(entryValue as JsonValue),
      ]),
    ) as Record<string, JsonValue>

    if ('id' in nextValue) {
      const currentId = nextValue.id

      if (typeof currentId !== 'string' || !currentId.trim()) {
        nextValue.id = generateRandomItemId()
      }
    }

    return nextValue as JsonValue
  }

  return value
}

function assignGalleryItemIds(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => assignGalleryItemIds(item as JsonValue))
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const nextValue = Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => {
      if (key === 'gallery' && Array.isArray(entryValue)) {
        return [
          key,
          entryValue.map((galleryItem) => {
            if (!isRecord(galleryItem)) {
              return galleryItem
            }

            return {
              ...assignGalleryItemIds(galleryItem as JsonValue) as Record<string, JsonValue>,
              id:
                typeof galleryItem.id === 'string' && galleryItem.id.trim()
                  ? galleryItem.id
                  : generateRandomItemId(),
            } as JsonValue
          }),
        ]
      }

      return [key, assignGalleryItemIds(entryValue as JsonValue)]
    }),
  ) as JsonValue

  return nextValue
}

function ensureHeroBackgroundFields(body: ContentBody): ContentBody {
  return ({
    background: typeof body.background === 'string' ? body.background : '',
    mobileBackground:
      typeof body.mobileBackground === 'string' ? body.mobileBackground : '',
    ...body,
  } as unknown) as ContentBody
}

function sanitizeContentBody(body: ContentBody, sectionKey?: string): ContentBody {
  const nextBody = cloneJsonValue(body)
  const sanitizedBody = normalizeBodySlugs(
    assignGalleryItemIds(stripLegacyFields(nextBody as JsonValue)),
  ) as ContentBody

  if (sectionKey === 'blog_preview') {
    return ensureBlogPreviewBodyShape(sanitizedBody)
  }

  if (sectionKey === 'packages_showcase') {
    return ensurePackagesShowcaseBodyShape(sanitizedBody)
  }

  if (
    sectionKey === 'home_hero' ||
    sectionKey === 'about_hero' ||
    sectionKey === 'services_hero' ||
    sectionKey === 'packages_hero' ||
    sectionKey === 'training_courses_hero' ||
    sectionKey === 'works_hero' ||
    sectionKey === 'blog_hero' ||
    sectionKey === 'contact_hero'
  ) {
    return ensureHeroBackgroundFields(sanitizedBody)
  }

  return sanitizedBody
}

function prepareContentBodyForSave(
  body: ContentBody,
  sectionKey?: string,
): ContentBody {
  return assignMissingItemIds(
    sanitizeContentBody(body, sectionKey) as JsonValue,
  ) as ContentBody
}

function resolveProjectImageForHomeHero(project: JsonValue) {
  if (!isRecord(project)) {
    return null
  }

  if (
    typeof project.coverImage === 'string' &&
    project.coverImage.trim() &&
    /^https?:\/\/|^\//.test(project.coverImage)
  ) {
    return project.coverImage.trim()
  }

  if (
    typeof project.image === 'string' &&
    project.image.trim() &&
    /^https?:\/\/|^\//.test(project.image)
  ) {
    return project.image.trim()
  }

  if (Array.isArray(project.storyBlocks)) {
    for (const block of project.storyBlocks) {
      if (
        isRecord(block) &&
        typeof block.image === 'string' &&
        block.image.trim() &&
        /^https?:\/\/|^\//.test(block.image)
      ) {
        return block.image.trim()
      }
    }
  }

  return null
}

function resolveProjectTitleForHomeHero(project: JsonValue, index: number) {
  if (isRecord(project) && typeof project.title === 'string' && project.title.trim()) {
    return project.title.trim()
  }

  return `مشروع ${index + 1}`
}

function resolveProjectSubtitleForHomeHero(project: JsonValue) {
  if (!isRecord(project)) {
    return 'Project highlight'
  }

  if (
    typeof project.listingDescription === 'string' &&
    project.listingDescription.trim()
  ) {
    return project.listingDescription.trim()
  }

  const client =
    typeof project.client === 'string' && project.client.trim()
      ? project.client.trim()
      : null
  const category =
    typeof project.category === 'string' && project.category.trim()
      ? project.category.trim()
      : null

  if (client && category) {
    return `${client} • ${category}`
  }

  if (client || category) {
    return client || category || 'Project highlight'
  }

  return 'Project highlight'
}

function resolveProjectSlugForHomeHero(project: JsonValue) {
  if (!isRecord(project) || typeof project.slug !== 'string') {
    return ''
  }

  return normalizeSlugValue(project.slug)
}

function normalizeHeroComparisonText(value: string) {
  return value.trim().toLocaleLowerCase('ar')
}

function isProjectLinkedToHeroSlide(project: JsonValue, slide: JsonValue) {
  if (!isRecord(project) || !isRecord(slide)) {
    return false
  }

  const projectSlug = resolveProjectSlugForHomeHero(project)
  const sourceProjectSlug =
    typeof slide.sourceProjectSlug === 'string'
      ? normalizeSlugValue(slide.sourceProjectSlug)
      : ''

  if (projectSlug && sourceProjectSlug && projectSlug === sourceProjectSlug) {
    return true
  }

  const projectImage = resolveProjectImageForHomeHero(project)
  const slideImage =
    typeof slide.image === 'string' ? slide.image.trim() : ''
  const projectTitle = normalizeHeroComparisonText(
    resolveProjectTitleForHomeHero(project, 0),
  )
  const slideBrand =
    typeof slide.brand === 'string'
      ? normalizeHeroComparisonText(slide.brand)
      : ''

  if (projectImage && slideImage && projectImage === slideImage) {
    return !slideBrand || slideBrand === projectTitle
  }

  return false
}

function buildHeroSlideFromProject(project: JsonValue, index: number): JsonValue {
  const title = resolveProjectTitleForHomeHero(project, index)
  const subtitle = resolveProjectSubtitleForHomeHero(project)
  const image = resolveProjectImageForHomeHero(project)
  const slug = resolveProjectSlugForHomeHero(project)

  if (!image) {
    throw new Error('لا يمكن إضافة المشروع إلى الهيرو بدون صورة مشروع.')
  }

  return {
    brand: title,
    subtitle,
    alt: `${title} - ${subtitle}`.trim(),
    image,
    sourceProjectSlug: slug,
  } as JsonValue
}

function expandPackagesSidebarItems(item: SidebarItem): SidebarItem[] {
  if (item.meta.sectionKey !== 'packages_showcase') {
    return [item]
  }

  const rawPackages = Array.isArray(item.body.packageDetails)
    ? item.body.packageDetails
    : item.body.items

  if (!Array.isArray(rawPackages)) {
    return [item]
  }

  const packageItems = rawPackages.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return [] as SidebarItem[]
    }

    const packageTitle =
      typeof entry.title === 'string' && entry.title.trim()
        ? entry.title.trim()
        : `الباقة ${index + 1}`

    return [
      {
        ...item,
        sidebarId: `${item.sidebarId}:package:${index}`,
        routePath: `/content/${item.id}/package/${index}`,
        sidebarTitle: `الباقة: ${packageTitle}`,
        sidebarChild: true,
        parentSidebarId: item.sidebarId,
      },
    ]
  })

  return [
    {
      ...item,
      sidebarTitle: 'إعدادات صفحة الباقات',
    },
    ...packageItems,
  ]
}

const SPECIAL_SIDEBAR_BASE = {
  contentType: 0,
  contentTypeName: '',
  rawJsonContent: '{}',
  createdAt: '',
  updatedAt: null,
  body: {},
  meta: {},
  sidebarChild: false,
} as const

const PACKAGES_EDITOR_SIDEBAR_ITEM: SidebarItem = {
  ...SPECIAL_SIDEBAR_BASE,
  id: 'special:packages',
  sidebarId: 'special:packages',
  routePath: '/packages',
  sidebarTitle: 'الباقات',
}

const VIDEOS_SIDEBAR_ITEM: SidebarItem = {
  ...SPECIAL_SIDEBAR_BASE,
  id: 'special:videos',
  sidebarId: 'special:videos',
  routePath: '/videos',
  sidebarTitle: 'الفيديوهات',
}

const SECTORS_SIDEBAR_ITEM: SidebarItem = {
  ...SPECIAL_SIDEBAR_BASE,
  id: 'special:sectors',
  sidebarId: 'special:sectors',
  routePath: '/sectors',
  sidebarTitle: 'قطاعات نخدمها',
}

const SLIDER_CARDS_SIDEBAR_ITEM: SidebarItem = {
  ...SPECIAL_SIDEBAR_BASE,
  id: 'special:slider-cards',
  sidebarId: 'special:slider-cards',
  routePath: '/slider-cards',
  sidebarTitle: 'بطاقات السلايدر',
}

const HERO_SIDEBAR_ITEM: SidebarItem = {
  ...SPECIAL_SIDEBAR_BASE,
  id: 'special:hero',
  sidebarId: 'special:hero',
  routePath: '/hero',
  sidebarTitle: 'نصوص الهيرو',
}

const ORDERS_SIDEBAR_ITEM: SidebarItem = {
  ...SPECIAL_SIDEBAR_BASE,
  id: 'special:orders',
  sidebarId: 'special:orders',
  routePath: '/orders',
  sidebarTitle: 'الطلبات والمدفوعات',
}

const BRIEFS_SIDEBAR_ITEM: SidebarItem = {
  ...SPECIAL_SIDEBAR_BASE,
  id: 'special:briefs',
  sidebarId: 'special:briefs',
  routePath: '/briefs',
  sidebarTitle: 'البريفات',
}

const SPECIAL_SECTION_KEYS = new Set(['home_sectors', 'home_slider_cards', 'home_hero'])

function buildDashboardSidebarGroups(groups: SidebarGroup[]): SidebarGroup[] {
  return groups.map((group) => {
    const filteredItems = group.items.filter(
      (item) => !SPECIAL_SECTION_KEYS.has(item.meta?.sectionKey ?? ''),
    )
    const expandedItems = filteredItems.flatMap((item) => expandPackagesSidebarItems(item))
    const hasPackages = group.items.some((item) => item.meta.sectionKey === 'packages_showcase')
    const isHome = group.key === 'home'
    const isPackagesPage = group.key === 'packages'
    const extraItems = [
      ...(hasPackages && isPackagesPage ? [PACKAGES_EDITOR_SIDEBAR_ITEM, VIDEOS_SIDEBAR_ITEM] : []),
      ...(isHome ? [HERO_SIDEBAR_ITEM, SECTORS_SIDEBAR_ITEM, SLIDER_CARDS_SIDEBAR_ITEM, ORDERS_SIDEBAR_ITEM, BRIEFS_SIDEBAR_ITEM] : []),
    ]
    return {
      ...group,
      items: extraItems.length > 0 ? [...expandedItems, ...extraItems] : expandedItems,
    }
  })
}

export function DashboardPage({
  username,
  onLogout,
  onOpenCredentials,
  settingsMode = false,
  videosMode = false,
  packagesMode = false,
  sectorsMode = false,
  sliderCardsMode = false,
  heroMode = false,
  ordersMode = false,
  briefsMode = false,
  authToken = '',
}: DashboardPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { contentId, packageId } = useParams<{
    contentId?: string
    packageId?: string
  }>()
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [catalog, setCatalog] = useState<CatalogState>({
    status: 'idle',
    items: [],
    error: null,
  })
  const [detail, setDetail] = useState<DetailState>({
    status: 'idle',
    content: null,
    error: null,
  })
  const [draftBody, setDraftBody] = useState<ContentBody | null>(null)
  const [saveState, setSaveState] = useState<SaveState>({
    status: 'idle',
    message: null,
  })

  useEffect(() => {
    const controller = new AbortController()

    async function loadCatalog() {
      setCatalog((current) => ({
        ...current,
        status: 'loading',
        error: null,
      }))

      try {
        const items = await fetchContentList(controller.signal)

        setCatalog({
          status: 'success',
          items,
          error: null,
        })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setCatalog({
          status: 'error',
          items: [],
          error:
            error instanceof Error
              ? error.message
              : 'حدث خطأ غير متوقع أثناء تحميل المحتوى.',
        })
      }
    }

    void loadCatalog()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (catalog.status !== 'success' || catalog.items.length === 0 || contentId || settingsMode || videosMode || packagesMode || sectorsMode || sliderCardsMode || heroMode || ordersMode || briefsMode) {
      return
    }

    navigate(`/content/${catalog.items[0].id}`, { replace: true })
  }, [catalog.status, catalog.items.length, contentId, navigate, settingsMode, videosMode, packagesMode, sectorsMode, sliderCardsMode, heroMode, ordersMode, briefsMode])

  useEffect(() => {
    const targetContentId = contentId

    if (!targetContentId) {
      return
    }

    const resolvedContentId: string = targetContentId

    const controller = new AbortController()

    async function loadDetail() {
      setDetail({
        status: 'loading',
        content: null,
        error: null,
      })
      setDraftBody(null)
      setSaveState({
        status: 'idle',
        message: null,
      })

      try {
        const content = await fetchContentDetail(
          resolvedContentId,
          controller.signal,
        )

        setDetail({
          status: 'success',
          content,
          error: null,
        })
        setDraftBody(sanitizeContentBody(content.body, content.meta.sectionKey))
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setDetail({
          status: 'error',
          content: null,
          error:
            error instanceof Error
              ? error.message
              : 'تعذر تحميل بيانات القسم المحدد.',
        })
        setDraftBody(null)
      }
    }

    void loadDetail()

    return () => {
      controller.abort()
    }
  }, [contentId])

  const groups = buildDashboardSidebarGroups(buildSidebarGroups(catalog.items))
  const selectedSidebarId = location.pathname === '/packages'
    ? 'special:packages'
    : location.pathname === '/videos'
    ? 'special:videos'
    : location.pathname === '/sectors'
    ? 'special:sectors'
    : location.pathname === '/slider-cards'
    ? 'special:slider-cards'
    : location.pathname === '/hero'
    ? 'special:hero'
    : location.pathname === '/orders'
    ? 'special:orders'
    : location.pathname === '/briefs'
    ? 'special:briefs'
    : contentId
      ? packageId !== undefined
        ? `content:${contentId}:package:${packageId}`
        : `content:${contentId}`
      : undefined
  const homeHeroItem = catalog.items.find(
    (item) => item.meta.sectionKey === 'home_hero',
  )
  const packagesShowcaseItem = catalog.items.find(
    (item) => item.meta.sectionKey === 'packages_showcase',
  ) ?? null
  const homeHeroSlides =
    homeHeroItem && Array.isArray(homeHeroItem.body.slides)
      ? (homeHeroItem.body.slides as JsonValue[])
      : []

  function handleRetryCatalog() {
    setCatalog((current) => ({
      ...current,
      status: 'idle',
    }))

    const controller = new AbortController()

    setCatalog({
      status: 'loading',
      items: [],
      error: null,
    })

    void fetchContentList(controller.signal)
      .then((items) => {
        setCatalog({
          status: 'success',
          items,
          error: null,
        })
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return
        }

        setCatalog({
          status: 'error',
          items: [],
          error:
            error instanceof Error
              ? error.message
              : 'حدث خطأ غير متوقع أثناء تحميل المحتوى.',
        })
      })
  }

  function handleRetryDetail() {
    const targetContentId = contentId

    if (!targetContentId) {
      return
    }

    const resolvedContentId: string = targetContentId

    setDetail({
      status: 'loading',
      content: null,
      error: null,
    })
    setDraftBody(null)
    setSaveState({
      status: 'idle',
      message: null,
    })

    const controller = new AbortController()

    void fetchContentDetail(resolvedContentId, controller.signal)
      .then((content) => {
        setDetail({
          status: 'success',
          content,
          error: null,
        })
        setDraftBody(sanitizeContentBody(content.body, content.meta.sectionKey))
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return
        }

        setDetail({
          status: 'error',
          content: null,
          error:
            error instanceof Error
              ? error.message
              : 'تعذر تحميل بيانات القسم المحدد.',
        })
        setDraftBody(null)
      })
  }

  function handleDraftChange(nextBody: ContentBody) {
    setDraftBody(nextBody)
    setSaveState((current) =>
      current.status === 'idle'
        ? current
        : {
            status: 'idle',
            message: null,
          },
    )
  }

  function handleResetDraft() {
    if (!detail.content) {
      return
    }

    setDraftBody(
      sanitizeContentBody(detail.content.body, detail.content.meta.sectionKey),
    )
    setSaveState({
      status: 'idle',
      message: null,
    })
  }

  async function handleToggleProjectInHomeHero(
    project: JsonValue,
    projectIndex: number,
    shouldInclude: boolean,
  ) {
    if (!homeHeroItem) {
      throw new Error('تعذر العثور على قسم هيرو الصفحة الرئيسية في بيانات المحتوى.')
    }

    if (!isRecord(project)) {
      throw new Error('بيانات المشروع غير صالحة للإضافة إلى الهيرو.')
    }

    const currentSlides = Array.isArray(homeHeroItem.body.slides)
      ? [...(homeHeroItem.body.slides as JsonValue[])]
      : []
    const matchedSlideIndex = currentSlides.findIndex((slide) =>
      isProjectLinkedToHeroSlide(project, slide),
    )

    let nextSlides = currentSlides

    if (shouldInclude) {
      const nextSlide = buildHeroSlideFromProject(project, projectIndex)
      const nextSlideRecord = nextSlide as Record<string, JsonValue>

      if (matchedSlideIndex === -1) {
        nextSlides = [...currentSlides, nextSlide]
      } else {
        nextSlides = currentSlides.map((slide, slideIndex) => {
          if (slideIndex !== matchedSlideIndex) {
            return slide
          }

          return isRecord(slide)
            ? ({ ...slide, ...nextSlideRecord } as JsonValue)
            : nextSlide
        })
      }
    } else if (matchedSlideIndex !== -1) {
      nextSlides = currentSlides.filter(
        (_, slideIndex) => slideIndex !== matchedSlideIndex,
      )
    } else {
      return
    }

    const nextHomeHeroBody = sanitizeContentBody(
      ({
        ...homeHeroItem.body,
        slides: nextSlides as unknown as JsonValue,
      } as unknown) as ContentBody,
      homeHeroItem.meta.sectionKey,
    )

    const updatedHomeHero = await updateContentDetail(homeHeroItem.id, {
      contentType: homeHeroItem.contentType,
      body: nextHomeHeroBody,
    })

    setCatalog((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === updatedHomeHero.id ? updatedHomeHero : item,
      ),
    }))

    if (detail.content?.id === updatedHomeHero.id) {
      setDetail({
        status: 'success',
        content: updatedHomeHero,
        error: null,
      })
      setDraftBody(
        sanitizeContentBody(updatedHomeHero.body, updatedHomeHero.meta.sectionKey),
      )
    }
  }

  async function handleSaveDetail() {
    if (!contentId || !detail.content || !draftBody) {
      return
    }

    setSaveState({
      status: 'saving',
      message: null,
    })

    try {
      const sanitizedBody = prepareContentBodyForSave(
        draftBody,
        detail.content.meta.sectionKey,
      )

      const updated = await updateContentDetail(contentId, {
        contentType: detail.content.contentType,
        body: sanitizedBody,
      })

      setDetail({
        status: 'success',
        content: updated,
        error: null,
      })
      setDraftBody(sanitizeContentBody(updated.body, updated.meta.sectionKey))
      setSaveState({
        status: 'success',
        message: 'تم حفظ التعديلات بنجاح.',
      })
      setCatalog((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      }))
    } catch (error) {
      setSaveState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'تعذر حفظ التعديلات على القسم الحالي.',
      })
    }
  }

  return (
    <DashboardShell
      username={username}
      onOpenSidebar={() => setSidebarOpen(true)}
      onOpenCredentials={onOpenCredentials}
      onLogout={onLogout}
      onOpenSettings={() => navigate('/settings')}
      sidebar={
        <ContentSidebar
          groups={groups}
          isOpen={isSidebarOpen}
          selectedId={selectedSidebarId}
          status={catalog.status}
          error={catalog.error}
          onClose={() => setSidebarOpen(false)}
          onRetry={handleRetryCatalog}
          onSelect={(routePath) => navigate(routePath)}
        />
      }
    >
      {settingsMode ? (
        <SettingsPage />
      ) : packagesMode ? (
        <PackagesEditorPage
          packagesShowcaseItem={packagesShowcaseItem}
          onCatalogUpdate={(updated) => {
            setCatalog((current) => ({
              ...current,
              items: current.items.map((item) => item.id === updated.id ? updated : item),
            }))
          }}
        />
      ) : sectorsMode ? (
        <SectorsEditorPage />
      ) : sliderCardsMode ? (
        <SliderCardsEditorPage />
      ) : heroMode ? (
        <HeroEditorPage />
      ) : ordersMode ? (
        <OrdersPage token={authToken} />
      ) : briefsMode ? (
        <BriefsPage token={authToken} />
      ) : videosMode ? (
        <VideoManagerPage
          packagesShowcaseItem={packagesShowcaseItem}
          onCatalogUpdate={(updated) => {
            setCatalog((current) => ({
              ...current,
              items: current.items.map((item) => item.id === updated.id ? updated : item),
            }))
          }}
        />
      ) : (
        <ErrorBoundary key={contentId ?? 'no-content'} compact>
          <ContentDetailPanel
            content={contentId ? detail.content : null}
            draftBody={contentId ? draftBody : null}
            homeHeroSlides={homeHeroSlides}
            status={contentId ? detail.status : 'idle'}
            error={detail.error}
            saveStatus={saveState.status}
            saveMessage={saveState.message}
            onRetry={handleRetryDetail}
            onDraftChange={handleDraftChange}
            onResetDraft={handleResetDraft}
            onSave={handleSaveDetail}
            onToggleProjectInHomeHero={handleToggleProjectInHomeHero}
          />
        </ErrorBoundary>
      )}
    </DashboardShell>
  )
}
