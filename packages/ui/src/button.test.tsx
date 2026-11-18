import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button.js";

describe("Button", () => {
  it("renderiza o texto e é type=button por padrão", () => {
    render(<Button>Salvar</Button>);
    const el = screen.getByRole("button", { name: "Salvar" });
    expect(el.getAttribute("type")).toBe("button");
    expect(el.className).toContain("ui-button");
  });
});
