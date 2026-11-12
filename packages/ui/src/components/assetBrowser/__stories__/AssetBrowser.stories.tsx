import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, fireEvent, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { documentImage, interiorImage, landscapeImage, portraitImage } from "../../../storybook/sampleImages";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { MenuItem } from "../../menu/MenuItem";
import { AssetBrowser, type AssetBrowserAsset, type AssetBrowserFolder, type AssetBrowserProps } from "../AssetBrowser";
import assetBrowserTokens from "../AssetBrowser.tokens.scss?raw";

const folders: AssetBrowserFolder[] = [
    { id: "root", name: "All assets", parentId: null },
    { id: "campaigns", name: "Campaigns", parentId: "root" },
    { id: "spring", name: "Spring 2026", parentId: "campaigns" },
    { id: "autumn", name: "Autumn 2026", parentId: "campaigns" },
    { id: "team", name: "Team", parentId: "root" },
    { id: "documents", name: "Documents", parentId: "root" },
];

const assets: AssetBrowserAsset[] = [
    {
        id: "a1",
        name: "sunset-hills.jpg",
        folderId: "root",
        type: "image",
        src: landscapeImage,
        focalPoint: { x: 0.56, y: 0.34 },
        meta: "JPG · 2.4 MB",
        modified: "Oct 12, 2026",
    },
    {
        id: "a2",
        name: "lobby.jpg",
        folderId: "root",
        type: "image",
        src: interiorImage,
        badges: ["missingAlt"],
        meta: "JPG · 3.1 MB",
        modified: "Oct 3, 2026",
    },
    {
        id: "a3",
        name: "product.png",
        folderId: "root",
        type: "image",
        src: portraitImage,
        badges: ["ai"],
        meta: "PNG · 840 KB",
        modified: "Sep 28, 2026",
    },
    {
        id: "a4",
        name: "annual-report.pdf",
        folderId: "root",
        type: "document",
        src: documentImage,
        fileType: "PDF",
        meta: "PDF · 1.2 MB",
        modified: "Sep 2, 2026",
    },
    {
        id: "a5",
        name: "campaign.mp4",
        folderId: "root",
        type: "video",
        src: landscapeImage,
        duration: "0:42",
        meta: "MP4 · 18 MB",
        modified: "Aug 30, 2026",
    },
    { id: "a6", name: "spring-hero.jpg", folderId: "spring", type: "image", src: landscapeImage, meta: "JPG · 2.0 MB", modified: "Mar 4, 2026" },
    { id: "a7", name: "spring-teaser.jpg", folderId: "spring", type: "image", src: interiorImage, meta: "JPG · 1.4 MB", modified: "Mar 6, 2026" },
    { id: "a8", name: "team-offsite.jpg", folderId: "team", type: "image", src: interiorImage, meta: "JPG · 2.8 MB", modified: "Jul 18, 2026" },
    {
        id: "a9",
        name: "terms.pdf",
        folderId: "documents",
        type: "document",
        src: documentImage,
        fileType: "PDF",
        meta: "PDF · 220 KB",
        modified: "Jan 9, 2026",
    },
];

/** Simulates searching on a server: the folders and assets whose name contains the search, after a short delay. */
function useSimulatedSearch(search: string, allFolders: ReadonlyArray<AssetBrowserFolder>, allAssets: ReadonlyArray<AssetBrowserAsset>) {
    const [result, setResult] = useState<{ search: string; folders: AssetBrowserFolder[]; assets: AssetBrowserAsset[] }>();
    useEffect(() => {
        const query = search.trim().toLowerCase();
        if (query === "") {
            return;
        }
        const timeout = setTimeout(() => {
            setResult({
                search,
                folders: allFolders.filter((folder) => folder.parentId != null && folder.name.toLowerCase().includes(query)),
                assets: allAssets.filter((asset) => asset.name.toLowerCase().includes(query)),
            });
        }, 400);
        return () => clearTimeout(timeout);
    }, [search, allFolders, allAssets]);
    return { searchResults: result?.assets, searchFolderResults: result?.folders, searchLoading: result?.search !== search };
}

