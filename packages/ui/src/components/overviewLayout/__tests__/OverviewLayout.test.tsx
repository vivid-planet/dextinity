import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OverviewLayout } from "../OverviewLayout";

afterEach(cleanup);

describe("OverviewLayout", () => {
    it("renders the greeting as the page heading and the cards in their own region", () => {
        const { container } = render(
            <OverviewLayout title="Good morning, Max" eyebrow="Career portal" summary="Four pages were edited.">
                <section>Recently edited</section>
            </OverviewLayout>,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityOverviewLayout");
        expect(screen.getByRole("heading", { level: 1, name: "Good morning, Max" }).className).toContain("dextinityOverviewLayout__title");
        expect(screen.getByText("Four pages were edited.").className).toContain("dextinityOverviewLayout__summary");
        expect(screen.getByText("Recently edited").parentElement?.className).toContain("dextinityOverviewLayout__cards");
    });

    it("marks the root when the greeting has an aside", () => {
        const { container, rerender } = render(
            <OverviewLayout title="Hello">
                <section />
            </OverviewLayout>,
        );
        const root = container.firstElementChild as HTMLElement;
        expect(root.hasAttribute("data-aside")).toBe(false);

        rerender(
            <OverviewLayout title="Hello" aside="09:41">
                <section />
            </OverviewLayout>,
        );
        expect(root.dataset.aside).toBe("");
        expect(screen.getByText("09:41").className).toContain("dextinityOverviewLayout__aside");
    });
});
