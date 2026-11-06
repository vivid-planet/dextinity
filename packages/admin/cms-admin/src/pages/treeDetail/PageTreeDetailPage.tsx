import { useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, useEditDialog, useFocusAwarePolling, useStoredState } from "@dextinity/admin";
import {
    BulkActionBar,
    Button,
    Checkbox,
    EmptyState,
    FilterBar,
    FilterChip,
    Icon,
    IconButton,
    PageHeader,
    Panel,
    Skeleton,
    ToastViewport,
    TreeDetailLayout,
    type TreeNode,
    TreeView,
    useToasts,
    useUndoToast,
} from "@dextinity/ui";
import { DialogContent } from "@mui/material";
import { type ComponentType, type MouseEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Route, useHistory, useLocation, useRouteMatch } from "react-router-dom";

import { type ContentScope, useContentScope } from "../../contentScope/Provider";
import { useContentScopeConfig } from "../../contentScope/useContentScopeConfig";
import { DamScopeProvider } from "../../dam/config/DamScopeProvider";
import type { DocumentInterface, DocumentType } from "../../documents/types";
import { serializeInitialValues } from "../../form/serializeInitialValues";
import type { GQLPageTreeNodeVisibility } from "../../graphql.generated";
import { openSitePreviewWindow } from "../../preview/openSitePreviewWindow";
import { useSiteConfig } from "../../siteConfigs/useSiteConfig";
import { usePageTreeScope } from "../config/usePageTreeScope";
import { createEditPageNode, type EditPageNodeProps } from "../createEditPageNode";
import { createPagesQuery, type GQLPagesQuery, type GQLPagesQueryVariables, type GQLPageTreePageFragment } from "../pagesPage/createPagesQuery";
import { PageTreeContext } from "../pageTree/PageTreeContext";
import { arrayToTreeMap } from "../pageTree/treemap/TreeMapUtils";
import { usePageTreeConfig } from "../pageTreeConfig";
import { PageEditorRoute } from "./PageEditorRoute";
import { PageTreeNodeDetail } from "./PageTreeNodeDetail";
import { usePageTreeStatusLabels, visibilityStatus } from "./pageTreeStatus";
import { createPageTreeStructure, getAncestorIds, isHomePage, type PageTreeStructure } from "./pageTreeStructure";
import { selectedPageParam } from "./selectedPageParam";
import { usePageTreeDetailActions } from "./usePageTreeDetailActions";

type StatusFilter = GQLPageTreeNodeVisibility | "all";

const statusFilters: StatusFilter[] = ["all", "Published", "Unpublished", "Archived"];

const DefaultEditPageNode = createEditPageNode({});

export interface PageTreeDetailPageProps {
    /** The page tree category, e.g. `"mainNavigation"`. */
    category: string;
    /** The URL path of the page tree, used to return to it after a content scope change. */
    path: string;
    /** The document types that pages of this category can have. */
    documentTypes: Record<DocumentType, DocumentInterface> | ((category: string) => Record<DocumentType, DocumentInterface>);
    /** The form for adding a page and editing its properties. */
    editPageNode?: ComponentType<EditPageNodeProps>;
    /** @deprecated Unused, the page editor is no longer the one of `PagesPage`. */
    renderContentScopeIndicator?: (scope: ContentScope) => ReactNode;
    /** The title of the page header. */
    title?: string;
    /** The label above the title, e.g. the category. */
    eyebrow?: ReactNode;
}

/**
 * The page tree as a tree with the detail of the selected page next to it, built with `@dextinity/ui`. Editing a page's content opens
 * the editor of its document type at `<url>/<pageId>/edit`, which can read the page through `usePageEditorContext`.
 */