/** Keeps the story controlled: folder, view, selection, search, moves, and deletions live in local state. */
function ControlledAssetBrowser(props: AssetBrowserProps) {
    const [folderId, setFolderId] = useState(props.folderId);
    const [view, setView] = useState(props.view);
    const [selectedIds, setSelectedIds] = useState<string[]>([...props.selectedIds]);
    const [currentFolders, setCurrentFolders] = useState(props.folders);
    const [currentAssets, setCurrentAssets] = useState(props.assets);
    const [sidebarWidth, setSidebarWidth] = useState(props.sidebarWidth);
    const [search, setSearch] = useState(props.search ?? "");
    const simulatedSearch = useSimulatedSearch(search, currentFolders, currentAssets);
    return (
        <AssetBrowser
            {...props}
            {...(props.onSearchChange != null &&
                props.searchResults == null && {
                    search,
                    onSearchChange: (next: string) => {
                        props.onSearchChange?.(next);
                        setSearch(next);
                    },
                    ...simulatedSearch,
                })}
            sidebarWidth={sidebarWidth}
            onSidebarWidthChange={
                props.onSidebarWidthChange &&
                ((width) => {
                    props.onSidebarWidthChange?.(width);
                    setSidebarWidth(width);
                })
            }
            folders={currentFolders}
            assets={currentAssets}
            folderId={folderId}
            onFolderChange={(next) => {
                props.onFolderChange(next);
                setFolderId(next);
            }}
            view={view}
            onViewChange={(next) => {
                props.onViewChange(next);
                setView(next);
            }}
            selectedIds={selectedIds}
            onSelectionChange={(ids) => {
                props.onSelectionChange(ids);
                setSelectedIds(ids);
            }}
            onMove={
                props.onMove &&
                ((ids, targetId) => {
                    props.onMove?.(ids, targetId);
                    setCurrentAssets((current) => current.map((asset) => (ids.includes(asset.id) ? { ...asset, folderId: targetId } : asset)));
                    setCurrentFolders((current) => current.map((folder) => (ids.includes(folder.id) ? { ...folder, parentId: targetId } : folder)));
                    setSelectedIds([]);
                })
            }
            onDelete={
                props.onDelete &&
                ((ids) => {
                    props.onDelete?.(ids);
                    setCurrentAssets((current) => current.filter((asset) => !ids.includes(asset.id)));
                    setSelectedIds([]);
                })
            }
            onRename={
                props.onRename &&
                ((id, name) => {
                    props.onRename?.(id, name);
                    setCurrentAssets((current) => current.map((asset) => (asset.id === id ? { ...asset, name } : asset)));
                    setCurrentFolders((current) => current.map((folder) => (folder.id === id ? { ...folder, name } : folder)));
                })
            }
            onCreateFolder={
                props.onCreateFolder &&
                ((name, parentId) => {
                    props.onCreateFolder?.(name, parentId);
                    setCurrentFolders((current) => [...current, { id: `folder-${current.length + 1}`, name, parentId }]);
                })
            }
        />
    );
}

const meta = {
    component: AssetBrowser,
    title: "Building blocks/Media & upload/AssetBrowser",
    decorators: [themeDecorator],
    parameters: { tokens: assetBrowserTokens },
    args: {
        folders,
        assets,
        folderId: "root",
        onFolderChange: fn(),
        view: "icons",
        onViewChange: fn(),
        selectedIds: [],
        onSelectionChange: fn(),
        onOpen: fn(),
        onMove: fn(),
        onDelete: fn(),
    },
    argTypes: {
        view: { control: "select", options: ["icons", "list", "columns", "gallery"] },
        mode: { control: "radio", options: ["manage", "pick"] },
        folders: { control: false },
        assets: { control: false },
        selectedIds: { control: false },
        toolbar: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
        sidebarWidth: { control: false },
        searchResults: { control: false },
        searchFolderResults: { control: false },
    },
    render: (args) => <ControlledAssetBrowser {...args} />,
} satisfies Meta<typeof AssetBrowser>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Click to select, ⌘/Ctrl-click to add, Shift-click or Shift-arrow for a range, ⌘/Ctrl+A for all. Double-click or Enter opens;
 * ⌘/Ctrl+↑ goes to the enclosing folder. Drag items onto a folder to move them; Delete removes the selection.
 *
 * **Rules**
 *
 * - Behave like the macOS Finder; don't invent shortcuts where the Finder has some.
 * - Remember the view per user.
 * - Don't nest folders deeper than five levels.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("option", { name: /lobby\.jpg/ }));
        await waitFor(() => expect(args.onSelectionChange).toHaveBeenLastCalledWith(["a2"]));
        await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
        await waitFor(() => expect(args.onSelectionChange).toHaveBeenLastCalledWith(["a2", "a3"]));
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(args.onOpen).toHaveBeenLastCalledWith(expect.objectContaining({ id: "a3" })));
        await userEvent.dblClick(canvas.getByRole("option", { name: /Campaigns/ }));
        await waitFor(() => expect(args.onFolderChange).toHaveBeenLastCalledWith("campaigns"));
        await userEvent.keyboard("{Control>}{ArrowUp}{/Control}");
        await waitFor(() => expect(args.onFolderChange).toHaveBeenLastCalledWith("root"));
    },
};

