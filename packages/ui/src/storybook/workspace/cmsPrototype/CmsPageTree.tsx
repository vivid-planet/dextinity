import { type ReactElement, useState } from "react";

import { Avatar } from "../../../components/avatar/Avatar";
import { BulkActionBar, type BulkActionBarAction } from "../../../components/bulkActionBar/BulkActionBar";
import { Button } from "../../../components/button/Button";
import { Checkbox } from "../../../components/checkbox/Checkbox";
import { CopyField } from "../../../components/copyField/CopyField";
import { EmptyState } from "../../../components/emptyState/EmptyState";
import { FilterBar } from "../../../components/filterBar/FilterBar";
import { FilterChip } from "../../../components/filterChip/FilterChip";
import { Icon } from "../../../components/icon/Icon";
import { IconButton } from "../../../components/iconButton/IconButton";
import { useKeyboardShortcutPlatform } from "../../../components/keyboardShortcut/keyboardShortcutPlatform";
import { matchesKeyboardShortcut } from "../../../components/keyboardShortcut/useKeyboardShortcut";
import { KeyValueList } from "../../../components/keyValueList/KeyValueList";
import { LinkedContent } from "../../../components/linkedContent/LinkedContent";
import { Menu } from "../../../components/menu/Menu";
import { MenuGroup } from "../../../components/menu/MenuGroup";
import { MenuItem } from "../../../components/menu/MenuItem";
import { MenuLinkItem } from "../../../components/menu/MenuLinkItem";
import { MenuRadioGroup } from "../../../components/menu/MenuRadioGroup";
import { MenuRadioItem } from "../../../components/menu/MenuRadioItem";
import { MenuSeparator } from "../../../components/menu/MenuSeparator";
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
import { type ContentStatus, flattenPages, newsArticles, type SitePage, siteTree } from "./cmsData";
import styles from "./cmsPrototype.module.scss";
import { NewPageDialog } from "./NewPageDialog";
import { addChild, duplicatePages, findInTree, findTrail, pastePages, removePages, setStatus, updatePages, withDescendantIds } from "./pageTreeState";

const statusFilters: { value: ContentStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
    { value: "archived", label: "Archived" },
];

const statusLabels: Record<ContentStatus, string> = { published: "Published", unpublished: "Unpublished", archived: "Archived" };

const otherScopes = ["Germany · German", "Switzerland · German", "Switzerland · French"];

function statusOf(page: TreeNode): ContentStatus {
    return page.status === "archived" || page.status === "unpublished" ? page.status : "published";
}

function countDescendants(page: TreeNode): number {
    return (page.children ?? []).reduce((count, child) => count + 1 + countDescendants(child), 0);
}

function describePages(count: number, noun = "page") {
    return count === 1 ? `1 ${noun}` : `${count} ${noun}s`;
}

function nameOrCount(pages: SitePage[]) {
    return pages.length === 1 ? `“${pages[0].label}”` : describePages(pages.length);
}

let newPageCounter = 0;

/** The actions on one page, in its row's menu and in the detail card's menu. */
interface PageActions {
    onAddSubpage: (page: SitePage) => void;
    onPreview: (page: SitePage) => void;
    onDuplicate: (page: SitePage) => void;
    onCopy: (page: SitePage) => void;
    onPaste: (page: SitePage) => void;
    onMove: (page: SitePage) => void;
    onStatusChange: (page: SitePage, status: ContentStatus) => void;
    onDelete: (page: SitePage) => void;
    copiedCount: number;
}

