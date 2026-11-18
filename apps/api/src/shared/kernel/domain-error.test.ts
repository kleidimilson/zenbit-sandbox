import { describe, it, expect } from "vitest";
import { DomainError } from "./domain-error.js";

class NotFound extends DomainError {
  readonly code = "NOT_FOUND";
}

describe("DomainError", () => {
  it("carrega código e mensagem", () => {
    const e = new NotFound("pedido não encontrado");
    expect([e.code, e.message]).toEqual(["NOT_FOUND", "pedido não encontrado"]);
  });
});