export function PageTreeDetailPage(props: PageTreeDetailPageProps) {
    const match = useRouteMatch();
    const editorPath = `${match.path}/:pageId/edit`;
    const editorMatch = useRouteMatch<{ pageId: string }>(editorPath);
    const { setRedirectPathAfterChange } = useContentScope();
    useContentScopeConfig({ redirectPathAfterChange: props.path });

    useEffect(() => {
        setRedirectPathAfterChange(props.path);
        return () => setRedirectPathAfterChange(undefined);
    }, [setRedirectPathAfterChange, props.path]);

    if (editorMatch != null) {
        const { documentTypes, category } = props;
        return (
            <Route path={editorPath}>
                <PageEditorRoute
                    pageId={editorMatch.params.pageId}
                    category={category}
                    documentTypes={typeof documentTypes === "function" ? documentTypes(category) : documentTypes}
                    getDocumentTypesByCategory={typeof documentTypes === "function" ? documentTypes : undefined}
                    pageTreeUrl={match.url}
                />
            </Route>
        );
    }

    return (
        <DamScopeProvider>
            <PageTreeDetailView {...props} url={match.url} />
        </DamScopeProvider>
    );
}

function createTreeNodes(structure: PageTreeStructure, parentId: string | null = null): TreeNode[] {
    return (structure.childrenByParentId.get(parentId) ?? []).map((page) => {
        const children = createTreeNodes(structure, page.id);
        return {
            id: page.id,
            label: page.name,
            type: children.length > 0 ? "folder" : "page",
            icon: parentId == null && isHomePage(page) ? <Icon name="home" /> : undefined,
            status: visibilityStatus[page.visibility],
            path: page.path,
            hiddenInMenu: page.hideInMenu,
            children: children.length > 0 ? children : undefined,
        };
    });
}

function matchesSearch(page: GQLPageTreePageFragment, search: string) {
    const query = search.trim().toLowerCase();
    return query === "" || page.name.toLowerCase().includes(query) || page.path.toLowerCase().includes(query);
}

interface PageTreeDetailViewProps extends Omit<PageTreeDetailPageProps, "path" | "renderContentScopeIndicator"> {
    url: string;
}