function PageActionsMenu({ page, actions, trigger }: { page: SitePage; actions: PageActions; trigger: ReactElement }) {
    const [open, setOpen] = useState(false);
    const status = statusOf(page);
    return (
        <Menu open={open} onOpenChange={setOpen} placement="bottom-end" trigger={trigger}>
            <MenuGroup label={page.label}>
                <MenuLinkItem label="Edit" icon={<Icon name="edit" />} href={`#page-tree/${page.id}`} />
                <MenuItem label="Preview" icon={<Icon name="eye" />} onClick={() => actions.onPreview(page)} />
                <MenuItem label="Add subpage" icon={<Icon name="plus" />} onClick={() => actions.onAddSubpage(page)} />
                <MenuItem label="Duplicate" icon={<Icon name="duplicate" />} onClick={() => actions.onDuplicate(page)} />
                <MenuItem label="Copy" icon={<Icon name="copy" />} keyboardShortcut="mod+c" onClick={() => actions.onCopy(page)} />
                {actions.copiedCount > 0 && (
                    <MenuItem
                        label={`Paste (${actions.copiedCount})`}
                        icon={<Icon name="paste-add" />}
                        keyboardShortcut="mod+v"
                        onClick={() => actions.onPaste(page)}
                    />
                )}
                <MenuItem label="Move…" icon={<Icon name="page-move" />} onClick={() => actions.onMove(page)} />
            </MenuGroup>
            <MenuSeparator />
            {status === "published" && (
                <MenuItem label="Unpublish" icon={<Icon name="eye-off" />} onClick={() => actions.onStatusChange(page, "unpublished")} />
            )}
            {status === "unpublished" && (
                <MenuItem label="Publish" icon={<Icon name="check" />} onClick={() => actions.onStatusChange(page, "published")} />
            )}
            {status === "archived" ? (
                <MenuItem label="Restore" icon={<Icon name="restore" />} onClick={() => actions.onStatusChange(page, "unpublished")} />
            ) : (
                <MenuItem label="Archive" icon={<Icon name="archive" />} onClick={() => actions.onStatusChange(page, "archived")} />
            )}
            <MenuItem label="Delete" icon={<Icon name="trash" />} color="error" onClick={() => actions.onDelete(page)} />
        </Menu>
    );
}

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
                    <StatusIndicator status={status} decorative />
                    <span className={styles.statusText}>{statusLabels[status]}</span>
                    <span className={styles.statusChevron}>
                        <Icon name="chevron-down" />
                    </span>
                </button>
            }
        >
            <MenuGroup label="Status">
                <MenuRadioGroup value={status} onChange={(value) => onChange(value as ContentStatus)}>
                    {(Object.keys(statusLabels) as ContentStatus[]).map((value) => (
                        <MenuRadioItem key={value} value={value} label={statusLabels[value]} icon={<StatusIndicator status={value} decorative />} />
                    ))}
                </MenuRadioGroup>
            </MenuGroup>
        </Menu>
    );
}

function PageDetail({ page, pages, actions }: { page: SitePage; pages: SitePage[]; actions: PageActions }) {
    const trail = findTrail(pages, page.id) ?? [];
    const isLink = page.type === "link";
    const status = statusOf(page);
    const editor = page.editor ?? "Anna Klein";
    return (
        <Panel
            title="Selected"
            actions={
                <PageActionsMenu
                    page={page}
                    actions={actions}
                    trigger={
                        <IconButton aria-label={`Actions for “${page.label}”`} variant="text" color="secondary">
                            <Icon name="more-horizontal" />
                        </IconButton>
                    }
                />
            }
        >
            <div className={styles.detail}>
                <div className={styles.detailHeading}>
                    <Typography variant="label">{trail.length > 0 ? trail.map((ancestor) => ancestor.label).join(" › ") : "Root"}</Typography>
                    <h3 className={styles.detailTitle}>{page.label}</h3>
                    <CopyField value={isLink ? (page.path ?? "") : `example.com${page.path ?? ""}`} />
                </div>
                <div className={styles.detailActions}>
                    <Button startIcon={<Icon name="edit" />} href={`#page-tree/${page.id}`}>
                        Edit
                    </Button>
                    <Button variant="outlined" color="secondary" startIcon={<Icon name="eye" />} onClick={() => actions.onPreview(page)}>
                        Preview
                    </Button>
                </div>
                <Switch
                    checked={status === "published"}
                    disabled={status === "archived"}
                    onChange={(published) => actions.onStatusChange(page, published ? "published" : "unpublished")}
                    description={
                        status === "published"
                            ? "Live at the address above."
                            : status === "archived"
                              ? "Archived – restore it first."
                              : "Only visible in the admin."
                    }
                >
                    Published
                </Switch>
                <KeyValueList
                    items={[
                        { key: "Status", value: <StatusIndicator status={status} /> },
                        { key: "Template", value: isLink ? "External link" : (page.template ?? "Content page") },
                        {
                            key: "Changed",
                            value: (
                                <span className={styles.changedBy}>
                                    <Avatar name={editor} size="small" />
                                    {page.edited ?? "3 days ago"} by {editor}
                                </span>
                            ),
                        },
                        { key: "Subpages", value: countDescendants(page) },
                    ]}
                />
                {page.id === "newsroom" && (
                    <LinkedContent
                        href="#news"
                        icon={<Icon name="news" />}
                        title="News"
                        description={`${newsArticles.filter((article) => article.status === "published").length} articles are shown here`}
                    />
                )}
            </div>
        </Panel>
    );
}