export const List: Story = {
    args: { view: "list", selectedIds: ["a2"] },
};

/**
 * Each column shows a folder on the path; clicking a folder opens it in the next column. A single selected asset shows its
 * preview at the end. As in the Finder, → opens the focused folder and ← goes back to the enclosing one.
 */
export const Columns: Story = {
    args: { view: "columns", folderId: "spring", selectedIds: ["a6"] },
    play: async ({ args, canvas }) => {
        canvas.getByRole("option", { name: /spring-hero\.jpg/ }).focus();
        await userEvent.keyboard("{ArrowLeft}");
        await waitFor(() => expect(args.onFolderChange).toHaveBeenLastCalledWith("campaigns"));
        await waitFor(() => expect(args.onSelectionChange).toHaveBeenLastCalledWith(["spring"]));
        await expect(canvas.getByRole("option", { name: /^Spring 2026/ })).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
        await waitFor(() => expect(args.onFolderChange).toHaveBeenLastCalledWith("spring"));
    },
};

export const Gallery: Story = {
    args: { view: "gallery", selectedIds: ["a1"] },
};

/**
 * For choosing assets in a field's dialog: no moving, no deleting.
 */
export const Pick: Story = {
    args: { mode: "pick", selectedIds: ["a1"] },
    play: async ({ args, canvas }) => {
        canvas.getAllByRole("option", { selected: true })[0].focus();
        await userEvent.keyboard("{Delete}");
        await expect(args.onDelete).not.toHaveBeenCalled();
    },
};

/**
 * Further controls such as upload go into `toolbar`.
 */
export const WithToolbar: Story = {
    args: {
        toolbar: (
            <Button size="small" variant="outlined" color="secondary" startIcon={<Icon name="upload" />}>
                Upload
            </Button>
        ),
    },
};

const manyAssets: AssetBrowserAsset[] = Array.from({ length: 36 }, (_, index) => ({
    id: `photo-${index + 1}`,
    name: `photo-${String(index + 1).padStart(2, "0")}.jpg`,
    folderId: "root",
    type: "image",
    src: [landscapeImage, interiorImage, portraitImage][index % 3],
    meta: "JPG · 1.8 MB",
}));

function UploadAndReveal(props: AssetBrowserProps) {
    const [view, setView] = useState(props.view);
    const [currentAssets, setCurrentAssets] = useState(manyAssets);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [scrollToItemId, setScrollToItemId] = useState<string>();
    const upload = () => {
        const uploaded: AssetBrowserAsset = {
            id: `upload-${currentAssets.length}`,
            name: "zz-team-offsite.jpg",
            folderId: "root",
            type: "image",
            src: landscapeImage,
            meta: "JPG · 2.2 MB",
        };
        setCurrentAssets((current) => [...current, uploaded]);
        setSelectedIds([uploaded.id]);
        setScrollToItemId(uploaded.id);
    };
    return (
        <AssetBrowser
            {...props}
            assets={currentAssets}
            view={view}
            onViewChange={setView}
            selectedIds={selectedIds}
            onSelectionChange={(ids) => {
                setSelectedIds(ids);
                setScrollToItemId(undefined);
            }}
            scrollToItemId={scrollToItemId}
            toolbar={
                <Button size="small" variant="outlined" color="secondary" startIcon={<Icon name="upload" />} onClick={upload}>
                    Upload
                </Button>
            }
        />
    );
}

