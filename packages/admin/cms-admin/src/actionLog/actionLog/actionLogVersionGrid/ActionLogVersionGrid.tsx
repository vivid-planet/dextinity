import { type GridColDef, useBufferedRowCount, type useDataGridRemote, type usePersistentColumnState } from "@dextinity/admin";
import { View } from "@dextinity/admin-icons";
import { IconButton, Typography } from "@mui/material";
import { getGridDateOperators, gridClasses, type GridRowParams, type GridRowSelectionModel, type GridSlotsComponent } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";

import { DataGrid } from "../../../dataGrid/DataGrid";
import { ActionLogHeader } from "../../components/actionLogHeader/ActionLogHeader";
import { ActionLogTypeChip } from "../../components/actionLogTypeChip/ActionLogTypeChip";
import { ScopeCell } from "../../components/scopeCell/ScopeCell";
import { UserCell } from "../../components/userCell/UserCell";
import { ActionGridToolbar, type ActionGridToolbarProps } from "./actionGridToolbar/ActionGridToolbar";
import type { GQLActionLogVersionGridFragment } from "./ActionLogVersionGrid.gql.generated";
import { Root } from "./ActionLogVersionGrid.sc";

// "is" and "not" would compare the timestamps to the millisecond on the server, so they would hardly ever match.
const createdAtFilterOperators = getGridDateOperators(true).filter((operator) =>
    ["after", "onOrAfter", "before", "onOrBefore"].includes(operator.value),
);

type ActionLogVersionGridProps<Row extends GQLActionLogVersionGridFragment> = ReturnType<typeof useDataGridRemote> &
    ReturnType<typeof usePersistentColumnState> & {
        actionLogs: { nodes: Row[]; totalCount: number } | undefined;
        id: string;
        loading: boolean;
        /**
         * Latest name of the actual object, displayed in the title
         */
        name?: string;
        /**
         * Shows the scope of each version, for a history that spans several scopes.
         */
        showScope?: boolean;
        onShowVersionClick: (version: Row) => void;
        onCompareVersionsClick: (beforeVersion: Row | NonNullable<Row["previousVersion"]>, afterVersion: Row) => void;
    };

export function ActionLogVersionGrid<Row extends GQLActionLogVersionGridFragment>({
    actionLogs,
    id,
    loading,
    name,
    showScope,
    onShowVersionClick,
    onCompareVersionsClick,
    ...dataGridProps
}: ActionLogVersionGridProps<Row>) {
    const intl = useIntl();
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({ type: "include", ids: new Set() });

    const columns = useMemo<GridColDef<Row>[]>(
        () => [
            {
                field: "version",
                type: "number",
                headerName: intl.formatMessage({ defaultMessage: "Version", id: "actionLog.actionLogVersionGrid.columns.version" }),
            },
            {
                field: "type",
                headerName: intl.formatMessage({ defaultMessage: "Action", id: "actionLog.actionLogVersionGrid.columns.type" }),
                filterable: false,
                sortable: false,
                width: 130,
                renderCell: ({ row }) => <ActionLogTypeChip actionLogType={row.type} />,
            },
            ...(showScope
                ? [
                      {
                          field: "scope",
                          headerName: intl.formatMessage({ defaultMessage: "Scope", id: "actionLog.actionLogVersionGrid.columns.scope" }),
                          filterable: false,
                          sortable: false,
                          width: 150,
                          renderCell: ({ row }: { row: Row }) => <ScopeCell scopes={row.scope} />,
                      },
                  ]
                : []),
            {
                field: "createdAt",
                type: "dateTime",
                headerName: intl.formatMessage({ defaultMessage: "Date", id: "actionLog.actionLogVersionGrid.columns.createdAt" }),
                minWidth: 200,
                valueGetter: (value: string) => new Date(value),
                filterOperators: createdAtFilterOperators,
                renderCell: ({ row }) => {
                    return <FormattedDate dateStyle="medium" timeStyle="short" value={row.createdAt} />;
                },
            },
            {
                field: "user",
                headerName: intl.formatMessage({ defaultMessage: "Changed by", id: "actionLog.actionLogVersionGrid.columns.user" }),
                minWidth: 400,
                filterable: false,
                sortable: false,
                renderCell: ({ row }) => {
                    return <UserCell id={row.user.id} name={row.user.name ?? undefined} />;
                },
            },
            {
                align: "right",
                field: "actions",
                filterable: false,
                headerName: intl.formatMessage({ defaultMessage: "Actions", id: "actionLog.actionLogVersionGrid.columns.actions" }),
                pinned: "right",
                width: 60,
                renderCell: ({ row }) => {
                    return (
                        <IconButton
                            color="primary"
                            onClick={() => {
                                onShowVersionClick(row);
                            }}
                        >
                            <View />
                        </IconButton>
                    );
                },
                renderHeader: () => {
                    return null;
                },
                sortable: false,
                type: "actions",
            },
        ],
        [intl, showScope, onShowVersionClick],
    );

    const rowCount = useBufferedRowCount(actionLogs?.totalCount);

    const toolbarProps: ActionGridToolbarProps = {
        disableCompare: selectionModel.ids.size < 2,
        onClickCompare: () => {
            const [beforeVersion, afterVersion] = (actionLogs?.nodes ?? [])
                .filter((row) => selectionModel.ids.has(row.id))
                .sort((a, b) => a.version - b.version);
            if (beforeVersion && afterVersion) {
                onCompareVersionsClick(beforeVersion, afterVersion);
            }
        },
    };

    return (
        <Root>
            <ActionLogHeader
                action={
                    <Typography variant="caption">
                        <FormattedMessage
                            defaultMessage="You can only compare 2 versions at a time."
                            id="actionLog.actionLogVersionGrid.info.onlyCompare2Versions"
                        />
                    </Typography>
                }
                dbTypes={Array.from(
                    new Set(
                        actionLogs?.nodes.map((value) => {
                            return value.entityName;
                        }),
                    ),
                )}
                id={id}
                title={
                    <FormattedMessage
                        defaultMessage="Version history{name}"
                        id="actionLog.actionLogVersionGrid.title"
                        values={{
                            name: name != null ? ` - ${name}` : "",
                        }}
                    />
                }
            />

            <DataGrid
                sx={{
                    // Hide Column Header - Select All Checkbox
                    [`& .${gridClasses.columnHeaderCheckbox} .${gridClasses.columnHeaderTitleContainer}`]: {
                        display: "none",
                    },
                }}
                {...dataGridProps}
                checkboxSelection
                showToolbar
                columns={columns}
                isRowSelectable={(params) => {
                    if (selectionModel.ids.has(params.row.id)) {
                        return true;
                    }

                    return selectionModel.ids.size < 2;
                }}
                loading={loading}
                onRowClick={({ row }: GridRowParams<Row>) => {
                    if (row.previousVersion) {
                        onCompareVersionsClick(row.previousVersion, row);
                    } else {
                        onShowVersionClick(row);
                    }
                }}
                onRowSelectionModelChange={(newSelectionModel) => {
                    setSelectionModel(newSelectionModel);
                }}
                rowCount={rowCount}
                rows={actionLogs?.nodes ?? []}
                rowSelectionModel={selectionModel}
                slotProps={{
                    toolbar: toolbarProps,
                }}
                slots={{
                    toolbar: ActionGridToolbar as GridSlotsComponent["toolbar"],
                }}
            />
        </Root>
    );
}
export { actionLogVersionGridFragment } from "./ActionLogVersionGrid.gql";
