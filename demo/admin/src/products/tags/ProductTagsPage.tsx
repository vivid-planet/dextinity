import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { toGqlSort, useDataGridLabels, useRemoteListPagination, useRemoteListState } from "@dextinity/cms-admin";
import {
    Button,
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
import { InputField } from "@dextinity/ui-react-final-form";
import type { GQLProductTagSortField } from "@src/graphql.generated";
import { DeleteEntityDialog } from "@src/products/common/DeleteEntityDialog";
import { EntityFormPanel, toSubmissionError } from "@src/products/common/EntityFormPanel";
import { UnsavedChangesDialog } from "@src/products/common/UnsavedChangesDialog";
import { useFilterBarLabels } from "@src/products/common/useFilterBarLabels";
import { newEntrySelection, type PanelUnsavedChanges, usePanelSelection } from "@src/products/common/usePanelSelection";
import { useState } from "react";
import { FormattedDate, useIntl } from "react-intl";

import {
    createProductTagMutation,
    deleteProductTagMutation,
    productTagPanelQuery,
    productTagsListQuery,
    updateProductTagMutation,
} from "./ProductTagsPage.gql";
import type {
    GQLProductTagsUiCreateMutation,
    GQLProductTagsUiCreateMutationVariables,
    GQLProductTagsUiDeleteMutation,
    GQLProductTagsUiDeleteMutationVariables,
    GQLProductTagsUiListItemFragment,
    GQLProductTagsUiListQuery,
    GQLProductTagsUiListQueryVariables,
    GQLProductTagsUiPanelQuery,
    GQLProductTagsUiPanelQueryVariables,
    GQLProductTagsUiUpdateMutation,
    GQLProductTagsUiUpdateMutationVariables,
} from "./ProductTagsPage.gql.generated";
import styles from "./ProductTagsPage.module.css";

const sortableColumns = ["title", "createdAt", "updatedAt"] satisfies GQLProductTagSortField[];
const defaultSort = { key: "title", direction: "asc" } as const;

export function ProductTagsPage() {
    const intl = useIntl();
    const client = useApolloClient();
    const listState = useRemoteListState({
        queryParamsPrefix: "productTags",
        sortableColumns,
        defaultSort,
        pageSizeStorageKey: "demo-admin-product-tags-page-size",
    });
    const selection = usePanelSelection();
    const { labels: dataGridLabels } = useDataGridLabels();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const [tagToDelete, setTagToDelete] = useState<GQLProductTagsUiListItemFragment>();
    const [deleting, setDeleting] = useState(false);

    const { data, previousData, loading, error } = useQuery<GQLProductTagsUiListQuery, GQLProductTagsUiListQueryVariables>(productTagsListQuery, {
        variables: {
            offset: listState.offset,
            limit: listState.limit,
            sort: toGqlSort<GQLProductTagSortField>(listState.sort),
            search: listState.search || undefined,
        },
        fetchPolicy: "cache-and-network",
    });
    const shownData = data ?? previousData;
    const pagination = useRemoteListPagination(listState, shownData?.productTags.totalCount);
    const filterBarLabels = useFilterBarLabels({
        search: intl.formatMessage({ id: "uiDemo.productTags.search", defaultMessage: "Search tags" }),
        searchPlaceholder: intl.formatMessage({ id: "uiDemo.productTags.searchPlaceholder", defaultMessage: "Search title" }),
    });

    if (error) {
        throw error;
    }

    const deleteTag = async () => {
        if (!tagToDelete) {
            return;
        }
        setDeleting(true);
        try {
            await client.mutate<GQLProductTagsUiDeleteMutation, GQLProductTagsUiDeleteMutationVariables>({
                mutation: deleteProductTagMutation,
                variables: { id: tagToDelete.id },
                refetchQueries: ["ProductTagsUiList"],
                awaitRefetchQueries: true,
                context: LocalErrorScopeApolloContext,
            });
            if (selection.selectedId === tagToDelete.id) {
                selection.replaceSelection(null);
            }
            addToast({ message: intl.formatMessage({ id: "uiDemo.productTags.deleted", defaultMessage: "Tag deleted" }) });
        } catch (deleteError) {
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    { id: "uiDemo.productTags.deleteFailed", defaultMessage: "Deleting failed: {reason}" },
                    { reason: deleteError instanceof Error ? deleteError.message : String(deleteError) },
                ),
            });
        } finally {
            setDeleting(false);
            setTagToDelete(undefined);
        }
    };

    const columns: DataGridColumn<GQLProductTagsUiListItemFragment>[] = [
        {
            key: "title",
            header: intl.formatMessage({ id: "uiDemo.productTags.title", defaultMessage: "Title" }),
            sortable: true,
            render: (tag) => <span className={styles.title}>{tag.title}</span>,
        },
        {
            key: "products",
            header: intl.formatMessage({ id: "uiDemo.productTags.products", defaultMessage: "Products" }),
            width: 110,
            align: "end",
            render: (tag) => intl.formatNumber(tag.products.length),
        },
        {
            key: "updatedAt",
            header: intl.formatMessage({ id: "uiDemo.productTags.updatedAt", defaultMessage: "Updated" }),
            sortable: true,
            width: 140,
            priority: "low",
            render: (tag) => (
                <span className={styles.muted}>
                    <FormattedDate value={tag.updatedAt} dateStyle="medium" />
                </span>
            ),
        },
    ];

    const rows = shownData?.productTags.nodes ?? [];
    const isPanelOpen = selection.selectedId != null;

    return (
        <>
            <ListDetailLayout
                open={isPanelOpen}
                onOpenChange={(open) => !open && selection.select(null)}
                sidePanelLabel={intl.formatMessage({ id: "uiDemo.productTags.panel", defaultMessage: "Tag details" })}
                header={
                    <PageHeader
                        eyebrow={intl.formatMessage({ id: "uiDemo.productTags.eyebrow", defaultMessage: "Products" })}
                        title={intl.formatMessage({ id: "uiDemo.productTags.pageTitle", defaultMessage: "Product tags" })}
                        actions={
                            <Button startIcon={<Icon name="plus" />} onClick={() => selection.select(newEntrySelection)}>
                                {intl.formatMessage({ id: "uiDemo.productTags.new", defaultMessage: "New tag" })}
                            </Button>
                        }
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={listState.searchInput}
                        onSearchChange={listState.setSearchInput}
                        resultCount={shownData?.productTags.totalCount}
                        labels={filterBarLabels}
                    />
                }
                sidePanel={
                    selection.selectedId != null && (
                        <ProductTagPanel
                            key={selection.selectedId}
                            tagId={selection.selectedId === newEntrySelection ? undefined : selection.selectedId}
                            onClose={() => selection.select(null)}
                            onCreated={(id) => selection.replaceSelection(id)}
                            onDelete={setTagToDelete}
                            onUnsavedChangesChange={selection.onUnsavedChangesChange}
                        />
                    )
                }
            >
                <DataGrid
                    aria-label={intl.formatMessage({ id: "uiDemo.productTags.pageTitle", defaultMessage: "Product tags" })}
                    columns={columns}
                    rows={rows}
                    getRowId={(tag) => tag.id}
                    loading={loading && !shownData}
                    sort={listState.sort}
                    onSortChange={listState.setSort}
                    onRowClick={(tag) => selection.select(tag.id)}
                    activeRowId={selection.selectedId ?? undefined}
                    rowActions={(tag) => (
                        <IconButton
                            aria-label={intl.formatMessage(
                                { id: "uiDemo.productTags.deleteTag", defaultMessage: "Delete {title}" },
                                { title: tag.title },
                            )}
                            variant="text"
                            color="secondary"
                            size="small"
                            onClick={() => setTagToDelete(tag)}
                        >
                            <Icon name="trash" />
                        </IconButton>
                    )}
                    labels={dataGridLabels}
                    pagination={pagination}
                    emptyState={
                        listState.isFiltered ? (
                            <EmptyState
                                icon={<Icon name="search" />}
                                title={intl.formatMessage({ id: "uiDemo.productTags.noMatches", defaultMessage: "No tags match the search" })}
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" onClick={listState.resetFilters}>
                                        {intl.formatMessage({ id: "uiDemo.productTags.resetSearch", defaultMessage: "Reset search" })}
                                    </Button>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={<Icon name="file" />}
                                title={intl.formatMessage({ id: "uiDemo.productTags.empty", defaultMessage: "No tags yet" })}
                            />
                        )
                    }
                />
            </ListDetailLayout>
            <UnsavedChangesDialog {...selection.unsavedChangesDialog} />
            <DeleteEntityDialog
                entryName={tagToDelete?.title}
                description={
                    tagToDelete && tagToDelete.products.length > 0
                        ? intl.formatMessage(
                              {
                                  id: "uiDemo.productTags.deleteUsed",
                                  defaultMessage: "{count, plural, one {# product uses} other {# products use}} this tag. This can't be undone.",
                              },
                              { count: tagToDelete.products.length },
                          )
                        : undefined
                }
                deleting={deleting}
                onCancel={() => setTagToDelete(undefined)}
                onConfirm={() => void deleteTag()}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "uiDemo.productsCommon.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}

interface ProductTagFormValues {
    title: string;
}

interface ProductTagPanelProps {
    tagId?: string;
    onClose: () => void;
    onCreated: (id: string) => void;
    onDelete: (tag: GQLProductTagsUiListItemFragment) => void;
    onUnsavedChangesChange: (unsavedChanges: PanelUnsavedChanges | undefined) => void;
}

function ProductTagPanel({ tagId, onClose, onCreated, onDelete, onUnsavedChangesChange }: ProductTagPanelProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const { data, loading, error } = useQuery<GQLProductTagsUiPanelQuery, GQLProductTagsUiPanelQueryVariables>(productTagPanelQuery, {
        variables: { id: tagId ?? "" },
        skip: tagId === undefined,
        context: LocalErrorScopeApolloContext,
    });
    const tag = data?.productTag;

    if (tagId !== undefined && !tag) {
        return (
            <Panel title={intl.formatMessage({ id: "uiDemo.productTags.panelTitle", defaultMessage: "Tag" })}>
                {loading ? (
                    <Skeleton variant="text" count={3} />
                ) : (
                    <EmptyState
                        icon={<Icon name="warning-triangle" />}
                        title={intl.formatMessage({ id: "uiDemo.productTags.loadFailed", defaultMessage: "The tag couldn't be loaded" })}
                        description={error?.message}
                    />
                )}
            </Panel>
        );
    }

    const save = async (values: ProductTagFormValues) => {
        const input = { title: values.title.trim() };
        try {
            if (tag) {
                await client.mutate<GQLProductTagsUiUpdateMutation, GQLProductTagsUiUpdateMutationVariables>({
                    mutation: updateProductTagMutation,
                    variables: { id: tag.id, input },
                    refetchQueries: ["ProductTagsUiList"],
                    context: LocalErrorScopeApolloContext,
                });
            } else {
                const { data: created } = await client.mutate<GQLProductTagsUiCreateMutation, GQLProductTagsUiCreateMutationVariables>({
                    mutation: createProductTagMutation,
                    variables: { input },
                    refetchQueries: ["ProductTagsUiList"],
                    context: LocalErrorScopeApolloContext,
                });
                if (created) {
                    onCreated(created.createProductTag.id);
                }
            }
            return undefined;
        } catch (saveError) {
            return toSubmissionError(
                intl.formatMessage(
                    { id: "uiDemo.productsCommon.saveFailed", defaultMessage: "Saving failed: {reason}" },
                    { reason: saveError instanceof Error ? saveError.message : String(saveError) },
                ),
            );
        }
    };

    return (
        <EntityFormPanel<ProductTagFormValues>
            title={tag?.title ?? intl.formatMessage({ id: "uiDemo.productTags.newTitle", defaultMessage: "New tag" })}
            initialValues={{ title: tag?.title ?? "" }}
            onSubmit={save}
            onClose={onClose}
            onUnsavedChangesChange={onUnsavedChangesChange}
            footerStart={
                tag && (
                    <Button size="small" variant="text" color="error" startIcon={<Icon name="trash" />} onClick={() => onDelete(tag)}>
                        {intl.formatMessage({ id: "uiDemo.productsCommon.delete", defaultMessage: "Delete" })}
                    </Button>
                )
            }
            details={
                tag && (
                    <KeyValueList
                        items={[
                            {
                                key: intl.formatMessage({ id: "uiDemo.productTags.products", defaultMessage: "Products" }),
                                value: intl.formatNumber(tag.products.length),
                            },
                            {
                                key: intl.formatMessage({ id: "uiDemo.productsCommon.createdAt", defaultMessage: "Created" }),
                                value: <FormattedDate value={tag.createdAt} dateStyle="medium" timeStyle="short" />,
                            },
                            {
                                key: intl.formatMessage({ id: "uiDemo.productTags.updatedAt", defaultMessage: "Updated" }),
                                value: <FormattedDate value={tag.updatedAt} dateStyle="medium" timeStyle="short" />,
                            },
                        ]}
                    />
                )
            }
        >
            <InputField
                name="title"
                label={intl.formatMessage({ id: "uiDemo.productTags.title", defaultMessage: "Title" })}
                required
                requiredMessage={intl.formatMessage({ id: "uiDemo.productsCommon.required", defaultMessage: "Required" })}
                validate={(title?: string) =>
                    title && title.trim() === ""
                        ? intl.formatMessage({ id: "uiDemo.productsCommon.blank", defaultMessage: "Enter more than spaces" })
                        : undefined
                }
            />
        </EntityFormPanel>
    );
}
