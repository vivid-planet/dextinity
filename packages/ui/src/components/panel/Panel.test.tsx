import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Panel } from "./Panel";

afterEach(cleanup);

describe("Panel", () => {
    it("renders the contract classes and owner state, named by its title", () => {
        render(
            <Panel title="Recently edited" description="Last 30 days" actions={<button type="button">More</button>} className="consumer-class">
                Content
            </Panel>,
        );

        const root = screen.getByRole("region", { name: "Recently edited" });
        expect(root.className).toContain("dextinityPanel");
        expect(root.className).toContain("consumer-class");
        expect([root.dataset.variant, root.dataset.padding]).toStrictEqual(["glass", "default"]);
        expect(screen.getByRole("heading", { level: 2 }).className).toContain("dextinityPanel__title");
        expect(screen.getByText("Last 30 days").className).toContain("dextinityPanel__description");
        expect(screen.getByRole("button").parentElement?.className).toContain("dextinityPanel__actions");
        expect(screen.getByText("Content").className).toContain("dextinityPanel__body");
    });

    it("renders no header without title, description, or actions", () => {
        const { container } = render(
            <Panel variant="solid" padding="none">
                Rows
            </Panel>,
        );

        const root = container.firstElementChild as HTMLElement;
        expect([root.dataset.variant, root.dataset.padding]).toStrictEqual(["solid", "none"]);
        expect(root.querySelector(".dextinityPanel__header")).toBeNull();
    });
});
