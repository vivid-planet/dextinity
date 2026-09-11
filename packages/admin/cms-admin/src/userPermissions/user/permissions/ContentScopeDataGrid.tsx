import { DataGridToolbar, FillSpace, type GridColDef, GridToolbarQuickFilter } from "@dextinity/admin";
import { Typography } from "@mui/material";
import type { GridRowSelectionModel, GridToolbarProps } from "@mui/x-data-grid";
import type { ReactNode } from "react";
import { useIntl } from "react-intl";

import { DataGrid } from "../../../dataGrid/DataGrid";
import { contentScopeAllValues, type ContentScope } from "./contentScope";
import type { GQLAvailableContentScopesQuery } from "./selectScopesDialogContent/SelectScopesDialogContent.generated";

export type { ContentScope };

interface ToolbarProps extends GridToolbarProps {
    toolbarAction?: ReactNode;
}

function ContentScopeDataGridToolbar({ toolbarAction }: ToolbarProps) {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <FillSpace />
            {toolbarAction}
        </DataGridToolbar>
    );
}

interface ContentScopeDataGridSelection {
    selectedRowIds: string[];
    onSelectedRowIdsChange: (selectedRowIds: string[]) => void;
    disabled?: boolean;
}

interface ContentScopeDataGridProps {
    rows: ContentScope[];
    availableContentScopes: GQLAvailableContentScopesQuery["availableContentScopes"];
    availableContentScopeDimensions?: Array<{ name: string; label: string }>;
    hasAllContentScopes?: boolean;
    /** Additional columns appended after the content scope dimension columns (e.g. assignment type or actions). */
    additionalColumns?: GridColDef<ContentScope>[];
    /** Rendered on the right of the toolbar (e.g. an "Add scope" button). */
    toolbarAction?: ReactNode;
    /** When set, the grid shows a checkbox for each row and reports the selected rows by their id. */
    selection?: ContentScopeDataGridSelection;
}

/**
 * Renders content scopes in a consistent grid: one column per content scope dimension, pagination and an optional
 * checkbox selection. Shared by the assigned scopes grid and the permission-specific content scopes dialog.
 */
export function ContentScopeDataGrid({
    rows,
    availableContentScopes,
    availableContentScopeDimensions,
    hasAllContentScopes,
    additionalColumns = [],
    toolbarAction,
    selection,
}: ContentScopeDataGridProps) {
    const intl = useIntl();
    const allValuesLabel = intl.formatMessage({ id: "dextinity.userPermissions.allContentScopeValues", defaultMessage: "All" });
    const columns: GridColDef<ContentScope>[] = [
        ...generateGridColumnsFromContentScopeProperties(availableContentScopes, {
            dimensions: availableContentScopeDimensions,
            hasAllContentScopes,
            allValuesLabel,
        }),
        ...additionalColumns,
    ];

    return (
        <DataGrid<ContentScope>
            rows={rows}
            columns={columns}
            loading={false}
            getRowId={(row) => JSON.stringify(row)}
            pagination
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            slots={{ toolbar: ContentScopeDataGridToolbar }}
            slotProps={{ toolbar: { toolbarAction } as ToolbarProps }}
            showToolbar
            checkboxSelection={selection ? !selection.disabled : undefined}
            rowSelectionModel={selection ? { type: "include", ids: new Set<string>(selection.selectedRowIds) } : undefined}
            onRowSelectionModelChange={
                selection
                    ? (selectionModel: GridRowSelectionModel) =>
                          selection.onSelectedRowIdsChange(Array.from(selectionModel.ids).map((id) => String(id)))
                    : undefined
            }
            disableRowSelectionExcludeModel={selection !== undefined}
        />
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
    // A value without a label is a free value of a dimension that is not part of the available content scopes.
    return value !== undefined ? String(value) : "";
}

function generateGridColumnsFromContentScopeProperties(
    availableContentScopes: GQLAvailableContentScopesQuery["availableContentScopes"],
    {
        dimensions = [],
        hasAllContentScopes = false,
        allValuesLabel,
    }: {
        dimensions?: Array<{ name: string; label: string }>;
        hasAllContentScopes?: boolean;
        allValuesLabel: string;
    },
): GridColDef<ContentScope>[] {
    // The declared content scope dimensions are the sole source of columns, so every user shows a consistent set of columns
    // regardless of which values happen to be present in the scopes.
    return dimensions.map((dimension): GridColDef<ContentScope> => {
        const propertyName = dimension.name;
        return {
            field: propertyName,
            flex: 1,
            pinnable: false,
            sortable: false,
            filterable: true,
            headerName: dimension.label,
            // Resolve the label via valueGetter (not only renderCell) so filtering and quick filtering match the displayed
            // label instead of the raw scope value.
            valueGetter: (value, row) =>
                resolveContentScopeDimensionValue({ row, propertyName, availableContentScopes, hasAllContentScopes, allValuesLabel }),
            renderCell: ({ value }) => (value ? <Typography variant="body2">{value}</Typography> : "-"),
        };
    });
}
