import http from "node:http";

import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT || 8787);

const server = http.createServer(async (request, response) => {
  const result = await app.handleNodeRequest(request);
  response.statusCode = result.statusCode;

  for (const [key, value] of Object.entries(result.headers)) {
    response.setHeader(key, value);
  }

  response.end(result.body);
});

server.listen(port, () => {
  console.log(`Flex & Grid Vault backend listening on http://localhost:${port}`);
});
