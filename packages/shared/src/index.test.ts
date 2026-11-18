import { describe, expect, it } from "vitest";
import { healthPayload } from "./index.js";

describe("healthPayload", () => {
  it("retorna status ok com a versão", () => {
    expect(healthPayload("1.0.0")).toEqual({ status: "ok", version: "1.0.0" });
  });

  it("rejeita versão vazia", () => {
    expect(() => healthPayload("")).toThrow();
  });
});
