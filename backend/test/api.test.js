import test from "node:test";
import assert from "node:assert/strict";

import { createApp } from "../src/app.js";

function readJson(response) {
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
  return JSON.parse(response.body);
}

test("GET /health returns ok", () => {
  const app = createApp();
  const response = app.inject({ method: "GET", url: "/health" });
  const payload = readJson(response);
  assert.equal(payload.status, "ok");
});

test("GET /api/v1/catalog returns all top-level sections", () => {
  const app = createApp();
  const response = app.inject({ method: "GET", url: "/api/v1/catalog" });
  const payload = readJson(response);

  assert.equal(payload.product.name, "Flex & Grid Vault");
  assert.equal(payload.sections.length, 5);
  assert.ok(payload.sections.some((section) => section.id === "flex-container-properties"));
  assert.ok(payload.sections.some((section) => section.id === "flex-item-properties"));
  assert.ok(payload.sections.some((section) => section.id === "grid-container-properties"));
  assert.ok(payload.sections.some((section) => section.id === "grid-item-properties"));
  assert.ok(payload.sections.some((section) => section.id === "quick-patterns"));
});

test("GET /api/v1/properties can filter by layout and level", () => {
  const app = createApp();
  const response = app.inject({
    method: "GET",
    url: "/api/v1/properties?layout=flexbox&level=container"
  });
  const payload = readJson(response);

  assert.ok(payload.total >= 7);
  assert.ok(payload.items.some((item) => item.name === "flex-direction"));
  assert.ok(payload.items.some((item) => item.name === "justify-content"));
  assert.ok(payload.items.every((item) => item.layout === "flexbox"));
  assert.ok(payload.items.every((item) => item.level === "container"));
});

test("GET /api/v1/properties includes required value sets", () => {
  const app = createApp();
  const response = app.inject({ method: "GET", url: "/api/v1/properties" });
  const payload = readJson(response);

  const byName = new Map(payload.items.map((item) => [item.name, item]));
  assert.deepEqual(byName.get("display").values, ["flex", "inline-flex", "grid", "inline-grid"]);
  assert.deepEqual(byName.get("flex-wrap").values, ["nowrap", "wrap", "wrap-reverse"]);
  assert.deepEqual(byName.get("order").values, ["-1", "0", "1", "2"]);
  assert.ok(byName.get("grid-template-columns").values.includes("repeat(auto-fit, minmax(160px, 1fr))"));
});

test("GET /api/v1/patterns returns all required quick patterns", () => {
  const app = createApp();
  const response = app.inject({ method: "GET", url: "/api/v1/patterns" });
  const payload = readJson(response);

  assert.equal(payload.total, 7);
  assert.ok(payload.items.some((item) => item.slug === "centered-single-item"));
  assert.ok(payload.items.some((item) => item.slug === "sticky-footer-layout"));
  assert.ok(payload.items.some((item) => item.slug === "holy-grail-layout"));
  assert.ok(payload.items.some((item) => item.slug === "card-grid-auto-fill-minmax"));
  assert.ok(payload.items.some((item) => item.slug === "sidebar-content-flex"));
  assert.ok(payload.items.some((item) => item.slug === "equal-height-cards"));
  assert.ok(payload.items.some((item) => item.slug === "masonry-ish-grid-auto-rows"));
});

test("GET /api/v1/search finds properties and patterns", () => {
  const app = createApp();
  const response = app.inject({ method: "GET", url: "/api/v1/search?q=auto-fit" });
  const payload = readJson(response);

  assert.ok(payload.total >= 1);
  assert.ok(payload.items.some((item) => item.type === "property"));
});

test("GET /api/v1/callouts includes at least 8 callouts and required gotchas", () => {
  const app = createApp();
  const response = app.inject({ method: "GET", url: "/api/v1/callouts" });
  const payload = readJson(response);

  assert.ok(payload.total >= 8);
  assert.ok(payload.items.some((item) => item.text.includes("flex: 1 is shorthand for flex: 1 1 0")));
  assert.ok(payload.items.some((item) => item.text.includes("min-width: 0 on flex children")));
  assert.ok(payload.items.some((item) => item.text.includes("auto-fill vs auto-fit")));
});

test("GET /api/v1/ad-slots includes required ids and sizes", () => {
  const app = createApp();
  const response = app.inject({ method: "GET", url: "/api/v1/ad-slots" });
  const payload = readJson(response);

  const ids = payload.items.map((item) => item.id);
  assert.deepEqual(ids, ["ad-top-bar", "ad-mid-flex", "ad-mid-grid", "ad-mobile-bottom"]);
});

test("GET /api/v1/shortcuts defaults by os query", () => {
  const app = createApp();
  const mac = readJson(app.inject({ method: "GET", url: "/api/v1/shortcuts?os=mac" }));
  const win = readJson(app.inject({ method: "GET", url: "/api/v1/shortcuts?os=windows" }));

  assert.equal(mac.platform, "mac");
  assert.equal(mac.copyShortcut, "Cmd+C");
  assert.equal(win.platform, "windows");
  assert.equal(win.copyShortcut, "Ctrl+C");
});

test("POST /api/v1/telemetry/copy accepts event payload", () => {
  const app = createApp();
  const response = app.inject({
    method: "POST",
    url: "/api/v1/telemetry/copy",
    body: JSON.stringify({ source: "property", value: "flex-direction: row" })
  });

  const payload = readJson(response);
  assert.equal(payload.received, true);
  assert.equal(payload.kind, "copy");
});

test("POST /api/v1/telemetry/copy rejects non-json content type", () => {
  const app = createApp();
  const response = app.inject({
    method: "POST",
    url: "/api/v1/telemetry/copy",
    headers: { "content-type": "text/plain" },
    body: "source=frontend"
  });

  assert.equal(response.statusCode, 415);
});

test("POST /api/v1/telemetry/copy rate limits noisy clients", () => {
  const app = createApp();
  const headers = { "content-type": "application/json", "x-real-ip": "1.2.3.4" };

  let finalResponse;
  for (let i = 0; i < 121; i += 1) {
    finalResponse = app.inject({
      method: "POST",
      url: "/api/v1/telemetry/copy",
      headers,
      body: JSON.stringify({ source: "frontend", value: `v-${i}` })
    });
  }

  assert.equal(finalResponse.statusCode, 429);
});
