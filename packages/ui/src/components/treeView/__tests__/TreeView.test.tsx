import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getExpandableTreeNodeIds, type TreeNode, TreeView } from "../TreeView";

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
        expect(root.hasAttribute("data-guide-lines")).toBe(true);
    });

    it("leaves out the guide lines data attribute when they are turned off", () => {
        render(<TreeView aria-label="Pages" nodes={nodes} expandedIds={[]} onExpandedChange={noop} guideLines={false} />);

        expect(screen.getByRole("tree", { name: "Pages" }).hasAttribute("data-guide-lines")).toBe(false);
    });

    it("shows a node's count in its contract part and describes it with the count label", () => {
        render(
            <TreeView
                aria-label="Pages"
                nodes={[{ id: "about", label: "About", count: 3, status: "published" }]}
                expandedIds={[]}
                onExpandedChange={noop}
                labels={{ count: (count) => `${count} subpages` }}
            />,
        );

        const about = screen.getByRole("treeitem", { name: "About" });
        expect(about.querySelector(".dextinityTreeView__count")?.textContent).toContain("3");
        const descriptions = (about.getAttribute("aria-describedby") ?? "").split(" ").map((id) => document.getElementById(id)?.textContent);
        expect(descriptions).toContain("3 subpages");
        expect(descriptions).toHaveLength(2);
    });

    it("keeps collapsing children hidden from assistive technology until their animation ends", () => {
        const { rerender } = render(<TreeView aria-label="Pages" nodes={nodes} expandedIds={["home"]} onExpandedChange={noop} />);
        rerender(<TreeView aria-label="Pages" nodes={nodes} expandedIds={[]} onExpandedChange={noop} />);

        expect(screen.queryByRole("treeitem", { name: "About" })).toBeNull();
        const frame = screen.getByText("About").closest("[data-closing]") as HTMLElement;
        expect(frame.getAttribute("aria-hidden")).toBe("true");
        expect(frame.hasAttribute("inert")).toBe(true);

        // jsdom has no AnimationEvent, so React listens for the prefixed event
        fireEvent(frame, new Event("webkitAnimationEnd", { bubbles: true }));
        expect(screen.queryByText("About")).toBeNull();
    });

    it("returns the ids of the nodes with children", () => {
        expect(
            getExpandableTreeNodeIds([
                { id: "a", label: "A", children: [{ id: "b", label: "B", children: [{ id: "c", label: "C" }] }] },
                { id: "d", label: "D", children: [] },
            ]),
        ).toStrictEqual(["a", "b"]);
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

    it("opens a node on double-click, but not on a double-click on its expand toggle, its actions or their popup", () => {
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
                renderActions={(node) => (
                    <>
                        <button type="button">{`Actions for ${node.label}`}</button>
                        {node.id === "home" && createPortal(<button type="button">Move to</button>, document.body)}
                    </>
                )}
            />,
        );

        const home = screen.getByRole("treeitem", { name: "Home" });
        fireEvent.doubleClick(home.querySelector("[class*='toggle']") as HTMLElement);
        fireEvent.doubleClick(screen.getByRole("button", { name: "Actions for Home" }));
        fireEvent.doubleClick(screen.getByRole("button", { name: "Move to" }));
        expect(onOpen).not.toHaveBeenCalled();

        fireEvent.doubleClick(screen.getByText("About"));
        expect(onOpen).toHaveBeenCalledExactlyOnceWith("about");
    });
});
