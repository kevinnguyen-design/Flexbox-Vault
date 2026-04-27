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

function route({ method, url, body }) {
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
  return {
    inject({ method = "GET", url = "/", body = "" }) {
      return route({ method, url, body });
    },
    async handleNodeRequest(request) {
      const chunks = [];
      for await (const chunk of request) {
        chunks.push(chunk);
      }

      return route({
        method: request.method ?? "GET",
        url: request.url ?? "/",
        body: Buffer.concat(chunks).toString("utf8")
      });
    }
  };
}
