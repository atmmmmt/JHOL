#!/usr/bin/env node

const API_BASE_URL =
  (process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'https://gohor.octoserv-comp.com').replace(/\/$/, '')
const DEFAULT_BACKGROUND = process.env.DEFAULT_BACKGROUND ?? ''
const DEFAULT_CONTENT = process.env.DEFAULT_CONTENT ?? '<p></p>'
const DRY_RUN = process.argv.includes('--dry-run')

function printUsage() {
  console.log(`\nUsage:\n  AUTH_TOKEN=<token> npm run backfill:page-fields\n  AUTH_USERNAME=<username> AUTH_PASSWORD=<password> npm run backfill:page-fields\n\nAlias:\n  npm run backfill:background\n\nOptional env vars:\n  API_BASE_URL=<url>         # default: ${API_BASE_URL}\n  DEFAULT_BACKGROUND=<value> # default: empty string\n  DEFAULT_CONTENT=<value>    # default: <p></p>\n\nFlags:\n  --dry-run                  # preview only, no PUT requests\n`)
}

function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function readResponseBody(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  const parsed = parseJson(text)
  return parsed ?? text
}

async function getAuthHeaderValue() {
  const directToken = process.env.AUTH_TOKEN?.trim()
  const tokenType = process.env.AUTH_TOKEN_TYPE?.trim() || 'Bearer'

  if (directToken) {
    return `${tokenType} ${directToken}`
  }

  const username = process.env.AUTH_USERNAME?.trim()
  const password = process.env.AUTH_PASSWORD ?? ''

  if (!username || !password) {
    printUsage()
    throw new Error(
      'Missing authentication: use AUTH_TOKEN or AUTH_USERNAME + AUTH_PASSWORD.',
    )
  }

  const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  if (!loginResponse.ok) {
    const loginErrorPayload = await readResponseBody(loginResponse)
    throw new Error(
      `Login failed (${loginResponse.status}): ${
        typeof loginErrorPayload === 'string'
          ? loginErrorPayload
          : JSON.stringify(loginErrorPayload)
      }`,
    )
  }

  const loginPayload = await loginResponse.json()
  const resolvedToken = String(loginPayload?.token || '').trim()

  if (!resolvedToken) {
    throw new Error('Login succeeded but no token was returned.')
  }

  return `${String(loginPayload?.tokenType || 'Bearer').trim() || 'Bearer'} ${resolvedToken}`
}

function ensurePageDefaults(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      background: DEFAULT_BACKGROUND,
      content: DEFAULT_CONTENT,
    }
  }

  const hasBackground = Object.prototype.hasOwnProperty.call(body, 'background')
  const hasContent = Object.prototype.hasOwnProperty.call(body, 'content')

  if (hasBackground && hasContent) {
    return body
  }

  return {
    background: DEFAULT_BACKGROUND,
    content: DEFAULT_CONTENT,
    ...body,
  }
}

async function fetchContentList(authHeader) {
  const response = await fetch(`${API_BASE_URL}/api/content`, {
    headers: {
      accept: 'application/json',
      authorization: authHeader,
    },
  })

  if (!response.ok) {
    const errorPayload = await readResponseBody(response)
    throw new Error(
      `Failed to load content list (${response.status}): ${
        typeof errorPayload === 'string'
          ? errorPayload
          : JSON.stringify(errorPayload)
      }`,
    )
  }

  const payload = await response.json()

  if (!Array.isArray(payload)) {
    throw new Error('Unexpected /api/content payload: expected an array.')
  }

  return payload
}

async function updateContentRecord(authHeader, record, nextBody) {
  const payload = {
    contentType: record.contentType,
    jsonContent: JSON.stringify(nextBody),
  }

  const response = await fetch(`${API_BASE_URL}/api/content/${record.id}`, {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: authHeader,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorPayload = await readResponseBody(response)
    throw new Error(
      `PUT failed for record ${record.id} (${response.status}): ${
        typeof errorPayload === 'string'
          ? errorPayload
          : JSON.stringify(errorPayload)
      }`,
    )
  }
}

async function main() {
  const authHeader = await getAuthHeaderValue()
  const list = await fetchContentList(authHeader)

  let scannedCount = 0
  let updatedCount = 0
  let skippedCount = 0
  let invalidCount = 0

  for (const record of list) {
    scannedCount += 1

    const parsedBody = parseJson(record?.jsonContent)

    if (parsedBody === null || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      invalidCount += 1
      console.warn(`Skipping ${record?.id ?? 'unknown-id'}: invalid jsonContent object.`)
      continue
    }

    const hasBackground = Object.prototype.hasOwnProperty.call(parsedBody, 'background')
    const hasContent = Object.prototype.hasOwnProperty.call(parsedBody, 'content')

    if (hasBackground && hasContent) {
      skippedCount += 1
      continue
    }

    const nextBody = ensurePageDefaults(parsedBody)

    if (DRY_RUN) {
      console.log(`[dry-run] would update record ${record.id}`)
      updatedCount += 1
      continue
    }

    await updateContentRecord(authHeader, record, nextBody)
    updatedCount += 1
    console.log(`Updated record ${record.id}`)
  }

  console.log('\nDone.')
  console.log(`Scanned: ${scannedCount}`)
  console.log(`Updated: ${updatedCount}`)
  console.log(`Already had background + content: ${skippedCount}`)
  console.log(`Invalid payloads: ${invalidCount}`)
}

main().catch((error) => {
  console.error(`\nBackfill failed: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
