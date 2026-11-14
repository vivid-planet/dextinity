import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PageHeader } from "../PageHeader";

afterEach(cleanup);

describe("PageHeader", () => {
    it("renders the title as the page heading with the contract classes", () => {
        const { container } = render(
            <PageHeader
                title="Page tree"
                eyebrow="Austria · German"
                subtitle="3 unpublished"
                actions={<button type="button">New page</button>}
                back={{ label: "Overview", href: "/" }}
                className="consumer-class"
            />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.tagName).toBe("HEADER");
        expect(root.className).toContain("dextinityPageHeader");
        expect(root.className).toContain("consumer-class");
        expect(root.dataset.hasBack).toBe("");
        expect(root.dataset.hasActions).toBe("");
        const heading = screen.getByRole("heading", { level: 1, name: "Page tree" });
        expect(heading.className).toContain("dextinityPageHeader__title");
        const back = screen.getByRole("link", { name: "Overview" });
        expect(back.getAttribute("href")).toBe("/");
        expect(back.nextElementSibling).toBe(heading);
        expect(screen.getByText("3 unpublished").className).toContain("dextinityPageHeader__subtitle");
        expect(container.querySelector(".dextinityPageHeader__labelLine")?.textContent).toBe("Austria · German");
    });

    it("leaves out the label line and the actions when they are not given", () => {
        const { container } = render(<PageHeader title="Page tree" />);

        expect(container.querySelector(".dextinityPageHeader__labelLine")).toBeNull();
        expect(container.querySelector(".dextinityPageHeader__actions")).toBeNull();
        expect((container.firstElementChild as HTMLElement).hasAttribute("data-has-back")).toBe(false);
    });

    it("shows a back button before the title that calls onClick", () => {
        const onClick = vi.fn();
        render(<PageHeader title="Frontend developer" back={{ label: "Back to job ads", onClick }} actions={<button type="button">Save</button>} />);

        const back = screen.getByRole("button", { name: "Back to job ads" });
        expect(back.nextElementSibling).toBe(screen.getByRole("heading", { level: 1, name: "Frontend developer" }));
        fireEvent.click(back);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("emits the variant", () => {
        const { container } = render(
            <>
                <PageHeader title="Page tree" />
                <PageHeader title="Open positions" variant="compact" />
            </>,
        );

        expect(Array.from(container.children).map((header) => (header as HTMLElement).dataset.variant)).toStrictEqual(["default", "compact"]);
    });
});
