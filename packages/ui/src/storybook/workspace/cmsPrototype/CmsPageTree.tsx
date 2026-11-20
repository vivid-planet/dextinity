import { useState } from "react";

import { BulkActionBar } from "../../../components/bulkActionBar/BulkActionBar";
import { Button } from "../../../components/button/Button";
import { Checkbox } from "../../../components/checkbox/Checkbox";
import { CopyField } from "../../../components/copyField/CopyField";
import { FilterBar } from "../../../components/filterBar/FilterBar";
import { FilterChip } from "../../../components/filterChip/FilterChip";
import { Icon } from "../../../components/icon/Icon";
import { KeyValueList } from "../../../components/keyValueList/KeyValueList";
import { LinkedContent } from "../../../components/linkedContent/LinkedContent";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import { Panel } from "../../../components/panel/Panel";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { Switch } from "../../../components/switch/Switch";
import { TreeDetailLayout } from "../../../components/treeDetailLayout/TreeDetailLayout";
import { getExpandableTreeNodeIds, type TreeNode, TreeView } from "../../../components/treeView/TreeView";
import { TreeViewExpandButtons } from "../../../components/treeViewExpandButtons/TreeViewExpandButtons";
import { Typography } from "../../../components/typography/Typography";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { allSitePages, type ContentStatus, findPageTrail, type SitePage, siteTree } from "./cmsData";
import styles from "./cmsPrototype.module.scss";

const expandableIds = getExpandableTreeNodeIds(siteTree);

const statusFilters: { value: ContentStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
    { value: "archived", label: "Archived" },
];

function countDescendants(page: TreeNode): number {
    return (page.children ?? []).reduce((count, child) => count + 1 + countDescendants(child), 0);
}

function PageDetail({ page, published, onPublishedChange }: { page: SitePage; published: boolean; onPublishedChange: (published: boolean) => void }) {
    const trail = findPageTrail(page.id) ?? [];
    const isLink = page.type === "link";
    return (
        <Panel title="Selected">
            <div className={styles.detail}>
                <div className={styles.detailHeading}>
                    {trail.length > 0 && <Typography variant="label">{trail.map((ancestor) => ancestor.label).join(" › ")}</Typography>}
                    <h3 className={styles.detailTitle}>{page.label}</h3>
                    <CopyField value={isLink ? (page.path ?? "") : `example.com${page.path ?? ""}`} />
                </div>
                <div className={styles.detailActions}>
                    <Button startIcon={<Icon name="edit" />} href={`#page-tree/${page.id}`}>
                        Edit
                    </Button>
                    <Button variant="outlined" color="secondary" startIcon={<Icon name="eye" />}>
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
                        { key: "Template", value: isLink ? "External link" : (page.template ?? "Content page") },
                        { key: "Last edited", value: `${page.edited ?? "3 days ago"} by ${page.editor ?? "Anna Klein"}` },
                        { key: "Subpages", value: countDescendants(page) },
                    ]}
                />
                {page.id === "newsroom" && (
                    <LinkedContent href="#news" icon={<Icon name="news" />} title="News" description="This page lists the published articles" />
                )}
            </div>
        </Panel>
    );
}

export function CmsPageTree() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<ContentStatus | "all">("all");
    const [expandedIds, setExpandedIds] = useState(["home", "products"]);
    const [selectedId, setSelectedId] = useState("products");
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [unpublishedIds, setUnpublishedIds] = useState(allSitePages.filter((page) => page.status === "unpublished").map((page) => page.id));

    const selected = allSitePages.find((page) => page.id === selectedId) ?? allSitePages[0];
    const statusOf = (page: TreeNode): ContentStatus =>
        page.status === "archived" ? "archived" : unpublishedIds.includes(page.id) ? "unpublished" : "published";
    const matchesSearch = (page: TreeNode) => page.label.toLowerCase().includes(search.toLowerCase());
    const countFor = (value: ContentStatus | "all") =>
        allSitePages.filter((page) => matchesSearch(page) && (value === "all" || statusOf(page) === value)).length;
    const filtered = search !== "" || status !== "all";

    function withStatus(pages: TreeNode[]): TreeNode[] {
        return pages.map((page) => ({
            ...page,
            status: statusOf(page),
            count: page.children != null ? countDescendants(page) : undefined,
            children: page.children && withStatus(page.children),
        }));
    }

    return (
        <PageTypeShell currentId="page-tree">
            <TreeDetailLayout
                header={
                    <PageHeader
                        eyebrow={`Austria · German · ${allSitePages.length} pages`}
                        title="Page tree"
                        subtitle={`${countFor("unpublished")} unpublished · ${countFor("archived")} archived`}
                        primaryAction={{ label: "New page", icon: <Icon name="plus" /> }}
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
                                checked={checkedIds.length === allSitePages.length}
                                indeterminate={checkedIds.length > 0 && checkedIds.length < allSitePages.length}
                                onChange={(checked) => setCheckedIds(checked ? allSitePages.map((page) => page.id) : [])}
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
                                startAdornment={filter.value === "all" ? undefined : <StatusIndicator status={filter.value} decorative />}
                            >
                                {filter.label}
                            </FilterChip>
                        ))}
                    </FilterBar>
                }
                detail={
                    <PageDetail
                        page={selected}
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
                    nodes={withStatus(siteTree)}
                    expandedIds={expandedIds}
                    onExpandedChange={setExpandedIds}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    checkable
                    checkedIds={checkedIds}
                    onCheckedChange={setCheckedIds}
                    filter={filtered ? (page) => matchesSearch(page) && (status === "all" || statusOf(page) === status) : undefined}
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
        </PageTypeShell>
    );
}
