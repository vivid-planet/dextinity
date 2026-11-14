import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TreeViewExpandButtons } from "../TreeViewExpandButtons";

afterEach(cleanup);

function noop() {}

describe("TreeViewExpandButtons", () => {
    it("renders the contract classes, with the buttons named by their labels", () => {
        const { container } = render(
            <TreeViewExpandButtons onExpandAll={noop} onCollapseAll={noop} collapseAllDisabled labels={{ expandAll: "Alle aufklappen" }} />,
        );

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("dextinityTreeViewExpandButtons");
        expect(root.hasAttribute("data-expandable")).toBe(true);
        expect(root.hasAttribute("data-collapsible")).toBe(false);
        expect(screen.getByRole("button", { name: "Alle aufklappen" }).className).toContain("dextinityTreeViewExpandButtons__expandAllButton");
        const collapseAll = screen.getByRole("button", { name: "Collapse all" });
        expect(collapseAll.className).toContain("dextinityTreeViewExpandButtons__collapseAllButton");
        expect(collapseAll).toBeDisabled();
    });
});
