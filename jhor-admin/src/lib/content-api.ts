import type {
  ContentApiRecord,
  ContentBody,
  ContentDetail,
  ContentListItem,
  SidebarGroup,
  SidebarItem,
} from '../types/content'
import type {
  AuthCredentialUpdateResponse,
  AuthCredentials,
  AuthSession,
} from '../types/auth'
import type { ImageAsset } from '../types/image'
import { translatePageKey } from './utils'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
  'https://johor-back.euphoria-motiva.com'

const AUTH_SESSION_STORAGE_KEY = 'dash-jgor.auth.session'
export const AUTH_UNAUTHORIZED_EVENT = 'dash-jgor:auth-unauthorized'

export class UnauthorizedError extends Error {
  constructor(message = 'انتهت الجلسة الحالية. سجل الدخول مرة أخرى للمتابعة.') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

function parseJsonPayload<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function normalizeTokenType(tokenType: string) {
  return tokenType.trim() || 'Bearer'
}

function isAuthSessionExpired(session: AuthSession) {
  const expiresAt = new Date(session.expiresAt)

  return Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()
}

export function getStoredAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  const session = parseJsonPayload<AuthSession>(rawSession)

  if (!session || !session.token || !session.username || !session.expiresAt) {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
    return null
  }

  if (isAuthSessionExpired(session)) {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
    return null
  }

  return {
    ...session,
    tokenType: normalizeTokenType(session.tokenType),
  }
}

export function persistAuthSession(session: AuthSession) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify({
      ...session,
      tokenType: normalizeTokenType(session.tokenType),
    }),
  )
}

export function clearStoredAuthSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
}

export function updateStoredAuthUsername(username: string) {
  const currentSession = getStoredAuthSession()

  if (!currentSession) {
    return
  }

  persistAuthSession({
    ...currentSession,
    username,
  })
}

function dispatchUnauthorizedEvent() {
  clearStoredAuthSession()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
  }
}

function getAuthorizationHeaderValue() {
  const session = getStoredAuthSession()

  if (!session) {
    return null
  }

  return `${normalizeTokenType(session.tokenType)} ${session.token}`
}

function createRequestHeaders(headers?: Record<string, string>) {
  const authHeader = getAuthorizationHeaderValue()

  return {
    accept: 'application/json',
    ...(authHeader ? { authorization: authHeader } : {}),
    ...headers,
  }
}

async function readResponseData<T>(response: Response): Promise<T> {
  const rawPayload = await response.text()

  if (!rawPayload) {
    return {} as T
  }

  const parsedPayload = parseJsonPayload<T>(rawPayload)

  return (parsedPayload ?? (rawPayload as T)) as T
}

async function readResponseErrorMessage(response: Response, fallback: string) {
  const rawPayload = await response.text()

  if (!rawPayload) {
    return fallback
  }

  const parsedPayload = parseJsonPayload<Record<string, unknown>>(rawPayload)

  if (parsedPayload) {
    const knownMessage =
      typeof parsedPayload.message === 'string'
        ? parsedPayload.message
        : typeof parsedPayload.title === 'string'
          ? parsedPayload.title
          : typeof parsedPayload.error === 'string'
            ? parsedPayload.error
            : null

    if (knownMessage) {
      return knownMessage
    }
  }

  return rawPayload
}

async function ensureAuthorizedResponse(
  response: Response,
  fallbackMessage: string,
) {
  if (response.status === 401) {
    dispatchUnauthorizedEvent()
    throw new UnauthorizedError()
  }

  if (!response.ok) {
    throw new Error(await readResponseErrorMessage(response, fallbackMessage))
  }
}

function parseJsonContent(jsonContent: string | object): ContentBody {
  try {
    const parsed = (typeof jsonContent !== "string" ? jsonContent : JSON.parse(jsonContent)) as ContentBody

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed
    }

    return {}
  } catch {
    return {}
  }
}

