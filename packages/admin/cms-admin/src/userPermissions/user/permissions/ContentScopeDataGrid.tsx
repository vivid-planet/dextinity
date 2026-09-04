import { DataGridToolbar, FillSpace, type GridColDef, GridToolbarQuickFilter } from "@dextinity/admin";
import { Typography } from "@mui/material";
import type { GridRowSelectionModel, GridToolbarProps } from "@mui/x-data-grid";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { DataGrid } from "../../../dataGrid/DataGrid";
import type { GQLAvailableContentScopesQuery } from "./selectScopesDialogContent/SelectScopesDialogContent.generated";

export type ContentScope = {
    [key: string]: string;
};

/**
 * Wildcard value a content scope dimension can have when `getContentScopesForUser` grants access to any value for it.
 * Must match the wildcard value used by `getContentScopesForUser` in `@dextinity/cms-api`.
 */
const contentScopeAllValues = "*";

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
    const columns: GridColDef<ContentScope>[] = [
        ...generateGridColumnsFromContentScopeProperties(availableContentScopes, {
            dimensions: availableContentScopeDimensions,
            hasAllContentScopes,
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

export function generateGridColumnsFromContentScopeProperties(
    availableContentScopes: GQLAvailableContentScopesQuery["availableContentScopes"],
    {
        dimensions = [],
        hasAllContentScopes = false,
    }: {
        dimensions?: Array<{ name: string; label: string }>;
        hasAllContentScopes?: boolean;
    } = {},
): GridColDef[] {
    // The declared content scope dimensions are the sole source of columns, so every user shows a consistent set of columns
    // regardless of which values happen to be present in the scopes.
    return dimensions.map((dimension) => {
        const propertyName = dimension.name;
        return {
            field: propertyName,
            flex: 1,
            pinnable: false,
            sortable: false,
            filterable: true,
            headerName: dimension.label,
            renderCell: ({ row }: { row: ContentScope }) => {
                const value = row[propertyName];
                const isAllValues =
                    value === contentScopeAllValues ||
                    // A user with all content scopes also has all values for dimensions that are not part of the available
                    // content scopes (e.g. an optional dimension), which are therefore not set on the scope.
                    (value === undefined && hasAllContentScopes);
                if (isAllValues) {
                    return (
                        <Typography variant="body2">
                            <FormattedMessage id="dextinity.userPermissions.allContentScopeValues" defaultMessage="All" />
                        </Typography>
                    );
                }

                // A wildcard dimension prevents the whole scope from matching an available scope, so labels are resolved per dimension
                const label = availableContentScopes.find((availableContentScope) => availableContentScope.scope[propertyName] === value)?.label[
                    propertyName
                ];
                if (label) {
                    return <Typography variant="body2">{label}</Typography>;
                }
                // A value without a label is a free value of a dimension that is not part of the available content scopes
                if (value !== undefined) {
                    return <Typography variant="body2">{String(value)}</Typography>;
                }
                return "-";
            },
        };
    });
}
