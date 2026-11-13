import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { PageTypeShell, StructureFrame, StructureRegion } from "../../../storybook/pageTypes/PageTypeShell";
import { PatternLegend, PatternPage, PatternRules, PatternSection, PatternShortcuts, PatternUses } from "../../../storybook/patterns/PatternPage";
import { documentImage, interiorImage, landscapeImage, portraitImage } from "../../../storybook/sampleImages";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { AssetThumbnail, type AssetThumbnailBadge, type AssetThumbnailType } from "../../assetThumbnail/AssetThumbnail";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { PageHeader } from "../../pageHeader/PageHeader";
import { FinderLayout } from "../FinderLayout";
import finderLayoutTokens from "../FinderLayout.tokens.scss?raw";
import styles from "./FinderLayout.stories.module.scss";

interface StoryFolder {
    id: string;
    name: string;
    parentId: string | null;
}

interface StoryAsset {
    id: string;
    name: string;
    folderId: string;
    type: AssetThumbnailType;
    src?: string;
    fileType?: string;
    duration?: string;
    badges?: AssetThumbnailBadge[];
    meta: string;
}

const folders: StoryFolder[] = [
    { id: "root", name: "All assets", parentId: null },
    { id: "careers", name: "Careers", parentId: "root" },
    { id: "jobs", name: "Job ads", parentId: "careers" },
    { id: "team", name: "Team", parentId: "careers" },
    { id: "campaigns", name: "Campaigns", parentId: "root" },
    { id: "spring", name: "Spring 2026", parentId: "campaigns" },
    { id: "documents", name: "Documents", parentId: "root" },
];

const images = [landscapeImage, interiorImage, portraitImage];

const assets: StoryAsset[] = [
    { id: "a1", name: "career-stage.jpg", folderId: "root", type: "image", src: landscapeImage, meta: "JPG · 2.4 MB" },
    { id: "a2", name: "office-vienna.jpg", folderId: "root", type: "image", src: interiorImage, badges: ["missingAlt"], meta: "JPG · 3.1 MB" },
    { id: "a3", name: "team-portrait.png", folderId: "root", type: "image", src: portraitImage, meta: "PNG · 840 KB" },
    { id: "a4", name: "benefits.pdf", folderId: "root", type: "document", src: documentImage, fileType: "PDF", meta: "PDF · 1.2 MB" },
    { id: "a5", name: "employer-video.mp4", folderId: "root", type: "video", src: landscapeImage, duration: "0:42", meta: "MP4 · 18 MB" },
    ...Array.from({ length: 7 }, (_, index): StoryAsset => ({
        id: `j${index}`,
        name: `job-ad-${index + 1}.jpg`,
        folderId: "jobs",
        type: "image",
        src: images[index % images.length],
        meta: "JPG · 1.8 MB",
    })),
    { id: "t1", name: "team-offsite.jpg", folderId: "team", type: "image", src: interiorImage, meta: "JPG · 2.8 MB" },
    { id: "s1", name: "spring-hero.jpg", folderId: "spring", type: "image", src: landscapeImage, meta: "JPG · 2.0 MB" },
    { id: "d1", name: "terms.pdf", folderId: "documents", type: "document", src: documentImage, fileType: "PDF", meta: "PDF · 220 KB" },
];

function getDepth(folder: StoryFolder): number {
    const parent = folders.find((candidate) => candidate.id === folder.parentId);
    return parent == null ? 0 : getDepth(parent) + 1;
}

/**
 * A minimal finder for the story: the folder tree in the sidebar, the folder's subfolders and files as thumbnails.
 */
function StoryFinder() {
    const [folderId, setFolderId] = useState("root");
    const subfolders = folders.filter((folder) => folder.parentId === folderId);
    const folderAssets = assets.filter((asset) => asset.folderId === folderId);

    return (
        <div className={styles.finder}>
            <nav aria-label="Folders" className={styles.sidebar}>
                {folders.map((folder) => (
                    <button
                        key={folder.id}
                        type="button"
                        aria-current={folder.id === folderId ? "true" : undefined}
                        onClick={() => setFolderId(folder.id)}
                        className={styles.folderButton}
                        style={{ paddingInlineStart: `calc(var(--dextinity-space-2) + ${getDepth(folder)} * var(--dextinity-space-4))` }}
                    >
                        <Icon name="folder" />
                        {folder.name}
                    </button>
                ))}
            </nav>
            <ul className={styles.content}>
                {subfolders.map((folder) => (
                    <li key={folder.id}>
                        <AssetThumbnail type="folder" name={folder.name} />
                    </li>
                ))}
                {folderAssets.map((asset) => (
                    <li key={asset.id}>
                        <AssetThumbnail
                            type={asset.type}
                            src={asset.src}
                            fileType={asset.fileType}
                            duration={asset.duration}
                            badges={asset.badges}
                            name={asset.name}
                            meta={asset.meta}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

function AssetsPage() {
    return (
        <FinderLayout
            header={
                <PageHeader
                    eyebrow="Content"
                    title="Assets"
                    subtitle={`${assets.length} files · shared by all scopes`}
                    actions={
                        <>
                            <Button variant="outlined" color="secondary" startIcon={<Icon name="folder" />}>
                                New folder
                            </Button>
                            <Button startIcon={<Icon name="cloud-upload" />}>Upload</Button>
                        </>
                    }
                />
            }
        >
            <StoryFinder />
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
                    "Files and folders as in the macOS Finder; assets are shared by all scopes. The page header sits above the finder window, which takes the viewport's height so that the finder's own areas scroll instead of the page.",
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
 * The assets of the career portal inside the app frame. The finder here is a placeholder: a folder tree and the folder's thumbnails.
 *
 * **Rules**
 *
 * - Do: behave like the macOS Finder; remember the view and the folder tree's width per user.
 * - Don't: invent shortcuts where the Finder has its own; nest folders deeper than five levels.
 */
export const Default: Story = {
    render: () => (
        <PageTypeShell activeId="assets">
            <AssetsPage />
        </PageTypeShell>
    ),
    play: async ({ canvas }) => {
        const sidebar = canvas.getByRole("navigation", { name: "Folders" });
        await userEvent.click(within(sidebar).getByRole("button", { name: "Careers" }));
        await expect(within(sidebar).getByRole("button", { name: "Careers" })).toHaveAttribute("aria-current", "true");
        await expect(canvas.queryByText("career-stage.jpg")).toBeNull();
        await userEvent.click(within(sidebar).getByRole("button", { name: "All assets" }));
        await expect(canvas.getByText("career-stage.jpg")).toBeVisible();
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
