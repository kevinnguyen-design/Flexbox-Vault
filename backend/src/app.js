import {
  adSlots,
  buildCatalog,
  callouts,
  meta,
  patterns,
  properties,
  shortcuts
} from "./data/catalog.js";

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload)
  };
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function parseRequestUrl(rawUrl) {
  return new URL(rawUrl, "http://localhost");
}

function filterProperties(query) {
  const layout = normalizeText(query.get("layout"));
  const level = normalizeText(query.get("level"));
  const q = normalizeText(query.get("q"));

  const matched = properties.filter((item) => {
    const layoutOk =
      !layout || item.layout === layout || (layout !== "patterns" && item.layout === "both");
    const levelOk = !level || item.level === level;
    const qOk =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.values.some((value) => value.toLowerCase().includes(q));
    return layoutOk && levelOk && qOk;
  });

  if (!layout) {
    return matched;
  }

  return matched.map((item) => {
    if (item.layout !== "both") {
      return item;
    }

    return { ...item, layout };
  });
}

function filterPatterns(query) {
  const q = normalizeText(query.get("q"));
  const layout = normalizeText(query.get("layout"));

  return patterns.filter((item) => {
    const layoutOk = !layout || layout === "patterns" || item.layout === layout;
    const qOk = !q || item.label.toLowerCase().includes(q) || item.css.toLowerCase().includes(q);
    return layoutOk && qOk;
  });
}

function buildSearch(query) {
  const q = normalizeText(query.get("q"));
  if (!q) {
    return [];
  }

  const propertyMatches = properties
    .filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.values.some((value) => value.toLowerCase().includes(q)) ||
        normalizeText(item.note).includes(q)
    )
    .map((item) => ({
      type: "property",
      id: item.id,
      label: item.name,
      section: item.section
    }));

  const patternMatches = patterns
    .filter((item) => item.label.toLowerCase().includes(q) || item.css.toLowerCase().includes(q))
    .map((item) => ({
      type: "pattern",
      id: item.slug,
      label: item.label,
      section: "quick-patterns"
    }));

  const calloutMatches = callouts
    .filter((item) => item.text.toLowerCase().includes(q))
    .map((item, index) => ({
      type: "callout",
      id: `callout-${index + 1}`,
      label: item.text,
      section: item.section
    }));

  return [...propertyMatches, ...patternMatches, ...calloutMatches];
}

function parseJsonBody(body) {
  if (!body || !String(body).trim()) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

const telemetryBucket = new Map();

function getClientKey(headers) {
  const xForwardedFor = String(headers["x-forwarded-for"] ?? "").split(",")[0].trim();
  if (xForwardedFor) {
    return xForwardedFor;
  }
  return String(headers["x-real-ip"] ?? "unknown");
}

function checkTelemetryRateLimit(headers) {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 120;
  const key = getClientKey(headers);
  const state = telemetryBucket.get(key) ?? { count: 0, resetAt: now + windowMs };

  if (now >= state.resetAt) {
    state.count = 0;
    state.resetAt = now + windowMs;
  }

  if (state.count >= maxRequests) {
    telemetryBucket.set(key, state);
    return false;
  }

  state.count += 1;
  telemetryBucket.set(key, state);
  return true;
}

function route({ method, url, body, headers = {} }) {
  const parsed = parseRequestUrl(url);
  const pathname = parsed.pathname;

  if (method === "GET" && pathname === "/health") {
    return json(200, { status: "ok" });
  }

  if (method === "GET" && pathname === "/api/v1/meta") {
    return json(200, meta);
  }

  if (method === "GET" && pathname === "/api/v1/catalog") {
    return json(200, buildCatalog());
  }

  if (method === "GET" && pathname === "/api/v1/properties") {
    const items = filterProperties(parsed.searchParams);
    return json(200, { total: items.length, items });
  }

  if (method === "GET" && pathname === "/api/v1/patterns") {
    const items = filterPatterns(parsed.searchParams);
    return json(200, { total: items.length, items });
  }

  if (method === "GET" && pathname === "/api/v1/callouts") {
    return json(200, { total: callouts.length, items: callouts });
  }

  if (method === "GET" && pathname === "/api/v1/ad-slots") {
    return json(200, { total: adSlots.length, items: adSlots });
  }

  if (method === "GET" && pathname === "/api/v1/search") {
    const items = buildSearch(parsed.searchParams);
    return json(200, { total: items.length, items });
  }

  if (method === "GET" && pathname === "/api/v1/shortcuts") {
    const os = normalizeText(parsed.searchParams.get("os"));
    const target = os === "windows" ? shortcuts.windows : shortcuts.mac;
    return json(200, target);
  }

  if (method === "POST" && pathname === "/api/v1/telemetry/copy") {
    if (!checkTelemetryRateLimit(headers)) {
      return json(429, { error: "Rate limit exceeded." });
    }

    const contentType = normalizeText(headers["content-type"] ?? "");
    if (contentType && !contentType.includes("application/json")) {
      return json(415, { error: "Content-Type must be application/json." });
    }

    const parsedBody = parseJsonBody(body);
    if (parsedBody === null) {
      return json(400, {
        error: "Invalid JSON body."
      });
    }

    return json(200, {
      received: true,
      kind: "copy",
      source: parsedBody.source ?? "unknown",
      value: parsedBody.value ?? ""
    });
  }

  return json(404, { error: "Not found." });
}

export function createApp() {
  const maxBodyBytes = 16 * 1024;

  return {
    inject({ method = "GET", url = "/", body = "", headers = {} }) {
      return route({ method, url, body, headers });
    },
    async handleNodeRequest(request) {
      const chunks = [];
      let totalBytes = 0;
      for await (const chunk of request) {
        totalBytes += chunk.length;
        if (totalBytes > maxBodyBytes) {
          return json(413, { error: "Payload too large." });
        }
        chunks.push(chunk);
      }

      return route({
        method: request.method ?? "GET",
        url: request.url ?? "/",
        body: Buffer.concat(chunks).toString("utf8"),
        headers: request.headers ?? {}
      });
    }
  };
}
