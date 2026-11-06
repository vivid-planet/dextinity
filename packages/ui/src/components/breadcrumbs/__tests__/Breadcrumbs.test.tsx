import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Breadcrumbs } from "../Breadcrumbs";

afterEach(cleanup);

describe("Breadcrumbs", () => {
    it("renders earlier levels as links and the last level as the current page", () => {
        const { container } = render(
            <Breadcrumbs
                items={[{ label: "Page", href: "/page" }, { label: "Teaser grid", href: "/grid" }, { label: "Teaser 2" }]}
                separator="›"
                className="consumer-class"
            />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.tagName).toBe("NAV");
        expect(root.className).toContain("dextinityBreadcrumbs");
        expect(root.className).toContain("consumer-class");
        expect(root.dataset.variant).toBe("default");
        expect(screen.getAllByRole("link").map((link) => link.textContent)).toStrictEqual(["Page", "Teaser grid"]);
        const current = screen.getByText("Teaser 2");
        expect(current.getAttribute("aria-current")).toBe("page");
        expect(current.className).toContain("dextinityBreadcrumbs__current");
        expect(container.querySelectorAll(".dextinityBreadcrumbs__separator")).toHaveLength(2);
    });

    it("collapses the middle levels beyond maxItems", () => {
        const { container } = render(
            <Breadcrumbs items={["Page", "Grid", "Teaser", "Column", "Text"].map((label) => ({ label, href: `/${label}` }))} maxItems={3} />,
        );

        expect((container.firstElementChild as HTMLElement).dataset.collapsed).toBe("");
        expect(screen.getAllByRole("link").map((link) => link.textContent)).toStrictEqual(["Page"]);
        expect(screen.getByRole("button", { name: "Show hidden levels" })).toBeTruthy();
        expect(screen.getByText("Text").getAttribute("aria-current")).toBe("page");
    });

    it("renders a level with only onClick as a focusable button", () => {
        const onClick = vi.fn();
        render(<Breadcrumbs items={[{ label: "Page", onClick }, { label: "Teaser 2" }]} />);

        const level = screen.getByRole("button", { name: "Page" });
        expect(level.className).toContain("dextinityLink");
        expect(level.className).toContain("dextinityBreadcrumbs__linkButton");
        fireEvent.click(level);
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
