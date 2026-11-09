import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { PageTypeShell, StructureFrame, StructureRegion } from "../../../storybook/pageTypes/PageTypeShell";
import { PatternLegend, PatternPage, PatternRules, PatternSection, PatternUses } from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { BulkActionBar } from "../../bulkActionBar/BulkActionBar";
import { Button } from "../../button/Button";
import { Checkbox } from "../../checkbox/Checkbox";
import { CopyField } from "../../copyField/CopyField";
import { FilterBar } from "../../filterBar/FilterBar";
import { FilterChip } from "../../filterChip/FilterChip";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { KeyValueList } from "../../keyValueList/KeyValueList";
import { LinkedContent } from "../../linkedContent/LinkedContent";
import { PageHeader } from "../../pageHeader/PageHeader";
import { Panel } from "../../panel/Panel";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { Switch } from "../../switch/Switch";
import { getExpandableTreeNodeIds, type TreeNode, TreeView } from "../../treeView/TreeView";
import { TreeViewExpandButtons } from "../../treeViewExpandButtons/TreeViewExpandButtons";
import { Typography } from "../../typography/Typography";
import { TreeDetailLayout, type TreeDetailLayoutProps } from "../TreeDetailLayout";
import treeDetailLayoutTokens from "../TreeDetailLayout.tokens.scss?raw";
import styles from "./TreeDetailLayout.stories.module.scss";

type PageStatus = "published" | "unpublished" | "archived";

const pageTree: TreeNode[] = [
    {
        id: "home",
        label: "Home",
        icon: <Icon name="home" />,
        status: "published",
        path: "/",
        children: [
            {
                id: "careers",
                label: "Careers",
                status: "published",
                path: "/careers",
                children: [
                    { id: "jobs", label: "Open positions", status: "published", path: "/careers/open-positions" },
                    { id: "benefits", label: "Benefits", status: "unpublished", path: "/careers/benefits" },
                    { id: "apply", label: "How to apply", status: "published", path: "/careers/how-to-apply" },
                    { id: "trainees", label: "Trainee program 2025", status: "archived", path: "/careers/trainees-2025" },
                ],
            },
            {
                id: "about",
                label: "About us",
                status: "published",
                path: "/about-us",
                children: [
                    { id: "team", label: "Team", status: "published", path: "/about-us/team" },
                    { id: "locations", label: "Locations", status: "published", path: "/about-us/locations" },
                ],
            },
            { id: "news", label: "News", status: "published", path: "/news" },
            { id: "shop", label: "Shop", type: "link", status: "published", path: "https://shop.example.com" },
            { id: "imprint", label: "Imprint", status: "published", path: "/imprint", hiddenInMenu: true },
            { id: "privacy", label: "Privacy", status: "published", path: "/privacy", hiddenInMenu: true },
        ],
    },
];

function flatten(nodes: TreeNode[]): TreeNode[] {
    return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
}

function countDescendants(node: TreeNode): number {
    return (node.children ?? []).reduce((count, child) => count + 1 + countDescendants(child), 0);
}

function findTrail(nodes: TreeNode[], id: string): TreeNode[] | undefined {
    for (const node of nodes) {
        if (node.id === id) {
            return [];
        }
        const trail = findTrail(node.children ?? [], id);
        if (trail != null) {
            return [node, ...trail];
        }
    }
    return undefined;
}

const allNodes = flatten(pageTree);
const expandableIds = getExpandableTreeNodeIds(pageTree);

const statusFilters: { value: PageStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
    { value: "archived", label: "Archived" },
];

