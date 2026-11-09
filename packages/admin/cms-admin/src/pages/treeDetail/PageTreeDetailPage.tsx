import { useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, useFocusAwarePolling, useStoredState } from "@dextinity/admin";
import {
    BulkActionBar,
    type BulkActionBarAction,
    Button,
    Checkbox,
    EmptyState,
    FilterBar,
    FilterChip,
    getExpandableTreeNodeIds,
    Icon,
    matchesShortcut,
    MenuItem,
    PageHeader,
    Panel,
    Skeleton,
    ToastViewport,
    TreeDetailLayout,
    type TreeNode,
    TreeView,
    TreeViewExpandButtons,
    useToasts,
    useUndoToast,
} from "@dextinity/ui";
import { type ComponentType, type KeyboardEvent, type MouseEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Route, useHistory, useLocation, useRouteMatch } from "react-router-dom";

import { ProgressDialog } from "../../common/useProgressDialog";
import { type ContentScope, useContentScope } from "../../contentScope/Provider";
import { useContentScopeConfig } from "../../contentScope/useContentScopeConfig";
import { DamScopeProvider } from "../../dam/config/DamScopeProvider";
import type { DocumentInterface, DocumentType } from "../../documents/types";
import type { GQLPageTreeNodeVisibility } from "../../graphql.generated";
import { openSitePreviewWindow } from "../../preview/openSitePreviewWindow";
import { useSiteConfig } from "../../siteConfigs/useSiteConfig";
import { usePageTreeScope } from "../config/usePageTreeScope";
import { createEditPageNode, type EditPageNodeInitialValues, type EditPageNodeProps } from "../createEditPageNode";
import { createPagesQuery, type GQLPagesQuery, type GQLPagesQueryVariables, type GQLPageTreePageFragment } from "../pagesPage/createPagesQuery";
import { categorySupportsDocumentType } from "../pageTree/categorySupportsDocumentType";
import { PageTreeContext } from "../pageTree/PageTreeContext";
import { arrayToTreeMap } from "../pageTree/treemap/TreeMapUtils";
import { useTranslatePagesAction } from "../pageTree/useTranslatePagesAction";
import { usePageTreeConfig } from "../pageTreeConfig";
import { getCategoryLabelText } from "./getCategoryLabelText";
import { PageDeleteConfirmDialog } from "./PageDeleteConfirmDialog";
import { PageEditorRoute } from "./PageEditorRoute";
import { PageTreeNodeDetail } from "./PageTreeNodeDetail";
import { PageTreeNodeMenu, type PageTreeNodeMenuCategory } from "./PageTreeNodeMenu";
import { pageTreeShortcuts } from "./pageTreeShortcuts";
import { usePageTreeStatusLabels, visibilityStatus } from "./pageTreeStatus";
import { createPageTreeStructure, getAncestorIds, getSubtree, getTopmostPageIds, isHomePage, type PageTreeStructure } from "./pageTreeStructure";
import { selectedPageParam } from "./selectedPageParam";
import { type PastePosition, usePageTreeCopyPaste } from "./usePageTreeCopyPaste";
import { areSubtreesComplete, getPagesToDelete, usePageTreeDetailActions } from "./usePageTreeDetailActions";

type StatusFilter = GQLPageTreeNodeVisibility | "all";

const statusFilters: StatusFilter[] = ["all", "Published", "Unpublished", "Archived"];

const DefaultEditPageNode = createEditPageNode({});

type PageNodeDialogTarget = { mode: "add"; initialValues?: EditPageNodeInitialValues } | { mode: "edit"; id: string };

