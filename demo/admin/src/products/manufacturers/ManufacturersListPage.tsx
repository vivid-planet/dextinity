import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import {
    remoteListFilterParam,
    toGqlSort,
    useDataGridLabels,
    useRemoteListPagination,
    useRemoteListState,
    useRouterLinkClick,
} from "@dextinity/cms-admin";
import {
    Button,
    Chip,
    DataGrid,
    type DataGridColumn,
    EmptyState,
    FilterBar,
    FilterChip,
    Icon,
    IconButton,
    ListLayout,
    Menu,
    MenuRadioGroup,
    MenuRadioItem,
    PageHeader,
    ToastViewport,
    useToasts,
} from "@dextinity/ui";
import type { GQLManufacturerFilter, GQLManufacturerSortField, GQLProductType } from "@src/graphql.generated";
import { DeleteEntityDialog } from "@src/products/common/DeleteEntityDialog";
import { useFilterBarLabels } from "@src/products/common/useFilterBarLabels";
import { getProductTypeLabel, productTypes } from "@src/products/ui/productLabels";
import { useState } from "react";
import { FormattedDate, useIntl } from "react-intl";
import { useHistory } from "react-router";

import { deleteManufacturerMutation, manufacturerCountriesQuery, manufacturersListQuery } from "./ManufacturersListPage.gql";
import type {
    GQLManufacturersUiCountriesQuery,
    GQLManufacturersUiCountriesQueryVariables,
    GQLManufacturersUiDeleteMutation,
    GQLManufacturersUiDeleteMutationVariables,
    GQLManufacturersUiListQuery,
    GQLManufacturersUiListQueryVariables,
} from "./ManufacturersListPage.gql.generated";
import styles from "./ManufacturersListPage.module.css";

type ManufacturerRow = GQLManufacturersUiListQuery["manufacturers"]["nodes"][number];

const filterParams = {
    country: remoteListFilterParam.string(),
    productType: remoteListFilterParam.oneOf(productTypes),
};

const sortableColumns = ["name", "productType", "updatedAt", "addressAsEmbeddable_country"] satisfies GQLManufacturerSortField[];
const defaultSort = { key: "name", direction: "asc" } as const;

interface ManufacturersListPageProps {
    baseUrl: string;
}

