import { useState } from "react";

import { BulkActionBar, type BulkActionBarAction } from "../../../components/bulkActionBar/BulkActionBar";
import { Button } from "../../../components/button/Button";
import { Checkbox } from "../../../components/checkbox/Checkbox";
import { CopyField } from "../../../components/copyField/CopyField";
import { FilterBar } from "../../../components/filterBar/FilterBar";
import { FilterChip } from "../../../components/filterChip/FilterChip";
import { Icon } from "../../../components/icon/Icon";
import type { IconName } from "../../../components/icon/iconRegistry";
import { KeyValueList } from "../../../components/keyValueList/KeyValueList";
import { LinkedContent } from "../../../components/linkedContent/LinkedContent";
import { Menu } from "../../../components/menu/Menu";
import { MenuItem } from "../../../components/menu/MenuItem";
import { MenuRadioGroup } from "../../../components/menu/MenuRadioGroup";
import { MenuRadioItem } from "../../../components/menu/MenuRadioItem";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import { Panel } from "../../../components/panel/Panel";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { Switch } from "../../../components/switch/Switch";
import { ToastViewport } from "../../../components/toast/ToastViewport";
import { useToasts } from "../../../components/toast/useToasts";
import { TreeDetailLayout } from "../../../components/treeDetailLayout/TreeDetailLayout";
import { getExpandableTreeNodeIds, type TreeNode, TreeView } from "../../../components/treeView/TreeView";
import { TreeViewExpandButtons } from "../../../components/treeViewExpandButtons/TreeViewExpandButtons";
import { Typography } from "../../../components/typography/Typography";
import { useUndoToast } from "../../../components/undoToast/useUndoToast";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { type ContentStatus, findPageTrail, flattenPages, type SitePage, siteTree } from "./cmsData";
import styles from "./cmsPrototype.module.scss";
import { NewPageDialog } from "./NewPageDialog";
import { addChild, duplicatePages, removePages, setStatus, updatePages, withDescendantIds } from "./pageTreeState";

const statusFilters: { value: ContentStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
    { value: "archived", label: "Archived" },
];

const statusLabels: Record<ContentStatus, string> = { published: "Published", unpublished: "Unpublished", archived: "Archived" };
const statusVerbs: Record<ContentStatus, string> = { published: "published", unpublished: "unpublished", archived: "archived" };

const otherScopes = ["Germany · German", "Switzerland · German", "Switzerland · French"];

function statusOf(page: TreeNode): ContentStatus {
    return page.status === "archived" || page.status === "unpublished" ? page.status : "published";
}

function countDescendants(page: TreeNode): number {
    return (page.children ?? []).reduce((count, child) => count + 1 + countDescendants(child), 0);
}

function describePages(count: number) {
    return count === 1 ? "1 page" : `${count} pages`;
}

let newPageCounter = 0;

/** The status at the end of a tree row, with a menu to change it right there. */
function PageStatusMenu({ page, onChange }: { page: SitePage; onChange: (status: ContentStatus) => void }) {
    const [open, setOpen] = useState(false);
    const status = statusOf(page);
    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <button type="button" className={styles.statusTrigger} aria-label={`Status of “${page.label}”: ${statusLabels[status]}`}>
                    <StatusIndicator status={status} />
                    <Icon name="chevron-down" />
                </button>
            }
        >
            <MenuRadioGroup value={status} onChange={(value) => onChange(value as ContentStatus)}>
                {(Object.keys(statusLabels) as ContentStatus[]).map((value) => (
                    <MenuRadioItem key={value} value={value} label={statusLabels[value]} icon={<StatusIndicator status={value} decorative />} />
                ))}
            </MenuRadioGroup>
        </Menu>
    );
}

