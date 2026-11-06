import { gql, useQuery } from "@apollo/client";
import { Button, Dialog, EmptyState, FilterBar, Icon, SegmentedControl, Spinner, type TreeNode, TreeView } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type JSX, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import type { ContentScope } from "../../contentScope/Provider";
import { usePageTreeScope } from "../config/usePageTreeScope";
import { createPagesQuery, type GQLPagesQuery, type GQLPagesQueryVariables, type GQLPageTreePageFragment } from "../pagesPage/createPagesQuery";
import { usePageTreeConfig } from "../pageTreeConfig";
import { visibilityStatus } from "../treeDetail/pageTreeStatus";
import { createPageTreeStructure, getAncestorIds, isHomePage, type PageTreeStructure } from "../treeDetail/pageTreeStructure";
import type {
    GQLPageTreeSelectCategoryQuery,
    GQLPageTreeSelectCategoryQueryVariables,
    GQLSelectedPageFragment,
} from "./PageTreeSelectDialog.generated";

export type { GQLSelectedPageFragment };

export const selectedPageFragment = gql`
    fragment SelectedPage on PageTreeNode {
        id
        name
        path
        documentType
    }
`;

const pageTreeSelectCategoryQuery = gql`
    query PageTreeSelectCategory($id: ID!) {
        page: pageTreeNode(id: $id) {
            id
            category
        }
    }
`;

export type PageTreeSelectValue = GQLSelectedPageFragment & { scope?: ContentScope };

export interface PageTreeSelectDialogProps {
    /** The chosen page, preselected with its ancestors expanded when the dialog opens. */
    value: PageTreeSelectValue | undefined | null;
    /** Called with the page chosen with "Select", or `null` for "Remove selection". The dialog doesn't close itself. */
    onChange: (newValue: PageTreeSelectValue | null) => void;
    open: boolean;
    onClose: () => void;
    /** The page tree category shown first. Without it, the category of `value`, or else the first configured category. */
    defaultCategory?: string;
}