/**
 * `scrollToItemId` reveals an item, e.g. a file just uploaded: it scrolls into view once it shows in the content. Here, "Upload" adds
 * a file sorted last, selects it, and scrolls to it.
 */
export const ScrollToItem: Story = {
    render: (args) => <UploadAndReveal {...args} />,
    play: async ({ canvas, canvasElement }) => {
        const content = canvasElement.querySelector<HTMLElement>(".dextinityAssetBrowser__content");
        if (content == null) {
            throw new Error("Missing the content");
        }
        await expect(content.scrollTop).toBe(0);

        await userEvent.click(canvas.getByRole("button", { name: "Upload" }));

        const uploaded = await canvas.findByRole("option", { name: /zz-team-offsite\.jpg/ });
        await waitFor(() => {
            const contentBox = content.getBoundingClientRect();
            const itemBox = uploaded.getBoundingClientRect();
            expect(itemBox.top).toBeGreaterThanOrEqual(contentBox.top - 1);
            expect(itemBox.bottom).toBeLessThanOrEqual(contentBox.bottom + 1);
        });
        await expect(content.scrollTop).toBeGreaterThan(0);
    },
};

export const EmptyFolder: Story = {
    args: { folderId: "autumn" },
};

export const Delete: Story = {
    args: { selectedIds: ["a5"] },
    play: async ({ args, canvas }) => {
        canvas.getByRole("option", { selected: true }).focus();
        await userEvent.keyboard("{Delete}");
        await waitFor(() => expect(args.onDelete).toHaveBeenCalledWith(["a5"]));
        await expect(canvas.queryByText("campaign.mp4")).toBeNull();
    },
};

/**
 * With `onRename`, F2 renames the focused item in place; a file's extension stays unselected, so typing replaces only the name. Enter
 * or leaving the field saves, Escape cancels.
 */
export const Rename: Story = {
    args: { view: "list", onRename: fn() },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("option", { name: /lobby\.jpg/ }));
        await userEvent.keyboard("{F2}");
        const field = canvas.getByRole("textbox", { name: "Rename" });
        await expect(field).toHaveFocus();
        await expect([(field as HTMLInputElement).selectionStart, (field as HTMLInputElement).selectionEnd]).toStrictEqual([0, 5]);
        await userEvent.keyboard("entrance{Enter}");
        await waitFor(() => expect(args.onRename).toHaveBeenCalledWith("a2", "entrance.jpg"));
        await waitFor(() => expect(canvas.getByRole("option", { name: /entrance\.jpg/ })).toHaveFocus());

        await userEvent.keyboard("{F2}x{Escape}");
        await expect(canvas.queryByRole("textbox", { name: "Rename" })).toBeNull();
        await expect(args.onRename).toHaveBeenCalledTimes(1);
        await expect(canvas.getByRole("option", { name: /entrance\.jpg/ })).toHaveFocus();
    },
};

/**
 * With `onCreateFolder`, the toolbar's New folder button, or New folder in the context menu of the empty area, adds a folder named in
 * place; the application creates it and adds it to `folders`.
 */
export const NewFolder: Story = {
    args: { view: "icons", folderId: "campaigns", onCreateFolder: fn() },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "New folder" }));
        const field = canvas.getByRole("textbox", { name: "New folder" });
        await expect(field).toHaveFocus();
        await expect(field).toHaveValue("Untitled folder");
        await userEvent.keyboard("Press kit{Enter}");
        await waitFor(() => expect(args.onCreateFolder).toHaveBeenCalledWith("Press kit", "campaigns"));
        await expect(canvas.getByRole("option", { name: /Press kit/ })).toBeInTheDocument();
    },
};