function PageDetail({ page, onStatusChange }: { page: SitePage; onStatusChange: (status: ContentStatus) => void }) {
    const trail = findPageTrail(page.id) ?? [];
    const isLink = page.type === "link";
    const status = statusOf(page);
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
                    checked={status === "published"}
                    onChange={(published) => onStatusChange(published ? "published" : "unpublished")}
                    description={status === "published" ? "Live at the address above." : "Only visible in the admin."}
                >
                    Published
                </Switch>
                <KeyValueList
                    items={[
                        { key: "Status", value: <StatusIndicator status={status} /> },
                        { key: "Template", value: isLink ? "External link" : (page.template ?? "Content page") },
                        { key: "Menu", value: page.hiddenInMenu === true ? "Hidden" : "Shown" },
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
    const [pages, setPages] = useState<SitePage[]>(siteTree);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
    const [expandedIds, setExpandedIds] = useState(["home", "products"]);
    const [selectedId, setSelectedId] = useState("products");
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [newPageDialogKey, setNewPageDialogKey] = useState(0);
    const [isNewPageDialogOpen, setIsNewPageDialogOpen] = useState(false);
    const [isCopyToScopeOpen, setIsCopyToScopeOpen] = useState(false);
    const { toasts, add: addToast, dismiss } = useToasts();
    const undoToast = useUndoToast({ addToast });

    const allPages = flattenPages(pages);
    const selected = allPages.find((page) => page.id === selectedId) ?? allPages[0];
    const checkedPages = allPages.filter((page) => checkedIds.includes(page.id));
    const expandableIds = getExpandableTreeNodeIds(pages);
    const matchesSearch = (page: TreeNode) => page.label.toLowerCase().includes(search.toLowerCase());
    const countFor = (value: ContentStatus | "all") =>
        allPages.filter((page) => matchesSearch(page) && (value === "all" || statusOf(page) === value)).length;
    const filtered = search !== "" || statusFilter !== "all";

    function withCounts(nodes: SitePage[]): TreeNode[] {
        // The status shows as text with its menu at the end of the row instead of the tree's dot
        return nodes.map((page) => ({
            ...page,
            status: undefined,
            count: page.children != null && page.children.length > 0 ? countDescendants(page) : undefined,
            children: page.children && withCounts(page.children),
        }));
    }

    /** Changes the tree, with Undo in the toast that reports it. */
    function change(nextPages: SitePage[], message: string, afterRun?: () => void) {
        const previousPages = pages;
        undoToast.perform({
            run: () => {
                setPages(nextPages);
                afterRun?.();
            },
            undo: () => setPages(previousPages),
            message,
        });
    }

    function changeStatus(ids: string[], status: ContentStatus) {
        const changedIds = ids.filter((id) => statusOf(allPages.find((page) => page.id === id) ?? { id, label: "" }) !== status);
        const name = changedIds.length === 1 ? `“${allPages.find((page) => page.id === changedIds[0])?.label}”` : describePages(changedIds.length);
        change(setStatus(pages, changedIds, status), `${name} ${statusVerbs[status]}`, () => setCheckedIds([]));
    }

    function bulkStatusAction(status: ContentStatus, label: string, icon: IconName): BulkActionBarAction {
        const allHaveStatus = checkedPages.every((page) => statusOf(page) === status);
        return {
            label,
            icon: <Icon name={icon} />,
            disabled: allHaveStatus,
            disabledReason: allHaveStatus ? `All selected pages are ${statusVerbs[status]}` : undefined,
            onClick: () => changeStatus(checkedIds, status),
        };
    }

    const allHidden = checkedPages.length > 0 && checkedPages.every((page) => page.hiddenInMenu === true);
    const removedIds = withDescendantIds(pages, checkedIds);
    const removedSubpages = removedIds.length - checkedIds.length;

    const bulkActions: BulkActionBarAction[] = [
        bulkStatusAction("published", "Publish", "check"),
        bulkStatusAction("unpublished", "Unpublish", "eye-off"),
        bulkStatusAction("archived", "Archive", "archive"),
        {
            label: allHidden ? "Show in menu" : "Hide in menu",
            icon: <Icon name={allHidden ? "invisible-item-show" : "invisible-item-hide"} />,
            onClick: () =>
                change(
                    updatePages(pages, checkedIds, (page) => ({ ...page, hiddenInMenu: !allHidden })),
                    `${describePages(checkedIds.length)} ${allHidden ? "shown in" : "hidden in"} the menu`,
                    () => setCheckedIds([]),
                ),
        },
        {
            label: "Duplicate",
            icon: <Icon name="duplicate" />,
            onClick: () => {
                const { pages: nextPages, copyIds } = duplicatePages(pages, checkedIds);
                change(nextPages, `${describePages(copyIds.length)} duplicated, unpublished`, () => setCheckedIds(copyIds));
            },
        },
        {
            label: "Copy",
            icon: <Icon name="copy" />,
            onClick: () => {
                addToast({ message: `${describePages(checkedIds.length)} copied – paste them in another scope's page tree`, color: "info" });
                setCheckedIds([]);
            },
        },
        {
            label: "Copy to scope",
            icon: <Icon name="globe" />,
            open: isCopyToScopeOpen,
            onOpenChange: setIsCopyToScopeOpen,
            menu: otherScopes.map((scope) => (
                <MenuItem
                    key={scope}
                    label={scope}
                    onClick={() => {
                        addToast({ message: `${describePages(checkedIds.length)} copied to ${scope}, unpublished` });
                        setCheckedIds([]);
                    }}
                />
            )),
        },
        {
            label: "Delete",
            icon: <Icon name="trash" />,
            color: "error",
            onClick: () =>
                change(
                    removePages(pages, checkedIds),
                    `${describePages(checkedIds.length)} deleted${removedSubpages > 0 ? `, with ${describePages(removedSubpages)} below` : ""}`,
                    () => setCheckedIds([]),
                ),
        },
    ];

    return (
        <PageTypeShell currentId="page-tree">
            <TreeDetailLayout
                header={
                    <PageHeader
                        eyebrow={`Austria · German · ${allPages.length} pages`}
                        title="Page tree"
                        subtitle={`${countFor("unpublished")} unpublished · ${countFor("archived")} archived`}
                        primaryAction={{
                            label: "New page",
                            icon: <Icon name="plus" />,
                            onClick: () => {
                                setNewPageDialogKey((key) => key + 1);
                                setIsNewPageDialogOpen(true);
                            },
                        }}
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
                                checked={checkedIds.length === allPages.length}
                                indeterminate={checkedIds.length > 0 && checkedIds.length < allPages.length}
                                onChange={(checked) => setCheckedIds(checked ? allPages.map((page) => page.id) : [])}
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
                                selected={statusFilter === filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                count={countFor(filter.value)}
                                startAdornment={filter.value === "all" ? undefined : <StatusIndicator status={filter.value} decorative />}
                            >
                                {filter.label}
                            </FilterChip>
                        ))}
                    </FilterBar>
                }
                detail={selected != null && <PageDetail page={selected} onStatusChange={(status) => changeStatus([selected.id], status)} />}
                detailLabel={selected?.label ?? "Page"}
            >
                <TreeView
                    aria-label="Pages"
                    className={styles.pageTree}
                    nodes={withCounts(pages)}
                    expandedIds={expandedIds}
                    onExpandedChange={setExpandedIds}
                    selectedId={selected?.id}
                    onSelect={setSelectedId}
                    checkable
                    checkedIds={checkedIds}
                    onCheckedChange={setCheckedIds}
                    filter={
                        filtered
                            ? (node) => {
                                  const page = allPages.find((candidate) => candidate.id === node.id);
                                  return matchesSearch(node) && (statusFilter === "all" || (page != null && statusOf(page) === statusFilter));
                              }
                            : undefined
                    }
                    renderActions={(node) => {
                        const page = allPages.find((candidate) => candidate.id === node.id);
                        return page != null && <PageStatusMenu page={page} onChange={(status) => changeStatus([page.id], status)} />;
                    }}
                />
            </TreeDetailLayout>
            <BulkActionBar count={checkedIds.length} onClear={() => setCheckedIds([])} actions={bulkActions} />
            <NewPageDialog
                key={newPageDialogKey}
                open={isNewPageDialogOpen}
                onOpenChange={setIsNewPageDialogOpen}
                pages={pages}
                defaultParentId={selected?.id ?? null}
                onCreate={(newPage) => {
                    newPageCounter += 1;
                    const id = `new-page-${newPageCounter}`;
                    setPages((current) =>
                        addChild(current, newPage.parentId, {
                            id,
                            label: newPage.name,
                            type: newPage.documentType === "link" ? "link" : "page",
                            status: "unpublished",
                            path: newPage.path,
                            hiddenInMenu: newPage.hiddenInMenu,
                            template: newPage.documentType === "predefined" ? "Predefined page" : "Content page",
                            editor: "Max Mustermann",
                            edited: "Just now",
                        }),
                    );
                    if (newPage.parentId != null) {
                        setExpandedIds((ids) => (ids.includes(newPage.parentId ?? "") ? ids : [...ids, newPage.parentId ?? ""]));
                    }
                    setSelectedId(id);
                    addToast({ message: `“${newPage.name}” created, unpublished` });
                }}
            />
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </PageTypeShell>
    );
}
