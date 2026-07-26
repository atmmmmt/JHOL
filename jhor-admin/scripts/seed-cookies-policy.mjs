#!/usr/bin/env node

const API_BASE_URL = (
  process.env.API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "https://gohor.octoserv-comp.com"
).replace(/\/$/, "");

const TARGET_SECTION_KEY = "cookies_policy";

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
    contentType: 8104,
    contentTypeName: "سياسة الكوكيز",
    jsonContent: JSON.stringify({
      _meta: {
        tabLabel: "سياسة الكوكيز",
        sectionKey: TARGET_SECTION_KEY,
        sectionType: "content",
        assignToPages: ["cookies-policy"],
        tabOrder: 1,
      },
      background: "",
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
    return null;
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
  if (!token) {
    throw new Error("Login succeeded but token is missing.");
  }

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
  if (!Array.isArray(list)) {
    throw new Error("Unexpected /api/content payload.");
  }
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
}

async function main() {
  const authHeader = await getAuthHeaderValue();
  const list = await fetchContentList(authHeader);
  const payload = buildPayload();
  const existing = list.find((record) => getSectionKey(record) === TARGET_SECTION_KEY);

  if (existing) {
    await updateContentRecord(authHeader, existing.id, payload);
    console.log(`Updated cookies policy (id: ${existing.id})`);
    return;
  }

  await createContentRecord(authHeader, payload);
  console.log("Created cookies policy");
}

main().catch((error) => {
  console.error(
    `Seed cookies policy failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