function ensureContentDefaults(body: ContentBody): ContentBody {
  const sectionKey =
    typeof body._meta?.sectionKey === 'string' ? body._meta.sectionKey : ''

  if (sectionKey === 'footer_content') {
    const partnerLogos = Array.isArray(body.partnerLogos) ? body.partnerLogos : []

    return {
      ...body,
      partnerLogos:
        partnerLogos.length > 0
          ? partnerLogos
          : [
              {
                name: 'Google Partner',
                alt: 'Google Partner',
                image: '/google partner.png',
              },
              {
                name: 'Meta Business Partner',
                alt: 'Meta Business Partner',
                image: '/meta-business-partner-seeklogo.png',
              },
            ],
    } as unknown as ContentBody
  }

  return body
}

function normalizeContentRecord(record: ContentApiRecord): ContentListItem {
  const body = ensureContentDefaults(parseJsonContent(record.jsonContent))

  return {
    id: record.id,
    contentType: record.contentType,
    contentTypeName: record.contentTypeName,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    rawJsonContent: record.jsonContent,
    body,
    meta: body._meta ?? {},
  }
}

async function requestJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: createRequestHeaders(),
    signal,
  })

  await ensureAuthorizedResponse(
    response,
    `فشل الطلب: ${response.status} ${response.statusText}`,
  )

  return readResponseData<T>(response)
}

export async function fetchContentList(signal?: AbortSignal) {
  const response = await requestJson<ContentApiRecord[]>('/api/content', signal)

  return response.map(normalizeContentRecord)
}

export async function fetchContentDetail(
  id: string,
  signal?: AbortSignal,
): Promise<ContentDetail> {
  const response = await requestJson<ContentApiRecord>(
    `/api/content/${id}`,
    signal,
  )

  return normalizeContentRecord(response)
}

export async function createContentDetail(payload: {
  contentType: number
  contentTypeName: string
  jsonContent: string
}): Promise<ContentDetail> {
  const response = await fetch(`${API_BASE_URL}/api/content`, {
    method: 'POST',
    headers: createRequestHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify(payload),
  })
  await ensureAuthorizedResponse(response, `فشل الإنشاء: ${response.status}`)
  const record = await readResponseData<ContentApiRecord>(response)
  return normalizeContentRecord(record)
}

export async function updateContentDetail(
  id: string,
  payload: {
    contentType: number
    body: ContentBody
  },
): Promise<ContentDetail> {
  const response = await fetch(`${API_BASE_URL}/api/content/${id}`, {
    method: 'PUT',
    headers: createRequestHeaders({
      'content-type': 'application/json',
    }),
    body: JSON.stringify({
      contentType: payload.contentType,
      jsonContent: JSON.stringify(payload.body),
    }),
  })

  await ensureAuthorizedResponse(
    response,
    `فشل الحفظ: ${response.status} ${response.statusText}`,
  )

  const record = await readResponseData<ContentApiRecord>(response)

  return normalizeContentRecord(record)
}

export async function fetchImages(signal?: AbortSignal): Promise<ImageAsset[]> {
  return requestJson<ImageAsset[]>('/api/images', signal)
}

export async function uploadImageAsset(file: File): Promise<ImageAsset> {
  const formData = new FormData()

  formData.append('File', file)

  const response = await fetch(`${API_BASE_URL}/api/images/upload`, {
    method: 'POST',
    headers: createRequestHeaders(),
    body: formData,
  })

  await ensureAuthorizedResponse(
    response,
    `فشل رفع الصورة: ${response.status} ${response.statusText}`,
  )

  return readResponseData<ImageAsset>(response)
}

export async function uploadVideoAsset(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('File', file)

  const response = await fetch(`${API_BASE_URL}/api/images/upload`, {
    method: 'POST',
    headers: createRequestHeaders(),
    body: formData,
  })

  await ensureAuthorizedResponse(
    response,
    `فشل رفع الفيديو: ${response.status} ${response.statusText}`,
  )

  const asset = await readResponseData<ImageAsset>(response)
  return asset.publicUrl ?? asset.filePath ?? ''
}

