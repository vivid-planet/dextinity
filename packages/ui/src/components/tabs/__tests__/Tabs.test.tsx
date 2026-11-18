import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Tabs } from "../Tabs";

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

    it("marks a tab with errors and names the errors", () => {
        render(
            <Tabs
                aria-label="Page"
                items={[
                    { value: "blocks", label: "Blocks" },
                    { value: "seo", label: "SEO", tone: "error" },
                ]}
                value="blocks"
                onChange={vi.fn()}
                labels={{ error: "Has errors" }}
            />,
        );

        const tab = screen.getByRole("tab", { name: "SEO Has errors" });
        expect(tab.dataset.tone).toBe("error");
        expect(tab.querySelector(".dextinityTabs__errorMarker")).toBeTruthy();
    });

    it("renders tabs with an href as links through the tab slot", () => {
        function RouterLink(props: { href: string }) {
            return <a {...props} data-router="" />;
        }
        render(
            <Tabs
                aria-label="Page"
                items={[
                    { value: "blocks", label: "Blocks", href: "/page/blocks" },
                    { value: "seo", label: "SEO", href: "/page/seo" },
                ]}
                value="blocks"
                onChange={vi.fn()}
                slots={{ tab: RouterLink }}
            />,
        );

        const tab = screen.getByRole("tab", { name: "SEO" });
        expect(tab.tagName).toBe("A");
        expect(tab.getAttribute("href")).toBe("/page/seo");
        expect(tab.dataset.router).toBe("");
    });

    it("keeps the click handler from slotProps on link tabs, and leaves the tab on a modifier click", () => {
        const onChange = vi.fn();
        const onTabClick = vi.fn();
        render(
            <Tabs
                aria-label="Page"
                items={[
                    { value: "blocks", label: "Blocks", href: "#blocks" },
                    { value: "seo", label: "SEO", href: "#seo" },
                ]}
                value="blocks"
                onChange={onChange}
                slotProps={{ tab: { onClick: onTabClick } }}
            />,
        );

        const tab = screen.getByRole("tab", { name: "SEO" });
        fireEvent.click(tab, { ctrlKey: true });
        expect(onTabClick).toHaveBeenCalledTimes(1);
        expect(onChange).not.toHaveBeenCalled();

        fireEvent.click(tab);
        expect(onTabClick).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenCalledWith("seo");
    });
});
