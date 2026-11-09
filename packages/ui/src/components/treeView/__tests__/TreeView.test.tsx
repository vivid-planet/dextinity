import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type TreeNode, TreeView } from "../TreeView";

afterEach(cleanup);

function noop() {}

const nodes: TreeNode[] = [
    {
        id: "home",
        label: "Home",
        children: [
            { id: "about", label: "About", status: "published" },
            { id: "imprint", label: "Imprint", hiddenInMenu: true },
        ],
    },
    { id: "archive", label: "Archive", status: "archived" },
];

describe("TreeView", () => {
    it("emits the root class and owner state", () => {
        render(<TreeView aria-label="Pages" nodes={nodes} expandedIds={[]} onExpandedChange={noop} checkable draggable />);

        const root = screen.getByRole("tree", { name: "Pages" });
        expect(root.className).toContain("dextinityTreeView");
        expect([root.hasAttribute("data-checkable"), root.hasAttribute("data-draggable"), root.hasAttribute("data-filtered")]).toStrictEqual([
            true,
            true,
            false,
        ]);
    });

    it("renders only expanded children, with level and expanded state", () => {
        const { rerender } = render(<TreeView aria-label="Pages" nodes={nodes} expandedIds={[]} onExpandedChange={noop} />);
        expect(screen.queryByRole("treeitem", { name: "About" })).toBeNull();
        expect(screen.getByRole("treeitem", { name: "Home" }).getAttribute("aria-expanded")).toBe("false");

        rerender(<TreeView aria-label="Pages" nodes={nodes} expandedIds={["home"]} onExpandedChange={noop} />);
        const about = screen.getByRole("treeitem", { name: "About" });
        expect(about.getAttribute("aria-level")).toBe("2");
        expect(about.hasAttribute("aria-expanded")).toBe(false);
        expect(screen.getByRole("treeitem", { name: "Imprint Hidden in menu" })).toBeTruthy();
    });

    it("marks the selected and checked rows, with one tab stop on the selected node", () => {
        render(
            <TreeView
                aria-label="Pages"
                nodes={nodes}
                expandedIds={["home"]}
                onExpandedChange={noop}
                selectedId="about"
                checkable
                checkedIds={["archive"]}
            />,
        );

        const about = screen.getByRole("treeitem", { name: "About" });
        expect(about.getAttribute("aria-selected")).toBe("true");
        expect(about.tabIndex).toBe(0);
        expect(screen.getByRole("treeitem", { name: "Home" }).tabIndex).toBe(-1);
        const row = about.firstElementChild as HTMLElement;
        expect(row.className).toContain("dextinityTreeView__row");
        expect(row.hasAttribute("data-selected")).toBe(true);
        expect(screen.getByRole("treeitem", { name: "Archive" }).getAttribute("aria-checked")).toBe("true");
    });

    it("dims the ancestors of filter matches as context and expands them", () => {
        render(<TreeView aria-label="Pages" nodes={nodes} expandedIds={[]} onExpandedChange={noop} filter={(node) => node.id === "about"} />);

        expect(screen.queryByRole("treeitem", { name: "Archive" })).toBeNull();
        expect(screen.getByRole("treeitem", { name: "Home" }).firstElementChild?.hasAttribute("data-context")).toBe(true);
        expect(screen.getByRole("treeitem", { name: "About" }).firstElementChild?.hasAttribute("data-context")).toBe(false);
    });

    it("opens a node on double-click, but not on a double-click on its expand toggle or actions", () => {
        const onSelect = vi.fn();
        const onOpen = vi.fn();
        render(
            <TreeView
                aria-label="Pages"
                nodes={nodes}
                expandedIds={["home"]}
                onExpandedChange={noop}
                onSelect={onSelect}
                onOpen={onOpen}
                renderActions={(node) => <button type="button">{`Actions for ${node.label}`}</button>}
            />,
        );

        const home = screen.getByRole("treeitem", { name: "Home" });
        fireEvent.doubleClick(home.querySelector("[class*='toggle']") as HTMLElement);
        fireEvent.doubleClick(screen.getByRole("button", { name: "Actions for Home" }));
        expect(onOpen).not.toHaveBeenCalled();

        fireEvent.doubleClick(screen.getByText("About"));
        expect(onOpen).toHaveBeenCalledExactlyOnceWith("about");
    });
});
