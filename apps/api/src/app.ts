import type { IncomingMessage, ServerResponse } from "node:http";
import { healthPayload } from "shared";

export function handle(req: IncomingMessage, res: ServerResponse): void {
  if (req.method === "GET" && req.url === "/health") {
    send(res, 200, healthPayload(process.env.APP_VERSION ?? "dev"));
    return;
  }
  send(res, 404, { error: "not_found" });
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}
