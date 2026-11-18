import { describe, it, expect } from "vitest";
import { ok, err, isOk, isErr, map } from "./result.js";

describe("Result", () => {
  it("distingue sucesso e erro", () => {
    expect(isOk(ok(1))).toBe(true);
    expect(isErr(err("x"))).toBe(true);
  });

  it("mapeia só o sucesso", () => {
    expect(map(ok(2), (v) => v * 2)).toEqual(ok(4));
    expect(map(err("e"), (v: number) => v * 2)).toEqual(err("e"));
  });
});
