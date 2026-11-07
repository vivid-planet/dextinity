import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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
        expect(screen.getByRole("link", { name: "Overview" }).getAttribute("href")).toBe("/");
        expect(screen.getByText("3 unpublished").className).toContain("dextinityPageHeader__subtitle");
        expect(container.querySelector(".dextinityPageHeader__labelLine")?.textContent).toBe("Overview·Austria · German");
    });

    it("leaves out the label line and the actions when they are not given", () => {
        const { container } = render(<PageHeader title="Page tree" />);

        expect(container.querySelector(".dextinityPageHeader__labelLine")).toBeNull();
        expect(container.querySelector(".dextinityPageHeader__actions")).toBeNull();
        expect((container.firstElementChild as HTMLElement).hasAttribute("data-has-back")).toBe(false);
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
