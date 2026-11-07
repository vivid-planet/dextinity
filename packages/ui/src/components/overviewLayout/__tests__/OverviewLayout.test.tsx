import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

    it("shows the back link before the eyebrow and lets the router handle it", () => {
        const onClick = vi.fn();
        render(
            <OverviewLayout title="Main site" eyebrow="Overview" back={{ label: "All sites", href: "/sites", onClick }}>
                <section />
            </OverviewLayout>,
        );

        const back = screen.getByRole("link", { name: "All sites" });
        expect(back.getAttribute("href")).toBe("/sites");
        expect(back.className).toContain("dextinityOverviewLayout__back");
        expect(back.parentElement?.className).toContain("dextinityOverviewLayout__label");
        expect(back.parentElement?.textContent).toMatch(/All sites.*Overview/);

        const click = new MouseEvent("click", { bubbles: true, cancelable: true });
        fireEvent(back, click);
        expect(onClick).toHaveBeenCalledOnce();
        expect(click.defaultPrevented).toBe(true);
    });
});
