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
});
