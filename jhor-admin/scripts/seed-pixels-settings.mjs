#!/usr/bin/env node

const API_BASE_URL = (
  process.env.API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "https://gohor.octoserv-comp.com"
).replace(/\/$/, "");

const TARGET_SECTION_KEY = "pixels_settings";

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function readResponseBody(response) {
  const text = await response.text();
  if (!text) return null;
  return parseJson(text) ?? text;
}

function buildPayload() {
  return {
    contentType: 9001,
    contentTypeName: "إعدادات البيكسلات",
    jsonContent: JSON.stringify({
      _meta: {
        tabLabel: "إعدادات البيكسلات",
        sectionKey: TARGET_SECTION_KEY,
        sectionType: "settings",
        assignToPages: ["settings"],
        tabOrder: 10,
      },
      googleAnalyticsId: "",
      googleAdsId: "AW-11414829697",
      metaPixelId: "887122059217323",
      snapchatPixelId: "bf52daa4-7d2d-4775-9942-d89340447cbc",
      twitterPixelId: "oj60s",
    }),
  };
}

async function getAuthHeaderValue() {
  const directToken = process.env.AUTH_TOKEN?.trim();
  const tokenType = process.env.AUTH_TOKEN_TYPE?.trim() || "Bearer";
  if (directToken) return `${tokenType} ${directToken}`;

  const username = process.env.AUTH_USERNAME?.trim();
  const password = process.env.AUTH_PASSWORD ?? "";
  if (!username || !password) {
    throw new Error(
      "يجب تحديد AUTH_TOKEN أو AUTH_USERNAME + AUTH_PASSWORD في متغيرات البيئة.",
    );
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const payload = await readResponseBody(response);
    throw new Error(
      `Login failed (${response.status}): ${
        typeof payload === "string" ? payload : JSON.stringify(payload)
      }`,
    );
  }

  const data = await response.json();
  const token = String(data?.token || "").trim();
  if (!token) throw new Error("Login succeeded but token is missing.");

  return `${String(data?.tokenType || "Bearer").trim() || "Bearer"} ${token}`;
}

function getSectionKey(record) {
  if (!record || typeof record !== "object") return "";
  const body = parseJson(String(record.jsonContent || ""));
  if (!body || typeof body !== "object" || Array.isArray(body)) return "";
  const meta = body._meta;
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return "";
  return typeof meta.sectionKey === "string" ? meta.sectionKey.trim() : "";
}

function buildHeaders(authHeader, extra = {}) {
  return {
    accept: "application/json",
    ...(authHeader ? { authorization: authHeader } : {}),
    ...extra,
  };
}

async function fetchContentList(authHeader) {
  const response = await fetch(`${API_BASE_URL}/api/content`, {
    headers: buildHeaders(authHeader),
  });

  if (!response.ok) {
    const payload = await readResponseBody(response);
    throw new Error(
      `Failed to load content list (${response.status}): ${
        typeof payload === "string" ? payload : JSON.stringify(payload)
      }`,
    );
  }

  const list = await response.json();
  if (!Array.isArray(list)) throw new Error("Unexpected /api/content payload.");
  return list;
}

async function updateContentRecord(authHeader, id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/content/${id}`, {
    method: "PUT",
    headers: buildHeaders(authHeader, { "content-type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await readResponseBody(response);
    throw new Error(
      `PUT failed (${response.status}) for ${id}: ${
        typeof body === "string" ? body : JSON.stringify(body)
      }`,
    );
  }
}

async function createContentRecord(authHeader, payload) {
  const response = await fetch(`${API_BASE_URL}/api/content`, {
    method: "POST",
    headers: buildHeaders(authHeader, { "content-type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await readResponseBody(response);
    throw new Error(
      `POST failed (${response.status}): ${
        typeof body === "string" ? body : JSON.stringify(body)
      }`,
    );
  }

  return response.json();
}

async function main() {
  const authHeader = await getAuthHeaderValue();
  const list = await fetchContentList(authHeader);
  const payload = buildPayload();
  const existing = list.find(
    (record) => getSectionKey(record) === TARGET_SECTION_KEY,
  );

  if (existing) {
    await updateContentRecord(authHeader, existing.id, payload);
    console.log(`Updated pixels settings (id: ${existing.id})`);
    return;
  }

  const created = await createContentRecord(authHeader, payload);
  console.log(`Created pixels settings (id: ${created?.id ?? "unknown"})`);
}

main().catch((error) => {
  console.error(
    `Seed pixels settings failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
});