export function uploadVideoAssetWithProgress(
  file: File,
  onProgress: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('File', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 401) {
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
        reject(new Error('انتهت الجلسة الحالية.'))
        return
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`فشل رفع الفيديو: ${xhr.status}`))
        return
      }
      try {
        const asset = JSON.parse(xhr.responseText) as ImageAsset
        resolve(asset.publicUrl ?? asset.filePath ?? '')
      } catch {
        reject(new Error('فشل قراءة رد السيرفر.'))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('فشل الاتصال بالسيرفر.')))
    xhr.addEventListener('abort', () => reject(new Error('تم إلغاء الرفع.')))

    xhr.open('POST', `${API_BASE_URL}/api/images/upload`)

    const authHeader = getAuthorizationHeaderValue()
    if (authHeader) xhr.setRequestHeader('authorization', authHeader)
    xhr.setRequestHeader('accept', 'application/json')

    xhr.send(formData)
  })
}

export async function updateImageAsset(
  id: string,
  originalFileName: string,
): Promise<ImageAsset> {
  const response = await fetch(`${API_BASE_URL}/api/images/${id}`, {
    method: 'PUT',
    headers: createRequestHeaders({
      'content-type': 'application/json',
    }),
    body: JSON.stringify({
      originalFileName,
    }),
  })

  await ensureAuthorizedResponse(
    response,
    `فشل تحديث بيانات الصورة: ${response.status} ${response.statusText}`,
  )

  return readResponseData<ImageAsset>(response)
}

export async function deleteImageAsset(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/images/${id}`, {
    method: 'DELETE',
    headers: createRequestHeaders(),
  })

  await ensureAuthorizedResponse(
    response,
    `فشل حذف الصورة: ${response.status} ${response.statusText}`,
  )
}

const SITE_SETTINGS_CONTENT_TYPE = 9999

export interface SiteSettings {
  comingSoonEnabled: boolean
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/content/type/${SITE_SETTINGS_CONTENT_TYPE}`, {
      headers: { accept: 'application/json' },
    })
    if (!response.ok) return { comingSoonEnabled: false }
    const data = await response.json() as { jsonContent: unknown }
    const content = typeof data.jsonContent === 'string'
      ? JSON.parse(data.jsonContent)
      : data.jsonContent
    return { comingSoonEnabled: !!(content as SiteSettings)?.comingSoonEnabled }
  } catch {
    return { comingSoonEnabled: false }
  }
}

export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  const listResponse = await fetch(`${API_BASE_URL}/api/content`, {
    headers: createRequestHeaders(),
  })
  await ensureAuthorizedResponse(listResponse, 'فشل جلب المحتوى')
  const all = await listResponse.json() as Array<{ id: string; contentType: number }>
  const existing = all.find(item => item.contentType === SITE_SETTINGS_CONTENT_TYPE)
  const body = JSON.stringify({ contentType: SITE_SETTINGS_CONTENT_TYPE, jsonContent: settings })

  if (existing) {
    const res = await fetch(`${API_BASE_URL}/api/content/${existing.id}`, {
      method: 'PUT',
      headers: createRequestHeaders({ 'content-type': 'application/json' }),
      body,
    })
    await ensureAuthorizedResponse(res, 'فشل تحديث الإعدادات')
  } else {
    const res = await fetch(`${API_BASE_URL}/api/content`, {
      method: 'POST',
      headers: createRequestHeaders({ 'content-type': 'application/json' }),
      body,
    })
    await ensureAuthorizedResponse(res, 'فشل حفظ الإعدادات')
  }
}

const CHECKOUT_PRIVACY_CONTENT_TYPE = 9997
const CHECKOUT_TERMS_CONTENT_TYPE = 9998

