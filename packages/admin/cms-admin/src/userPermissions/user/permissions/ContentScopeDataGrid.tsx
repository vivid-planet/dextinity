import { DataGrid, type DataGridColumn, EmptyState, FilterBar, Icon } from "@dextinity/ui";
import { type ReactNode, useState } from "react";
import { useIntl } from "react-intl";

import type { ContentScope } from "../../../contentScope/Provider";
import { useDataGridLabels } from "../../../dataGrid/remoteList/useDataGridLabels";
import { usePaginationLabels } from "../../../dataGrid/remoteList/useRemoteListPagination";
import { contentScopeAllValues } from "./contentScope";
import { ContentScopeToolbar } from "./ContentScopeDataGrid.sc";
import { getContentScopeKey } from "./selectScopesDialogContent/contentScopeSelection";
import type { GQLAvailableContentScopesQuery } from "./selectScopesDialogContent/SelectScopesDialogContent.generated";

const pageSizeOptions = [10, 25, 50];

interface ContentScopeDataGridProps {
    "aria-label": string;
    rows: ContentScope[];
    availableContentScopes: GQLAvailableContentScopesQuery["availableContentScopes"];
    availableContentScopeDimensions?: Array<{ name: string; label: string }>;
    hasAllContentScopes?: boolean;
    /** Additional columns appended after the content scope dimension columns (e.g. assignment type). */
    additionalColumns?: DataGridColumn<ContentScope>[];
    rowActions?: (row: ContentScope) => ReactNode;
    /** Rendered at the end of the search bar (e.g. an "Add scope" button). */
    toolbarAction?: ReactNode;
    emptyState: ReactNode;
    /** Indents the search to the content of a `Panel` with `padding="none"`. */
    isInPanel?: boolean;
}

/**
 * Renders content scopes in a consistent grid: one column per content scope dimension, a search, and pages of 10. Shared by the
 * assigned scopes and the permission-specific content scopes dialog.
 */
export function ContentScopeDataGrid({
    "aria-label": ariaLabel,
    rows,
    availableContentScopes,
    availableContentScopeDimensions = [],
    hasAllContentScopes = false,
    additionalColumns = [],
    rowActions,
    toolbarAction,
    emptyState,
    isInPanel,
}: ContentScopeDataGridProps) {
    const intl = useIntl();
    const { labels: dataGridLabels } = useDataGridLabels();
    const paginationLabels = usePaginationLabels();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
    const allValuesLabel = intl.formatMessage({ id: "dextinity.userPermissions.allContentScopeValues", defaultMessage: "All" });

    const getDimensionValue = (row: ContentScope, dimension: string) =>
        resolveContentScopeDimensionValue({ row, propertyName: dimension, availableContentScopes, hasAllContentScopes, allValuesLabel });

    const normalizedSearch = search.trim().toLowerCase();
    const filteredRows = normalizedSearch
        ? rows.filter((row) =>
              availableContentScopeDimensions.some((dimension) => getDimensionValue(row, dimension.name).toLowerCase().includes(normalizedSearch)),
          )
        : rows;
    const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const shownRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const columns: DataGridColumn<ContentScope>[] = [
        // The declared content scope dimensions are the sole source of columns, so every user shows a consistent set of columns
        // regardless of which values happen to be present in the scopes.
        ...availableContentScopeDimensions.map((dimension): DataGridColumn<ContentScope> => ({
            key: dimension.name,
            header: dimension.label,
            getValue: (row) => getDimensionValue(row, dimension.name),
            render: (row) => getDimensionValue(row, dimension.name) || "–",
        })),
        ...additionalColumns,
    ];

    return (
        <>
            <ContentScopeToolbar data-in-panel={isInPanel ? "" : undefined}>
                <FilterBar
                    searchValue={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    searchShortcut={false}
                    resultCount={normalizedSearch ? filteredRows.length : undefined}
                    actions={toolbarAction}
                    labels={{
                        search: intl.formatMessage({ id: "dextinity.userPermissions.searchScopes", defaultMessage: "Search scopes" }),
                        searchPlaceholder: intl.formatMessage({ id: "dextinity.userPermissions.searchScopesPlaceholder", defaultMessage: "Search" }),
                        filters: intl.formatMessage({ id: "dextinity.userPermissions.filters", defaultMessage: "Filters" }),
                        resultCount: (count) =>
                            intl.formatMessage(
                                { id: "dextinity.userPermissions.resultCount", defaultMessage: "{count, plural, one {# result} other {# results}}" },
                                { count },
                            ),
                    }}
                />
            </ContentScopeToolbar>
            <DataGrid
                aria-label={ariaLabel}
                variant="plain"
                columns={columns}
                rows={shownRows}
                getRowId={getContentScopeKey}
                rowActions={rowActions}
                labels={dataGridLabels}
                pagination={
                    filteredRows.length > pageSizeOptions[0]
                        ? {
                              page: currentPage,
                              pageSize,
                              total: filteredRows.length,
                              onPageChange: setPage,
                              onPageSizeChange: (newPageSize) => {
                                  setPageSize(newPageSize);
                                  setPage(1);
                              },
                              pageSizeOptions,
                              labels: paginationLabels,
                          }
                        : undefined
                }
                emptyState={
                    normalizedSearch ? (
                        <EmptyState
                            icon={<Icon name="search" />}
                            title={intl.formatMessage({
                                id: "dextinity.userPermissions.noScopeMatches",
                                defaultMessage: "No scopes match the search",
                            })}
                        />
                    ) : (
                        emptyState
                    )
                }
            />
        </>
    );
}

// Resolves the display value of a content scope dimension: the "all values" label for a wildcard, the dimension's label
// from the available content scopes, or the raw value for a free value that is not part of the available content scopes.
// Returns an empty string when the dimension is not set, so the grid can render a placeholder.
function resolveContentScopeDimensionValue({
    row,
    propertyName,
    availableContentScopes,
    hasAllContentScopes,
    allValuesLabel,
}: {
    row: ContentScope;
    propertyName: string;
    availableContentScopes: GQLAvailableContentScopesQuery["availableContentScopes"];
    hasAllContentScopes: boolean;
    allValuesLabel: string;
}): string {
    const value = row[propertyName];
    // A user with all content scopes also has all values for dimensions that are not part of the available content scopes
    // (e.g. an optional dimension), which are therefore not set on the scope.
    if (value === contentScopeAllValues || (value === undefined && hasAllContentScopes)) {
        return allValuesLabel;
    }
    // A wildcard dimension prevents the whole scope from matching an available scope, so labels are resolved per dimension.
    // Available scope values are raw JSON (e.g. numbers), while row values are strings, so compare as strings.
    const label = availableContentScopes.find((availableContentScope) => String(availableContentScope.scope[propertyName]) === String(value))
        ?.label?.[propertyName];
    if (label) {
        return label;
    }
    return value !== undefined ? String(value) : "";
}
