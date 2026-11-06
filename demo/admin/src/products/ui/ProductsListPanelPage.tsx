import { useApolloClient, useQuery } from "@apollo/client";
import {
    Button,
    Chip,
    DataGrid,
    type DataGridColumn,
    EmptyState,
    FilterBar,
    FilterChip,
    Icon,
    ListDetailLayout,
    Menu,
    MenuRadioGroup,
    MenuRadioItem,
    PageHeader,
    StatusIndicator,
    ToastViewport,
    useToasts,
    useUndoToast,
} from "@dextinity/ui";
import type { GQLProductFilter, GQLProductSortField, GQLProductStatus, GQLProductType } from "@src/graphql.generated";
import { useRouterLinkClick } from "@src/news/ui/useRouterLinkClick";
import { useEffect, useState } from "react";
import { FormattedDate, FormattedNumber, useIntl } from "react-intl";

import { ProductDetailsPanel } from "./ProductDetailsPanel";
import { getProductStatusIndicator, getProductStatusLabel, getProductTypeLabel, productTypes } from "./productLabels";
import { productsListQuery, updateProductStatusMutation } from "./ProductsListPanelPage.gql";
import type {
    GQLProductsUiListQuery,
    GQLProductsUiListQueryVariables,
    GQLProductsUiUpdateStatusMutation,
    GQLProductsUiUpdateStatusMutationVariables,
} from "./ProductsListPanelPage.gql.generated";
import styles from "./ProductsListPanelPage.module.css";
import { type ProductStatusFilter, useProductsListUrlState } from "./useProductsListUrlState";

type ProductRow = GQLProductsUiListQuery["products"]["nodes"][number];

const searchDebounceMs = 300;

const columnsHiddenNextToPanel = ["category", "updatedAt"];

interface ProductsListPanelPageProps {
    baseUrl: string;
}