function PageDetail({ node, published, onPublishedChange }: { node: TreeNode; published: boolean; onPublishedChange: (published: boolean) => void }) {
    const trail = findTrail(pageTree, node.id) ?? [];
    return (
        <Panel
            title="Selected"
            actions={
                <IconButton color="secondary" variant="text" size="small" aria-label="Actions">
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <div className={styles.detail}>
                <div className={styles.detailHeading}>
                    {trail.length > 0 && <Typography variant="label">{trail.map((ancestor) => ancestor.label).join(" › ")}</Typography>}
                    <h3 className={styles.detailTitle}>{node.label}</h3>
                    <CopyField value={`example.com${node.path ?? ""}`} />
                </div>
                <div className={styles.detailActions}>
                    <Button startIcon={<Icon name="edit" />}>Edit</Button>
                    <Button variant="outlined" color="secondary" startIcon={<Icon name="visible" />}>
                        Preview
                    </Button>
                </div>
                <Switch
                    checked={published}
                    onChange={onPublishedChange}
                    description={published ? "Live at the address above." : "Only visible in the admin."}
                >
                    Published
                </Switch>
                <KeyValueList
                    items={[
                        { key: "Status", value: <StatusIndicator status={published ? "published" : "unpublished"} /> },
                        { key: "Template", value: "Content page" },
                        { key: "Last edited", value: "12 min ago by Anna Klein" },
                        { key: "Subpages", value: countDescendants(node) },
                    ]}
                />
                <LinkedContent href="#job-ads" icon={<Icon name="layout" />} title="Job ads" description="This page lists 47 job ads" />
            </div>
        </Panel>
    );
}

function PageTreePage({ surface }: Pick<TreeDetailLayoutProps, "surface">) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<PageStatus | "all">("all");
    const [expandedIds, setExpandedIds] = useState(["home", "careers"]);
    const [selectedId, setSelectedId] = useState("jobs");
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [unpublishedIds, setUnpublishedIds] = useState<string[]>(allNodes.filter((node) => node.status !== "published").map((node) => node.id));

    const selected = allNodes.find((node) => node.id === selectedId) ?? allNodes[0];
    const statusOf = (node: TreeNode): PageStatus =>
        node.status === "archived" ? "archived" : unpublishedIds.includes(node.id) ? "unpublished" : "published";
    const matchesSearch = (node: TreeNode) => node.label.toLowerCase().includes(search.toLowerCase());
    const countFor = (value: PageStatus | "all") =>
        allNodes.filter((node) => matchesSearch(node) && (value === "all" || statusOf(node) === value)).length;
    const filtered = search !== "" || status !== "all";
    const nodes = allNodes.length;

    const unpublishedCount = allNodes.filter((node) => statusOf(node) === "unpublished").length;
    const archivedCount = allNodes.filter((node) => statusOf(node) === "archived").length;

    function withStatus(list: TreeNode[]): TreeNode[] {
        return list.map((node) => ({
            ...node,
            status: statusOf(node),
            count: node.children != null ? countDescendants(node) : undefined,
            children: node.children && withStatus(node.children),
        }));
    }

    return (
        <>
            <TreeDetailLayout
                surface={surface}
                header={
                    <PageHeader
                        eyebrow={`Austria · German · ${nodes} pages`}
                        title="Page tree"
                        subtitle={`${unpublishedCount} unpublished · ${archivedCount} archived`}
                        actions={<Button startIcon={<Icon name="plus" />}>New page</Button>}
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={search}
                        onSearchChange={setSearch}
                        labels={{ search: "Filter pages", searchPlaceholder: "Filter pages" }}
                        start={
                            <Checkbox
                                aria-label="Select all pages"
                                checked={checkedIds.length === nodes}
                                indeterminate={checkedIds.length > 0 && checkedIds.length < nodes}
                                onChange={(checked) => setCheckedIds(checked ? allNodes.map((node) => node.id) : [])}
                            />
                        }
                        actions={
                            <TreeViewExpandButtons
                                onExpandAll={() => setExpandedIds(expandableIds)}
                                onCollapseAll={() => setExpandedIds([])}
                                expandAllDisabled={expandedIds.length === expandableIds.length}
                                collapseAllDisabled={expandedIds.length === 0}
                            />
                        }
                    >
                        {statusFilters.map((filter) => (
                            <FilterChip
                                key={filter.value}
                                selected={status === filter.value}
                                onClick={() => setStatus(filter.value)}
                                count={countFor(filter.value)}
                                status={filter.value === "all" ? undefined : filter.value}
                            >
                                {filter.label}
                            </FilterChip>
                        ))}
                    </FilterBar>
                }
                detail={
                    <PageDetail
                        node={selected}
                        published={statusOf(selected) === "published"}
                        onPublishedChange={(published) =>
                            setUnpublishedIds((ids) => (published ? ids.filter((id) => id !== selected.id) : [...ids, selected.id]))
                        }
                    />
                }
                detailLabel={selected.label}
            >
                <TreeView
                    aria-label="Pages"
                    nodes={withStatus(pageTree)}
                    expandedIds={expandedIds}
                    onExpandedChange={setExpandedIds}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    checkable
                    checkedIds={checkedIds}
                    onCheckedChange={setCheckedIds}
                    filter={filtered ? (node) => matchesSearch(node) && (status === "all" || statusOf(node) === status) : undefined}
                />
            </TreeDetailLayout>
            {checkedIds.length > 0 && (
                <BulkActionBar
                    count={checkedIds.length}
                    onClear={() => setCheckedIds([])}
                    actions={[
                        {
                            label: "Publish",
                            icon: <Icon name="check" />,
                            onClick: () => {
                                setUnpublishedIds((ids) => ids.filter((id) => !checkedIds.includes(id)));
                                setCheckedIds([]);
                            },
                        },
                        { label: "Move", icon: <Icon name="move" />, onClick: () => setCheckedIds([]) },
                    ]}
                />
            )}
        </>
    );
}

