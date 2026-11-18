import { describe, it, expect } from "vitest";
import { Entity } from "./entity.js";

class User extends Entity {
  static with(id: string) {
    return new User(id);
  }
}
class Admin extends Entity {
  static with(id: string) {
    return new Admin(id);
  }
}

describe("Entity", () => {
  it("compara por id e tipo", () => {
    expect(User.with("1").equals(User.with("1"))).toBe(true);
    expect(User.with("1").equals(User.with("2"))).toBe(false);
    expect(User.with("1").equals(Admin.with("1"))).toBe(false);
  });
});