function PageTreeDetailView({
    category,
    documentTypes: passedDocumentTypes,
    editPageNode: EditPageNode = DefaultEditPageNode,
    title,
    eyebrow,
    url,
}: PageTreeDetailViewProps) {
    const intl = useIntl();
    const history = useHistory();
    const location = useLocation();
    const { scope, match: contentScopeMatch } = useContentScope();
    const pageTreeScope = usePageTreeScope();
    const siteConfig = useSiteConfig({ scope });
    const { additionalPageTreeNodeFragment } = usePageTreeConfig();
    const statusLabels = usePageTreeStatusLabels();
    const documentTypes = typeof passedDocumentTypes === "function" ? passedDocumentTypes(category) : passedDocumentTypes;
    const pagesQuery = useMemo(() => createPagesQuery({ additionalPageTreeNodeFragment }), [additionalPageTreeNodeFragment]);
    const { data, loading, error, refetch, startPolling, stopPolling } = useQuery<GQLPagesQuery, GQLPagesQueryVariables>(pagesQuery, {
        fetchPolicy: "cache-and-network",
        variables: { contentScope: pageTreeScope, category },
        context: LocalErrorScopeApolloContext,
    });
    useFocusAwarePolling({ pollInterval: 10000, refetch, startPolling, stopPolling });

    const pages = useMemo(() => data?.pages ?? [], [data]);
    const structure = useMemo(() => createPageTreeStructure(pages), [pages]);
    const treeNodes = useMemo(() => createTreeNodes(structure), [structure]);
    const tree = useMemo(() => arrayToTreeMap([...pages].sort((pageA, pageB) => pageA.pos - pageB.pos)), [pages]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [expandedIds, setExpandedIds] = useStoredState<string[]>("pageTreeExpandedIds", [], window.sessionStorage);
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [EditDialog, editDialogSelection, editDialogApi] = useEditDialog();

    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const { perform, block } = useUndoToast({
        addToast,
        labels: { undo: intl.formatMessage({ id: "dextinity.pageTreeDetail.undo", defaultMessage: "Undo" }) },
    });
    const { changeVisibility, movePages, canMove } = usePageTreeDetailActions({ structure, perform, block });

    const selectedIdParam = new URLSearchParams(location.search).get(selectedPageParam);
    const selectedPage =
        (selectedIdParam != null ? structure.pagesById.get(selectedIdParam) : undefined) ?? structure.childrenByParentId.get(null)?.[0];

    const selectPage = useCallback(
        (id: string) => {
            const searchParams = new URLSearchParams(location.search);
            searchParams.set(selectedPageParam, id);
            history.replace({ ...location, search: searchParams.toString() });
        },
        [history, location],
    );

    const revealedPageIdRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (selectedIdParam == null || revealedPageIdRef.current === selectedIdParam || !structure.pagesById.has(selectedIdParam)) {
            return;
        }
        revealedPageIdRef.current = selectedIdParam;
        const ancestorIds = getAncestorIds(structure, selectedIdParam);
        setExpandedIds((ids) => [...ids, ...ancestorIds.filter((id) => !ids.includes(id))]);
    }, [selectedIdParam, structure, setExpandedIds]);

    const editUrl = (pageId: string) => `${url}/${pageId}/edit`;
    const openEditor = (pageId: string) => {
        const page = structure.pagesById.get(pageId);
        if (page != null && page.visibility !== "Archived" && documentTypes[page.documentType]?.editComponent != null) {
            history.push(editUrl(pageId));
        }
    };
    const handleEditClick = (event: MouseEvent<HTMLElement>) => {
        const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
        const href = event.currentTarget.getAttribute("href");
        if (href != null && !isModifiedClick) {
            event.preventDefault();
            history.push(href);
        }
    };

    const matchesFilters = (page: GQLPageTreePageFragment, status: StatusFilter) =>
        matchesSearch(page, search) && (status === "all" || page.visibility === status);
    const countFor = (status: StatusFilter) => pages.filter((page) => matchesFilters(page, status)).length;
    const isFiltered = search.trim() !== "" || statusFilter !== "all";
    const filteredCount = isFiltered ? countFor(statusFilter) : undefined;
    const visiblePageIds = pages.filter((page) => matchesFilters(page, statusFilter)).map((page) => page.id);
    const areAllVisiblePagesChecked =
        visiblePageIds.length > 0 && checkedIds.length === visiblePageIds.length && visiblePageIds.every((id) => checkedIds.includes(id));
    const folderIds = pages.filter((page) => structure.childrenByParentId.has(page.id)).map((page) => page.id);
    const unpublishedCount = pages.filter((page) => page.visibility === "Unpublished").length;
    const archivedCount = pages.filter((page) => page.visibility === "Archived").length;

    const statusFilterLabels: Record<StatusFilter, string> = {
        all: intl.formatMessage({ id: "dextinity.pageTreeDetail.filter.all", defaultMessage: "All" }),
        Published: statusLabels.published,
        Unpublished: statusLabels.unpublished,
        Archived: statusLabels.archived,
    };

    const isInitialLoad = loading && data == null;
    if (error != null && data == null) {
        throw error;
    }

    const newPageButton = (
        <Button startIcon={<Icon name="plus" />} onClick={() => editDialogApi.openAddDialog()}>
            {intl.formatMessage({ id: "dextinity.pageTreeDetail.newPage", defaultMessage: "New page" })}
        </Button>
    );

    const renderTree = () => {
        if (isInitialLoad) {
            return <Skeleton variant="row" count={6} />;
        }
        if (pages.length === 0) {
            return (
                <EmptyState
                    icon={<Icon name="file" />}
                    title={intl.formatMessage({ id: "dextinity.pageTreeDetail.empty.title", defaultMessage: "No pages yet" })}
                    description={intl.formatMessage({
                        id: "dextinity.pageTreeDetail.empty.description",
                        defaultMessage: "Pages you add appear here as a tree.",
                    })}
                    actions={newPageButton}
                />
            );
        }
        if (filteredCount === 0) {
            return (
                <EmptyState
                    icon={<Icon name="search" />}
                    title={intl.formatMessage({ id: "dextinity.pageTreeDetail.noMatches.title", defaultMessage: "No matching pages" })}
                    description={intl.formatMessage({
                        id: "dextinity.pageTreeDetail.noMatches.description",
                        defaultMessage: "Try a different search or status.",
                    })}
                    actions={
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("all");
                            }}
                        >
                            {intl.formatMessage({ id: "dextinity.pageTreeDetail.resetFilters", defaultMessage: "Reset filters" })}
                        </Button>
                    }
                />
            );
        }
        return (
            <TreeView
                aria-label={intl.formatMessage({ id: "dextinity.pageTreeDetail.tree", defaultMessage: "Pages" })}
                nodes={treeNodes}
                expandedIds={expandedIds}
                onExpandedChange={setExpandedIds}
                selectedId={selectedPage?.id}
                onSelect={selectPage}
                onOpen={openEditor}
                checkable
                checkedIds={checkedIds}
                onCheckedChange={setCheckedIds}
                filter={
                    isFiltered
                        ? (node) => {
                              const page = structure.pagesById.get(node.id);
                              return page != null && matchesFilters(page, statusFilter);
                          }
                        : undefined
                }
                draggable
                onMove={(move) => movePages(move, checkedIds)}
                canDrop={(move) => canMove(move, checkedIds)}
                labels={{
                    hiddenInMenu: intl.formatMessage({ id: "dextinity.pageTreeDetail.hiddenInMenu", defaultMessage: "Hidden in menu" }),
                }}
            />
        );
    };

    return (
        <PageTreeContext.Provider
            value={{
                currentCategory: category,
                getDocumentTypesByCategory: typeof passedDocumentTypes === "function" ? passedDocumentTypes : undefined,
                tree,
                query: pagesQuery,
            }}
        >
            <TreeDetailLayout
                header={
                    <PageHeader
                        eyebrow={eyebrow}
                        title={title ?? intl.formatMessage({ id: "dextinity.pageTreeDetail.title", defaultMessage: "Page tree" })}
                        subtitle={
                            isInitialLoad
                                ? undefined
                                : intl.formatMessage(
                                      {
                                          id: "dextinity.pageTreeDetail.subtitle",
                                          defaultMessage:
                                              "{count, plural, one {# page} other {# pages}}{unpublished, plural, =0 {} other { · # unpublished}}{archived, plural, =0 {} other { · # archived}}",
                                      },
                                      { count: pages.length, unpublished: unpublishedCount, archived: archivedCount },
                                  )
                        }
                        actions={newPageButton}
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={search}
                        onSearchChange={setSearch}
                        resultCount={filteredCount}
                        labels={{
                            search: intl.formatMessage({ id: "dextinity.pageTreeDetail.search", defaultMessage: "Search pages" }),
                            searchPlaceholder: intl.formatMessage({
                                id: "dextinity.pageTreeDetail.searchPlaceholder",
                                defaultMessage: "Search name or path",
                            }),
                            filters: intl.formatMessage({ id: "dextinity.pageTreeDetail.filters", defaultMessage: "Filters" }),
                            resultCount: (count) =>
                                intl.formatMessage(
                                    { id: "dextinity.pageTreeDetail.resultCount", defaultMessage: "{count, plural, one {# page} other {# pages}}" },
                                    { count },
                                ),
                        }}
                        actions={
                            <>
                                <IconButton
                                    variant="text"
                                    color="secondary"
                                    aria-label={intl.formatMessage({ id: "dextinity.pageTreeDetail.expandAll", defaultMessage: "Expand all" })}
                                    onClick={() => setExpandedIds(folderIds)}
                                >
                                    <Icon name="maximize" />
                                </IconButton>
                                <IconButton
                                    variant="text"
                                    color="secondary"
                                    aria-label={intl.formatMessage({ id: "dextinity.pageTreeDetail.collapseAll", defaultMessage: "Collapse all" })}
                                    onClick={() => setExpandedIds([])}
                                    disabled={expandedIds.length === 0}
                                >
                                    <Icon name="minimize" />
                                </IconButton>
                            </>
                        }
                    >
                        <Checkbox
                            aria-label={intl.formatMessage({ id: "dextinity.pageTreeDetail.selectAll", defaultMessage: "Select all pages" })}
                            checked={areAllVisiblePagesChecked}
                            indeterminate={checkedIds.length > 0 && !areAllVisiblePagesChecked}
                            onChange={(checked) => setCheckedIds(checked ? visiblePageIds : [])}
                            disabled={visiblePageIds.length === 0}
                        />
                        {statusFilters.map((status) => (
                            <FilterChip
                                key={status}
                                selected={statusFilter === status}
                                onClick={() => setStatusFilter(status)}
                                count={countFor(status)}
                                status={status === "all" ? undefined : visibilityStatus[status]}
                            >
                                {statusFilterLabels[status]}
                            </FilterChip>
                        ))}
                    </FilterBar>
                }
                detail={
                    selectedPage != null ? (
                        <PageTreeNodeDetail
                            page={selectedPage}
                            documentType={documentTypes[selectedPage.documentType]}
                            siteUrl={siteConfig.url}
                            editUrl={editUrl(selectedPage.id)}
                            onEditClick={handleEditClick}
                            onPreviewClick={() => openSitePreviewWindow(selectedPage.path, contentScopeMatch.url)}
                            onVisibilityChange={(visibility) => changeVisibility([selectedPage.id], visibility)}
                            onPropertiesClick={() => editDialogApi.openEditDialog(selectedPage.id)}
                            onAddSubpageClick={() => editDialogApi.openAddDialog(serializeInitialValues({ parent: selectedPage.id }))}
                        />
                    ) : isInitialLoad ? (
                        <Panel>
                            <Skeleton variant="block" />
                        </Panel>
                    ) : null
                }
                detailLabel={selectedPage?.name}
            >
                <Panel>{renderTree()}</Panel>
            </TreeDetailLayout>
            <BulkActionBar
                count={checkedIds.length}
                onClear={() => setCheckedIds([])}
                labels={{
                    count: (count) =>
                        intl.formatMessage({ id: "dextinity.pageTreeDetail.bulk.count", defaultMessage: "{count} selected" }, { count }),
                    clear: intl.formatMessage({ id: "dextinity.pageTreeDetail.bulk.clear", defaultMessage: "Clear selection" }),
                    toolbar: intl.formatMessage({ id: "dextinity.pageTreeDetail.bulk.toolbar", defaultMessage: "Bulk actions" }),
                }}
                actions={(["Published", "Unpublished", "Archived"] as const).map((visibility) => ({
                    label: intl.formatMessage(
                        {
                            id: "dextinity.pageTreeDetail.bulk.changeVisibility",
                            defaultMessage: "{visibility, select, Published {Publish} Unpublished {Unpublish} other {Archive}}",
                        },
                        { visibility },
                    ),
                    icon: <Icon name={visibility === "Published" ? "visible" : visibility === "Unpublished" ? "invisible" : "archive"} />,
                    onClick: () => {
                        changeVisibility(checkedIds, visibility);
                        setCheckedIds([]);
                    },
                }))}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.pageTreeDetail.notifications", defaultMessage: "Notifications" }) }}
            />
            <EditDialog>
                <DialogContent>
                    <EditPageNode
                        id={editDialogSelection.id || null}
                        mode={editDialogSelection.mode ?? "add"}
                        category={category}
                        documentTypes={documentTypes}
                    />
                </DialogContent>
            </EditDialog>
        </PageTreeContext.Provider>
    );
}