function createTreeNodes(structure: PageTreeStructure, parentId: string | null = null): TreeNode[] {
    return (structure.childrenByParentId.get(parentId) ?? []).map((page) => {
        const children = createTreeNodes(structure, page.id);
        return {
            id: page.id,
            label: page.name,
            type: page.documentType === "Link" ? "link" : children.length > 0 ? "folder" : "page",
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

/**
 * A dialog to choose a page from the page tree, built with `@dextinity/ui`: the categories, a search, and the tree. Archived pages
 * aren't offered, except the chosen one; links to other pages can't be chosen.
 */
export function PageTreeSelectDialog({ value, onChange, open, onClose, defaultCategory }: PageTreeSelectDialogProps): JSX.Element {
    const intl = useIntl();
    const { categories, additionalPageTreeNodeFragment } = usePageTreeConfig();
    const scope = usePageTreeScope();

    if (categories.length === 0) {
        throw new Error("No categories defined in the page tree configuration. Please define at least one category.");
    }

    const valueCategoryQuery = useQuery<GQLPageTreeSelectCategoryQuery, GQLPageTreeSelectCategoryQueryVariables>(pageTreeSelectCategoryQuery, {
        variables: { id: value?.id as string },
        skip: !open || defaultCategory != null || value?.id == null,
    });
    const initialCategory = defaultCategory ?? valueCategoryQuery.data?.page?.category ?? categories[0].category;
    const [chosenCategory, setChosenCategory] = useState<string>();
    const category = chosenCategory ?? initialCategory;

    const [selectedId, setSelectedId] = useState<string | undefined>(value?.id);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [search, setSearch] = useState("");

    const pagesQuery = useMemo(() => createPagesQuery({ additionalPageTreeNodeFragment }), [additionalPageTreeNodeFragment]);
    const { data, loading, error } = useQuery<GQLPagesQuery, GQLPagesQueryVariables>(pagesQuery, {
        variables: { contentScope: scope, category },
        skip: !open || (valueCategoryQuery.loading && defaultCategory == null),
    });

    const selectablePages = useMemo(
        () => (data?.pages ?? []).filter((page) => page.visibility !== "Archived" || page.id === value?.id),
        [data, value?.id],
    );
    const structure = useMemo(() => createPageTreeStructure(selectablePages), [selectablePages]);
    const treeNodes = useMemo(() => createTreeNodes(structure), [structure]);

    useEffect(() => {
        if (open) {
            setSelectedId(value?.id);
            setSearch("");
            setChosenCategory(undefined);
        }
    }, [open, value?.id]);

    const valueId = value?.id;
    const valueIsLoaded = valueId != null && structure.pagesById.has(valueId);
    useEffect(() => {
        if (open && valueIsLoaded && valueId != null) {
            setExpandedIds((ids) => Array.from(new Set([...ids, ...getAncestorIds(structure, valueId)])));
        }
    }, [open, valueIsLoaded, valueId, structure]);

    const selectedPage = selectedId != null ? structure.pagesById.get(selectedId) : undefined;
    const canChoose = selectedPage != null && selectedPage.documentType !== "Link";
    const matchCount = search.trim() === "" ? undefined : selectablePages.filter((page) => matchesSearch(page, search)).length;

    const choose = (page: GQLPageTreePageFragment) => {
        if (page.documentType === "Link") {
            return;
        }
        onChange({ id: page.id, name: page.name, path: page.path, documentType: page.documentType, scope });
    };

    const renderTree = () => {
        if (error) {
            return (
                <EmptyState
                    icon={<Icon name="warning" />}
                    title={intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.error", defaultMessage: "The pages couldn't be loaded" })}
                    description={error.message}
                />
            );
        }
        if (loading && data == null) {
            return (
                <Centered>
                    <Spinner aria-label={intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.loading", defaultMessage: "Loading pages" })} />
                </Centered>
            );
        }
        if (treeNodes.length === 0 || matchCount === 0) {
            return (
                <EmptyState
                    icon={<Icon name="search" />}
                    title={
                        matchCount === 0
                            ? intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.noMatches", defaultMessage: "No pages match the search" })
                            : intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.noPages", defaultMessage: "There are no pages yet" })
                    }
                />
            );
        }
        return (
            <TreeView
                aria-label={intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.tree", defaultMessage: "Pages" })}
                nodes={treeNodes}
                expandedIds={expandedIds}
                onExpandedChange={setExpandedIds}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onOpen={(id) => {
                    const page = structure.pagesById.get(id);
                    if (page != null) {
                        choose(page);
                    }
                }}
                filter={matchCount != null ? (node) => matchesSearch(structure.pagesById.get(node.id) as GQLPageTreePageFragment, search) : undefined}
                labels={{
                    hiddenInMenu: intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.hiddenInMenu", defaultMessage: "Hidden in menu" }),
                }}
            />
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onClose();
                }
            }}
            size="large"
            title={intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.label", defaultMessage: "Select Page" })}
            labels={{ close: intl.formatMessage({ id: "dextinity.generic.close", defaultMessage: "Close" }) }}
            footer={
                <>
                    {value != null && (
                        <RemoveButton variant="text" color="secondary" startIcon={<Icon name="delete" />} onClick={() => onChange(null)}>
                            {intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.removeSelection", defaultMessage: "Remove Selection" })}
                        </RemoveButton>
                    )}
                    <Button variant="text" color="secondary" onClick={onClose}>
                        {intl.formatMessage({ id: "dextinity.generic.cancel", defaultMessage: "Cancel" })}
                    </Button>
                    <Button disabled={!canChoose} onClick={() => selectedPage != null && choose(selectedPage)}>
                        {intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.select", defaultMessage: "Select" })}
                    </Button>
                </>
            }
        >
            <Content>
                <Toolbar>
                    {categories.length > 1 && (
                        <SegmentedControl
                            aria-label={intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.category", defaultMessage: "Page tree" })}
                            options={categories.map(({ category, label }) => ({ value: category, label }))}
                            value={category}
                            onChange={(nextCategory) => {
                                setChosenCategory(nextCategory);
                                setExpandedIds([]);
                            }}
                        />
                    )}
                    <FilterBar
                        searchValue={search}
                        onSearchChange={setSearch}
                        resultCount={matchCount}
                        searchShortcut={false}
                        labels={{
                            search: intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.search", defaultMessage: "Search pages" }),
                            searchPlaceholder: intl.formatMessage({
                                id: "dextinity.pages.pageTreeSelect.searchPlaceholder",
                                defaultMessage: "Search name or path",
                            }),
                            resultCount: (count) =>
                                intl.formatMessage(
                                    {
                                        id: "dextinity.pages.pageTreeSelect.resultCount",
                                        defaultMessage: "{count, plural, one {# page} other {# pages}}",
                                    },
                                    { count },
                                ),
                        }}
                    />
                </Toolbar>
                <TreeArea>{renderTree()}</TreeArea>
            </Content>
        </Dialog>
    );
}

/** @deprecated Use the named export `PageTreeSelectDialog` instead. */
export default PageTreeSelectDialog;

const Content = styled("div")`
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: var(--dextinity-space-3);
    block-size: min(60vh, 560px);
`;

const Toolbar = styled("div")`
    display: grid;
    gap: var(--dextinity-space-3);
`;

const TreeArea = styled("div")`
    min-block-size: 0;
    overflow-y: auto;
`;

const Centered = styled("div")`
    display: grid;
    place-items: center;
    block-size: 100%;
`;

const RemoveButton = styled(Button)`
    margin-inline-end: auto;
`;
