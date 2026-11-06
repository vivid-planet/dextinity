import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { PageTypeShell, StructureFrame, StructureRegion } from "../../../storybook/pageTypes/PageTypeShell";
import { PatternLegend, PatternPage, PatternRules, PatternSection, PatternShortcuts, PatternUses } from "../../../storybook/patterns/PatternPage";
import { documentImage, interiorImage, landscapeImage, portraitImage } from "../../../storybook/sampleImages";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { AssetBrowser, type AssetBrowserAsset, type AssetBrowserFolder, type AssetBrowserView } from "../../assetBrowser/AssetBrowser";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { PageHeader } from "../../pageHeader/PageHeader";
import finderLayoutTokens from "../_tokens.scss?raw";
import { FinderLayout } from "../FinderLayout";
import styles from "./FinderLayout.stories.module.scss";

const folders: AssetBrowserFolder[] = [
    { id: "root", name: "All assets", parentId: null },
    { id: "careers", name: "Careers", parentId: "root" },
    { id: "jobs", name: "Job ads", parentId: "careers" },
    { id: "team", name: "Team", parentId: "careers" },
    { id: "campaigns", name: "Campaigns", parentId: "root" },
    { id: "spring", name: "Spring 2026", parentId: "campaigns" },
    { id: "documents", name: "Documents", parentId: "root" },
];

const images = [landscapeImage, interiorImage, portraitImage];

const assets: AssetBrowserAsset[] = [
    { id: "a1", name: "career-stage.jpg", folderId: "root", type: "image", src: landscapeImage, meta: "JPG · 2.4 MB", modified: "Oct 12, 2026" },
    {
        id: "a2",
        name: "office-vienna.jpg",
        folderId: "root",
        type: "image",
        src: interiorImage,
        badges: ["missingAlt"],
        meta: "JPG · 3.1 MB",
        modified: "Oct 3, 2026",
    },
    {
        id: "a3",
        name: "team-portrait.png",
        folderId: "root",
        type: "image",
        src: portraitImage,
        badges: ["ai"],
        meta: "PNG · 840 KB",
        modified: "Sep 28, 2026",
    },
    {
        id: "a4",
        name: "benefits.pdf",
        folderId: "root",
        type: "document",
        src: documentImage,
        fileType: "PDF",
        meta: "PDF · 1.2 MB",
        modified: "Sep 2, 2026",
    },
    {
        id: "a5",
        name: "employer-video.mp4",
        folderId: "root",
        type: "video",
        src: landscapeImage,
        duration: "0:42",
        meta: "MP4 · 18 MB",
        modified: "Aug 30, 2026",
    },
    ...Array.from({ length: 7 }, (_, index): AssetBrowserAsset => ({
        id: `j${index}`,
        name: `job-ad-${index + 1}.jpg`,
        folderId: "jobs",
        type: "image",
        src: images[index % images.length],
        meta: "JPG · 1.8 MB",
        modified: "Oct 1, 2026",
    })),
    { id: "t1", name: "team-offsite.jpg", folderId: "team", type: "image", src: interiorImage, meta: "JPG · 2.8 MB", modified: "Jul 18, 2026" },
    { id: "s1", name: "spring-hero.jpg", folderId: "spring", type: "image", src: landscapeImage, meta: "JPG · 2.0 MB", modified: "Mar 4, 2026" },
    {
        id: "d1",
        name: "terms.pdf",
        folderId: "documents",
        type: "document",
        src: documentImage,
        fileType: "PDF",
        meta: "PDF · 220 KB",
        modified: "Jan 9, 2026",
    },
];

function AssetsPage() {
    const [folderId, setFolderId] = useState("root");
    const [view, setView] = useState<AssetBrowserView>("icons");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentAssets, setCurrentAssets] = useState(assets);
    const [currentFolders, setCurrentFolders] = useState(folders);

    return (
        <FinderLayout
            header={
                <PageHeader
                    eyebrow="Content"
                    title="Assets"
                    subtitle={`${currentAssets.length} files · shared by all scopes`}
                    actions={
                        <>
                            <Button variant="outlined" color="secondary" startIcon={<Icon name="folder" />}>
                                New folder
                            </Button>
                            <Button startIcon={<Icon name="upload" />}>Upload</Button>
                        </>
                    }
                />
            }
        >
            <AssetBrowser
                folders={currentFolders}
                assets={currentAssets}
                folderId={folderId}
                onFolderChange={setFolderId}
                view={view}
                onViewChange={setView}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onMove={(ids, targetId) => {
                    setCurrentAssets((current) => current.map((asset) => (ids.includes(asset.id) ? { ...asset, folderId: targetId } : asset)));
                    setCurrentFolders((current) => current.map((folder) => (ids.includes(folder.id) ? { ...folder, parentId: targetId } : folder)));
                    setSelectedIds([]);
                }}
                onDelete={(ids) => {
                    setCurrentAssets((current) => current.filter((asset) => !ids.includes(asset.id)));
                    setSelectedIds([]);
                }}
            />
        </FinderLayout>
    );
}

