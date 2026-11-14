import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CardRow } from "../CardRow";

afterEach(cleanup);

describe("CardRow", () => {
    it("renders the contract classes on a link", () => {
        render(
            <CardRow
                href="/pages/open-positions"
                title="Open positions"
                subtitle="/careers/open-positions"
                end="12 min ago"
                className="consumer-class"
            />,
        );

        const root = screen.getByRole("link", { name: /Open positions/ });
        expect(root.getAttribute("href")).toBe("/pages/open-positions");
        expect(root.className).toContain("dextinityCardRow");
        expect(root.className).toContain("consumer-class");
        expect(screen.getByText("Open positions").className).toContain("dextinityCardRow__title");
        expect(screen.getByText("Open positions").parentElement?.className).toContain("dextinityCardRow__text");
        expect(screen.getByText("/careers/open-positions").className).toContain("dextinityCardRow__subtitle");
        expect(screen.getByText("12 min ago").className).toContain("dextinityCardRow__end");
        expect(root.lastElementChild?.className).toContain("dextinityCardRow__arrow");
    });

    it("renders through a custom root element", () => {
        render(<CardRow title="Open positions" render={<button type="button" />} />);

        expect(screen.getByRole("button", { name: "Open positions" }).className).toContain("dextinityCardRow");
    });
});
