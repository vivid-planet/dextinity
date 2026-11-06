import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TreeDetailLayout } from "./TreeDetailLayout";

afterEach(cleanup);

describe("TreeDetailLayout", () => {
    it("renders each region as its contract part, with the detail as a named complementary region", () => {
        const { container } = render(
            <TreeDetailLayout header="Header" toolbar="Toolbar" detail="Detail" detailLabel="Open positions">
                Tree
            </TreeDetailLayout>,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityTreeDetailLayout");
        expect(root.dataset.toolbar).toBe("");
        expect(screen.getByText("Header").className).toContain("dextinityTreeDetailLayout__header");
        expect(screen.getByText("Toolbar").className).toContain("dextinityTreeDetailLayout__toolbar");
        expect(screen.getByText("Tree").className).toContain("dextinityTreeDetailLayout__tree");
        const detail = screen.getByRole("complementary", { name: "Open positions" });
        expect(detail.className).toContain("dextinityTreeDetailLayout__detail");
        expect(detail.textContent).toBe("Detail");
    });

    it("leaves out the toolbar part and its data attribute without a toolbar", () => {
        const { container } = render(
            <TreeDetailLayout header="Header" detail="Detail">
                Tree
            </TreeDetailLayout>,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.hasAttribute("data-toolbar")).toBe(false);
        expect(root.querySelector(".dextinityTreeDetailLayout__toolbar")).toBeNull();
    });
});