export interface CheckoutLegalText {
  content: string
}

const DEFAULT_PRIVACY = `نحن في جهور نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.\n\nنجمع البيانات التي تقدمها عند إتمام عملية الشراء مثل الاسم، البريد الإلكتروني، رقم الهاتف، وبيانات الدفع.\n\nتُستخدم البيانات حصراً لمعالجة طلبك وتقديم الخدمة، ولن يتم مشاركتها مع أي طرف ثالث.\n\nنستخدم تشفير SSL لحماية جميع البيانات المرسلة خلال عملية الدفع.`

const DEFAULT_TERMS = `باستخدامك لخدمات جهور فإنك توافق على الشروط والأحكام التالية.\n\nيتم الدفع مسبقاً قبل بدء تنفيذ الخدمة. جميع الأسعار شاملة للضريبة.\n\nيمكن إلغاء الطلب خلال 24 ساعة من تأكيده واسترداد المبلغ كاملاً. بعد ذلك لا يحق استرداد المبلغ.\n\nتنتقل ملكية جميع المخرجات إلى العميل بعد إتمام الدفع الكامل.`

async function getCheckoutText(contentType: number, defaultText: string): Promise<CheckoutLegalText> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/content/type/${contentType}`, {
      headers: { accept: 'application/json' },
    })
    if (!response.ok) return { content: defaultText }
    const data = await response.json() as { jsonContent: unknown }
    const content = typeof data.jsonContent === 'string'
      ? JSON.parse(data.jsonContent)
      : data.jsonContent
    return { content: (content as CheckoutLegalText)?.content || defaultText }
  } catch {
    return { content: defaultText }
  }
}

async function updateCheckoutText(contentType: number, text: CheckoutLegalText): Promise<void> {
  const listResponse = await fetch(`${API_BASE_URL}/api/content`, {
    headers: createRequestHeaders(),
  })
  await ensureAuthorizedResponse(listResponse, 'فشل جلب المحتوى')
  const all = await listResponse.json() as Array<{ id: string; contentType: number }>
  const existing = all.find(item => item.contentType === contentType)
  const body = JSON.stringify({ contentType, jsonContent: text })

  if (existing) {
    const res = await fetch(`${API_BASE_URL}/api/content/${existing.id}`, {
      method: 'PUT',
      headers: createRequestHeaders({ 'content-type': 'application/json' }),
      body,
    })
    await ensureAuthorizedResponse(res, 'فشل تحديث النص')
  } else {
    const res = await fetch(`${API_BASE_URL}/api/content`, {
      method: 'POST',
      headers: createRequestHeaders({ 'content-type': 'application/json' }),
      body,
    })
    await ensureAuthorizedResponse(res, 'فشل حفظ النص')
  }
}

export const getCheckoutPrivacy = () => getCheckoutText(CHECKOUT_PRIVACY_CONTENT_TYPE, DEFAULT_PRIVACY)
export const getCheckoutTerms = () => getCheckoutText(CHECKOUT_TERMS_CONTENT_TYPE, DEFAULT_TERMS)
export const updateCheckoutPrivacy = (text: CheckoutLegalText) => updateCheckoutText(CHECKOUT_PRIVACY_CONTENT_TYPE, text)
export const updateCheckoutTerms = (text: CheckoutLegalText) => updateCheckoutText(CHECKOUT_TERMS_CONTENT_TYPE, text)

// ─── SEO Descriptions ────────────────────────────────────────────────────────
const SEO_DESCRIPTIONS_CONTENT_TYPE = 9996

export type SeoDescriptions = Record<string, string>

export async function getSeoDescriptions(): Promise<SeoDescriptions> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/content/type/${SEO_DESCRIPTIONS_CONTENT_TYPE}`, {
      headers: { accept: 'application/json' },
    })
    if (!response.ok) return {}
    const data = await response.json() as { jsonContent: unknown }
    const content = typeof data.jsonContent === 'string'
      ? JSON.parse(data.jsonContent)
      : data.jsonContent
    return (content as SeoDescriptions) ?? {}
  } catch {
    return {}
  }
}

