import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { documentImage, interiorImage, landscapeImage, portraitImage } from "../../../storybook/sampleImages";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import assetBrowserTokens from "../_tokens.scss?raw";
import { AssetBrowser, type AssetBrowserAsset, type AssetBrowserFolder, type AssetBrowserProps } from "../AssetBrowser";

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

/** Keeps the story controlled: folder, view, selection, moves, and deletions live in local state. */
function ControlledAssetBrowser(props: AssetBrowserProps) {
    const [folderId, setFolderId] = useState(props.folderId);
    const [view, setView] = useState(props.view);
    const [selectedIds, setSelectedIds] = useState<string[]>([...props.selectedIds]);
    const [currentFolders, setCurrentFolders] = useState(props.folders);
    const [currentAssets, setCurrentAssets] = useState(props.assets);
    return (
        <AssetBrowser
            {...props}
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
        await expect(canvas.getByRole("option", { name: /Spring 2026/ })).toHaveFocus();
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
