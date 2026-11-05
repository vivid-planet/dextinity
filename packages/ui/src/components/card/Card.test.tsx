import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Card } from "./Card";

afterEach(cleanup);

describe("Card", () => {
    it("renders the contract classes, named by its title", () => {
        render(
            <Card title="Recently edited" icon={<span>i</span>} meta="30 days" link={<a href="/pages">Pages</a>} className="consumer-class">
                Rows
            </Card>,
        );

        const root = screen.getByRole("region", { name: "Recently edited" });
        expect(root.className).toContain("dextinityCard");
        expect(root.className).toContain("consumer-class");
        expect(screen.getByText("i").parentElement?.className).toContain("dextinityCard__orb");
        expect(screen.getByRole("heading", { level: 2 }).className).toContain("dextinityCard__title");
        expect(screen.getByText("30 days").className).toContain("dextinityCard__meta");
        expect(screen.getByRole("link").parentElement?.className).toContain("dextinityCard__link");
        expect(screen.getByText("Rows").className).toContain("dextinityCard__body");
    });
});