export function ProductsListPanelPage({ baseUrl }: ProductsListPanelPageProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const navigateWithRouter = useRouterLinkClick();
    const { search, status, type, sort, page, pageSize, setPageSize, selectedProductId, update, selectProduct } = useProductsListUrlState();
    const [searchInput, setSearchInput] = useState(search);
    const [typeMenuOpen, setTypeMenuOpen] = useState(false);
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const { perform } = useUndoToast({
        addToast,
        labels: { undo: intl.formatMessage({ id: "uiDemo.products.undo", defaultMessage: "Undo" }) },
    });

    useEffect(() => {
        if (searchInput === search) {
            return;
        }
        const timeout = window.setTimeout(() => update({ search: searchInput }), searchDebounceMs);
        return () => window.clearTimeout(timeout);
    }, [searchInput, search, update]);

    const countFilter: GQLProductFilter = type ? { type: { equal: type } } : {};
    const filter: GQLProductFilter = status === "all" ? countFilter : { and: [countFilter, { status: { equal: status } }] };

    const { data, previousData, loading, error } = useQuery<GQLProductsUiListQuery, GQLProductsUiListQueryVariables>(productsListQuery, {
        fetchPolicy: "cache-and-network",
        variables: {
            offset: (page - 1) * pageSize,
            limit: pageSize,
            sort: [{ field: sort.key as GQLProductSortField, direction: sort.direction === "asc" ? "ASC" : "DESC" }],
            search: search || undefined,
            filter,
            countFilter,
        },
    });

    if (error) {
        throw error;
    }

    const shownData = data ?? previousData;
    const rows = shownData?.products.nodes ?? [];
    const total = shownData?.products.totalCount ?? 0;
    const isFiltered = search !== "" || status !== "all" || type !== null;

    const editUrl = (id: string) => `${baseUrl}/${id}/edit`;

    const setStatus = async (id: string, nextStatus: GQLProductStatus) => {
        try {
            await client.mutate<GQLProductsUiUpdateStatusMutation, GQLProductsUiUpdateStatusMutationVariables>({
                mutation: updateProductStatusMutation,
                variables: { id, status: nextStatus },
                refetchQueries: ["ProductsUiList"],
            });
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({
                    id: "uiDemo.products.statusFailed",
                    defaultMessage: "Changing the status failed · nothing was changed",
                }),
            });
        }
    };

    const changeStatus = (product: Pick<ProductRow, "id" | "title" | "status">, nextStatus: GQLProductStatus) => {
        if (product.status === nextStatus) {
            return;
        }
        const previousStatus = product.status;
        perform({
            run: () => void setStatus(product.id, nextStatus),
            undo: () => void setStatus(product.id, previousStatus),
            icon: <Icon name={nextStatus === "Deleted" ? "archive" : nextStatus === "Published" ? "eye" : "eye-off"} />,
            message: intl.formatMessage(
                { id: "uiDemo.products.statusChanged", defaultMessage: "“{title}” is now {status}" },
                { title: product.title, status: getProductStatusLabel(intl, nextStatus).toLowerCase() },
            ),
            undoneMessage: intl.formatMessage({ id: "uiDemo.products.statusUndone", defaultMessage: "Status change undone" }),
        });
    };

    const columns: DataGridColumn<ProductRow>[] = [
        {
            key: "title",
            header: intl.formatMessage({ id: "uiDemo.products.title", defaultMessage: "Title" }),
            sortable: true,
            render: (product) => (
                <span className={styles.titleCell}>
                    <span className={styles.title}>{product.title}</span>
                    <span className={styles.slug}>{`/${product.slug}`}</span>
                </span>
            ),
        },
        {
            key: "type",
            header: intl.formatMessage({ id: "uiDemo.products.type", defaultMessage: "Type" }),
            sortable: true,
            width: 120,
            priority: "low",
            render: (product) => <span className={styles.muted}>{getProductTypeLabel(intl, product.type)}</span>,
        },
        {
            key: "category",
            header: intl.formatMessage({ id: "uiDemo.products.category", defaultMessage: "Category" }),
            width: 180,
            priority: "low",
            render: (product) => <span className={styles.muted}>{product.category?.title ?? "–"}</span>,
        },
        {
            key: "price",
            header: intl.formatMessage({ id: "uiDemo.products.price", defaultMessage: "Price" }),
            sortable: true,
            width: 110,
            align: "end",
            render: (product) =>
                product.price != null ? (
                    <FormattedNumber value={product.price} style="currency" currency="EUR" />
                ) : (
                    <span className={styles.muted}>–</span>
                ),
        },
        {
            key: "updatedAt",
            header: intl.formatMessage({ id: "uiDemo.products.updatedAt", defaultMessage: "Updated" }),
            sortable: true,
            width: 130,
            priority: "low",
            render: (product) => (
                <span className={styles.muted}>
                    <FormattedDate value={product.updatedAt} dateStyle="medium" />
                </span>
            ),
        },
        {
            key: "status",
            header: intl.formatMessage({ id: "uiDemo.products.status", defaultMessage: "Status" }),
            sortable: true,
            width: 140,
            render: (product) => (
                <StatusIndicator status={getProductStatusIndicator(product.status)}>{getProductStatusLabel(intl, product.status)}</StatusIndicator>
            ),
        },
    ];

    const statusFilters: { value: ProductStatusFilter; count: number | undefined }[] = [
        { value: "all", count: shownData?.allProducts.totalCount },
        { value: "Published", count: shownData?.publishedProducts.totalCount },
        { value: "Unpublished", count: shownData?.unpublishedProducts.totalCount },
        { value: "Deleted", count: shownData?.deletedProducts.totalCount },
    ];

    const resetFilters = () => {
        setSearchInput("");
        update({ search: "", status: "all", type: null });
    };

    const isPanelOpen = selectedProductId != null;
    const visibleColumns = isPanelOpen ? columns.filter((column) => !columnsHiddenNextToPanel.includes(column.key)) : columns;
    const selectedProduct = rows.find((product) => product.id === selectedProductId);

    return (
        <>
            <ListDetailLayout
                open={isPanelOpen}
                onOpenChange={(open) => !open && selectProduct(null)}
                sidePanelLabel={
                    selectedProduct
                        ? intl.formatMessage(
                              { id: "uiDemo.products.panel.labelWithTitle", defaultMessage: "Details of {title}" },
                              { title: selectedProduct.title },
                          )
                        : intl.formatMessage({ id: "uiDemo.products.panel.label", defaultMessage: "Product details" })
                }
                header={
                    <PageHeader
                        eyebrow={intl.formatMessage({ id: "uiDemo.products.eyebrow", defaultMessage: "Products" })}
                        title={intl.formatMessage({ id: "uiDemo.products.pageTitle", defaultMessage: "Products" })}
                        subtitle={
                            shownData
                                ? intl.formatMessage(
                                      {
                                          id: "uiDemo.products.subtitle",
                                          defaultMessage: "{count, plural, one {# product} other {# products}} in total",
                                      },
                                      { count: shownData.totalProducts.totalCount },
                                  )
                                : undefined
                        }
                        actions={
                            <Button startIcon={<Icon name="plus" />} href={`${baseUrl}/add/add`} onClick={navigateWithRouter}>
                                {intl.formatMessage({ id: "uiDemo.products.new", defaultMessage: "New product" })}
                            </Button>
                        }
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                        resultCount={shownData ? total : undefined}
                        labels={{
                            search: intl.formatMessage({ id: "uiDemo.products.search", defaultMessage: "Search products" }),
                            searchPlaceholder: intl.formatMessage({
                                id: "uiDemo.products.searchPlaceholder",
                                defaultMessage: "Search title or slug",
                            }),
                            filters: intl.formatMessage({ id: "uiDemo.products.filters", defaultMessage: "Filters" }),
                            resultCount: (count) =>
                                intl.formatMessage(
                                    { id: "uiDemo.products.resultCount", defaultMessage: "{count, plural, one {# result} other {# results}}" },
                                    { count },
                                ),
                        }}
                    >
                        {statusFilters.map((filterOption) => (
                            <FilterChip
                                key={filterOption.value}
                                selected={status === filterOption.value}
                                onClick={() => update({ status: filterOption.value })}
                                count={filterOption.count}
                                status={filterOption.value === "all" ? undefined : getProductStatusIndicator(filterOption.value)}
                            >
                                {filterOption.value === "all"
                                    ? intl.formatMessage({ id: "uiDemo.products.filter.all", defaultMessage: "All" })
                                    : getProductStatusLabel(intl, filterOption.value)}
                            </FilterChip>
                        ))}
                        <Menu
                            open={typeMenuOpen}
                            onOpenChange={setTypeMenuOpen}
                            trigger={
                                <FilterChip selected={type !== null} hasMenu onClick={() => undefined}>
                                    {intl.formatMessage({ id: "uiDemo.products.type", defaultMessage: "Type" })}
                                </FilterChip>
                            }
                        >
                            <MenuRadioGroup
                                value={type ?? ""}
                                onChange={(nextType) => {
                                    update({ type: nextType === "" ? null : (nextType as GQLProductType) });
                                    setTypeMenuOpen(false);
                                }}
                            >
                                <MenuRadioItem
                                    value=""
                                    label={intl.formatMessage({ id: "uiDemo.products.filter.allTypes", defaultMessage: "All types" })}
                                />
                                {productTypes.map((option) => (
                                    <MenuRadioItem key={option} value={option} label={getProductTypeLabel(intl, option)} />
                                ))}
                            </MenuRadioGroup>
                        </Menu>
                        {type !== null && (
                            <Chip
                                onDelete={() => update({ type: null })}
                                labels={{
                                    delete: intl.formatMessage(
                                        { id: "uiDemo.products.filter.removeType", defaultMessage: "Remove filter Type: {type}" },
                                        { type: getProductTypeLabel(intl, type) },
                                    ),
                                }}
                            >
                                {intl.formatMessage(
                                    { id: "uiDemo.products.filter.typeChip", defaultMessage: "Type: {type}" },
                                    { type: getProductTypeLabel(intl, type) },
                                )}
                            </Chip>
                        )}
                    </FilterBar>
                }
                sidePanel={
                    selectedProductId != null && (
                        <ProductDetailsPanel
                            key={selectedProductId}
                            productId={selectedProductId}
                            editUrl={editUrl(selectedProductId)}
                            onClose={() => selectProduct(null)}
                            onChangeStatus={changeStatus}
                            onError={(message) => addToast({ tone: "error", message })}
                        />
                    )
                }
            >
                <DataGrid
                    aria-label={intl.formatMessage({ id: "uiDemo.products.pageTitle", defaultMessage: "Products" })}
                    columns={visibleColumns}
                    rows={rows}
                    getRowId={(product) => product.id}
                    loading={loading && !shownData}
                    sort={sort}
                    onSortChange={(nextSort) => update({ sort: nextSort, page })}
                    onRowClick={(product) => selectProduct(product.id)}
                    activeRowId={selectedProductId ?? undefined}
                    pagination={
                        total === 0
                            ? undefined
                            : {
                                  page,
                                  pageSize,
                                  total,
                                  onPageChange: (nextPage) => update({ page: nextPage }),
                                  onPageSizeChange: (nextPageSize) => {
                                      setPageSize(nextPageSize);
                                      update({ page: 1 });
                                  },
                                  labels: {
                                      navigation: intl.formatMessage({ id: "uiDemo.products.pagination", defaultMessage: "Pagination" }),
                                      pageSize: intl.formatMessage({ id: "uiDemo.products.pageSize", defaultMessage: "Per page" }),
                                      range: (from, to, count) =>
                                          intl.formatMessage(
                                              { id: "uiDemo.products.range", defaultMessage: "{from}–{to} of {count}" },
                                              { from, to, count },
                                          ),
                                      previous: intl.formatMessage({ id: "uiDemo.products.previousPage", defaultMessage: "Previous page" }),
                                      next: intl.formatMessage({ id: "uiDemo.products.nextPage", defaultMessage: "Next page" }),
                                      page: (pageNumber) =>
                                          intl.formatMessage({ id: "uiDemo.products.page", defaultMessage: "Page {page}" }, { page: pageNumber }),
                                  },
                              }
                    }
                    emptyState={
                        isFiltered ? (
                            <EmptyState
                                icon={<Icon name="search" />}
                                title={intl.formatMessage({ id: "uiDemo.products.noMatches", defaultMessage: "No products match the filters" })}
                                description={intl.formatMessage({
                                    id: "uiDemo.products.noMatchesDescription",
                                    defaultMessage: "Check the spelling or reset the filters.",
                                })}
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" onClick={resetFilters}>
                                        {intl.formatMessage({ id: "uiDemo.products.resetFilters", defaultMessage: "Reset filters" })}
                                    </Button>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={<Icon name="inbox" />}
                                title={intl.formatMessage({ id: "uiDemo.products.empty", defaultMessage: "No products yet" })}
                            />
                        )
                    }
                />
            </ListDetailLayout>
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "uiDemo.products.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}