const meta = {
    component: FinderLayout,
    title: "Page types/Finder",
    decorators: [themeDecorator],
    parameters: {
        tokens: finderLayoutTokens,
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Files and folders as in the macOS Finder; assets are shared by all scopes. The sidebar holds the places and the folder tree and takes dropped items; the toolbar has back and forward, the folder name, the icon size, four views, and a search across all assets; the content supports multi-select, renaming, a context menu, and dragging; the path bar is clickable and shows the count and the selection.",
            },
            story: { inline: false, height: "960px" },
        },
    },
    args: {
        header: null,
        children: null,
    },
    argTypes: {
        header: { control: false },
        children: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof FinderLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The assets of the career portal inside the app frame.
 *
 * **Rules**
 *
 * - Do: behave like the macOS Finder; remember the view per user.
 * - Don't: invent shortcuts where the Finder has its own; nest folders deeper than five levels.
 */
export const Default: Story = {
    render: () => (
        <PageTypeShell activeId="assets">
            <AssetsPage />
        </PageTypeShell>
    ),
    play: async ({ canvas }) => {
        const sidebar = canvas.getByRole("navigation", { name: /folders/i });
        await userEvent.click(within(sidebar).getByText("Careers"));
        await expect(canvas.getAllByText("Job ads").length).toBeGreaterThan(0);
        await userEvent.click(within(sidebar).getByText("All assets"));
        await expect(canvas.getAllByText("career-stage.jpg").length).toBeGreaterThan(0);
    },
};

/**
 * The regions of the finder and the draft's rules.
 */
export const Structure: Story = {
    parameters: { layout: "padded", docs: { story: { inline: true } } },
    render: () => (
        <PatternPage>
            <PatternSection title="Structure" description="Assets are shared by all scopes.">
                <div className={styles.structure}>
                    <StructureFrame>
                        <FinderLayout className={styles.structureLayout} header={null}>
                            <div className={styles.structureWindow}>
                                <StructureRegion number={1} label="Places · folder tree" className={styles.structureSidebar} />
                                <StructureRegion number={2} label="← → · title · size · view · search" className={styles.structureToolbar} />
                                <StructureRegion
                                    number={3}
                                    label="Icons | list | columns | gallery"
                                    variant="accent"
                                    className={styles.structureContent}
                                />
                                <StructureRegion number={4} label="Path bar · count" variant="dashed" className={styles.structurePath} />
                            </div>
                        </FinderLayout>
                    </StructureFrame>
                    <PatternLegend
                        items={[
                            {
                                title: "Sidebar",
                                description: "Places (recently changed, unused, archived) and the folder tree. Target for dropping.",
                            },
                            { title: "Toolbar", description: "Back and forward, folder name, icon size, four views, search across all assets." },
                            { title: "Content", description: "Multi-select, rename, context menu, drag." },
                            { title: "Path bar", description: "Clickable path, count, selection." },
                        ]}
                    />
                </div>
            </PatternSection>
            <PatternShortcuts
                shortcuts={[
                    { keys: ["⌘", "A"], description: "Select all" },
                    { keys: ["Space"], description: "Quick look" },
                    { keys: ["⌘", "⌫"], description: "Move to the archive" },
                    { keys: ["⌘", "↑"], description: "Enclosing folder" },
                ]}
            />
            <PatternUses pages={["Media & upload", "Menus & messages", "Modals & overlays"]} />
            <PatternRules
                dos={["Behave like the macOS Finder.", "Remember the view per user."]}
                donts={["Own shortcuts where the Finder has its own.", "Folders deeper than five levels."]}
            />
        </PatternPage>
    ),
};
