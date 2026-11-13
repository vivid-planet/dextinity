import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { useDataGridLabels } from "@dextinity/cms-admin";
import {
    Button,
    Chip,
    DataGrid,
    type DataGridColumn,
    EmptyState,
    FilterBar,
    Icon,
    IconButton,
    KeyValueList,
    ListDetailLayout,
    PageHeader,
    Panel,
    Skeleton,
    ToastViewport,
    useToasts,
} from "@dextinity/ui";
import { InputField, SelectField } from "@dextinity/ui-react-final-form";
import { DeleteEntityDialog } from "@src/products/common/DeleteEntityDialog";
import { EntityFormPanel, toSubmissionError } from "@src/products/common/EntityFormPanel";
import { UnsavedChangesDialog } from "@src/products/common/UnsavedChangesDialog";
import { useFilterBarLabels } from "@src/products/common/useFilterBarLabels";
import { newEntrySelection, type PanelUnsavedChanges, usePanelSelection } from "@src/products/common/usePanelSelection";
import { useEffect, useMemo, useState } from "react";
import { FormattedDate, useIntl } from "react-intl";

import {
    createProductCategoryMutation,
    deleteProductCategoryMutation,
    productCategoriesListQuery,
    productCategoryPanelQuery,
    productCategoryTypesQuery,
    updateProductCategoryMutation,
    updateProductCategoryPositionMutation,
} from "./ProductCategoriesPage.gql";
import type {
    GQLProductCategoriesUiCreateMutation,
    GQLProductCategoriesUiCreateMutationVariables,
    GQLProductCategoriesUiDeleteMutation,
    GQLProductCategoriesUiDeleteMutationVariables,
    GQLProductCategoriesUiItemFragment,
    GQLProductCategoriesUiListQuery,
    GQLProductCategoriesUiListQueryVariables,
    GQLProductCategoriesUiPanelQuery,
    GQLProductCategoriesUiPanelQueryVariables,
    GQLProductCategoriesUiTypesQuery,
    GQLProductCategoriesUiTypesQueryVariables,
    GQLProductCategoriesUiUpdateMutation,
    GQLProductCategoriesUiUpdateMutationVariables,
    GQLProductCategoriesUiUpdatePositionMutation,
    GQLProductCategoriesUiUpdatePositionMutationVariables,
} from "./ProductCategoriesPage.gql.generated";
import styles from "./ProductCategoriesPage.module.css";

type CategoryRow = GQLProductCategoriesUiItemFragment;

const noTypeValue = "";
const slugPattern = /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/;

