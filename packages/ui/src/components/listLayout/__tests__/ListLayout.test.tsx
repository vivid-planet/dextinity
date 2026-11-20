import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ListLayout } from "../ListLayout";

afterEach(cleanup);

describe("ListLayout", () => {
    it("renders the header, the toolbar, and the list in order, each as its contract part", () => {
        const { container } = render(
            <ListLayout header="Header" toolbar="Toolbar">
                List
            </ListLayout>,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityListLayout");
        expect(root.dataset.toolbar).toBe("");
        expect(Array.from(root.children, (child) => [child.className, child.textContent])).toStrictEqual([
            [expect.stringContaining("dextinityListLayout__header"), "Header"],
            [expect.stringContaining("dextinityListLayout__toolbar"), "Toolbar"],
            [expect.stringContaining("dextinityListLayout__content"), "List"],
        ]);
    });

    it("leaves out the toolbar part and its data attribute without a toolbar", () => {
        const { container } = render(<ListLayout header="Header">List</ListLayout>);

        const root = container.firstElementChild as HTMLElement;
        expect(root.hasAttribute("data-toolbar")).toBe(false);
        expect(root.children).toHaveLength(2);
        expect(screen.getByText("List").className).toContain("dextinityListLayout__content");
    });
});
