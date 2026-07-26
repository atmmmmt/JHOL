#!/usr/bin/env node

const API_BASE_URL = (
  process.env.API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  'https://gohor.octoserv-comp.com'
).replace(/\/$/, '')

function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function readResponseBody(response) {
  const text = await response.text()
  if (!text) return null
  return parseJson(text) ?? text
}

function buildRecordPayload({
  contentType,
  contentTypeName,
  tabLabel,
  sectionKey,
  assignToPages,
  content,
}) {
  return {
    contentType,
    contentTypeName,
    jsonContent: JSON.stringify({
      _meta: {
        tabLabel,
        sectionKey,
        sectionType: 'content',
        assignToPages,
        tabOrder: 1,
      },
      background: '',
      content,
    }),
  }
}

async function getAuthHeaderValue() {
  const directToken = process.env.AUTH_TOKEN?.trim()
  const tokenType = process.env.AUTH_TOKEN_TYPE?.trim() || 'Bearer'
  if (directToken) return `${tokenType} ${directToken}`

  const username = process.env.AUTH_USERNAME?.trim()
  const password = process.env.AUTH_PASSWORD ?? ''
  if (!username || !password) {
    return null
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const payload = await readResponseBody(response)
    throw new Error(
      `Login failed (${response.status}): ${
        typeof payload === 'string' ? payload : JSON.stringify(payload)
      }`,
    )
  }

  const data = await response.json()
  const token = String(data?.token || '').trim()
  if (!token) {
    throw new Error('Login succeeded but token is missing.')
  }

  return `${String(data?.tokenType || 'Bearer').trim() || 'Bearer'} ${token}`
}

async function fetchContentList(authHeader) {
  const headers = {
    accept: 'application/json',
    ...(authHeader ? { authorization: authHeader } : {}),
  }

  const response = await fetch(`${API_BASE_URL}/api/content`, {
    headers,
  })

  if (!response.ok) {
    const payload = await readResponseBody(response)
    throw new Error(
      `Failed to load content list (${response.status}): ${
        typeof payload === 'string' ? payload : JSON.stringify(payload)
      }`,
    )
  }

  const list = await response.json()
  if (!Array.isArray(list)) {
    throw new Error('Unexpected /api/content payload.')
  }
  return list
}

function getSectionKey(record) {
  if (!record || typeof record !== 'object') return ''
  const body = parseJson(String(record.jsonContent || ''))
  if (!body || typeof body !== 'object' || Array.isArray(body)) return ''
  const meta = body._meta
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return ''
  return typeof meta.sectionKey === 'string' ? meta.sectionKey.trim() : ''
}

