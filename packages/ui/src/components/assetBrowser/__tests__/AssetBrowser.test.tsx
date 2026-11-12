import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AssetBrowser, type AssetBrowserAsset, type AssetBrowserFolder } from "../AssetBrowser";

afterEach(cleanup);

const folders: AssetBrowserFolder[] = [
    { id: "root", name: "All assets", parentId: null },
    { id: "team", name: "Team", parentId: "root" },
];
const assets: AssetBrowserAsset[] = [
    { id: "b", name: "b.jpg", folderId: "root", type: "image" },
    { id: "a", name: "a.jpg", folderId: "root", type: "image" },
];

function renderBrowser(props: Partial<Parameters<typeof AssetBrowser>[0]> = {}) {
    return render(
        <AssetBrowser
            folders={folders}
            assets={assets}
            folderId="root"
            onFolderChange={vi.fn()}
            view="list"
            onViewChange={vi.fn()}
            selectedIds={["a"]}
            onSelectionChange={vi.fn()}
            {...props}
        />,
    );
}

describe("AssetBrowser", () => {
    it("emits the view and mode as data attributes", () => {
        const { container } = renderBrowser({ mode: "pick" });
        const root = container.firstElementChild as HTMLElement;

        expect(root.className).toContain("dextinityAssetBrowser");
        expect([root.dataset.view, root.dataset.mode]).toStrictEqual(["list", "pick"]);
    });

    it("lists subfolders first, then assets, each sorted by name, and marks the selection", () => {
        renderBrowser();

        const options = screen.getAllByRole("option");
        expect(options.map((option) => option.textContent?.split(/\d/)[0].trim())).toStrictEqual(["Team", "a.jpg", "b.jpg"]);
        expect(options.map((option) => option.getAttribute("aria-selected"))).toStrictEqual(["false", "true", "false"]);
    });

    it("keeps the badges inside options out of the tab order", () => {
        renderBrowser({
            view: "icons",
            assets: [{ id: "a", name: "a.jpg", folderId: "root", type: "image", src: "a.jpg", badges: ["ai", "missingAlt"] }],
        });

        const option = screen.getByRole("option", { name: /a\.jpg/ });
        expect(option.querySelectorAll("[tabindex='0'], button, a[href], input")).toHaveLength(0);
    });

    it("scrolls to scrollToItemId once it shows, and again for another id", () => {
        const scrollIntoView = vi.fn();
        Element.prototype.scrollIntoView = scrollIntoView;
        const { rerender } = renderBrowser({ scrollToItemId: "c" });
        expect(scrollIntoView).not.toHaveBeenCalled();

        const props = {
            folders,
            folderId: "root",
            onFolderChange: vi.fn(),
            view: "list" as const,
            onViewChange: vi.fn(),
            selectedIds: [],
            onSelectionChange: vi.fn(),
        };
        const withUpload = [...assets, { id: "c", name: "c.jpg", folderId: "root", type: "image" as const }];
        rerender(<AssetBrowser {...props} assets={withUpload} scrollToItemId="c" />);
        expect(scrollIntoView).toHaveBeenCalledTimes(1);
        expect(scrollIntoView.mock.contexts[0]).toBe(screen.getByRole("option", { name: /c\.jpg/ }));

        rerender(<AssetBrowser {...props} assets={[...withUpload]} scrollToItemId="c" />);
        expect(scrollIntoView).toHaveBeenCalledTimes(1);

        rerender(<AssetBrowser {...props} assets={withUpload} scrollToItemId="a" />);
        expect(scrollIntoView).toHaveBeenCalledTimes(2);
        expect(scrollIntoView.mock.contexts[1]).toBe(screen.getByRole("option", { name: /a\.jpg/ }));
        delete (Element.prototype as Partial<Element>).scrollIntoView;
    });

    it("can only be resized when the width can change", () => {
        renderBrowser();

        expect(screen.queryByRole("separator")).toBeNull();
    });

    it("exposes the sidebar's edge as a separator with its width and bounds", () => {
        const { container } = renderBrowser({ sidebarWidth: 240, onSidebarWidthChange: vi.fn() });

        const separator = screen.getByRole("separator", { name: "Resize folders" });
        expect(separator.className).toContain("dextinityAssetBrowser__resizeHandle");
        expect(separator.getAttribute("aria-controls")).toBe(screen.getByRole("navigation", { name: "Folders" }).id);
        expect(["aria-orientation", "aria-valuenow", "aria-valuemin", "aria-valuemax"].map((name) => separator.getAttribute(name))).toStrictEqual([
            "vertical",
            "240",
            "160",
            "560",
        ]);
        expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--dextinity-asset-browser-sidebar-width")).toBe("240px");
    });

    it("keeps a remembered width within the bounds", () => {
        const { container } = renderBrowser({ sidebarWidth: 900, onSidebarWidthChange: vi.fn() });

        expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--dextinity-asset-browser-sidebar-width")).toBe("560px");
    });

    it("collapses the root folder and reveals a folder opened inside a collapsed one", () => {
        const nestedFolders: AssetBrowserFolder[] = [...folders, { id: "portraits", name: "Portraits", parentId: "team" }];
        const { rerender } = renderBrowser({ folders: nestedFolders });
        const treeItem = (name: string) => screen.getByRole("treeitem", { name: new RegExp(`^${name}`) });

        expect(treeItem("All assets").getAttribute("aria-expanded")).toBe("true");
        fireEvent.keyDown(treeItem("All assets"), { key: "ArrowLeft" });
        expect(treeItem("All assets").getAttribute("aria-expanded")).toBe("false");
        expect(screen.queryByRole("treeitem", { name: /^Team/ })).toBeNull();

        rerender(
            <AssetBrowser
                folders={nestedFolders}
                assets={assets}
                folderId="portraits"
                onFolderChange={vi.fn()}
                view="list"
                onViewChange={vi.fn()}
                selectedIds={[]}
                onSelectionChange={vi.fn()}
            />,
        );
        expect(treeItem("All assets").getAttribute("aria-expanded")).toBe("true");
        expect(treeItem("Team").getAttribute("aria-expanded")).toBe("true");
    });

    it("shows a folder's meta in place of the count of its loaded items", () => {
        renderBrowser({ folders: [folders[0], { ...folders[1], meta: "12 items" }] });

        expect(screen.getByRole("option", { name: /Team/ }).textContent).toContain("12 items");
    });

    describe("search", () => {
        const teamAsset: AssetBrowserAsset = { id: "t", name: "team.jpg", folderId: "team", type: "image", meta: "JPG · 1 MB" };

        it("shows a search field only with onSearchChange", () => {
            renderBrowser();
            expect(screen.queryByRole("searchbox")).toBeNull();
        });

        it("lists the results across folders with their folder path instead of the folder's items", () => {
            const { container } = renderBrowser({ search: "team", onSearchChange: vi.fn(), searchResults: [teamAsset, assets[1]], selectedIds: [] });

            expect((container.firstElementChild as HTMLElement).dataset.searching).toBe("");
            const results = screen.getByRole("listbox", { name: "Search results" });
            expect(results.getAttribute("aria-busy")).toBeNull();
            const options = screen.getAllByRole("option");
            expect(options.map((option) => option.textContent)).toStrictEqual(["team.jpgAll assets › TeamJPG · 1 MB", "a.jpgAll assets"]);
            expect(screen.getByText("2 results", { selector: "[class*='titleMeta']" })).toBeTruthy();
        });

        it("shows the columns view as a list while searching", () => {
            renderBrowser({ view: "columns", search: "team", onSearchChange: vi.fn(), searchResults: [teamAsset] });

            expect(screen.getByText("Location")).toBeTruthy();
        });

        it("announces the number of results", () => {
            renderBrowser({ search: "team", onSearchChange: vi.fn(), searchResults: [teamAsset] });

            expect(screen.getByRole("status").textContent).toBe("1 result");
        });

        it("shows the loading and the empty state", () => {
            const { rerender } = renderBrowser({ search: "x", onSearchChange: vi.fn(), searchResults: [], searchLoading: true });
            expect(screen.getByRole("status").textContent).toBe("Searching…");

            rerender(
                <AssetBrowser
                    folders={folders}
                    assets={assets}
                    folderId="root"
                    onFolderChange={vi.fn()}
                    view="list"
                    onViewChange={vi.fn()}
                    selectedIds={[]}
                    onSelectionChange={vi.fn()}
                    search=" x "
                    onSearchChange={vi.fn()}
                    searchResults={[]}
                />,
            );
            expect(screen.getByRole("status").textContent).toBe("No results for “x”");
        });

        it("clears the search on Escape in the search field and with the clear button", () => {
            const onSearchChange = vi.fn();
            renderBrowser({ search: "team", onSearchChange, searchResults: [] });

            fireEvent.keyDown(screen.getByRole("searchbox", { name: "Search" }), { key: "Escape" });
            expect(onSearchChange).toHaveBeenLastCalledWith("");
            onSearchChange.mockClear();
            fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
            expect(onSearchChange).toHaveBeenLastCalledWith("");
        });

        it("opens a folder on the selected result's path and selects what leads to the result", () => {
            const nestedFolders: AssetBrowserFolder[] = [...folders, { id: "portraits", name: "Portraits", parentId: "team" }];
            const result: AssetBrowserAsset = { id: "p", name: "portrait.jpg", folderId: "portraits", type: "image" };
            const onFolderChange = vi.fn();
            const onSelectionChange = vi.fn();
            const onSearchChange = vi.fn();
            renderBrowser({
                folders: nestedFolders,
                search: "portrait",
                onSearchChange,
                searchResults: [result],
                selectedIds: ["p"],
                onFolderChange,
                onSelectionChange,
            });

            const pathBar = screen.getByRole("navigation", { name: "Breadcrumbs" });
            expect(pathBar.textContent).toContain("portrait.jpg");
            fireEvent.click(screen.getByRole("button", { name: "Team" }));
            expect([onSearchChange.mock.lastCall, onFolderChange.mock.lastCall, onSelectionChange.mock.lastCall]).toStrictEqual([
                [""],
                ["team"],
                [["portraits"]],
            ]);

            fireEvent.keyDown(screen.getByRole("option", { name: /portrait\.jpg/ }), { key: "ArrowUp", ctrlKey: true });
            expect([onFolderChange.mock.lastCall, onSelectionChange.mock.lastCall]).toStrictEqual([["portraits"], [["p"]]]);
        });

        it("deletes only the selected results", () => {
            const onDelete = vi.fn();
            renderBrowser({ search: "team", onSearchChange: vi.fn(), searchResults: [teamAsset], selectedIds: ["a", "t"], onDelete });

            fireEvent.keyDown(screen.getByRole("option", { name: /team\.jpg/ }), { key: "Delete" });
            expect(onDelete).toHaveBeenCalledWith(["t"]);
        });
    });
});
