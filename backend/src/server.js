import http from "node:http";

import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT || 8787);

function setSecurityHeaders(request, response) {
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader("x-frame-options", "DENY");
  response.setHeader("referrer-policy", "no-referrer");
  response.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("cross-origin-opener-policy", "same-origin");
  response.setHeader("cross-origin-resource-policy", "same-origin");
  response.setHeader("content-security-policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");

  const forwardedProto = String(request.headers["x-forwarded-proto"] ?? "").toLowerCase();
  const isHttps = request.socket.encrypted || forwardedProto === "https";
  if (isHttps) {
    response.setHeader("strict-transport-security", "max-age=31536000; includeSubDomains");
  }
}

const server = http.createServer(async (request, response) => {
  const result = await app.handleNodeRequest(request);
  response.statusCode = result.statusCode;
  setSecurityHeaders(request, response);

  for (const [key, value] of Object.entries(result.headers)) {
    response.setHeader(key, value);
  }

  response.end(result.body);
});

server.listen(port, () => {
  console.log(`Flex & Grid Vault backend listening on http://localhost:${port}`);
});
