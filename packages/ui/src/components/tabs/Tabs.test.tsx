import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Tabs } from "./Tabs";

afterEach(cleanup);

describe("Tabs", () => {
    it("emits the root class and whether the tabs render their panels", () => {
        const { container } = render(
            <Tabs
                aria-label="Page"
                items={[
                    { value: "blocks", label: "Blocks", panel: "Blocks content" },
                    { value: "seo", label: "SEO" },
                ]}
                value="blocks"
                onChange={vi.fn()}
            />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityTabs");
        expect(root.dataset.haspanels).toBe("");
        expect(screen.getByRole("tabpanel").className).toContain("dextinityTabs__panel");
    });

    it("names the tab list and adds the count to the tab's name", () => {
        render(
            <Tabs
                aria-label="Page"
                items={[
                    { value: "blocks", label: "Blocks" },
                    { value: "seo", label: "SEO", count: 1 },
                ]}
                value="seo"
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("tablist", { name: "Page" })).toBeTruthy();
        expect(screen.getByRole("tab", { name: "SEO 1" }).getAttribute("aria-selected")).toBe("true");
    });
});
