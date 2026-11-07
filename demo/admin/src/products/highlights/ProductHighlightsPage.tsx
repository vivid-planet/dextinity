import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { useDataGridLabels } from "@dextinity/cms-admin";
import {
    Button,
    DataGrid,
    type DataGridColumn,
    type DataGridSort,
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
import { ComboboxField, TextareaField } from "@dextinity/ui-react-final-form";
import { DeleteEntityDialog } from "@src/products/common/DeleteEntityDialog";
import { EntityFormPanel, toSubmissionError } from "@src/products/common/EntityFormPanel";
import { OnFieldChange } from "@src/products/common/OnFieldChange";
import { UnsavedChangesDialog } from "@src/products/common/UnsavedChangesDialog";
import { useComboboxLabels } from "@src/products/common/useComboboxLabels";
import { useFilterBarLabels } from "@src/products/common/useFilterBarLabels";
import { newEntrySelection, type PanelUnsavedChanges, usePanelSelection } from "@src/products/common/usePanelSelection";
import { useMemo, useState } from "react";
import { useForm } from "react-final-form";
import { FormattedDate, useIntl } from "react-intl";

import {
    createProductHighlightMutation,
    deleteProductHighlightMutation,
    productHighlightCategoryOptionsQuery,
    productHighlightPanelQuery,
    productHighlightProductOptionsQuery,
    productHighlightsListQuery,
    updateProductHighlightMutation,
} from "./ProductHighlightsPage.gql";
import type {
    GQLProductHighlightsUiCategoryOptionsQuery,
    GQLProductHighlightsUiCategoryOptionsQueryVariables,
    GQLProductHighlightsUiCreateMutation,
    GQLProductHighlightsUiCreateMutationVariables,
    GQLProductHighlightsUiDeleteMutation,
    GQLProductHighlightsUiDeleteMutationVariables,
    GQLProductHighlightsUiItemFragment,
    GQLProductHighlightsUiListQuery,
    GQLProductHighlightsUiListQueryVariables,
    GQLProductHighlightsUiPanelQuery,
    GQLProductHighlightsUiPanelQueryVariables,
    GQLProductHighlightsUiProductOptionsQuery,
    GQLProductHighlightsUiProductOptionsQueryVariables,
    GQLProductHighlightsUiUpdateMutation,
    GQLProductHighlightsUiUpdateMutationVariables,
} from "./ProductHighlightsPage.gql.generated";
import styles from "./ProductHighlightsPage.module.css";

type HighlightRow = GQLProductHighlightsUiItemFragment;

const sortValues: Record<string, (highlight: HighlightRow) => string> = {
    description: (highlight) => highlight.description,
    product: (highlight) => highlight.product.title,
    category: (highlight) => highlight.product.category?.title ?? "",
};

function getErrorReason(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

export function ProductHighlightsPage() {
    const intl = useIntl();
    const client = useApolloClient();
    const selection = usePanelSelection();
    const { labels: dataGridLabels } = useDataGridLabels();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<DataGridSort>({ key: "product", direction: "asc" });
    const [highlightToDelete, setHighlightToDelete] = useState<HighlightRow>();
    const [deleting, setDeleting] = useState(false);

    const { data, loading, error } = useQuery<GQLProductHighlightsUiListQuery, GQLProductHighlightsUiListQueryVariables>(productHighlightsListQuery, {
        fetchPolicy: "cache-and-network",
    });
    const filterBarLabels = useFilterBarLabels({
        search: intl.formatMessage({ id: "uiDemo.productHighlights.search", defaultMessage: "Search highlights" }),
        searchPlaceholder: intl.formatMessage({ id: "uiDemo.productHighlights.searchPlaceholder", defaultMessage: "Search description or product" }),
    });

    const rows = useMemo(() => {
        const query = search.trim().toLocaleLowerCase(intl.locale);
        const getSortValue = sortValues[sort.key] ?? sortValues.product;
        return (data?.productHighlights ?? [])
            .filter(
                (highlight) =>
                    query === "" ||
                    highlight.description.toLocaleLowerCase(intl.locale).includes(query) ||
                    highlight.product.title.toLocaleLowerCase(intl.locale).includes(query),
            )
            .sort((a, b) => getSortValue(a).localeCompare(getSortValue(b), intl.locale) * (sort.direction === "asc" ? 1 : -1));
    }, [data, search, sort, intl.locale]);

    if (error) {
        throw error;
    }

    const deleteHighlight = async () => {
        if (!highlightToDelete) {
            return;
        }
        setDeleting(true);
        try {
            await client.mutate<GQLProductHighlightsUiDeleteMutation, GQLProductHighlightsUiDeleteMutationVariables>({
                mutation: deleteProductHighlightMutation,
                variables: { id: highlightToDelete.id },
                refetchQueries: ["ProductHighlightsUiList"],
                awaitRefetchQueries: true,
                context: LocalErrorScopeApolloContext,
            });
            if (selection.selectedId === highlightToDelete.id) {
                selection.replaceSelection(null);
            }
            addToast({ message: intl.formatMessage({ id: "uiDemo.productHighlights.deleted", defaultMessage: "Highlight deleted" }) });
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
            setHighlightToDelete(undefined);
        }
    };

    const columns: DataGridColumn<HighlightRow>[] = [
        {
            key: "description",
            header: intl.formatMessage({ id: "uiDemo.productHighlights.description", defaultMessage: "Description" }),
            sortable: true,
            render: (highlight) => <span className={styles.description}>{highlight.description}</span>,
        },
        {
            key: "product",
            header: intl.formatMessage({ id: "uiDemo.productHighlights.product", defaultMessage: "Product" }),
            sortable: true,
            width: 220,
            render: (highlight) => highlight.product.title,
        },
        {
            key: "category",
            header: intl.formatMessage({ id: "uiDemo.productHighlights.category", defaultMessage: "Category" }),
            sortable: true,
            width: 180,
            priority: "low",
            render: (highlight) => <span className={styles.muted}>{highlight.product.category?.title ?? "–"}</span>,
        },
    ];

    return (
        <>
            <ListDetailLayout
                open={selection.selectedId != null}
                onOpenChange={(open) => !open && selection.select(null)}
                sidePanelLabel={intl.formatMessage({ id: "uiDemo.productHighlights.panel", defaultMessage: "Highlight details" })}
                header={
                    <PageHeader
                        eyebrow={intl.formatMessage({ id: "uiDemo.productHighlights.eyebrow", defaultMessage: "Products" })}
                        title={intl.formatMessage({ id: "uiDemo.productHighlights.pageTitle", defaultMessage: "Product highlights" })}
                        subtitle={intl.formatMessage({
                            id: "uiDemo.productHighlights.subtitle",
                            defaultMessage: "Short selling points shown with a product.",
                        })}
                        actions={
                            <Button startIcon={<Icon name="plus" />} onClick={() => selection.select(newEntrySelection)}>
                                {intl.formatMessage({ id: "uiDemo.productHighlights.new", defaultMessage: "New highlight" })}
                            </Button>
                        }
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={search}
                        onSearchChange={setSearch}
                        resultCount={data ? rows.length : undefined}
                        labels={filterBarLabels}
                    />
                }
                sidePanel={
                    selection.selectedId != null && (
                        <ProductHighlightPanel
                            key={selection.selectedId}
                            highlightId={selection.selectedId === newEntrySelection ? undefined : selection.selectedId}
                            onClose={() => selection.select(null)}
                            onCreated={(id) => selection.replaceSelection(id)}
                            onDelete={setHighlightToDelete}
                            onUnsavedChangesChange={selection.onUnsavedChangesChange}
                        />
                    )
                }
            >
                <DataGrid
                    aria-label={intl.formatMessage({ id: "uiDemo.productHighlights.pageTitle", defaultMessage: "Product highlights" })}
                    columns={columns}
                    rows={rows}
                    getRowId={(highlight) => highlight.id}
                    loading={loading && !data}
                    sort={sort}
                    onSortChange={setSort}
                    onRowClick={(highlight) => selection.select(highlight.id)}
                    activeRowId={selection.selectedId ?? undefined}
                    rowActions={(highlight) => (
                        <IconButton
                            aria-label={intl.formatMessage(
                                { id: "uiDemo.productHighlights.deleteHighlight", defaultMessage: "Delete the highlight of {product}" },
                                { product: highlight.product.title },
                            )}
                            variant="text"
                            color="secondary"
                            size="small"
                            onClick={() => setHighlightToDelete(highlight)}
                        >
                            <Icon name="delete" />
                        </IconButton>
                    )}
                    labels={dataGridLabels}
                    emptyState={
                        search !== "" ? (
                            <EmptyState
                                icon={<Icon name="search" />}
                                title={intl.formatMessage({
                                    id: "uiDemo.productHighlights.noMatches",
                                    defaultMessage: "No highlights match the search",
                                })}
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" onClick={() => setSearch("")}>
                                        {intl.formatMessage({ id: "uiDemo.productHighlights.resetSearch", defaultMessage: "Reset search" })}
                                    </Button>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={<Icon name="inbox" />}
                                title={intl.formatMessage({ id: "uiDemo.productHighlights.empty", defaultMessage: "No highlights yet" })}
                            />
                        )
                    }
                />
            </ListDetailLayout>
            <UnsavedChangesDialog {...selection.unsavedChangesDialog} />
            <DeleteEntityDialog
                entryName={highlightToDelete ? truncate(highlightToDelete.description) : undefined}
                deleting={deleting}
                onCancel={() => setHighlightToDelete(undefined)}
                onConfirm={() => void deleteHighlight()}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "uiDemo.productsCommon.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}

const maxNameLength = 40;

function truncate(text: string) {
    return text.length > maxNameLength ? `${text.slice(0, maxNameLength)}…` : text;
}

interface CategoryOption {
    id: string;
    title: string;
}

type ProductOption = GQLProductHighlightsUiProductOptionsQuery["products"]["nodes"][number];

interface ProductHighlightFormValues {
    description: string;
    category: CategoryOption | null;
    product: ProductOption | null;
}

interface ProductHighlightPanelProps {
    highlightId?: string;
    onClose: () => void;
    onCreated: (id: string) => void;
    onDelete: (highlight: HighlightRow) => void;
    onUnsavedChangesChange: (unsavedChanges: PanelUnsavedChanges | undefined) => void;
}

function ProductHighlightPanel({ highlightId, onClose, onCreated, onDelete, onUnsavedChangesChange }: ProductHighlightPanelProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const { data, loading, error } = useQuery<GQLProductHighlightsUiPanelQuery, GQLProductHighlightsUiPanelQueryVariables>(
        productHighlightPanelQuery,
        { variables: { id: highlightId ?? "" }, skip: highlightId === undefined, context: LocalErrorScopeApolloContext },
    );
    const highlight = data?.productHighlight;

    const initialValues = useMemo<ProductHighlightFormValues>(
        () => ({
            description: highlight?.description ?? "",
            category: highlight?.product.category ?? null,
            product: highlight?.product ?? null,
        }),
        [highlight],
    );

    if (highlightId !== undefined && !highlight) {
        return (
            <Panel title={intl.formatMessage({ id: "uiDemo.productHighlights.panelTitle", defaultMessage: "Highlight" })}>
                {loading ? (
                    <Skeleton variant="text" count={3} />
                ) : (
                    <EmptyState
                        icon={<Icon name="warning" />}
                        title={intl.formatMessage({
                            id: "uiDemo.productHighlights.loadFailed",
                            defaultMessage: "The highlight couldn't be loaded",
                        })}
                        description={error?.message}
                    />
                )}
            </Panel>
        );
    }

    const save = async (values: ProductHighlightFormValues) => {
        if (!values.product) {
            return { product: intl.formatMessage({ id: "uiDemo.productsCommon.required", defaultMessage: "Required" }) };
        }
        const input = { description: values.description.trim(), product: values.product.id };
        try {
            if (highlight) {
                await client.mutate<GQLProductHighlightsUiUpdateMutation, GQLProductHighlightsUiUpdateMutationVariables>({
                    mutation: updateProductHighlightMutation,
                    variables: { id: highlight.id, input },
                    refetchQueries: ["ProductHighlightsUiList"],
                    context: LocalErrorScopeApolloContext,
                });
            } else {
                const { data: created } = await client.mutate<GQLProductHighlightsUiCreateMutation, GQLProductHighlightsUiCreateMutationVariables>({
                    mutation: createProductHighlightMutation,
                    variables: { input },
                    refetchQueries: ["ProductHighlightsUiList"],
                    context: LocalErrorScopeApolloContext,
                });
                if (created) {
                    onCreated(created.createProductHighlight.id);
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

    return (
        <EntityFormPanel<ProductHighlightFormValues>
            title={highlight?.product.title ?? intl.formatMessage({ id: "uiDemo.productHighlights.newTitle", defaultMessage: "New highlight" })}
            initialValues={initialValues}
            onSubmit={save}
            onClose={onClose}
            onUnsavedChangesChange={onUnsavedChangesChange}
            footerStart={
                highlight && (
                    <Button size="small" variant="text" color="error" startIcon={<Icon name="delete" />} onClick={() => onDelete(highlight)}>
                        {intl.formatMessage({ id: "uiDemo.productsCommon.delete", defaultMessage: "Delete" })}
                    </Button>
                )
            }
            details={
                highlight && (
                    <KeyValueList
                        items={[
                            {
                                key: intl.formatMessage({ id: "uiDemo.productsCommon.createdAt", defaultMessage: "Created" }),
                                value: <FormattedDate value={highlight.createdAt} dateStyle="medium" timeStyle="short" />,
                            },
                            {
                                key: intl.formatMessage({ id: "uiDemo.productsCommon.updatedAt", defaultMessage: "Updated" }),
                                value: <FormattedDate value={highlight.updatedAt} dateStyle="medium" timeStyle="short" />,
                            },
                        ]}
                    />
                )
            }
        >
            <ProductHighlightFields />
        </EntityFormPanel>
    );
}

function ProductHighlightFields() {
    const intl = useIntl();
    const client = useApolloClient();
    const form = useForm<ProductHighlightFormValues>();
    const comboboxLabels = useComboboxLabels();
    const requiredMessage = intl.formatMessage({ id: "uiDemo.productsCommon.required", defaultMessage: "Required" });

    return (
        <>
            <TextareaField
                name="description"
                label={intl.formatMessage({ id: "uiDemo.productHighlights.description", defaultMessage: "Description" })}
                rows={3}
                required
                requiredMessage={requiredMessage}
            />
            <ComboboxField<CategoryOption>
                name="category"
                label={intl.formatMessage({ id: "uiDemo.productHighlights.category", defaultMessage: "Category" })}
                helperText={intl.formatMessage({
                    id: "uiDemo.productHighlights.categoryHelper",
                    defaultMessage: "Narrows the products to choose from.",
                })}
                placeholder={intl.formatMessage({ id: "uiDemo.productHighlights.allCategories", defaultMessage: "All categories" })}
                getOptionLabel={(category) => category.title}
                getOptionKey={(category) => category.id}
                labels={comboboxLabels}
                loadOptions={async (search, { signal }) => {
                    const { data } = await client.query<
                        GQLProductHighlightsUiCategoryOptionsQuery,
                        GQLProductHighlightsUiCategoryOptionsQueryVariables
                    >({
                        query: productHighlightCategoryOptionsQuery,
                        variables: { search: search || undefined },
                        context: { fetchOptions: { signal } },
                    });
                    return data.productCategories.nodes;
                }}
            />
            <OnFieldChange<CategoryOption | null>
                name="category"
                onChange={(category) => {
                    const product = form.getState().values.product;
                    if (category && product && product.category?.id !== category.id) {
                        form.change("product", null);
                    }
                }}
            />
            <ProductOptionsField requiredMessage={requiredMessage} />
        </>
    );
}

function ProductOptionsField({ requiredMessage }: { requiredMessage: string }) {
    const intl = useIntl();
    const client = useApolloClient();
    const form = useForm<ProductHighlightFormValues>();
    const comboboxLabels = useComboboxLabels();
    return (
        <ComboboxField<ProductOption>
            name="product"
            label={intl.formatMessage({ id: "uiDemo.productHighlights.product", defaultMessage: "Product" })}
            required
            requiredMessage={requiredMessage}
            placeholder={intl.formatMessage({ id: "uiDemo.productHighlights.chooseProduct", defaultMessage: "Choose a product" })}
            getOptionLabel={(product) => product.title}
            getOptionKey={(product) => product.id}
            renderOption={(product) => (
                <span className={styles.option}>
                    <span>{product.title}</span>
                    {product.category && <span className={styles.muted}>{product.category.title}</span>}
                </span>
            )}
            labels={comboboxLabels}
            loadOptions={async (search, { signal }) => {
                const category = form.getState().values.category;
                const { data } = await client.query<GQLProductHighlightsUiProductOptionsQuery, GQLProductHighlightsUiProductOptionsQueryVariables>({
                    query: productHighlightProductOptionsQuery,
                    variables: { search: search || undefined, filter: category ? { category: { equal: category.id } } : undefined },
                    context: { fetchOptions: { signal } },
                });
                return data.products.nodes;
            }}
        />
    );
}