/** The rows a person sees: all pages of expanded parents, or, while filtering, the pages that match. */
function collectVisibleIds(pages: SitePage[], expandedIds: string[], matches: ((page: SitePage) => boolean) | undefined): string[] {
    if (matches != null) {
        return flattenPages(pages)
            .filter(matches)
            .map((page) => page.id);
    }
    return pages.flatMap((page) => [
        page.id,
        ...(expandedIds.includes(page.id) ? collectVisibleIds(page.children ?? [], expandedIds, undefined) : []),
    ]);
}

function withCounts(nodes: SitePage[]): TreeNode[] {
    // The status shows as text with its menu at the end of the row instead of the tree's dot
    return nodes.map((page) => ({
        ...page,
        status: undefined,
        count: page.children != null && page.children.length > 0 ? countDescendants(page) : undefined,
        children: page.children && withCounts(page.children),
    }));
}

export function CmsPageTree() {
    const [pages, setPages] = useState<SitePage[]>(siteTree);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
    const [expandedIds, setExpandedIds] = useState(["home", "products"]);
    const [selectedId, setSelectedId] = useState("products");
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [copiedIds, setCopiedIds] = useState<string[]>([]);
    const [newPageDialog, setNewPageDialog] = useState({ key: 0, open: false, parentId: null as string | null });
    const [isCopyToScopeOpen, setIsCopyToScopeOpen] = useState(false);
    const { toasts, add: addToast, dismiss } = useToasts();
    const undoToast = useUndoToast({ addToast });
    const apple = useKeyboardShortcutPlatform() === "apple";

    const allPages = flattenPages(pages);
    const selected = allPages.find((page) => page.id === selectedId) ?? allPages[0];
    const checkedPages = allPages.filter((page) => checkedIds.includes(page.id));
    const expandableIds = getExpandableTreeNodeIds(pages);
    const matchesSearch = (page: TreeNode) => page.label.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = (page: TreeNode, value: ContentStatus | "all") => value === "all" || statusOf(page) === value;
    const countFor = (value: ContentStatus | "all") => allPages.filter((page) => matchesSearch(page) && matchesStatus(page, value)).length;
    const filtered = search.trim() !== "" || statusFilter !== "all";
    // Looks the page up, since the tree's nodes leave out the status, which the rows show themselves
    const matchesFilter = filtered
        ? (node: TreeNode) => {
              const page = allPages.find((candidate) => candidate.id === node.id);
              return page != null && matchesSearch(page) && matchesStatus(page, statusFilter);
          }
        : undefined;
    const visibleIds = collectVisibleIds(pages, expandedIds, matchesFilter);
    const checkedVisibleCount = visibleIds.filter((id) => checkedIds.includes(id)).length;

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

    function changeStatus(page: SitePage, status: ContentStatus) {
        const verb = page.status === "archived" && status === "unpublished" ? "restored" : status;
        change(setStatus(pages, [page.id], status), `“${page.label}” ${verb}`);
    }

    /** Publishing and unpublishing leave archived pages alone; they have to be restored first. */
    function bulkPublishAction(status: "published" | "unpublished", label: string): BulkActionBarAction {
        const eligible = checkedPages.filter((page) => statusOf(page) !== "archived" && statusOf(page) !== status);
        const skipped = checkedPages.filter((page) => statusOf(page) === "archived").length;
        return {
            label,
            icon: <Icon name={status === "published" ? "check" : "eye-off"} />,
            disabled: eligible.length === 0,
            disabledReason: eligible.length === 0 ? `The selected pages are already ${status} or archived` : undefined,
            onClick: () =>
                change(
                    setStatus(
                        pages,
                        eligible.map((page) => page.id),
                        status,
                    ),
                    `${nameOrCount(eligible)} ${status === "published" ? "live" : "unpublished"}${skipped > 0 ? `, ${skipped} archived skipped` : ""}`,
                    () => setCheckedIds([]),
                ),
        };
    }

    function copyToClipboard(ids: string[]) {
        setCopiedIds(ids);
        const copied = allPages.filter((page) => ids.includes(page.id));
        addToast({ message: `${nameOrCount(copied)} copied – paste from a page's menu`, color: "info" });
    }

    function paste(target: SitePage) {
        const { pages: nextPages, copyIds } = pastePages(pages, copiedIds, target.id);
        change(nextPages, `${describePages(copyIds.length)} pasted under “${target.label}”, unpublished`, () =>
            setExpandedIds((ids) => (ids.includes(target.id) ? ids : [...ids, target.id])),
        );
    }

    function deletePages(ids: string[]) {
        const deleted = allPages.filter((page) => ids.includes(page.id));
        const subpages = withDescendantIds(pages, ids).length - ids.length;
        const subject = subpages > 0 ? `${nameOrCount(deleted)} and ${describePages(subpages, "subpage")}` : nameOrCount(deleted);
        change(removePages(pages, ids), `${subject} deleted`, () => setCheckedIds((current) => current.filter((id) => !ids.includes(id))));
    }

    function openNewPageDialog(parentId: string | null) {
        setNewPageDialog((dialog) => ({ key: dialog.key + 1, open: true, parentId }));
    }

    const pageActions: PageActions = {
        onAddSubpage: (page) => openNewPageDialog(page.id),
        onPreview: (page) => addToast({ message: `The preview of “${page.label}” opens in a new tab`, color: "info" }),
        onDuplicate: (page) => {
            const { pages: nextPages, copyIds } = duplicatePages(pages, [page.id]);
            change(nextPages, `“${page.label}” duplicated, unpublished`, () => setSelectedId(copyIds[0]));
        },
        onCopy: (page) => copyToClipboard([page.id]),
        onPaste: paste,
        onMove: (page) => addToast({ message: `Choosing where to move “${page.label}” comes with drag and drop`, color: "info" }),
        onStatusChange: changeStatus,
        onDelete: (page) => deletePages([page.id]),
        copiedCount: copiedIds.filter((id) => findInTree(pages, id) != null).length,
    };

    const allHidden = checkedPages.length > 0 && checkedPages.every((page) => page.hiddenInMenu === true);
    const toArchive = checkedPages.filter((page) => statusOf(page) !== "archived");

    const bulkActions: BulkActionBarAction[] = [
        bulkPublishAction("published", "Publish"),
        bulkPublishAction("unpublished", "Unpublish"),
        {
            label: "Archive",
            icon: <Icon name="archive" />,
            disabled: toArchive.length === 0,
            disabledReason: toArchive.length === 0 ? "The selected pages are already archived" : undefined,
            onClick: () =>
                change(
                    setStatus(
                        pages,
                        toArchive.map((page) => page.id),
                        "archived",
                    ),
                    `${nameOrCount(toArchive)} archived`,
                    () => setCheckedIds([]),
                ),
        },
        {
            label: allHidden ? "Show in menu" : "Hide in menu",
            icon: <Icon name={allHidden ? "invisible-item-show" : "invisible-item-hide"} />,
            onClick: () =>
                change(
                    updatePages(pages, checkedIds, (page) => ({ ...page, hiddenInMenu: !allHidden })),
                    `${nameOrCount(checkedPages)} ${allHidden ? "shown in" : "hidden in"} the menu`,
                    () => setCheckedIds([]),
                ),
        },
        {
            label: "Copy",
            icon: <Icon name="copy" />,
            onClick: () => {
                copyToClipboard(checkedIds);
                setCheckedIds([]);
            },
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
            label: "Copy to scope",
            icon: <Icon name="globe" />,
            open: isCopyToScopeOpen,
            onOpenChange: setIsCopyToScopeOpen,
            menu: otherScopes.map((scope) => (
                <MenuItem
                    key={scope}
                    label={scope}
                    onClick={() => {
                        addToast({ message: `${nameOrCount(checkedPages)} copied to ${scope}, unpublished` });
                        setCheckedIds([]);
                    }}
                />
            )),
        },
        { label: "Delete", icon: <Icon name="trash" />, color: "error", onClick: () => deletePages(checkedIds) },
    ];

    const emptyTitle =
        search.trim() !== "" && statusFilter !== "all"
            ? `No ${statusFilter} page is called “${search.trim()}”`
            : search.trim() !== ""
              ? `No page is called “${search.trim()}”`
              : `No page is ${statusFilter}`;

    return (
        <PageTypeShell currentId="page-tree">
            <TreeDetailLayout
                header={
                    <PageHeader
                        eyebrow={`Austria · German · ${allPages.length} pages`}
                        title="Page tree"
                        subtitle={`${allPages.filter((page) => statusOf(page) === "unpublished").length} unpublished · ${allPages.filter((page) => statusOf(page) === "archived").length} archived`}
                        primaryAction={{ label: "New page", icon: <Icon name="plus" />, onClick: () => openNewPageDialog(selected?.id ?? null) }}
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={search}
                        onSearchChange={setSearch}
                        labels={{ search: "Filter pages", searchPlaceholder: "Filter pages" }}
                        start={
                            <Checkbox
                                aria-label="Select all visible pages"
                                checked={visibleIds.length > 0 && checkedVisibleCount === visibleIds.length}
                                indeterminate={checkedVisibleCount > 0 && checkedVisibleCount < visibleIds.length}
                                disabled={visibleIds.length === 0}
                                onChange={(checked) =>
                                    setCheckedIds((current) =>
                                        checked ? [...new Set([...current, ...visibleIds])] : current.filter((id) => !visibleIds.includes(id)),
                                    )
                                }
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
                detail={selected != null && <PageDetail page={selected} pages={pages} actions={pageActions} />}
                detailLabel={selected?.label ?? "Page"}
            >
                {filtered && visibleIds.length === 0 ? (
                    <EmptyState
                        icon={<Icon name="page-search" />}
                        title={emptyTitle}
                        actions={
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("all");
                                }}
                            >
                                Clear filter
                            </Button>
                        }
                    />
                ) : (
                    <TreeView
                        aria-label="Pages"
                        className={styles.pageTree}
                        nodes={withCounts(pages)}
                        expandedIds={expandedIds}
                        onExpandedChange={setExpandedIds}
                        selectedId={selected?.id}
                        onSelect={setSelectedId}
                        onOpen={(id) => {
                            window.location.hash = `page-tree/${id}`;
                        }}
                        checkable
                        checkedIds={checkedIds}
                        onCheckedChange={setCheckedIds}
                        filter={matchesFilter}
                        onKeyDown={(event) => {
                            const id = (event.target as HTMLElement).dataset.id;
                            const page = id != null ? findInTree(pages, id) : undefined;
                            if (page == null) {
                                return;
                            }
                            if (matchesKeyboardShortcut(event, "mod+c", apple)) {
                                event.preventDefault();
                                copyToClipboard(checkedIds.includes(page.id) ? checkedIds : [page.id]);
                            } else if (matchesKeyboardShortcut(event, "mod+v", apple) && pageActions.copiedCount > 0) {
                                event.preventDefault();
                                paste(page);
                            }
                        }}
                        renderActions={(node) => {
                            const page = allPages.find((candidate) => candidate.id === node.id);
                            if (page == null) {
                                return null;
                            }
                            return (
                                <>
                                    <PageStatusMenu page={page} onChange={(status) => changeStatus(page, status)} />
                                    <span className={styles.rowButtons}>
                                        <IconButton
                                            aria-label="Add subpage"
                                            variant="text"
                                            color="secondary"
                                            size="small"
                                            className={styles.addSubpage}
                                            onClick={() => pageActions.onAddSubpage(page)}
                                        >
                                            <Icon name="plus" />
                                        </IconButton>
                                        <PageActionsMenu
                                            page={page}
                                            actions={pageActions}
                                            trigger={
                                                <IconButton aria-label="Actions" variant="text" color="secondary" size="small">
                                                    <Icon name="more-horizontal" />
                                                </IconButton>
                                            }
                                        />
                                    </span>
                                </>
                            );
                        }}
                    />
                )}
            </TreeDetailLayout>
            <BulkActionBar count={checkedIds.length} onClear={() => setCheckedIds([])} actions={bulkActions} />
            <NewPageDialog
                key={newPageDialog.key}
                open={newPageDialog.open}
                onOpenChange={(open) => setNewPageDialog((dialog) => ({ ...dialog, open }))}
                pages={pages}
                defaultParentId={newPageDialog.parentId}
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
