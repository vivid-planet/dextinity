import { gql, useQuery } from "@apollo/client";
import { messages } from "@dextinity/admin";
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
} from "@dextinity/ui";
import { type ReactNode, useState } from "react";
import { defineMessages, FormattedDate, useIntl } from "react-intl";
import { useHistory, useRouteMatch } from "react-router";

import { type ContentScope, useContentScope } from "../contentScope/Provider";
import { useContentScopeConfig } from "../contentScope/useContentScopeConfig";
import { getContentScopeLabel } from "../contentScope/utils/getContentScopeLabel";
import { DataGridRowActions, DataGridSecondaryText, DataGridTitle, DataGridTitleCell } from "../dataGrid/dataGridCells";
import { remoteListFilterParam } from "../dataGrid/remoteList/remoteListFilterParams";
import { toGqlSort } from "../dataGrid/remoteList/toGqlSort";
import { useDataGridLabels } from "../dataGrid/remoteList/useDataGridLabels";
import { useRemoteListPagination } from "../dataGrid/remoteList/useRemoteListPagination";
import { useRemoteListState } from "../dataGrid/remoteList/useRemoteListState";
import { useDependenciesConfig } from "../dependencies/dependenciesConfig";
import { getDisplayNameString } from "../dependencies/getDisplayNameString";
import type { GQLWarningFilter, GQLWarningSeverity, GQLWarningSortField, GQLWarningStatus } from "../graphql.generated";
import { useWarningSourceUrlResolver } from "./useWarningSourceUrl";
import { WarningMessage } from "./WarningMessage";
import { useWarningsConfig } from "./warningsConfig";
import { WarningSeverity, warningSeverityLabels, warningSeverityStatus } from "./WarningSeverity";
import type { GQLWarningsListFragment, GQLWarningsListQuery, GQLWarningsListQueryVariables } from "./WarningsPage.generated";

const warningsListFragment = gql`
    fragment WarningsList on Warning {
        id
        createdAt
        message
        severity
        status
        scope
        sourceInfo {
            rootEntityName
            rootColumnName
            targetId
            jsonPath
        }
        entityInfo {
            name
            secondaryInformation
            visible
        }
    }
`;

const warningsListQuery = gql`
    query WarningsList(
        $offset: Int!
        $limit: Int!
        $sort: [WarningSort!]
        $search: String
        $filter: WarningFilter!
        $countFilter: WarningFilter!
        $scopes: [JSONObject!]!
        $status: [WarningStatus!]!
    ) {
        warnings(offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter, scopes: $scopes, status: $status) {
            nodes {
                ...WarningsList
            }
            totalCount
        }
        totalWarnings: warnings(limit: 1, scopes: $scopes, status: $status) {
            totalCount
        }
        allWarnings: warnings(limit: 1, search: $search, filter: $countFilter, scopes: $scopes, status: $status) {
            totalCount
        }
        highWarnings: warnings(
            limit: 1
            search: $search
            filter: { and: [$countFilter, { severity: { equal: high } }] }
            scopes: $scopes
            status: $status
        ) {
            totalCount
        }
        mediumWarnings: warnings(
            limit: 1
            search: $search
            filter: { and: [$countFilter, { severity: { equal: medium } }] }
            scopes: $scopes
            status: $status
        ) {
            totalCount
        }
        lowWarnings: warnings(
            limit: 1
            search: $search
            filter: { and: [$countFilter, { severity: { equal: low } }] }
            scopes: $scopes
            status: $status
        ) {
            totalCount
        }
    }
    ${warningsListFragment}
`;

const warningSeverities: GQLWarningSeverity[] = ["high", "medium", "low"];
const warningStatuses: GQLWarningStatus[] = ["open", "resolved", "ignored"];

const warningStatusLabels = defineMessages({
    open: { id: "dextinity.warnings.status.open", defaultMessage: "Open" },
    resolved: { id: "dextinity.warnings.status.resolved", defaultMessage: "Resolved" },
    ignored: { id: "dextinity.warnings.status.ignored", defaultMessage: "Ignored" },
});