async function updateContentRecord(authHeader, id, payload) {
  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    ...(authHeader ? { authorization: authHeader } : {}),
  }

  const response = await fetch(`${API_BASE_URL}/api/content/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await readResponseBody(response)
    throw new Error(
      `PUT failed (${response.status}) for ${id}: ${
        typeof body === 'string' ? body : JSON.stringify(body)
      }`,
    )
  }
}

async function createContentRecord(authHeader, payload) {
  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    ...(authHeader ? { authorization: authHeader } : {}),
  }

  const response = await fetch(`${API_BASE_URL}/api/content`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await readResponseBody(response)
    throw new Error(
      `POST failed (${response.status}): ${
        typeof body === 'string' ? body : JSON.stringify(body)
      }`,
    )
  }
}

const legalPages = [
  {
    contentType: 8101,
    contentTypeName: 'شروط وأحكام الحملات',
    tabLabel: 'شروط وأحكام الحملات',
    sectionKey: 'campaign_terms_conditions',
    assignToPages: ['campaign-terms'],
    content: `
<h2>شروط وأحكام الحملات</h2>
<p>باستخدامك خدمات إدارة الحملات، فإنك توافق على الشروط التالية:</p>
<ul>
  <li>تزويدنا بمعلومات دقيقة وواضحة حول هدف الحملة والجمهور المستهدف.</li>
  <li>الالتزام بالمحتوى القانوني وعدم تضمين مواد مخالفة أو مضللة.</li>
  <li>الموافقة على خطط التنفيذ والجداول الزمنية قبل الإطلاق.</li>
  <li>تتحمل الجهة المالكة للحملة مسؤولية المواد المعتمدة للنشر.</li>
</ul>
<p>يحق لنا تعديل آلية التنفيذ بما يخدم أفضل أداء للحملة مع إشعاركم بالتغييرات الجوهرية.</p>
`.trim(),
  },
  {
    contentType: 8102,
    contentTypeName: 'شروط وأحكام الهويات',
    tabLabel: 'شروط وأحكام الهويات',
    sectionKey: 'identity_terms_conditions',
    assignToPages: ['identity-terms'],
    content: `
<h2>شروط وأحكام الهويات</h2>
<p>تنطبق هذه الشروط على مشاريع بناء الهوية البصرية والشعارات:</p>
<ul>
  <li>تسليم المتطلبات والمرجعيات قبل بدء مرحلة التصميم.</li>
  <li>يشمل المشروع عددًا محددًا من جولات التعديل حسب الاتفاق.</li>
  <li>تسليم الملفات النهائية بعد اعتماد النسخة الأخيرة وسداد المستحقات.</li>
  <li>يُمنع إعادة بيع أو استخدام الهوية خارج نطاق الجهة المالكة دون إذن.</li>
</ul>
<p>جميع الحقوق الفكرية تنتقل للعميل بعد التسليم النهائي ما لم يُذكر خلاف ذلك في العقد.</p>
`.trim(),
  },
  {
    contentType: 8103,
    contentTypeName: 'سياسة الخصوصية',
    tabLabel: 'سياسة الخصوصية',
    sectionKey: 'privacy_policy',
    assignToPages: ['privacy-policy'],
    content: `
<h2>سياسة الخصوصية</h2>
<p>نلتزم بحماية بياناتكم الشخصية واستخدامها فقط للأغراض التشغيلية والخدمية.</p>
<ul>
  <li>نجمع البيانات الأساسية اللازمة للتواصل وتقديم الخدمة.</li>
  <li>لا نشارك بياناتكم مع أطراف خارجية دون موافقة صريحة أو التزام قانوني.</li>
  <li>يمكنكم طلب تحديث أو حذف بياناتكم عبر قنوات التواصل الرسمية.</li>
  <li>نُطبّق إجراءات أمنية مناسبة لحماية المعلومات من الوصول غير المصرح.</li>
</ul>
<p>استمرار استخدامكم لخدماتنا يعني موافقتكم على هذه السياسة وتحديثاتها المستقبلية.</p>
`.trim(),
  },
  {
    contentType: 8104,
    contentTypeName: 'سياسة الكوكيز',
    tabLabel: 'سياسة الكوكيز',
    sectionKey: 'cookies_policy',
    assignToPages: ['cookies-policy'],
    content: `
<h2>سياسة الكوكيز</h2>
<p>توضح هذه السياسة كيفية استخدام ملفات تعريف الارتباط (Cookies) داخل موقعنا، وكيف يمكنك إدارة تفضيلاتك.</p>
<ul>
  <li>الكوكيز الضرورية: مطلوبة لتشغيل الموقع بشكل صحيح، ولا يمكن تعطيلها من النظام.</li>
  <li>الكوكيز التحليلية: تساعدنا على فهم سلوك الاستخدام وتحسين الأداء.</li>
  <li>الكوكيز التسويقية: تستخدم لقياس الحملات وتخصيص الرسائل الإعلانية.</li>
</ul>
<p>لا يتم تفعيل الكوكيز التحليلية أو التسويقية قبل الحصول على موافقتك. يمكنك قبول الكل أو رفض الكل أو تخصيص الاختيارات.</p>
<p>يمكنك تعديل موافقتك أو سحبها في أي وقت من إعدادات الكوكيز داخل الموقع.</p>
`.trim(),
  },
]

async function main() {
  const authHeader = await getAuthHeaderValue()
  const records = await fetchContentList(authHeader)

  for (const page of legalPages) {
    const payload = buildRecordPayload(page)
    const existing = records.find(
      (record) => getSectionKey(record) === page.sectionKey,
    )

    if (existing) {
      await updateContentRecord(authHeader, existing.id, payload)
      console.log(`Updated: ${page.tabLabel} (id: ${existing.id})`)
      continue
    }

    await createContentRecord(authHeader, payload)
    console.log(`Created: ${page.tabLabel}`)
  }
}

main().catch((error) => {
  console.error(
    `Seed legal pages failed: ${error instanceof Error ? error.message : String(error)}`,
  )
  process.exitCode = 1
})
