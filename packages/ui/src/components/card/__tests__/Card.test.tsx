import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Card } from "../Card";

afterEach(cleanup);

describe("Card", () => {
    it("renders the contract classes, named by its title", () => {
        render(
            <Card title="Recently edited" meta="12 pages" actions={<a href="/pages">Pages</a>} className="consumer-class">
                Rows
            </Card>,
        );

        const root = screen.getByRole("region", { name: "Recently edited" });
        expect(root.className).toContain("dextinityCard");
        expect(root.className).toContain("consumer-class");
        expect(screen.getByRole("banner").className).toContain("dextinityCard__header");
        expect(screen.getByRole("heading", { level: 2 }).className).toContain("dextinityCard__title");
        expect(screen.getByText("12 pages").className).toContain("dextinityCard__meta");
        expect(screen.getByRole("link").parentElement?.className).toContain("dextinityCard__actions");
        expect(screen.getByText("Rows").className).toContain("dextinityCard__body");
    });
});
