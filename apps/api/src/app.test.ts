import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { handle } from "./app.js";

let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer(handle);
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((r) => server.close(() => r())));

describe("api", () => {
  it("GET /health responde ok", async () => {
    const res = await fetch(`${base}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: "ok" });
  });

  it("rota desconhecida responde 404", async () => {
    const res = await fetch(`${base}/nada`);
    expect(res.status).toBe(404);
  });
});