/**
 * A right-click, Shift+F10, or the context menu key opens the context menu of the selected items – selecting the item first if it
 * isn't – with Open, Rename, the application's `contextMenuItems`, and Delete. On the empty area, it offers New folder.
 */
export const ContextMenu: Story = {
    args: {
        view: "icons",
        onRename: fn(),
        onCreateFolder: fn(),
        contextMenuItems: (ids) => (
            <MenuItem label={ids.length === 1 ? "Download" : `Download ${ids.length} items`} icon={<Icon name="download" />} />
        ),
    },
    play: async ({ args, canvas }) => {
        fireEvent.contextMenu(canvas.getByRole("option", { name: /lobby\.jpg/ }));
        const menu = await screen.findByRole("menu");
        await expect(
            within(menu)
                .getAllByRole("menuitem")
                .map((item) => item.textContent),
        ).toStrictEqual(["Open", "Rename", "Download", "Delete"]);
        await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["a2"]);
        await userEvent.click(within(menu).getByRole("menuitem", { name: "Rename" }));
        const field = await canvas.findByRole("textbox", { name: "Rename" });
        await waitFor(() => expect(field).toHaveFocus());
        await userEvent.keyboard("{Escape}");

        fireEvent.contextMenu(canvas.getByRole("listbox", { name: "Items" }));
        const emptyAreaMenu = await screen.findByRole("menu");
        await expect(
            within(emptyAreaMenu)
                .getAllByRole("menuitem")
                .map((item) => item.textContent),
        ).toStrictEqual(["New folder"]);
        await userEvent.click(within(emptyAreaMenu).getByRole("menuitem", { name: "New folder" }));
        await waitFor(() => expect(canvas.getByRole("textbox", { name: "New folder" })).toHaveFocus());
        await userEvent.keyboard("{Escape}");
        await expect(args.onCreateFolder).not.toHaveBeenCalled();
    },
};

const deepFolders: AssetBrowserFolder[] = [
    ...folders,
    { id: "press", name: "Press releases and media kits for the annual general meeting", parentId: "documents" },
    { id: "press-2026", name: "2026 · Shareholder letters, translated into all languages", parentId: "press" },
    { id: "brand", name: "Brand guidelines, logos, and partner co-branding templates", parentId: "root" },
];

/**
 * Drag the edge of the folder tree, or focus it and use ← and →, Home, and End, to make long folder names readable; double-click it to
 * go back to the theme's width. Remember the width per user.
 */
export const ResizableSidebar: Story = {
    args: { folders: deepFolders, folderId: "press-2026", onSidebarWidthChange: fn() },
    play: async ({ args, canvasElement }) => {
        const separator = within(canvasElement).getByRole("separator", { name: "Resize folders" });
        const sidebar = within(canvasElement).getByRole("navigation", { name: "Folders" });
        const startWidth = Math.round(sidebar.getBoundingClientRect().width);
        await expect(separator).toHaveAttribute("aria-valuenow", String(startWidth));

        const { x, y, width } = separator.getBoundingClientRect();
        await userEvent.pointer([
            { keys: "[MouseLeft>]", target: separator, coords: { clientX: x + width / 2, clientY: y + 40 } },
            { target: separator, coords: { clientX: x + width / 2 + 120, clientY: y + 40 } },
            { keys: "[/MouseLeft]", target: separator },
        ]);
        await waitFor(() => expect(args.onSidebarWidthChange).toHaveBeenLastCalledWith(startWidth + 120));
        await waitFor(() => expect(Math.round(sidebar.getBoundingClientRect().width)).toBe(startWidth + 120));

        await userEvent.keyboard("{ArrowLeft}");
        await waitFor(() => expect(args.onSidebarWidthChange).toHaveBeenLastCalledWith(startWidth + 104));
        await waitFor(() => expect(separator).toHaveAttribute("aria-valuenow", String(startWidth + 104)));
        await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
        await waitFor(() => expect(args.onSidebarWidthChange).toHaveBeenLastCalledWith(startWidth + 168));
        await userEvent.keyboard("{Home}");
        await waitFor(() => expect(separator).toHaveAttribute("aria-valuenow", separator.getAttribute("aria-valuemin")));
        await userEvent.keyboard("{End}");
        await waitFor(() => expect(separator).toHaveAttribute("aria-valuenow", separator.getAttribute("aria-valuemax")));

        await userEvent.dblClick(separator);
        await waitFor(() => expect(args.onSidebarWidthChange).toHaveBeenLastCalledWith(undefined));
        await waitFor(() => expect(Math.round(sidebar.getBoundingClientRect().width)).toBe(startWidth));
    },
};

