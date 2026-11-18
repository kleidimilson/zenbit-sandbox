import { describe, it, expect } from "vitest";
import { AggregateRoot } from "./aggregate-root.js";

class Order extends AggregateRoot {
  static open(id: string) {
    const o = new Order(id);
    o.record({ name: "OrderOpened", aggregateId: id, occurredAt: new Date(0) });
    return o;
  }
}

describe("AggregateRoot", () => {
  it("entrega os eventos registrados uma única vez", () => {
    const o = Order.open("o1");
    expect(o.pullEvents().map((e) => e.name)).toEqual(["OrderOpened"]);
    expect(o.pullEvents()).toEqual([]);
  });
});