function getErrorReason(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

function moveItem<Item>(items: Item[], fromIndex: number, toIndex: number) {
    const reordered = [...items];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    return reordered;
}

export function ProductCategoriesPage() {
    const intl = useIntl();
    const client = useApolloClient();
    const selection = usePanelSelection();
    const { labels: dataGridLabels } = useDataGridLabels();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [reorderedIds, setReorderedIds] = useState<string[]>();
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryRow>();
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => window.clearTimeout(timeout);
    }, [search]);

    const { data, previousData, loading, error } = useQuery<GQLProductCategoriesUiListQuery, GQLProductCategoriesUiListQueryVariables>(
        productCategoriesListQuery,
        { variables: { search: debouncedSearch || undefined }, fetchPolicy: "cache-and-network" },
    );
    const shownData = data ?? previousData;
    const filterBarLabels = useFilterBarLabels({
        search: intl.formatMessage({ id: "uiDemo.productCategories.search", defaultMessage: "Search categories" }),
        searchPlaceholder: intl.formatMessage({ id: "uiDemo.productCategories.searchPlaceholder", defaultMessage: "Search title or slug" }),
    });

    const rows = useMemo(() => {
        const nodes = shownData?.productCategories.nodes ?? [];
        if (!reorderedIds) {
            return nodes;
        }
        return reorderedIds.map((id) => nodes.find((node) => node.id === id)).filter((node): node is CategoryRow => node !== undefined);
    }, [shownData, reorderedIds]);

    if (error) {
        throw error;
    }

    const isSearching = debouncedSearch !== "";

    const reorder = async (fromIndex: number, toIndex: number) => {
        const moved = rows[fromIndex];
        setReorderedIds(moveItem(rows, fromIndex, toIndex).map((row) => row.id));
        try {
            await client.mutate<GQLProductCategoriesUiUpdatePositionMutation, GQLProductCategoriesUiUpdatePositionMutationVariables>({
                mutation: updateProductCategoryPositionMutation,
                variables: { id: moved.id, position: toIndex + 1 },
                refetchQueries: ["ProductCategoriesUiList"],
                awaitRefetchQueries: true,
                context: LocalErrorScopeApolloContext,
            });
        } catch (reorderError) {
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    { id: "uiDemo.productCategories.reorderFailed", defaultMessage: "Moving failed: {reason}" },
                    { reason: getErrorReason(reorderError) },
                ),
            });
        } finally {
            setReorderedIds(undefined);
        }
    };

    const deleteCategory = async () => {
        if (!categoryToDelete) {
            return;
        }
        setDeleting(true);
        try {
            await client.mutate<GQLProductCategoriesUiDeleteMutation, GQLProductCategoriesUiDeleteMutationVariables>({
                mutation: deleteProductCategoryMutation,
                variables: { id: categoryToDelete.id },
                refetchQueries: ["ProductCategoriesUiList"],
                awaitRefetchQueries: true,
                context: LocalErrorScopeApolloContext,
            });
            if (selection.selectedId === categoryToDelete.id) {
                selection.replaceSelection(null);
            }
            addToast({ message: intl.formatMessage({ id: "uiDemo.productCategories.deleted", defaultMessage: "Category deleted" }) });
        } catch (deleteError) {
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    { id: "uiDemo.productsCommon.deleteFailed", defaultMessage: "Deleting failed: {reason}" },
                    { reason: getErrorReason(deleteError) },
                ),
            });
        } finally {
            setDeleting(false);
            setCategoryToDelete(undefined);
        }
    };

    const columns: DataGridColumn<CategoryRow>[] = [
        {
            key: "title",
            header: intl.formatMessage({ id: "uiDemo.productCategories.title", defaultMessage: "Title" }),
            render: (category) => (
                <span className={styles.titleCell}>
                    <span className={styles.title}>{category.title}</span>
                    <span className={styles.slug}>{`/${category.slug}`}</span>
                </span>
            ),
        },
        {
            key: "type",
            header: intl.formatMessage({ id: "uiDemo.productCategories.type", defaultMessage: "Type" }),
            width: 180,
            priority: "low",
            render: (category) =>
                category.type ? (
                    <Chip size="small" variant="outlined" color="secondary">
                        {category.type.title}
                    </Chip>
                ) : (
                    <span className={styles.muted}>–</span>
                ),
        },
        {
            key: "products",
            header: intl.formatMessage({ id: "uiDemo.productCategories.products", defaultMessage: "Products" }),
            width: 110,
            align: "end",
            render: (category) => intl.formatNumber(category.products.length),
        },
    ];

    return (
        <>
            <ListDetailLayout
                open={selection.selectedId != null}
                onOpenChange={(open) => !open && selection.select(null)}
                sidePanelLabel={intl.formatMessage({ id: "uiDemo.productCategories.panel", defaultMessage: "Category details" })}
                header={
                    <PageHeader
                        eyebrow={intl.formatMessage({ id: "uiDemo.productCategories.eyebrow", defaultMessage: "Products" })}
                        title={intl.formatMessage({ id: "uiDemo.productCategories.pageTitle", defaultMessage: "Product categories" })}
                        subtitle={
                            isSearching
                                ? intl.formatMessage({
                                      id: "uiDemo.productCategories.subtitleSearching",
                                      defaultMessage: "Clear the search to change the order.",
                                  })
                                : intl.formatMessage({
                                      id: "uiDemo.productCategories.subtitle",
                                      defaultMessage: "Drag the categories into the order the site shows them in.",
                                  })
                        }
                        actions={
                            <Button startIcon={<Icon name="plus" />} onClick={() => selection.select(newEntrySelection)}>
                                {intl.formatMessage({ id: "uiDemo.productCategories.new", defaultMessage: "New category" })}
                            </Button>
                        }
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={search}
                        onSearchChange={setSearch}
                        resultCount={shownData?.productCategories.totalCount}
                        labels={filterBarLabels}
                    />
                }
                sidePanel={
                    selection.selectedId != null && (
                        <ProductCategoryPanel
                            key={selection.selectedId}
                            categoryId={selection.selectedId === newEntrySelection ? undefined : selection.selectedId}
                            nextPosition={(shownData?.productCategories.totalCount ?? 0) + 1}
                            onClose={() => selection.select(null)}
                            onCreated={(id) => selection.replaceSelection(id)}
                            onDelete={setCategoryToDelete}
                            onUnsavedChangesChange={selection.onUnsavedChangesChange}
                        />
                    )
                }
            >
                <DataGrid
                    aria-label={intl.formatMessage({ id: "uiDemo.productCategories.pageTitle", defaultMessage: "Product categories" })}
                    columns={columns}
                    rows={rows}
                    getRowId={(category) => category.id}
                    loading={loading && !shownData}
                    onRowReorder={isSearching || reorderedIds ? undefined : (fromIndex, toIndex) => void reorder(fromIndex, toIndex)}
                    onRowClick={(category) => selection.select(category.id)}
                    activeRowId={selection.selectedId ?? undefined}
                    rowActions={(category) => (
                        <IconButton
                            aria-label={intl.formatMessage(
                                { id: "uiDemo.productCategories.deleteCategory", defaultMessage: "Delete {title}" },
                                { title: category.title },
                            )}
                            variant="text"
                            color="secondary"
                            size="small"
                            onClick={() => setCategoryToDelete(category)}
                        >
                            <Icon name="trash" />
                        </IconButton>
                    )}
                    labels={dataGridLabels}
                    emptyState={
                        isSearching ? (
                            <EmptyState
                                icon={<Icon name="search" />}
                                title={intl.formatMessage({
                                    id: "uiDemo.productCategories.noMatches",
                                    defaultMessage: "No categories match the search",
                                })}
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" onClick={() => setSearch("")}>
                                        {intl.formatMessage({ id: "uiDemo.productCategories.resetSearch", defaultMessage: "Reset search" })}
                                    </Button>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={<Icon name="file" />}
                                title={intl.formatMessage({ id: "uiDemo.productCategories.empty", defaultMessage: "No categories yet" })}
                            />
                        )
                    }
                />
            </ListDetailLayout>
            <UnsavedChangesDialog {...selection.unsavedChangesDialog} />
            <DeleteEntityDialog
                entryName={categoryToDelete?.title}
                description={
                    categoryToDelete && categoryToDelete.products.length > 0
                        ? intl.formatMessage(
                              {
                                  id: "uiDemo.productCategories.deleteUsed",
                                  defaultMessage:
                                      "{count, plural, one {# product is} other {# products are}} in this category and will have none. This can't be undone.",
                              },
                              { count: categoryToDelete.products.length },
                          )
                        : undefined
                }
                deleting={deleting}
                onCancel={() => setCategoryToDelete(undefined)}
                onConfirm={() => void deleteCategory()}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "uiDemo.productsCommon.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}

interface ProductCategoryFormValues {
    title: string;
    slug: string;
    type: string | null;
}

interface ProductCategoryPanelProps {
    categoryId?: string;
    nextPosition: number;
    onClose: () => void;
    onCreated: (id: string) => void;
    onDelete: (category: CategoryRow) => void;
    onUnsavedChangesChange: (unsavedChanges: PanelUnsavedChanges | undefined) => void;
}

function ProductCategoryPanel({ categoryId, nextPosition, onClose, onCreated, onDelete, onUnsavedChangesChange }: ProductCategoryPanelProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const { data, loading, error } = useQuery<GQLProductCategoriesUiPanelQuery, GQLProductCategoriesUiPanelQueryVariables>(
        productCategoryPanelQuery,
        { variables: { id: categoryId ?? "" }, skip: categoryId === undefined, context: LocalErrorScopeApolloContext },
    );
    const { data: typesData } = useQuery<GQLProductCategoriesUiTypesQuery, GQLProductCategoriesUiTypesQueryVariables>(productCategoryTypesQuery);
    const category = data?.productCategory;

    const initialValues = useMemo<ProductCategoryFormValues>(
        () => ({ title: category?.title ?? "", slug: category?.slug ?? "", type: category?.type?.id ?? null }),
        [category],
    );

    if (categoryId !== undefined && !category) {
        return (
            <Panel title={intl.formatMessage({ id: "uiDemo.productCategories.panelTitle", defaultMessage: "Category" })}>
                {loading ? (
                    <Skeleton variant="text" count={3} />
                ) : (
                    <EmptyState
                        icon={<Icon name="warning-triangle" />}
                        title={intl.formatMessage({
                            id: "uiDemo.productCategories.loadFailed",
                            defaultMessage: "The category couldn't be loaded",
                        })}
                        description={error?.message}
                    />
                )}
            </Panel>
        );
    }

    const save = async (values: ProductCategoryFormValues) => {
        const input = { title: values.title.trim(), slug: values.slug.trim(), type: values.type };
        try {
            if (category) {
                await client.mutate<GQLProductCategoriesUiUpdateMutation, GQLProductCategoriesUiUpdateMutationVariables>({
                    mutation: updateProductCategoryMutation,
                    variables: { id: category.id, input },
                    refetchQueries: ["ProductCategoriesUiList"],
                    context: LocalErrorScopeApolloContext,
                });
            } else {
                const { data: created } = await client.mutate<GQLProductCategoriesUiCreateMutation, GQLProductCategoriesUiCreateMutationVariables>({
                    mutation: createProductCategoryMutation,
                    variables: { input: { ...input, position: nextPosition } },
                    refetchQueries: ["ProductCategoriesUiList"],
                    context: LocalErrorScopeApolloContext,
                });
                if (created) {
                    onCreated(created.createProductCategory.id);
                }
            }
            return undefined;
        } catch (saveError) {
            return toSubmissionError(
                intl.formatMessage(
                    { id: "uiDemo.productsCommon.saveFailed", defaultMessage: "Saving failed: {reason}" },
                    { reason: getErrorReason(saveError) },
                ),
            );
        }
    };

    const requiredMessage = intl.formatMessage({ id: "uiDemo.productsCommon.required", defaultMessage: "Required" });

    return (
        <EntityFormPanel<ProductCategoryFormValues>
            title={category?.title ?? intl.formatMessage({ id: "uiDemo.productCategories.newTitle", defaultMessage: "New category" })}
            initialValues={initialValues}
            onSubmit={save}
            onClose={onClose}
            onUnsavedChangesChange={onUnsavedChangesChange}
            footerStart={
                category && (
                    <Button size="small" variant="text" color="error" startIcon={<Icon name="trash" />} onClick={() => onDelete(category)}>
                        {intl.formatMessage({ id: "uiDemo.productsCommon.delete", defaultMessage: "Delete" })}
                    </Button>
                )
            }
            details={
                category && (
                    <KeyValueList
                        items={[
                            {
                                key: intl.formatMessage({ id: "uiDemo.productCategories.position", defaultMessage: "Position" }),
                                value: intl.formatNumber(category.position),
                            },
                            {
                                key: intl.formatMessage({ id: "uiDemo.productCategories.products", defaultMessage: "Products" }),
                                value: intl.formatNumber(category.products.length),
                            },
                            {
                                key: intl.formatMessage({ id: "uiDemo.productsCommon.updatedAt", defaultMessage: "Updated" }),
                                value: <FormattedDate value={category.updatedAt} dateStyle="medium" timeStyle="short" />,
                            },
                        ]}
                    />
                )
            }
        >
            <InputField
                name="title"
                label={intl.formatMessage({ id: "uiDemo.productCategories.title", defaultMessage: "Title" })}
                required
                requiredMessage={requiredMessage}
            />
            <InputField
                name="slug"
                label={intl.formatMessage({ id: "uiDemo.productCategories.slug", defaultMessage: "Slug" })}
                prefix="/"
                required
                requiredMessage={requiredMessage}
                validate={(slug?: string) =>
                    slug && !slugPattern.test(slug.trim())
                        ? intl.formatMessage({
                              id: "uiDemo.productCategories.slugInvalid",
                              defaultMessage: "Start with a letter or digit, then use letters, digits, “-” and “_” only",
                          })
                        : undefined
                }
            />
            <SelectField<false, string, string | null>
                name="type"
                format={(type) => type ?? noTypeValue}
                parse={(type) => (type === noTypeValue ? null : type)}
                label={intl.formatMessage({ id: "uiDemo.productCategories.type", defaultMessage: "Type" })}
                placeholder={intl.formatMessage({ id: "uiDemo.productCategories.noType", defaultMessage: "No type" })}
                options={[
                    { value: noTypeValue, label: intl.formatMessage({ id: "uiDemo.productCategories.noType", defaultMessage: "No type" }) },
                    ...(typesData?.productCategoryTypes.nodes ?? []).map((type) => ({ value: type.id, label: type.title })),
                ]}
            />
        </EntityFormPanel>
    );
}