/**
 * With `onQuickLook`, Space on an asset selects it and asks for a quick look, as in the Finder.
 */
export const QuickLookOnSpace: Story = {
    args: { onQuickLook: fn() },
    play: async ({ args, canvas }) => {
        canvas.getByRole("option", { name: /lobby\.jpg/ }).focus();
        await userEvent.keyboard(" ");
        await waitFor(() => expect(args.onQuickLook).toHaveBeenLastCalledWith(expect.objectContaining({ id: "a2" })));
        await expect(canvas.getByRole("option", { name: /lobby\.jpg/ })).toHaveAttribute("aria-selected", "true");
    },
};

/**
 * When the assets are loaded per folder, `meta` shows a folder's details, e.g. its number of items, in place of the count of the loaded
 * items.
 */
export const FolderMeta: Story = {
    args: {
        folders: folders.map((folder) => (folder.id === "documents" ? { ...folder, meta: "48 items" } : folder)),
        view: "list",
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("option", { name: /Documents/ })).toHaveTextContent("48 items");
    },
};

/**
 * With `onSearchChange`, the toolbar has a search field (⌘/Ctrl+F). The application searches across all folders and passes the
 * matching assets as `searchResults`; each shows with its folder path. The path bar shows where the selected result is: choose a folder
 * there, or press ⌘/Ctrl+↑, to open it with the result selected. Escape in the search field, or opening a folder, ends the search.
 *
 * **Rules**
 *
 * - Search all folders, not only the open one.
 * - Set `searchLoading` while the results load; keep showing the previous results meanwhile.
 */
export const Search: Story = {
    args: { view: "list", onSearchChange: fn() },
    play: async ({ args, canvas }) => {
        const searchField = canvas.getByRole("searchbox", { name: "Search" });
        await userEvent.click(canvas.getByRole("option", { name: /lobby\.jpg/ }));
        await userEvent.keyboard("{Control>}f{/Control}");
        await expect(searchField).toHaveFocus();
        await userEvent.type(searchField, "spring-");
        await waitFor(() => expect(args.onSearchChange).toHaveBeenLastCalledWith("spring-"));
        const results = await canvas.findByRole("listbox", { name: "Search results" });
        await waitFor(() => expect(within(results).getAllByRole("option")).toHaveLength(2));
        await expect(within(results).getByRole("option", { name: /spring-hero\.jpg/ })).toHaveTextContent("All assets › Campaigns › Spring 2026");

        await userEvent.keyboard("{ArrowDown}");
        await expect(within(results).getByRole("option", { name: /spring-hero\.jpg/ })).toHaveFocus();
        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(args.onSelectionChange).toHaveBeenLastCalledWith(["a7"]));
        const pathBar = canvas.getByRole("navigation", { name: "Breadcrumbs" });
        await expect(within(pathBar).getByText("spring-teaser.jpg")).toHaveAttribute("aria-current", "page");

        await userEvent.click(within(pathBar).getByRole("button", { name: "Campaigns" }));
        await waitFor(() => expect(args.onFolderChange).toHaveBeenLastCalledWith("campaigns"));
        await expect(args.onSearchChange).toHaveBeenLastCalledWith("");
        await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["spring"]);
        await waitFor(() => expect(canvas.getByRole("option", { name: /^Spring 2026/ })).toHaveFocus());
        await expect(searchField).toHaveValue("");
    },
};

/**
 * ⌘/Ctrl+↑ on a result opens its folder with the result selected. Escape in the search field clears it.
 */
