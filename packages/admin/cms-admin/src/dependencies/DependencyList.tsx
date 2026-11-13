import { type TypedDocumentNode, useQuery } from "@apollo/client";
import { type GqlFilter, messages } from "@dextinity/admin";
import {
    Banner,
    Button,
    Chip,
    DataGrid,
    type DataGridColumn,
    EmptyState,
    FilterBar,
    FilterChip,
    Icon,
    IconButton,
    Menu,
    MenuRadioGroup,
    MenuRadioItem,
    StatusIndicator,
    ToastViewport,
    useToasts,
} from "@dextinity/ui";
import { type ReactNode, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

import { useContentScope } from "../contentScope/Provider";
import { getContentScopeLabel } from "../contentScope/utils/getContentScopeLabel";
import { remoteListFilterParam } from "../dataGrid/remoteList/remoteListFilterParams";
import { toGqlSort } from "../dataGrid/remoteList/toGqlSort";
import { useDataGridLabels } from "../dataGrid/remoteList/useDataGridLabels";
import { useRemoteListPagination } from "../dataGrid/remoteList/useRemoteListPagination";
import { useRemoteListState } from "../dataGrid/remoteList/useRemoteListState";
import { useDependenciesConfig } from "./dependenciesConfig";
import { DependencyActions } from "./DependencyActions";
import { DependencyListRoot, InfoTitle, Name, NameCell, SecondaryText } from "./DependencyList.sc";
import { getDisplayNameString } from "./getDisplayNameString";
import { type DependencyTarget, useDependencyUrlResolver } from "./useDependencyUrlResolver";

export interface DependencyListItem extends DependencyTarget {
    rowId: string;
    name?: string | null;
    secondaryInformation?: string | null;
    visible: boolean;
}

interface DependencyListPage {
    nodes: DependencyListItem[];
    totalCount: number;
}

export type DependencyListQueryVariables = {
    offset: number;
    limit: number;
    forceRefresh?: boolean;
    filter?: GqlFilter;
    sort?: Array<{ field: string; direction: "ASC" | "DESC" }>;
};

interface DependencyListProps<Query> {
    query: TypedDocumentNode<Query, DependencyListQueryVariables>;
    variables: Record<string, unknown>;
    getPage: (data: Query) => DependencyListPage | undefined;
    /** Prefixes the URL parameters of the list. */
    listKey: "dependents" | "dependencies";
    /** The filter field of the GraphQL object type, which differs between dependents and dependencies. */
    typeFilterField: "rootGraphqlObjectType" | "targetGraphqlObjectType";
    labels: {
        list: string;
        emptyTitle: string;
        emptyDescription: string;
        infoTitle: string;
        infoDescription: string;
    };
}

const filters = {
    visibleOnly: remoteListFilterParam.boolean(true),
    type: remoteListFilterParam.string(),
};

const sortFields: Record<string, string> = { name: "name", type: "graphqlObjectType", visible: "visible" };
const sortableColumns = Object.keys(sortFields);

function getFilter({ search, visibleOnly, type, typeFilterField }: { search: string; visibleOnly: boolean; type: string; typeFilterField: string }) {
    const conditions: GqlFilter[] = [];
    if (visibleOnly) {
        conditions.push({ visible: { equal: true } });
    }
    if (type) {
        conditions.push({ [typeFilterField]: { equal: type } });
    }
    if (search) {
        const searchConditions: GqlFilter[] = [{ name: { contains: search } }, { secondaryInformation: { contains: search } }];
        // GqlFilter's index signature doesn't allow nesting `or` inside `and`, although the API does
        conditions.push({ or: searchConditions } as GqlFilter);
    }
    return conditions.length > 0 ? { and: conditions } : undefined;
}

export function DependencyList<Query>({ query, variables, getPage, listKey, typeFilterField, labels }: DependencyListProps<Query>) {
    const intl = useIntl();
    const history = useHistory();
    const { entityDependencyMap } = useDependenciesConfig();
    const contentScope = useContentScope();
    const resolveDependencyUrl = useDependencyUrlResolver();
    const { labels: dataGridLabels } = useDataGridLabels();
    const listState = useRemoteListState({
        queryParamsPrefix: listKey,
        filters,
        sortableColumns,
        defaultPageSize: 10,
        pageSizeStorageKey: "dextinity-dependency-list-page-size",
    });
    const { search, filters: filterValues } = listState;
    const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();

    const queryVariables: DependencyListQueryVariables = {
        offset: listState.offset,
        limit: listState.limit,
        filter: getFilter({ search, visibleOnly: filterValues.visibleOnly, type: filterValues.type, typeFilterField }),
        sort: toGqlSort(listState.sort, (columnKey) => sortFields[columnKey]),
        ...variables,
    };
    const { data, previousData, loading, error, refetch } = useQuery(query, { variables: queryVariables, fetchPolicy: "cache-and-network" });

    const page = data ? getPage(data) : previousData ? getPage(previousData) : undefined;
    const pagination = useRemoteListPagination(listState, page?.totalCount);

    if (error) {
        throw error;
    }

    const refresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch({ ...queryVariables, forceRefresh: true });
        } finally {
            setIsRefreshing(false);
        }
    };

    const getTypeLabel = (graphqlObjectType: string): ReactNode => entityDependencyMap[graphqlObjectType]?.displayName ?? graphqlObjectType;
    const typeOptions = Object.entries(entityDependencyMap).map(([value, dependency]) => ({
        value,
        label: getDisplayNameString(dependency.displayName, intl, value),
    }));
    const selectedTypeLabel = typeOptions.find((option) => option.value === filterValues.type)?.label ?? filterValues.type;

    // Scopes are only worth showing when the entries can actually originate from different scopes.
    const shouldShowScopeColumn = contentScope.values.length > 1;

    const columns: DataGridColumn<DependencyListItem>[] = [
        {
            key: "name",
            header: intl.formatMessage({ id: "dextinity.dependencies.dataGrid.nameAndInfo", defaultMessage: "Name/Info" }),
            sortable: true,
            render: (item) => (
                <NameCell>
                    <Name>{item.name ?? intl.formatMessage(messages.unknown)}</Name>
                    {item.secondaryInformation ? <SecondaryText>{item.secondaryInformation}</SecondaryText> : null}
                </NameCell>
            ),
            exportValue: (item) => item.name ?? null,
        },
        {
            key: "type",
            header: intl.formatMessage({ id: "dextinity.dependencies.dataGrid.type", defaultMessage: "Type" }),
            sortable: true,
            width: 180,
            render: (item) => (
                <Chip size="small" color="secondary">
                    {getTypeLabel(item.graphqlObjectType)}
                </Chip>
            ),
        },
        {
            key: "visible",
            header: intl.formatMessage({ id: "dextinity.dependencies.dataGrid.visible", defaultMessage: "Visible" }),
            sortable: true,
            width: 140,
            priority: "low",
            render: (item) => (
                <StatusIndicator status={item.visible ? "published" : "unpublished"}>
                    {item.visible
                        ? intl.formatMessage({ id: "dextinity.dependencies.dataGrid.visible.yes", defaultMessage: "Visible" })
                        : intl.formatMessage({ id: "dextinity.dependencies.dataGrid.visible.no", defaultMessage: "Hidden" })}
                </StatusIndicator>
            ),
        },
        ...(shouldShowScopeColumn
            ? [
                  {
                      key: "scope",
                      header: intl.formatMessage({ id: "dextinity.dependencies.dataGrid.scope", defaultMessage: "Scope" }),
                      width: 160,
                      priority: "low",
                      render: (item) => (
                          <SecondaryText>
                              {item.scope ? getContentScopeLabel({ scope: item.scope, values: contentScope.values }) : null}
                          </SecondaryText>
                      ),
                  } satisfies DataGridColumn<DependencyListItem>,
              ]
            : []),
    ];

    const openInThisTab = async (item: DependencyListItem) => {
        const dependencyUrl = resolveDependencyUrl(item);
        if (dependencyUrl.status === "available") {
            history.push(await dependencyUrl.loadUrl());
        }
    };

    const typeFilterLabel = intl.formatMessage({ id: "dextinity.dependencies.dataGrid.type", defaultMessage: "Type" });

    return (
        <DependencyListRoot>
            <FilterBar
                searchValue={listState.searchInput}
                onSearchChange={listState.setSearchInput}
                searchShortcut={false}
                resultCount={page?.totalCount}
                labels={{
                    search: intl.formatMessage({ id: "dextinity.dependencies.filter.search", defaultMessage: "Search" }),
                    searchPlaceholder: intl.formatMessage({
                        id: "dextinity.dependencies.filter.searchPlaceholder",
                        defaultMessage: "Search name or info",
                    }),
                    filters: intl.formatMessage({ id: "dextinity.dependencies.filter.filters", defaultMessage: "Filters" }),
                    resultCount: (count) =>
                        intl.formatMessage(
                            { id: "dextinity.dependencies.filter.resultCount", defaultMessage: "{count, plural, one {# result} other {# results}}" },
                            { count },
                        ),
                }}
                actions={
                    <IconButton
                        aria-label={intl.formatMessage({ id: "dextinity.dependencies.dataGrid.reloadTooltip", defaultMessage: "Reload" })}
                        variant="outlined"
                        color="secondary"
                        loading={isRefreshing}
                        onClick={() => void refresh()}
                    >
                        <Icon name="refresh" />
                    </IconButton>
                }
            >
                <FilterChip
                    selected={filterValues.visibleOnly}
                    onClick={() => listState.setFilter("visibleOnly", !filterValues.visibleOnly)}
                    status={filterValues.visibleOnly ? "published" : undefined}
                >
                    {intl.formatMessage({ id: "dextinity.dependencies.filter.visibleOnly", defaultMessage: "Visible only" })}
                </FilterChip>
                {typeOptions.length > 0 && (
                    <Menu
                        open={isTypeMenuOpen}
                        onOpenChange={setIsTypeMenuOpen}
                        trigger={
                            <FilterChip selected={filterValues.type !== ""} hasMenu onClick={() => undefined}>
                                {typeFilterLabel}
                            </FilterChip>
                        }
                    >
                        <MenuRadioGroup
                            value={filterValues.type}
                            onChange={(type) => {
                                listState.setFilter("type", type);
                                setIsTypeMenuOpen(false);
                            }}
                        >
                            <MenuRadioItem
                                value=""
                                label={intl.formatMessage({ id: "dextinity.dependencies.filter.allTypes", defaultMessage: "All types" })}
                            />
                            {typeOptions.map((option) => (
                                <MenuRadioItem key={option.value} value={option.value} label={option.label} />
                            ))}
                        </MenuRadioGroup>
                    </Menu>
                )}
                {filterValues.type !== "" && (
                    <Chip
                        color="secondary"
                        onClear={() => listState.setFilter("type", "")}
                        clearLabel={intl.formatMessage(
                            { id: "dextinity.dependencies.filter.removeType", defaultMessage: "Remove filter Type: {type}" },
                            { type: selectedTypeLabel },
                        )}
                    >
                        {intl.formatMessage(
                            { id: "dextinity.dependencies.filter.typeChip", defaultMessage: "Type: {type}" },
                            { type: selectedTypeLabel },
                        )}
                    </Chip>
                )}
            </FilterBar>
            <DataGrid
                aria-label={labels.list}
                columns={columns}
                rows={page?.nodes ?? []}
                getRowId={(item) => item.rowId}
                loading={loading && !page}
                loadingRowCount={listState.pageSize}
                sort={listState.sort}
                onSortChange={listState.setSort}
                onRowClick={(item) => void openInThisTab(item)}
                rowActions={(item) => (
                    <DependencyActions
                        {...item}
                        onCopyLinkError={() =>
                            addToast({
                                tone: "error",
                                message: intl.formatMessage({
                                    id: "dextinity.dependencies.dataGrid.copyLinkFailed",
                                    defaultMessage: "The link couldn't be copied",
                                }),
                            })
                        }
                    />
                )}
                pagination={pagination}
                labels={dataGridLabels}
                emptyState={
                    search !== "" || filterValues.type !== "" || filterValues.visibleOnly ? (
                        <EmptyState
                            icon={<Icon name="search" />}
                            title={intl.formatMessage({
                                id: "dextinity.dependencies.dataGrid.noMatches",
                                defaultMessage: "Nothing matches the filters",
                            })}
                            description={intl.formatMessage({
                                id: "dextinity.dependencies.dataGrid.noMatchesDescription",
                                defaultMessage: "Check the search, or show all items including hidden ones.",
                            })}
                            actions={
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    onClick={() => listState.update({ search: "", filters: { visibleOnly: false, type: "" } })}
                                >
                                    {intl.formatMessage({ id: "dextinity.dependencies.dataGrid.showAll", defaultMessage: "Show all" })}
                                </Button>
                            }
                        />
                    ) : (
                        <EmptyState icon={<Icon name="file" />} title={labels.emptyTitle} description={labels.emptyDescription} />
                    )
                }
            />
            <Banner tone="info">
                <InfoTitle>{labels.infoTitle}</InfoTitle>
                {labels.infoDescription}
            </Banner>
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.dependencies.notifications", defaultMessage: "Notifications" }) }}
            />
        </DependencyListRoot>
    );
}
