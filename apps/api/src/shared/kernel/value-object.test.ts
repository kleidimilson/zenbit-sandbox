import { describe, it, expect } from "vitest";
import { ValueObject } from "./value-object.js";

class Money extends ValueObject<{ cents: number; currency: string }> {
  static of(cents: number, currency = "BRL") {
    return new Money({ cents, currency });
  }
  get raw() {
    return this.props;
  }
}

describe("ValueObject", () => {
  it("compara por valor", () => {
    expect(Money.of(100).equals(Money.of(100))).toBe(true);
    expect(Money.of(100).equals(Money.of(101))).toBe(false);
    expect(Money.of(100).equals(undefined)).toBe(false);
  });

  it("é imutável", () => {
    expect(Object.isFrozen(Money.of(1).raw)).toBe(true);
  });
});