const warningsListFilters = {
    severity: remoteListFilterParam.oneOf(warningSeverities),
    status: remoteListFilterParam.oneOf(warningStatuses, "open"),
    type: remoteListFilterParam.string(),
    scope: remoteListFilterParam.string(),
    visibleOnly: remoteListFilterParam.boolean(true),
};

const sortableWarningColumns: GQLWarningSortField[] = ["createdAt", "message", "severity", "type", "name"];

const defaultWarningsSort = { key: "createdAt", direction: "desc" } as const;

export interface WarningsPageProps {
    /** Lists the warnings of all content scopes the user can access instead of only the current one, with a filter by scope. */
    showAllScopes?: boolean;
}

/**
 * The warnings of the content, e.g. missing alt texts or expired file licenses, built with `@dextinity/ui`. A click on a warning opens its
 * source.
 */
export function WarningsPage({ showAllScopes = false }: WarningsPageProps) {
    const intl = useIntl();
    const history = useHistory();
    const { match, scope: currentScope, values: scopeValues } = useContentScope();
    const routeMatch = useRouteMatch();
    useContentScopeConfig({ redirectPathAfterChange: routeMatch.url.replace(match.url, "") });
    const { messages: warningMessages } = useWarningsConfig();
    const { entityDependencyMap } = useDependenciesConfig();
    const { labels: dataGridLabels } = useDataGridLabels();
    const resolveWarningSourceUrl = useWarningSourceUrlResolver();
    const listState = useRemoteListState({
        filters: warningsListFilters,
        sortableColumns: sortableWarningColumns,
        defaultSort: defaultWarningsSort,
        pageSizeStorageKey: "dextinity-warnings-page-size",
    });
    const { search, filters } = listState;
    const [openFilterMenu, setOpenFilterMenu] = useState<"status" | "type" | "scope">();

    const scopeOptions = scopeValues.map((value) => ({
        value: JSON.stringify(value.scope),
        label: getContentScopeLabel({ scope: value.scope, values: scopeValues }),
    }));
    const selectedScope = showAllScopes ? scopeOptions.find((option) => option.value === filters.scope) : undefined;
    const scopes: ContentScope[] = selectedScope
        ? [JSON.parse(selectedScope.value)]
        : showAllScopes
          ? scopeValues.map((value) => value.scope)
          : [currentScope];

    const typeOptions = Object.entries(entityDependencyMap).map(([value, dependency]) => ({
        value,
        label: getDisplayNameString(dependency.displayName, intl, value),
    }));
    const selectedTypeLabel = typeOptions.find((option) => option.value === filters.type)?.label ?? filters.type;

    const countConditions: GQLWarningFilter[] = [];
    if (filters.visibleOnly) {
        countConditions.push({ visible: { equal: true } });
    }
    if (filters.type) {
        countConditions.push({ type: { equal: filters.type } });
    }
    const countFilter: GQLWarningFilter = { and: countConditions };
    const filter: GQLWarningFilter = filters.severity ? { and: [countFilter, { severity: { equal: filters.severity } }] } : countFilter;

    const { data, previousData, loading, error } = useQuery<GQLWarningsListQuery, GQLWarningsListQueryVariables>(warningsListQuery, {
        fetchPolicy: "cache-and-network",
        variables: {
            offset: listState.offset,
            limit: listState.limit,
            sort: toGqlSort<GQLWarningSortField>(listState.sort),
            search: search || undefined,
            filter,
            countFilter,
            scopes,
            status: [filters.status],
        },
    });
    const shownData = data ?? previousData;
    const total = shownData?.warnings.totalCount;
    const pagination = useRemoteListPagination(listState, total);

    if (error) {
        throw error;
    }

    const getTypeLabel = (rootEntityName: string): ReactNode => entityDependencyMap[rootEntityName]?.displayName ?? rootEntityName;
    const getScopeLabel = (scope: ContentScope | null) =>
        scope ? getContentScopeLabel({ scope, values: scopeValues }) : intl.formatMessage(messages.globalContentScope);

    const columns: DataGridColumn<GQLWarningsListFragment>[] = [
        {
            key: "message",
            header: intl.formatMessage({ id: "dextinity.warnings.message", defaultMessage: "Warning" }),
            sortable: true,
            render: (warning) => (
                <DataGridTitleCell>
                    <DataGridTitle>
                        <WarningMessage message={warning.message} warningMessages={warningMessages} />
                    </DataGridTitle>
                    <DataGridSecondaryText>
                        {[warning.entityInfo?.name ?? intl.formatMessage(messages.unknown), warning.entityInfo?.secondaryInformation]
                            .filter(Boolean)
                            .join(" · ")}
                    </DataGridSecondaryText>
                </DataGridTitleCell>
            ),
        },
        {
            key: "severity",
            header: intl.formatMessage({ id: "dextinity.warning.severity", defaultMessage: "Severity" }),
            sortable: true,
            width: 130,
            render: (warning) => <WarningSeverity severity={warning.severity} />,
        },
        {
            key: "type",
            header: intl.formatMessage({ id: "dextinity.warning.type", defaultMessage: "Type" }),
            sortable: true,
            width: 160,
            priority: "low",
            render: (warning) => (
                <Chip size="small" color="secondary">
                    {getTypeLabel(warning.sourceInfo.rootEntityName)}
                </Chip>
            ),
        },
        ...(showAllScopes
            ? [
                  {
                      key: "scope",
                      header: intl.formatMessage({ id: "dextinity.warning.scope", defaultMessage: "Scope" }),
                      width: 180,
                      priority: "low",
                      render: (warning) => <DataGridSecondaryText>{getScopeLabel(warning.scope)}</DataGridSecondaryText>,
                  } satisfies DataGridColumn<GQLWarningsListFragment>,
              ]
            : []),
        {
            key: "createdAt",
            header: intl.formatMessage({ id: "dextinity.warning.dateTime", defaultMessage: "Date / Time" }),
            sortable: true,
            width: 180,
            render: (warning) => (
                <DataGridSecondaryText>
                    <FormattedDate value={warning.createdAt} dateStyle="medium" timeStyle="short" />
                </DataGridSecondaryText>
            ),
        },
    ];

    const statusLabel = intl.formatMessage({ id: "dextinity.warnings.filter.status", defaultMessage: "Status" });
    const typeLabel = intl.formatMessage({ id: "dextinity.warning.type", defaultMessage: "Type" });
    const scopeLabel = intl.formatMessage({ id: "dextinity.warning.scope", defaultMessage: "Scope" });
    const severityCounts: Record<GQLWarningSeverity | "all", number | undefined> = {
        all: shownData?.allWarnings.totalCount,
        high: shownData?.highWarnings.totalCount,
        medium: shownData?.mediumWarnings.totalCount,
        low: shownData?.lowWarnings.totalCount,
    };

    const closeFilterMenu = () => setOpenFilterMenu(undefined);
    const filterMenuProps = (menu: "status" | "type" | "scope") => ({
        open: openFilterMenu === menu,
        onOpenChange: (open: boolean) => setOpenFilterMenu(open ? menu : undefined),
    });

    return (
        <ListLayout
            header={
                <PageHeader
                    eyebrow={[
                        intl.formatMessage({ id: "dextinity.warnings.eyebrow", defaultMessage: "System" }),
                        showAllScopes
                            ? intl.formatMessage({ id: "dextinity.warnings.allScopes", defaultMessage: "All scopes" })
                            : getScopeLabel(currentScope),
                    ].join(" · ")}
                    title={intl.formatMessage({ id: "dextinity.warnings.warnings", defaultMessage: "Warnings" })}
                    subtitle={
                        shownData
                            ? intl.formatMessage(
                                  {
                                      id: "dextinity.warnings.subtitle",
                                      defaultMessage:
                                          "{count, plural, one {# warning} other {# warnings}} {status, select, open {open} resolved {resolved} other {ignored}}",
                                  },
                                  { count: shownData.totalWarnings.totalCount, status: filters.status },
                              )
                            : undefined
                    }
                />
            }
            toolbar={
                <FilterBar
                    searchValue={listState.searchInput}
                    onSearchChange={listState.setSearchInput}
                    resultCount={total}
                    labels={{
                        search: intl.formatMessage({ id: "dextinity.warnings.filter.search", defaultMessage: "Search warnings" }),
                        searchPlaceholder: intl.formatMessage({
                            id: "dextinity.warnings.filter.searchPlaceholder",
                            defaultMessage: "Search name, info or type",
                        }),
                        filters: intl.formatMessage({ id: "dextinity.warnings.filter.filters", defaultMessage: "Filters" }),
                        resultCount: (count) =>
                            intl.formatMessage(
                                { id: "dextinity.warnings.filter.resultCount", defaultMessage: "{count, plural, one {# result} other {# results}}" },
                                { count },
                            ),
                    }}
                >
                    <FilterChip selected={filters.severity === null} onClick={() => listState.setFilter("severity", null)} count={severityCounts.all}>
                        {intl.formatMessage({ id: "dextinity.warnings.filter.allSeverities", defaultMessage: "All" })}
                    </FilterChip>
                    {warningSeverities.map((severity) => (
                        <FilterChip
                            key={severity}
                            selected={filters.severity === severity}
                            onClick={() => listState.setFilter("severity", severity)}
                            count={severityCounts[severity]}
                            status={warningSeverityStatus[severity]}
                        >
                            {intl.formatMessage(warningSeverityLabels[severity])}
                        </FilterChip>
                    ))}
                    <Menu
                        {...filterMenuProps("status")}
                        trigger={
                            <FilterChip selected={filters.status !== "open"} hasMenu onClick={() => undefined}>
                                {filters.status === "open"
                                    ? statusLabel
                                    : `${statusLabel}: ${intl.formatMessage(warningStatusLabels[filters.status])}`}
                            </FilterChip>
                        }
                    >
                        <MenuRadioGroup
                            value={filters.status}
                            onChange={(status) => {
                                listState.setFilter("status", status as GQLWarningStatus);
                                closeFilterMenu();
                            }}
                        >
                            {warningStatuses.map((status) => (
                                <MenuRadioItem key={status} value={status} label={intl.formatMessage(warningStatusLabels[status])} />
                            ))}
                        </MenuRadioGroup>
                    </Menu>
                    {typeOptions.length > 0 && (
                        <Menu
                            {...filterMenuProps("type")}
                            trigger={
                                <FilterChip selected={filters.type !== ""} hasMenu onClick={() => undefined}>
                                    {typeLabel}
                                </FilterChip>
                            }
                        >
                            <MenuRadioGroup
                                value={filters.type}
                                onChange={(type) => {
                                    listState.setFilter("type", type);
                                    closeFilterMenu();
                                }}
                            >
                                <MenuRadioItem
                                    value=""
                                    label={intl.formatMessage({ id: "dextinity.warnings.filter.allTypes", defaultMessage: "All types" })}
                                />
                                {typeOptions.map((option) => (
                                    <MenuRadioItem key={option.value} value={option.value} label={option.label} />
                                ))}
                            </MenuRadioGroup>
                        </Menu>
                    )}
                    {showAllScopes && scopeOptions.length > 1 && (
                        <Menu
                            {...filterMenuProps("scope")}
                            trigger={
                                <FilterChip selected={selectedScope !== undefined} hasMenu onClick={() => undefined}>
                                    {selectedScope ? `${scopeLabel}: ${selectedScope.label}` : scopeLabel}
                                </FilterChip>
                            }
                        >
                            <MenuRadioGroup
                                value={selectedScope?.value ?? ""}
                                onChange={(scope) => {
                                    listState.setFilter("scope", scope);
                                    closeFilterMenu();
                                }}
                            >
                                <MenuRadioItem
                                    value=""
                                    label={intl.formatMessage({ id: "dextinity.warnings.allScopes", defaultMessage: "All scopes" })}
                                />
                                {scopeOptions.map((option) => (
                                    <MenuRadioItem key={option.value} value={option.value} label={option.label} />
                                ))}
                            </MenuRadioGroup>
                        </Menu>
                    )}
                    <FilterChip
                        selected={filters.visibleOnly}
                        onClick={() => listState.setFilter("visibleOnly", !filters.visibleOnly)}
                        status={filters.visibleOnly ? "published" : undefined}
                    >
                        {intl.formatMessage({ id: "dextinity.warnings.filter.visibleOnly", defaultMessage: "Visible only" })}
                    </FilterChip>
                    {filters.type !== "" && (
                        <Chip
                            color="secondary"
                            onClear={() => listState.setFilter("type", "")}
                            clearLabel={intl.formatMessage(
                                { id: "dextinity.warnings.filter.removeType", defaultMessage: "Remove filter Type: {type}" },
                                { type: selectedTypeLabel },
                            )}
                        >
                            {`${typeLabel}: ${selectedTypeLabel}`}
                        </Chip>
                    )}
                </FilterBar>
            }
        >
            <DataGrid
                aria-label={intl.formatMessage({ id: "dextinity.warnings.warnings", defaultMessage: "Warnings" })}
                columns={columns}
                rows={shownData?.warnings.nodes ?? []}
                getRowId={(warning) => warning.id}
                loading={loading && !shownData}
                loadingRowCount={listState.pageSize}
                sort={listState.sort}
                onSortChange={listState.setSort}
                onRowClick={async (warning) => {
                    const loadUrl = resolveWarningSourceUrl(warning.sourceInfo, warning.scope ?? undefined);
                    if (loadUrl) {
                        history.push(await loadUrl());
                    }
                }}
                rowActions={(warning) => {
                    const loadUrl = resolveWarningSourceUrl(warning.sourceInfo, warning.scope ?? undefined);
                    return loadUrl ? <WarningActions loadUrl={loadUrl} /> : null;
                }}
                pagination={pagination}
                labels={dataGridLabels}
                emptyState={
                    listState.isFiltered ? (
                        <EmptyState
                            icon={<Icon name="search" />}
                            title={intl.formatMessage({ id: "dextinity.warnings.noMatches", defaultMessage: "No warnings match the filters" })}
                            description={intl.formatMessage({
                                id: "dextinity.warnings.noMatchesDescription",
                                defaultMessage: "Check the search, or show all warnings including those of hidden content.",
                            })}
                            actions={
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    onClick={() =>
                                        listState.update({ search: "", filters: { severity: null, type: "", scope: "", visibleOnly: false } })
                                    }
                                >
                                    {intl.formatMessage({ id: "dextinity.warnings.showAll", defaultMessage: "Show all" })}
                                </Button>
                            }
                        />
                    ) : (
                        <EmptyState
                            icon={<Icon name="check" />}
                            title={intl.formatMessage(
                                {
                                    id: "dextinity.warnings.empty",
                                    defaultMessage: "No {status, select, open {open} resolved {resolved} other {ignored}} warnings",
                                },
                                { status: filters.status },
                            )}
                            description={intl.formatMessage({
                                id: "dextinity.warnings.emptyDescription",
                                defaultMessage: "Warnings appear here when content needs attention, e.g. an image without alt text.",
                            })}
                        />
                    )
                }
            />
        </ListLayout>
    );
}

function WarningActions({ loadUrl }: { loadUrl: () => Promise<string> }) {
    const intl = useIntl();
    const history = useHistory();

    return (
        <DataGridRowActions>
            <IconButton
                aria-label={intl.formatMessage(messages.openInNewTab)}
                variant="text"
                color="secondary"
                size="small"
                onClick={async () => window.open(await loadUrl(), "_blank")}
            >
                <Icon name="open-new-tab" />
            </IconButton>
            <IconButton
                aria-label={intl.formatMessage(messages.openInThisTab)}
                variant="text"
                color="secondary"
                size="small"
                onClick={async () => history.push(await loadUrl())}
            >
                <Icon name="arrow-right" />
            </IconButton>
        </DataGridRowActions>
    );
}