const meta = {
    component: TreeDetailLayout,
    title: "Page types/Tree + detail",
    decorators: [themeDecorator],
    parameters: {
        tokens: treeDetailLayoutTokens,
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "The page tree with the detail of the active page. The page header has the scope, the count, and “New page”; the tree's card starts with the toolbar that selects all, searches, filters by status, and expands or collapses. The tree selects on the left, the detail shows on the right with path, edit button, published switch, and properties, and stays in view while scrolling. Checked pages get the bulk action bar.",
            },
            story: { inline: false, height: "960px" },
        },
    },
    args: {
        header: null,
        children: null,
        detail: null,
    },
    argTypes: {
        header: { control: false },
        toolbar: { control: false },
        surface: { control: "radio", options: ["glass", "solid", "none"] },
        children: { control: false },
        detail: { control: false },
        detailLabel: { control: "text" },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof TreeDetailLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The page tree of the career portal inside the app frame.
 *
 * **Rules**
 *
 * - Do: show the detail on the right and edit only through its button; keep checking pages separate from the active page.
 * - Don't: show the detail as a dialog; offer a tree of more than 50 pages without a filter.
 */
export const Default: Story = {
    render: (args) => (
        <PageTypeShell activeId="page-tree">
            <PageTreePage surface={args.surface} />
        </PageTypeShell>
    ),
    play: async ({ canvas }) => {
        await userEvent.click(within(canvas.getByRole("tree", { name: "Pages" })).getByText("Benefits"));
        const detail = canvas.getByRole("complementary", { name: "Benefits" });
        await expect(within(detail).getByRole("switch", { name: /Published/ })).not.toBeChecked();
        await userEvent.click(within(detail).getByRole("switch", { name: /Published/ }));
        await waitFor(() => expect(within(detail).getByRole("switch", { name: /Published/ })).toBeChecked());
    },
};

/**
 * The tree's card on a solid surface, e.g. over a busy background.
 */
export const SolidSurface: Story = {
    args: { surface: "solid" },
    render: Default.render,
};

/**
 * Without the card, the toolbar and the tree sit on the page, e.g. inside a card of your own.
 */
export const WithoutSurface: Story = {
    args: { surface: "none" },
    render: Default.render,
};

/**
 * The regions of the tree page and the draft's rules.
 */
export const Structure: Story = {
    parameters: { layout: "padded", docs: { story: { inline: true } } },
    render: () => (
        <PatternPage>
            <PatternSection title="Structure">
                <div className={styles.structure}>
                    <StructureFrame>
                        <TreeDetailLayout
                            className={styles.structureLayout}
                            header={<StructureRegion number={1} label="Page header" variant="dashed" />}
                            toolbar={<StructureRegion number={2} label="Select all · search · status · expand" />}
                            detail={
                                <StructureRegion number={4} label="Detail of the active page" variant="accent" className={styles.structureDetail} />
                            }
                        >
                            <StructureRegion number={3} label="Tree" className={styles.structureTree} />
                        </TreeDetailLayout>
                    </StructureFrame>
                    <PatternLegend
                        items={[
                            { title: "Page header", description: "Scope, count, new page." },
                            {
                                title: "Toolbar",
                                description: "At the top of the tree's card: select all, search, status filter, expand and collapse all.",
                            },
                            { title: "Tree", description: "Selection on the left, detail on the right. Bulk action bar when pages are checked." },
                            { title: "Detail", description: "Path, edit, published switch, properties. Sticks while scrolling." },
                        ]}
                    />
                </div>
            </PatternSection>
            <PatternUses pages={["Tree", "Selection & toggles"]} />
            <PatternRules
                dos={["Detail on the right, edit only through its button.", "Keep checking and being active apart."]}
                donts={["Detail as a dialog.", "A tree without a filter for more than 50 pages."]}
            />
        </PatternPage>
    ),
};