export function ManufacturersListPage({ baseUrl }: ManufacturersListPageProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const history = useHistory();
    const navigateWithRouter = useRouterLinkClick();
    const listState = useRemoteListState({
        queryParamsPrefix: "manufacturers",
        filters: filterParams,
        sortableColumns,
        defaultSort,
        pageSizeStorageKey: "demo-admin-manufacturers-page-size",
    });
    const { labels: dataGridLabels } = useDataGridLabels();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const [countryMenuOpen, setCountryMenuOpen] = useState(false);
    const [productTypeMenuOpen, setProductTypeMenuOpen] = useState(false);
    const [manufacturerToDelete, setManufacturerToDelete] = useState<ManufacturerRow>();
    const [deleting, setDeleting] = useState(false);

    const { country, productType } = listState.filters;
    const filters: GQLManufacturerFilter[] = [];
    if (country) {
        filters.push({ addressAsEmbeddable_country: { equal: country } });
    }
    if (productType) {
        filters.push({ productType: { equal: productType } });
    }

    const { data, previousData, loading, error } = useQuery<GQLManufacturersUiListQuery, GQLManufacturersUiListQueryVariables>(
        manufacturersListQuery,
        {
            variables: {
                offset: listState.offset,
                limit: listState.limit,
                sort: toGqlSort<GQLManufacturerSortField>(listState.sort),
                search: listState.search || undefined,
                filter: filters.length > 0 ? { and: filters } : undefined,
            },
            fetchPolicy: "cache-and-network",
        },
    );
    const { data: countriesData } = useQuery<GQLManufacturersUiCountriesQuery, GQLManufacturersUiCountriesQueryVariables>(manufacturerCountriesQuery);
    const shownData = data ?? previousData;
    const pagination = useRemoteListPagination(listState, shownData?.manufacturers.totalCount);
    const filterBarLabels = useFilterBarLabels({
        search: intl.formatMessage({ id: "uiDemo.manufacturers.search", defaultMessage: "Search manufacturers" }),
        searchPlaceholder: intl.formatMessage({ id: "uiDemo.manufacturers.searchPlaceholder", defaultMessage: "Search name or address" }),
    });

    if (error) {
        throw error;
    }

    const editUrl = (id: string) => `${baseUrl}/${id}/edit`;
    const countries = countriesData?.manufacturerCountries.nodes ?? [];
    const countryLabel = (countryId: string) => countries.find((option) => option.id === countryId)?.label ?? countryId;

    const deleteManufacturer = async () => {
        if (!manufacturerToDelete) {
            return;
        }
        setDeleting(true);
        try {
            await client.mutate<GQLManufacturersUiDeleteMutation, GQLManufacturersUiDeleteMutationVariables>({
                mutation: deleteManufacturerMutation,
                variables: { id: manufacturerToDelete.id },
                refetchQueries: ["ManufacturersUiList", "ManufacturersUiCountries"],
                awaitRefetchQueries: true,
                context: LocalErrorScopeApolloContext,
            });
            addToast({ message: intl.formatMessage({ id: "uiDemo.manufacturers.deleted", defaultMessage: "Manufacturer deleted" }) });
        } catch (deleteError) {
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    { id: "uiDemo.productsCommon.deleteFailed", defaultMessage: "Deleting failed: {reason}" },
                    { reason: deleteError instanceof Error ? deleteError.message : String(deleteError) },
                ),
            });
        } finally {
            setDeleting(false);
            setManufacturerToDelete(undefined);
        }
    };

    const columns: DataGridColumn<ManufacturerRow>[] = [
        {
            key: "name",
            header: intl.formatMessage({ id: "uiDemo.manufacturers.name", defaultMessage: "Name" }),
            sortable: true,
            render: (manufacturer) => <span className={styles.name}>{manufacturer.name}</span>,
        },
        {
            key: "address",
            header: intl.formatMessage({ id: "uiDemo.manufacturers.address", defaultMessage: "Address" }),
            render: (manufacturer) =>
                manufacturer.address ? (
                    <span className={styles.address}>
                        <span>{[manufacturer.address.street, manufacturer.address.streetNumber].filter((part) => part != null).join(" ")}</span>
                        <span className={styles.muted}>{`${manufacturer.address.zip} · ${manufacturer.address.country}`}</span>
                    </span>
                ) : (
                    <span className={styles.muted}>–</span>
                ),
        },
        {
            key: "alternativeAddress",
            header: intl.formatMessage({ id: "uiDemo.manufacturers.alternativeAddress", defaultMessage: "Alternative address" }),
            width: 170,
            priority: "low",
            render: (manufacturer) =>
                manufacturer.address?.alternativeAddress ? (
                    <Chip size="small" variant="outlined" color="secondary">
                        {manufacturer.address.alternativeAddress.country}
                    </Chip>
                ) : (
                    <span className={styles.muted}>–</span>
                ),
        },
        {
            key: "productType",
            header: intl.formatMessage({ id: "uiDemo.manufacturers.productType", defaultMessage: "Product type" }),
            sortable: true,
            width: 140,
            priority: "low",
            render: (manufacturer) =>
                manufacturer.productType ? getProductTypeLabel(intl, manufacturer.productType) : <span className={styles.muted}>–</span>,
        },
        {
            key: "updatedAt",
            header: intl.formatMessage({ id: "uiDemo.productsCommon.updatedAt", defaultMessage: "Updated" }),
            sortable: true,
            width: 140,
            priority: "low",
            render: (manufacturer) => (
                <span className={styles.muted}>
                    <FormattedDate value={manufacturer.updatedAt} dateStyle="medium" />
                </span>
            ),
        },
    ];

    return (
        <>
            <ListLayout
                header={
                    <PageHeader
                        eyebrow={intl.formatMessage({ id: "uiDemo.manufacturers.eyebrow", defaultMessage: "Products" })}
                        title={intl.formatMessage({ id: "uiDemo.manufacturers.pageTitle", defaultMessage: "Manufacturers" })}
                        actions={
                            <Button startIcon={<Icon name="plus" />} href={`${baseUrl}/add`} onClick={navigateWithRouter}>
                                {intl.formatMessage({ id: "uiDemo.manufacturers.new", defaultMessage: "New manufacturer" })}
                            </Button>
                        }
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={listState.searchInput}
                        onSearchChange={listState.setSearchInput}
                        resultCount={shownData?.manufacturers.totalCount}
                        labels={filterBarLabels}
                    >
                        <Menu
                            open={countryMenuOpen}
                            onOpenChange={setCountryMenuOpen}
                            trigger={
                                <FilterChip selected={country !== ""} hasMenu onClick={() => undefined}>
                                    {intl.formatMessage({ id: "uiDemo.manufacturers.country", defaultMessage: "Country" })}
                                </FilterChip>
                            }
                        >
                            <MenuRadioGroup
                                value={country}
                                onChange={(nextCountry) => {
                                    listState.setFilter("country", nextCountry);
                                    setCountryMenuOpen(false);
                                }}
                            >
                                <MenuRadioItem
                                    value=""
                                    label={intl.formatMessage({ id: "uiDemo.manufacturers.allCountries", defaultMessage: "All countries" })}
                                />
                                {countries.map((option) => (
                                    <MenuRadioItem
                                        key={option.id}
                                        value={option.id}
                                        label={intl.formatMessage(
                                            { id: "uiDemo.manufacturers.countryOption", defaultMessage: "{country} ({count})" },
                                            { country: option.label, count: option.used },
                                        )}
                                    />
                                ))}
                            </MenuRadioGroup>
                        </Menu>
                        <Menu
                            open={productTypeMenuOpen}
                            onOpenChange={setProductTypeMenuOpen}
                            trigger={
                                <FilterChip selected={productType !== null} hasMenu onClick={() => undefined}>
                                    {intl.formatMessage({ id: "uiDemo.manufacturers.productType", defaultMessage: "Product type" })}
                                </FilterChip>
                            }
                        >
                            <MenuRadioGroup
                                value={productType ?? ""}
                                onChange={(nextType) => {
                                    listState.setFilter("productType", nextType === "" ? null : (nextType as GQLProductType));
                                    setProductTypeMenuOpen(false);
                                }}
                            >
                                <MenuRadioItem
                                    value=""
                                    label={intl.formatMessage({ id: "uiDemo.manufacturers.allProductTypes", defaultMessage: "All product types" })}
                                />
                                {productTypes.map((option) => (
                                    <MenuRadioItem key={option} value={option} label={getProductTypeLabel(intl, option)} />
                                ))}
                            </MenuRadioGroup>
                        </Menu>
                        {country !== "" && (
                            <Chip
                                color="secondary"
                                onClear={() => listState.setFilter("country", "")}
                                clearLabel={intl.formatMessage(
                                    { id: "uiDemo.manufacturers.removeCountry", defaultMessage: "Remove filter Country: {country}" },
                                    { country: countryLabel(country) },
                                )}
                            >
                                {intl.formatMessage(
                                    { id: "uiDemo.manufacturers.countryChip", defaultMessage: "Country: {country}" },
                                    { country: countryLabel(country) },
                                )}
                            </Chip>
                        )}
                        {productType !== null && (
                            <Chip
                                color="secondary"
                                onClear={() => listState.setFilter("productType", null)}
                                clearLabel={intl.formatMessage(
                                    { id: "uiDemo.manufacturers.removeProductType", defaultMessage: "Remove filter Product type: {type}" },
                                    { type: getProductTypeLabel(intl, productType) },
                                )}
                            >
                                {intl.formatMessage(
                                    { id: "uiDemo.manufacturers.productTypeChip", defaultMessage: "Product type: {type}" },
                                    { type: getProductTypeLabel(intl, productType) },
                                )}
                            </Chip>
                        )}
                    </FilterBar>
                }
            >
                <DataGrid
                    aria-label={intl.formatMessage({ id: "uiDemo.manufacturers.pageTitle", defaultMessage: "Manufacturers" })}
                    columns={columns}
                    rows={shownData?.manufacturers.nodes ?? []}
                    getRowId={(manufacturer) => manufacturer.id}
                    loading={loading && !shownData}
                    sort={listState.sort}
                    onSortChange={listState.setSort}
                    onRowClick={(manufacturer) => history.push(editUrl(manufacturer.id))}
                    rowActions={(manufacturer) => (
                        <IconButton
                            aria-label={intl.formatMessage(
                                { id: "uiDemo.manufacturers.deleteManufacturer", defaultMessage: "Delete {name}" },
                                { name: manufacturer.name },
                            )}
                            variant="text"
                            color="secondary"
                            size="small"
                            onClick={() => setManufacturerToDelete(manufacturer)}
                        >
                            <Icon name="delete" />
                        </IconButton>
                    )}
                    labels={dataGridLabels}
                    pagination={pagination}
                    emptyState={
                        listState.isFiltered ? (
                            <EmptyState
                                icon={<Icon name="search" />}
                                title={intl.formatMessage({
                                    id: "uiDemo.manufacturers.noMatches",
                                    defaultMessage: "No manufacturers match the filters",
                                })}
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" onClick={listState.resetFilters}>
                                        {intl.formatMessage({ id: "uiDemo.manufacturers.resetFilters", defaultMessage: "Reset filters" })}
                                    </Button>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={<Icon name="inbox" />}
                                title={intl.formatMessage({ id: "uiDemo.manufacturers.empty", defaultMessage: "No manufacturers yet" })}
                            />
                        )
                    }
                />
            </ListLayout>
            <DeleteEntityDialog
                entryName={manufacturerToDelete?.name}
                description={intl.formatMessage({
                    id: "uiDemo.manufacturers.deleteDescription",
                    defaultMessage: "Its products keep existing without a manufacturer. This can't be undone.",
                })}
                deleting={deleting}
                onCancel={() => setManufacturerToDelete(undefined)}
                onConfirm={() => void deleteManufacturer()}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "uiDemo.productsCommon.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}