export async function updateSeoDescriptions(descriptions: SeoDescriptions): Promise<void> {
  const listResponse = await fetch(`${API_BASE_URL}/api/content`, {
    headers: createRequestHeaders(),
  })
  await ensureAuthorizedResponse(listResponse, 'فشل جلب المحتوى')
  const all = await listResponse.json() as Array<{ id: string; contentType: number }>
  const existing = all.find(item => item.contentType === SEO_DESCRIPTIONS_CONTENT_TYPE)
  const body = JSON.stringify({ contentType: SEO_DESCRIPTIONS_CONTENT_TYPE, jsonContent: descriptions })

  if (existing) {
    const res = await fetch(`${API_BASE_URL}/api/content/${existing.id}`, {
      method: 'PUT',
      headers: createRequestHeaders({ 'content-type': 'application/json' }),
      body,
    })
    await ensureAuthorizedResponse(res, 'فشل تحديث وصف SEO')
  } else {
    const res = await fetch(`${API_BASE_URL}/api/content`, {
      method: 'POST',
      headers: createRequestHeaders({ 'content-type': 'application/json' }),
      body,
    })
    await ensureAuthorizedResponse(res, 'فشل حفظ وصف SEO')
  }
}

export async function login(
  credentials: AuthCredentials,
): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error(
      await readResponseErrorMessage(
        response,
        'تعذر تسجيل الدخول. تحقق من اسم المستخدم وكلمة المرور.',
      ),
    )
  }

  const session = await readResponseData<AuthSession>(response)
  const normalizedSession = {
    ...session,
    tokenType: normalizeTokenType(session.tokenType),
  }

  persistAuthSession(normalizedSession)

  return normalizedSession
}