interface DeleteTarget {
    pageIds: string[];
    /** The page the deletion started from in its menu, as opposed to the checked pages. */
    page?: GQLPageTreePageFragment;
}

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
    /**
     * The URL path of another category's page tree within the content scope, like `path`. With it, the message after moving a page to
     * another category links there.
     */
    getCategoryUrl?: (category: string) => string;
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
        const { documentTypes, category, editPageNode = DefaultEditPageNode } = props;
        return (
            <Route path={editorPath}>
                <PageEditorRoute
                    pageId={editorMatch.params.pageId}
                    category={category}
                    documentTypes={typeof documentTypes === "function" ? documentTypes(category) : documentTypes}
                    getDocumentTypesByCategory={typeof documentTypes === "function" ? documentTypes : undefined}
                    pageTreeUrl={match.url}
                    editPageNode={editPageNode}
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

function countDescendants(nodes: TreeNode[]): number {
    return nodes.reduce((count, node) => count + 1 + countDescendants(node.children ?? []), 0);
}

function createTreeNodes(structure: PageTreeStructure, parentId: string | null = null): TreeNode[] {
    return (structure.childrenByParentId.get(parentId) ?? []).map((page) => {
        const children = createTreeNodes(structure, page.id);
        return {
            id: page.id,
            label: page.name,
            type: page.documentType === "Link" ? "link" : undefined,
            icon: parentId == null && isHomePage(page) ? <Icon name="home" /> : undefined,
            status: visibilityStatus[page.visibility],
            path: page.path,
            hiddenInMenu: page.hideInMenu,
            count: children.length > 0 ? countDescendants(children) : undefined,
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
    getCategoryUrl,
}: PageTreeDetailViewProps) {
    const intl = useIntl();
    const history = useHistory();
    const location = useLocation();
    const { scope, match: contentScopeMatch } = useContentScope();
    const pageTreeScope = usePageTreeScope();
    const siteConfig = useSiteConfig({ scope });
    const { additionalPageTreeNodeFragment, categories, allowPageDelete = true } = usePageTreeConfig();
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
    const [isPageNodeDialogOpen, setIsPageNodeDialogOpen] = useState(false);
    const [pageNodeDialogTarget, setPageNodeDialogTarget] = useState<PageNodeDialogTarget>({ mode: "add" });
    const openPageNodeDialog = (target: PageNodeDialogTarget) => {
        setPageNodeDialogTarget(target);
        setIsPageNodeDialogOpen(true);
    };

    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const { perform, block } = useUndoToast({
        addToast,
        labels: { undo: intl.formatMessage({ id: "dextinity.pageTreeDetail.undo", defaultMessage: "Undo" }) },
    });
    const { changeVisibility, movePages, canMove, deletePages, moveToCategory } = usePageTreeDetailActions({ structure, perform, block });
    const showError = (message: string) => addToast({ message, tone: "error" });
    const copyPaste = usePageTreeCopyPaste({
        structure,
        category,
        onPasteError: () =>
            showError(intl.formatMessage({ id: "dextinity.pageTreeDetail.pasteFailed", defaultMessage: "The pages could not be pasted" })),
    });
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>();
    const [isBulkMoveMenuOpen, setIsBulkMoveMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const selectedPageTranslation = useTranslatePagesAction({ pages: selectedPage != null ? [selectedPage] : [], documentTypes });
    const checkedPages = checkedIds.flatMap((id) => structure.pagesById.get(id) ?? []);
    const checkedPagesTranslation = useTranslatePagesAction({ pages: checkedPages, documentTypes });

    const copyPages = async (pageIds: string[]) => {
        try {
            const count = await copyPaste.copyPages(pageIds);
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.pageTreeDetail.copied", defaultMessage: "{count, plural, one {# page} other {# pages}} copied" },
                    { count },
                ),
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.pageTreeDetail.copyFailed", defaultMessage: "The pages could not be copied" }));
        }
    };

    const pastePages = async (target: GQLPageTreePageFragment, position: PastePosition) => {
        const count = await copyPaste.pastePages(target, position);
        if (count === 0) {
            return;
        }
        if (position === "inside") {
            setExpandedIds((ids) => (ids.includes(target.id) ? ids : [...ids, target.id]));
        }
        addToast({
            message: intl.formatMessage(
                { id: "dextinity.pageTreeDetail.pasted", defaultMessage: "{count, plural, one {# page} other {# pages}} pasted" },
                { count },
            ),
        });
    };

    const duplicatePage = async (page: GQLPageTreePageFragment) => {
        try {
            if (await copyPaste.duplicatePage(page)) {
                addToast({
                    message: intl.formatMessage(
                        { id: "dextinity.pageTreeDetail.duplicated", defaultMessage: "“{name}” duplicated" },
                        { name: page.name },
                    ),
                });
            }
        } catch {
            showError(intl.formatMessage({ id: "dextinity.pageTreeDetail.duplicateFailed", defaultMessage: "The page could not be duplicated" }));
        }
    };

    const duplicatePages = async (pagesToDuplicate: GQLPageTreePageFragment[]) => {
        try {
            const count = await copyPaste.duplicatePages(pagesToDuplicate);
            if (count > 0) {
                addToast({
                    message: intl.formatMessage(
                        {
                            id: "dextinity.pageTreeDetail.duplicatedPages",
                            defaultMessage: "{count, plural, one {# page} other {# pages}} duplicated",
                        },
                        { count },
                    ),
                });
            }
        } catch {
            showError(
                intl.formatMessage({ id: "dextinity.pageTreeDetail.duplicatePagesFailed", defaultMessage: "Not all pages could be duplicated" }),
            );
        }
    };

    const getMoveCategories = (pagesToMove: GQLPageTreePageFragment[]): PageTreeNodeMenuCategory[] =>
        categories.length > 1
            ? categories
                  .filter((otherCategory) => otherCategory.category !== category)
                  .map((otherCategory) => ({
                      category: otherCategory.category,
                      label: getCategoryLabelText(otherCategory, intl),
                      disabledReason: pagesToMove.every((page) =>
                          categorySupportsDocumentType(
                              otherCategory.category,
                              page.documentType,
                              typeof passedDocumentTypes === "function" ? passedDocumentTypes : undefined,
                          ),
                      )
                          ? undefined
                          : pagesToMove.length > 1
                            ? intl.formatMessage({
                                  id: "dextinity.pageTreeDetail.categoryUnsupportedForSome",
                                  defaultMessage: "This category has no pages of the type of some selected pages",
                              })
                            : intl.formatMessage({
                                  id: "dextinity.pageTreeDetail.categoryUnsupported",
                                  defaultMessage: "This category has no pages of this type",
                              }),
                  }))
            : [];

    const movePagesToCategory = async (pagesToMove: GQLPageTreePageFragment[], targetCategory: string) => {
        const targetCategoryConfig = categories.find((otherCategory) => otherCategory.category === targetCategory);
        const movedPages: GQLPageTreePageFragment[] = [];
        try {
            for (const page of pagesToMove) {
                await moveToCategory(page, targetCategory);
                movedPages.push(page);
            }
        } catch {
            showError(
                pagesToMove.length > 1
                    ? intl.formatMessage({ id: "dextinity.pageTreeDetail.movePagesCategoryFailed", defaultMessage: "Not all pages could be moved" })
                    : intl.formatMessage({ id: "dextinity.pageTreeDetail.moveCategoryFailed", defaultMessage: "The page could not be moved" }),
            );
            if (movedPages.length === 0) {
                return;
            }
        }
        const movedIds = new Set(movedPages.map((page) => page.id));
        setCheckedIds((ids) =>
            ids.filter((id) => !movedIds.has(id) && !getAncestorIds(structure, id).some((ancestorId) => movedIds.has(ancestorId))),
        );
        const categoryLabel = targetCategoryConfig != null ? getCategoryLabelText(targetCategoryConfig, intl) : targetCategory;
        addToast({
            message:
                movedPages.length === 1
                    ? intl.formatMessage(
                          { id: "dextinity.pageTreeDetail.movedToCategory", defaultMessage: "“{name}” moved to {category}" },
                          { name: movedPages[0].name, category: categoryLabel },
                      )
                    : intl.formatMessage(
                          {
                              id: "dextinity.pageTreeDetail.movedPagesToCategory",
                              defaultMessage: "{count, plural, one {# page} other {# pages}} moved to {category}",
                          },
                          { count: movedPages.length, category: categoryLabel },
                      ),
            action:
                getCategoryUrl != null
                    ? {
                          label: intl.formatMessage({ id: "dextinity.pageTreeDetail.showMovedPage", defaultMessage: "Show" }),
                          onClick: () =>
                              history.push(`${contentScopeMatch.url}${getCategoryUrl(targetCategory)}?${selectedPageParam}=${movedPages[0].id}`),
                      }
                    : undefined,
        });
    };

    const getTranslateDisabledReason = (translation: { translating: boolean; hasTranslatableContent: boolean }, pageCount: number) => {
        if (translation.translating) {
            return intl.formatMessage({ id: "dextinity.pageTreeDetail.translating", defaultMessage: "A translation is running" });
        }
        if (!translation.hasTranslatableContent) {
            return pageCount > 1
                ? intl.formatMessage({
                      id: "dextinity.pageTreeDetail.noTranslatablePages",
                      defaultMessage: "None of the selected pages is translatable, archived pages and pages without translatable content are skipped",
                  })
                : intl.formatMessage({
                      id: "dextinity.pageTreeDetail.noTranslatablePage",
                      defaultMessage: "This page has no translatable content",
                  });
        }
        return undefined;
    };

    const notFullySelectedReason = intl.formatMessage({
        id: "dextinity.pageTreeDetail.deleteNeedsSubpages",
        defaultMessage: "Select the subpages too, to delete pages with them",
    });
    const homePageReason = intl.formatMessage({ id: "dextinity.pageTreeDetail.deleteHomePage", defaultMessage: "The home page can't be deleted" });
    const getDeleteDisabledReason = (pageIds: string[]) => {
        if (getPagesToDelete(structure, pageIds).some(isHomePage)) {
            return homePageReason;
        }
        return areSubtreesComplete(structure, pageIds) ? undefined : notFullySelectedReason;
    };
    const pagesToDelete = deleteTarget != null ? getPagesToDelete(structure, deleteTarget.pageIds) : [];

    const confirmDelete = async () => {
        if (deleteTarget == null) {
            return;
        }
        const deletedIds = new Set(pagesToDelete.map((page) => page.id));
        const parentToSelect =
            selectedPage != null && deletedIds.has(selectedPage.id)
                ? getAncestorIds(structure, selectedPage.id).find((ancestorId) => !deletedIds.has(ancestorId))
                : undefined;
        setIsDeleting(true);
        try {
            await deletePages(pagesToDelete);
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.pageTreeDetail.deleted", defaultMessage: "{count, plural, one {# page} other {# pages}} deleted" },
                    { count: pagesToDelete.length },
                ),
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.pageTreeDetail.deleteFailed", defaultMessage: "Not all pages could be deleted" }));
        } finally {
            setIsDeleting(false);
            setDeleteTarget(undefined);
            setCheckedIds((ids) => ids.filter((id) => !deletedIds.has(id)));
            if (parentToSelect != null) {
                selectPage(parentToSelect);
            }
        }
    };

    const handleTreeKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
        const focusedId = (event.target as HTMLElement).dataset.id;
        const focusedPage = focusedId != null ? structure.pagesById.get(focusedId) : undefined;
        if (focusedPage == null) {
            return;
        }
        if (matchesShortcut(event, pageTreeShortcuts.copy)) {
            event.preventDefault();
            void copyPages(checkedIds.length > 0 ? checkedIds : [focusedPage.id]);
            return;
        }
        const pastePosition = matchesShortcut(event, pageTreeShortcuts.pasteInside)
            ? "inside"
            : matchesShortcut(event, pageTreeShortcuts.pasteAfter)
              ? "after"
              : undefined;
        if (pastePosition != null && !(pastePosition === "inside" && focusedPage.visibility === "Archived")) {
            // The TreeView handles the same keys after this handler to paste a cut page; it marks the event as handled when it does.
            queueMicrotask(() => {
                if (!event.defaultPrevented) {
                    void pastePages(focusedPage, pastePosition);
                }
            });
        }
    };

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
    const expandableIds = useMemo(() => getExpandableTreeNodeIds(treeNodes), [treeNodes]);
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

    const checkedDeleteDisabledReason = getDeleteDisabledReason(checkedIds);
    const topmostCheckedPages = getTopmostPageIds(structure, checkedIds).flatMap((id) => structure.pagesById.get(id) ?? []);
    const checkedMoveCategories = getMoveCategories(topmostCheckedPages.flatMap((page) => getSubtree(structure, page)));
    const checkedTranslateDisabledReason = getTranslateDisabledReason(checkedPagesTranslation, checkedPages.length);
    const bulkActions: BulkActionBarAction[] = [
        ...(["Published", "Unpublished", "Archived"] as const).map((visibility) => ({
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
        })),
        {
            label: intl.formatMessage({ id: "dextinity.pageTreeDetail.bulk.copy", defaultMessage: "Copy" }),
            icon: <Icon name="copy" />,
            onClick: () => void copyPages(checkedIds),
        },
        {
            label: intl.formatMessage({ id: "dextinity.pageTreeDetail.bulk.duplicate", defaultMessage: "Duplicate" }),
            icon: <Icon name="duplicate" />,
            onClick: () => {
                void duplicatePages(topmostCheckedPages);
                setCheckedIds([]);
            },
        },
        ...(checkedMoveCategories.length > 0
            ? [
                  {
                      label: intl.formatMessage({ id: "dextinity.pageTreeDetail.bulk.moveToCategory", defaultMessage: "Move to" }),
                      icon: <Icon name="move-page" />,
                      disabled: topmostCheckedPages.some((page) => page.visibility === "Archived"),
                      disabledReason: intl.formatMessage({
                          id: "dextinity.pageTreeDetail.bulk.moveArchived",
                          defaultMessage: "Archived pages can't be moved to another category, restore them first",
                      }),
                      open: isBulkMoveMenuOpen,
                      onOpenChange: setIsBulkMoveMenuOpen,
                      menu: checkedMoveCategories.map(({ category: targetCategory, label, disabledReason }) => (
                          <MenuItem
                              key={targetCategory}
                              label={label}
                              disabled={disabledReason != null}
                              disabledReason={disabledReason}
                              onClick={() => {
                                  setIsBulkMoveMenuOpen(false);
                                  void movePagesToCategory(topmostCheckedPages, targetCategory);
                              }}
                          />
                      )),
                  },
              ]
            : []),
        ...(checkedPagesTranslation.enabled
            ? [
                  {
                      label: intl.formatMessage({ id: "dextinity.pageTreeDetail.bulk.translate", defaultMessage: "Translate" }),
                      icon: <Icon name="translate" />,
                      disabled: checkedTranslateDisabledReason != null,
                      disabledReason: checkedTranslateDisabledReason,
                      onClick: checkedPagesTranslation.openDialog,
                  },
              ]
            : []),
        ...(allowPageDelete
            ? [
                  {
                      label: intl.formatMessage({ id: "dextinity.pageTreeDetail.bulk.delete", defaultMessage: "Delete" }),
                      icon: <Icon name="delete" />,
                      color: "error" as const,
                      onClick: () => {
                          if (checkedDeleteDisabledReason != null) {
                              showError(checkedDeleteDisabledReason);
                          } else {
                              setDeleteTarget({ pageIds: checkedIds });
                          }
                      },
                  },
              ]
            : []),
    ];

    const newPageButton = (
        <Button startIcon={<Icon name="plus" />} onClick={() => openPageNodeDialog({ mode: "add" })}>
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
                onKeyDown={handleTreeKeyDown}
                draggable
                onMove={(move) => movePages(move, checkedIds)}
                canDrop={(move) => canMove(move, checkedIds)}
                labels={{
                    hiddenInMenu: intl.formatMessage({ id: "dextinity.pageTreeDetail.hiddenInMenu", defaultMessage: "Hidden in menu" }),
                    count: (count) =>
                        intl.formatMessage(
                            { id: "dextinity.pageTreeDetail.subpageCount", defaultMessage: "{count, plural, one {# subpage} other {# subpages}}" },
                            { count },
                        ),
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
                        eyebrow={
                            isInitialLoad ? (
                                eyebrow
                            ) : (
                                <>
                                    {eyebrow != null && (
                                        <>
                                            {eyebrow}
                                            {" · "}
                                        </>
                                    )}
                                    {intl.formatMessage(
                                        { id: "dextinity.pageTreeDetail.pageCount", defaultMessage: "{count, plural, one {# page} other {# pages}}" },
                                        { count: pages.length },
                                    )}
                                </>
                            )
                        }
                        title={title ?? intl.formatMessage({ id: "dextinity.pageTreeDetail.title", defaultMessage: "Page tree" })}
                        subtitle={
                            isInitialLoad
                                ? undefined
                                : intl.formatMessage(
                                      {
                                          id: "dextinity.pageTreeDetail.statusSummary",
                                          defaultMessage: "{unpublished} unpublished · {archived} archived",
                                      },
                                      { unpublished: unpublishedCount, archived: archivedCount },
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
                        start={
                            <Checkbox
                                aria-label={intl.formatMessage({ id: "dextinity.pageTreeDetail.selectAll", defaultMessage: "Select all pages" })}
                                checked={areAllVisiblePagesChecked}
                                indeterminate={checkedIds.length > 0 && !areAllVisiblePagesChecked}
                                onChange={(checked) => setCheckedIds(checked ? visiblePageIds : [])}
                                disabled={visiblePageIds.length === 0}
                            />
                        }
                        actions={
                            <TreeViewExpandButtons
                                onExpandAll={() => setExpandedIds(expandableIds)}
                                onCollapseAll={() => setExpandedIds([])}
                                expandAllDisabled={expandableIds.length === 0 || expandableIds.every((id) => expandedIds.includes(id))}
                                collapseAllDisabled={!expandableIds.some((id) => expandedIds.includes(id))}
                                labels={{
                                    expandAll: intl.formatMessage({ id: "dextinity.pageTreeDetail.expandAll", defaultMessage: "Expand all" }),
                                    collapseAll: intl.formatMessage({ id: "dextinity.pageTreeDetail.collapseAll", defaultMessage: "Collapse all" }),
                                }}
                            />
                        }
                    >
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
                            ancestorNames={getAncestorIds(structure, selectedPage.id)
                                .reverse()
                                .flatMap((id) => structure.pagesById.get(id)?.name ?? [])}
                            documentType={documentTypes[selectedPage.documentType]}
                            siteUrl={siteConfig.url}
                            editUrl={editUrl(selectedPage.id)}
                            onEditClick={handleEditClick}
                            onPreviewClick={() => openSitePreviewWindow(selectedPage.path, contentScopeMatch.url)}
                            onVisibilityChange={(visibility) => changeVisibility([selectedPage.id], visibility)}
                            menu={
                                <PageTreeNodeMenu
                                    page={selectedPage}
                                    onPropertiesClick={() => openPageNodeDialog({ mode: "edit", id: selectedPage.id })}
                                    onAddSubpageClick={() => openPageNodeDialog({ mode: "add", initialValues: { parent: selectedPage.id } })}
                                    onVisibilityChange={(visibility) => changeVisibility([selectedPage.id], visibility)}
                                    onCopyClick={() => void copyPages([selectedPage.id])}
                                    onPasteClick={(position) => void pastePages(selectedPage, position)}
                                    onOpen={() => void copyPaste.readClipboard()}
                                    hasClipboardPages={copyPaste.hasClipboardPages}
                                    onDuplicateClick={() => void duplicatePage(selectedPage)}
                                    categories={getMoveCategories([selectedPage])}
                                    onMoveToCategoryClick={(targetCategory) => void movePagesToCategory([selectedPage], targetCategory)}
                                    translate={
                                        selectedPageTranslation.enabled
                                            ? {
                                                  disabledReason: getTranslateDisabledReason(selectedPageTranslation, 1),
                                                  onClick: selectedPageTranslation.openDialog,
                                              }
                                            : undefined
                                    }
                                    delete={
                                        allowPageDelete
                                            ? {
                                                  disabledReason: isHomePage(selectedPage) ? homePageReason : undefined,
                                                  onClick: () => setDeleteTarget({ pageIds: [selectedPage.id], page: selectedPage }),
                                              }
                                            : undefined
                                    }
                                />
                            }
                        />
                    ) : isInitialLoad ? (
                        <Panel>
                            <Skeleton variant="block" />
                        </Panel>
                    ) : null
                }
                detailLabel={selectedPage?.name}
            >
                {renderTree()}
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
                actions={bulkActions}
            />
            {selectedPageTranslation.dialogs}
            {checkedPagesTranslation.dialogs}
            <PageDeleteConfirmDialog
                open={deleteTarget != null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(undefined);
                    }
                }}
                pages={pagesToDelete}
                page={deleteTarget?.page}
                onConfirm={() => void confirmDelete()}
                loading={isDeleting}
            />
            <ProgressDialog
                title={intl.formatMessage({ id: "dextinity.pageTreeDetail.pasting", defaultMessage: "Pasting pages" })}
                progress={copyPaste.progress}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.pageTreeDetail.notifications", defaultMessage: "Notifications" }) }}
            />
            <EditPageNode
                open={isPageNodeDialogOpen}
                onOpenChange={setIsPageNodeDialogOpen}
                mode={pageNodeDialogTarget.mode}
                id={pageNodeDialogTarget.mode === "edit" ? pageNodeDialogTarget.id : undefined}
                initialValues={pageNodeDialogTarget.mode === "add" ? pageNodeDialogTarget.initialValues : undefined}
                category={category}
                documentTypes={documentTypes}
                onSaved={(page) => {
                    if (pageNodeDialogTarget.mode === "add") {
                        selectPage(page.id);
                        addToast({
                            message: intl.formatMessage({ id: "dextinity.pageTreeDetail.pageCreated", defaultMessage: "Page created" }),
                        });
                    } else {
                        addToast({
                            message: intl.formatMessage({
                                id: "dextinity.pageTreeDetail.propertiesSaved",
                                defaultMessage: "Page properties saved",
                            }),
                        });
                    }
                }}
            />
        </PageTreeContext.Provider>
    );
}
