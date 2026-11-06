import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AssetBrowser, type AssetBrowserAsset, type AssetBrowserFolder } from "./AssetBrowser";

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
});