export const SearchRevealWithKeyboard: Story = {
    args: { view: "icons", onSearchChange: fn() },
    play: async ({ args, canvas }) => {
        const searchField = canvas.getByRole("searchbox", { name: "Search" });
        await userEvent.type(searchField, "pdf");
        const results = await canvas.findByRole("listbox", { name: "Search results" });
        await waitFor(() => expect(within(results).getAllByRole("option")).toHaveLength(2));
        await expect(within(results).getByRole("option", { name: /terms\.pdf/ })).toHaveTextContent("Documents");

        await userEvent.keyboard("{Escape}");
        await expect(searchField).toHaveValue("");
        await expect(canvas.getByRole("listbox", { name: "Items" })).toBeInTheDocument();

        await userEvent.type(searchField, "terms");
        await waitFor(() => expect(canvas.getAllByRole("option")).toHaveLength(1));
        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{Control>}{ArrowUp}{/Control}");
        await waitFor(() => expect(args.onFolderChange).toHaveBeenLastCalledWith("documents"));
        await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["a9"]);
        await waitFor(() => expect(canvas.getByRole("option", { name: /terms\.pdf/ })).toHaveFocus());
        await expect(canvas.getByRole("option", { name: /terms\.pdf/ })).toHaveAttribute("aria-selected", "true");
    },
};

/**
 * Matching folders show before the assets, as `searchFolderResults`; opening one ends the search and shows it. The columns view
 * can't show results from many folders, so they show as a list, and the view switch says so. The up button goes to the folder of the
 * selected result, or without one back to where the search started.
 */
export const SearchFolders: Story = {
    args: { view: "columns", onSearchChange: fn() },
    play: async ({ args, canvas }) => {
        const viewSwitch = canvas.getByRole("radiogroup", { name: "View" });
        await expect(within(viewSwitch).getByRole("radio", { name: "Columns" })).toHaveAttribute("aria-checked", "true");
        await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "spring");
        const results = await canvas.findByRole("listbox", { name: "Search results" });
        await waitFor(() =>
            expect(
                within(results)
                    .getAllByRole("option")
                    .map((option) => option.textContent?.split("All assets")[0]),
            ).toStrictEqual(["Spring 2026", "spring-hero.jpg", "spring-teaser.jpg"]),
        );
        await expect(within(viewSwitch).getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "true");
        await expect(within(viewSwitch).getByRole("radio", { name: "Columns" })).toHaveAttribute("aria-disabled", "true");

        const up = canvas.getByRole("button", { name: "Enclosing folder" });
        await expect(up).toBeEnabled();
        await userEvent.click(within(results).getByRole("option", { name: /^Spring 2026/ }));
        const pathBar = canvas.getByRole("navigation", { name: "Breadcrumbs" });
        await expect(within(pathBar).getByText("Spring 2026")).toHaveAttribute("aria-current", "page");
        await userEvent.click(up);
        await waitFor(() => expect(args.onFolderChange).toHaveBeenLastCalledWith("campaigns"));
        await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["spring"]);
        await expect(args.onSearchChange).toHaveBeenLastCalledWith("");

        await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "spring");
        await waitFor(() => expect(canvas.getAllByRole("option", { name: /^Spring 2026/ })).toHaveLength(1));
        await userEvent.dblClick(canvas.getByRole("option", { name: /^Spring 2026/ }));
        await waitFor(() => expect(args.onFolderChange).toHaveBeenLastCalledWith("spring"));
        await expect(canvas.getByRole("searchbox", { name: "Search" })).toHaveValue("");
    },
};

/**
 * While the first results load, the content says so.
 */
export const SearchLoading: Story = {
    args: { view: "list", search: "team", onSearchChange: fn(), searchResults: [], searchLoading: true },
    play: async ({ canvas }) => {
        await expect(canvas.getAllByRole("status").some((status) => status.textContent === "Searching…")).toBe(true);
    },
};

/**
 * When nothing matches, the content says so; screen readers announce it, like the number of results.
 */
export const SearchWithoutResults: Story = {
    args: { view: "list", search: "invoice", onSearchChange: fn(), searchResults: [] },
    play: async ({ canvas }) => {
        await expect(canvas.getByText("No results for “invoice”", { selector: "p" })).toBeVisible();
        await expect(canvas.getByRole("status")).toHaveTextContent("No results for “invoice”");
    },
};