export async function updateAuthCredentials(
  credentials: AuthCredentials,
): Promise<AuthCredentialUpdateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/credentials`, {
    method: 'PUT',
    headers: createRequestHeaders({
      'content-type': 'application/json',
    }),
    body: JSON.stringify(credentials),
  })

  await ensureAuthorizedResponse(
    response,
    'تعذر تحديث بيانات الدخول الحالية.',
  )

  return readResponseData<AuthCredentialUpdateResponse>(response)
}

export function resolveImageAssetUrl(image: ImageAsset) {
  function normalizeImageUrl(value: string) {
    try {
      const apiUrl = new URL(`${API_BASE_URL}/`)
      const normalizedUrl = new URL(value, apiUrl)

      if (normalizedUrl.hostname === apiUrl.hostname && apiUrl.protocol === 'https:') {
        normalizedUrl.protocol = 'https:'
      }

      return normalizedUrl.toString()
    } catch {
      return value
    }
  }

  if (image.filePath) {
    return normalizeImageUrl(image.filePath)
  }

  if (image.publicUrl) {
    return normalizeImageUrl(image.publicUrl)
  }

  return ''
}

const pageGroupTitleMap: Record<string, string> = {
  all: 'المحتوى العام',
  home: 'الصفحة الرئيسية',
  about: 'صفحة من نحن',
  services: 'صفحة الخدمات',
  works: 'صفحة الأعمال',
  'work-details': 'تفاصيل الأعمال',
  packages: 'صفحة الباقات',
  'training-courses': 'صفحة الدورات التدريبية',
  blog: 'صفحة المدونة',
  contact: 'صفحة التواصل',
  legal: 'الصفحات القانونية',
  system: 'إعدادات النظام',
  settings: 'الإعدادات',
}

const pageGroupOrderMap: Record<string, number> = {
  all: 0,
  home: 1,
  about: 2,
  services: 3,
  works: 4,
  'work-details': 5,
  packages: 6,
  'training-courses': 7,
  blog: 8,
  contact: 9,
  legal: 10,
  system: 11,
  settings: 12,
}

const pageSectionOrderMap: Record<string, string[]> = {
  all: ['header_navigation', 'footer_content'],
  home: [
    'home_hero',
    'brand_story',
    'featured_services',
    'home_services_reveal',
    'works_gallery',
    'packages_showcase',
    'home_statistics',
    'partners_logos',
    'home_feedback',
    'home_contact_preview',
  ],
  about: ['about_hero', 'brand_story', 'partners_logos'],
  services: ['services_hero', 'featured_services'],
  works: ['works_hero', 'works_projects'],
  'work-details': ['works_projects', 'works_pagination'],
  packages: ['packages_hero', 'packages_showcase'],
  'training-courses': [
    'training_courses_hero',
    'training_courses_overview',
  ],
  blog: ['blog_hero', 'blog_preview'],
  contact: ['contact_hero', 'contact_form'],
  legal: [
    'campaign_terms_conditions',
    'identity_terms_conditions',
    'privacy_policy',
    'cookies_policy',
  ],
  system: ['loading_statuses'],
  settings: ['pixels_settings'],
}

const hiddenSidebarPageKeys = new Set(['work-details', 'system'])

function resolveMappedSidebarPages(
  item: ContentListItem,
  pageKeys: string[],
) {
  const sectionKey = item.meta.sectionKey?.trim()

  if (!sectionKey) {
    return pageKeys
  }

  const mappedPages = pageKeys.filter((pageKey) =>
    pageSectionOrderMap[pageKey]?.includes(sectionKey),
  )

  return mappedPages.length > 0 ? mappedPages : pageKeys
}

function resolveSidebarPageKeys(item: ContentListItem) {
  const assignToPages = item.meta.assignToPages?.filter(
    (pageKey) => Boolean(pageKey) && !hiddenSidebarPageKeys.has(pageKey),
  )

  if (assignToPages && assignToPages.length > 0) {
    const hasLegalAssignment = assignToPages.some((pageKey) =>
      ['campaign-terms', 'identity-terms', 'privacy-policy', 'cookies-policy'].includes(
        pageKey,
      ),
    )

    if (hasLegalAssignment) {
      return ['legal']
    }

    const uniquePages = resolveMappedSidebarPages(item, [
      ...new Set(assignToPages),
    ])

    if (uniquePages.includes('all')) {
      return ['all']
    }

    if (uniquePages.length === 1) {
      return uniquePages
    }

    const preferredPages = uniquePages.filter(
      (pageKey) => pageKey !== 'home' && pageKey !== 'work-details',
    )

    if (preferredPages.length > 0) {
      return [preferredPages[0]]
    }

    const nonHomePages = uniquePages.filter((pageKey) => pageKey !== 'home')

    if (nonHomePages.length > 0) {
      return [nonHomePages[0]]
    }

    const nonDetailPages = uniquePages.filter(
      (pageKey) => pageKey !== 'work-details',
    )

    if (nonDetailPages.length > 0) {
      return [nonDetailPages[0]]
    }

    return [uniquePages[0]]
  }

  return ['ungrouped']
}

function resolveSidebarGroupTitle(pageKey: string) {
  if (pageGroupTitleMap[pageKey]) {
    return pageGroupTitleMap[pageKey]
  }

  if (pageKey === 'ungrouped') {
    return 'أقسام غير مصنفة'
  }

  return translatePageKey(pageKey)
}

function resolveSidebarGroupOrder(pageKey: string) {
  return pageGroupOrderMap[pageKey] ?? Number.MAX_SAFE_INTEGER
}

function resolveItemOrderWithinPage(
  item: ContentListItem,
  pageKey: string,
) {
  const sectionKey = item.meta.sectionKey?.trim() ?? ''
  const sectionOrder = pageSectionOrderMap[pageKey]?.indexOf(sectionKey) ?? -1

  if (sectionOrder !== -1) {
    return sectionOrder
  }

  return 1000 + (item.meta.tabOrder ?? Number.MAX_SAFE_INTEGER)
}

function resolveSidebarItemIdentity(item: ContentListItem) {
  const sectionKey = item.meta.sectionKey?.trim()

  if (sectionKey) {
    return `section:${sectionKey}`
  }

  const tabKey = item.meta.tabKey?.trim()

  if (tabKey) {
    return `tab:${tabKey}`
  }

  const tabLabel = item.meta.tabLabel?.trim()

  if (tabLabel) {
    return `label:${tabLabel.toLocaleLowerCase('ar')}`
  }

  return `id:${item.id}`
}

function resolveSidebarItemTitle(item: ContentListItem) {
  const sectionKeyTitleMap: Record<string, string> = {
    campaign_terms_conditions: 'شروط وأحكام الحملات',
    identity_terms_conditions: 'شروط وأحكام الهويات',
    privacy_policy: 'سياسة الخصوصية',
    cookies_policy: 'سياسة الكوكيز',
    pixels_settings: 'إعدادات البيكسلات',
    works_projects: 'مشاريع الأعمال',
    works_hero: 'هيرو الأعمال',
    works_gallery: 'معرض الأعمال',
    works_pagination: 'تنقل بين الأعمال',
  }

  const sectionKey = item.meta.sectionKey?.trim()

  if (sectionKey && sectionKeyTitleMap[sectionKey]) {
    return sectionKeyTitleMap[sectionKey]
  }

  return item.meta.tabLabel || item.meta.sectionKey || item.contentTypeName
}

function createSidebarItem(item: ContentListItem): SidebarItem {
  return {
    ...item,
    sidebarId: `content:${item.id}`,
    routePath: `/content/${item.id}`,
    sidebarTitle: resolveSidebarItemTitle(item),
  }
}

export function buildSidebarGroups(items: ContentListItem[]): SidebarGroup[] {
  const groups = new Map<string, SidebarGroup>()
  const groupItemKeys = new Map<string, Set<string>>()

  for (const item of items) {
    for (const pageKey of resolveSidebarPageKeys(item)) {
      const itemKey = resolveSidebarItemIdentity(item)
      const existingItemKeys = groupItemKeys.get(pageKey) ?? new Set<string>()

      if (existingItemKeys.has(itemKey)) {
        continue
      }

      existingItemKeys.add(itemKey)
      groupItemKeys.set(pageKey, existingItemKeys)

      const existingGroup = groups.get(pageKey)
      const sidebarItem = createSidebarItem(item)

      if (existingGroup) {
        existingGroup.items.push(sidebarItem)
        existingGroup.groupOrder = Math.min(
          existingGroup.groupOrder,
          resolveSidebarGroupOrder(pageKey),
        )
        continue
      }

      groups.set(pageKey, {
        key: pageKey,
        title: resolveSidebarGroupTitle(pageKey),
        groupOrder: resolveSidebarGroupOrder(pageKey),
        items: [sidebarItem],
      })
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort((left, right) => {
        const orderDelta =
          resolveItemOrderWithinPage(left, group.key) -
          resolveItemOrderWithinPage(right, group.key)

        if (orderDelta !== 0) {
          return orderDelta
        }

        const tabOrderDelta =
          (left.meta.tabOrder ?? Number.MAX_SAFE_INTEGER) -
          (right.meta.tabOrder ?? Number.MAX_SAFE_INTEGER)

        if (tabOrderDelta !== 0) {
          return tabOrderDelta
        }

        return (left.meta.tabLabel || left.contentTypeName).localeCompare(
          right.meta.tabLabel || right.contentTypeName,
          'ar',
        )
      }),
    }))
    .sort((left, right) => {
      const orderDelta = left.groupOrder - right.groupOrder

      if (orderDelta !== 0) {
        return orderDelta
      }

      return left.title.localeCompare(right.title, 'ar')
    })
}
