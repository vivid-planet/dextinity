import { type GridColDef, useBufferedRowCount, type useDataGridRemote, type usePersistentColumnState } from "@dextinity/admin";
import { View } from "@dextinity/admin-icons";
import { IconButton, Typography } from "@mui/material";
import { gridClasses, type GridRowSelectionModel, type GridSlotsComponent } from "@mui/x-data-grid";
import { type FunctionComponent, useMemo, useState } from "react";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";

import { DataGrid } from "../../../dataGrid/DataGrid";
import { ActionLogHeader } from "../../components/actionLogHeader/ActionLogHeader";
import { ActionLogTypeChip } from "../../components/actionLogTypeChip/ActionLogTypeChip";
import { UserCell } from "../../components/userCell/UserCell";
import { ActionGridToolbar, type ActionGridToolbarProps } from "./actionGridToolbar/ActionGridToolbar";
import type { GQLActionLogVersionGridFragment } from "./ActionLogVersionGrid.gql.generated";
import { Root } from "./ActionLogVersionGrid.sc";

type ActionGridRow = GQLActionLogVersionGridFragment;

type ActionLogVersionGridProps = ReturnType<typeof useDataGridRemote> &
    ReturnType<typeof usePersistentColumnState> & {
        actionLogs: { nodes: ActionGridRow[]; totalCount: number } | undefined;
        id: string;
        loading: boolean;
        /**
         * Latest name of the actual object, displayed in the title
         */
        name?: string;
        onShowVersionClick: (versionId: string) => void;
        onCompareVersionsClick: (versionId: string, versionsId2: string) => void;
    };

export const ActionLogVersionGrid: FunctionComponent<ActionLogVersionGridProps> = ({
    actionLogs,
    id,
    loading,
    name,
    onShowVersionClick,
    onCompareVersionsClick,
    ...dataGridProps
}) => {
    const intl = useIntl();
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({ type: "include", ids: new Set() });

    const columns = useMemo<GridColDef<ActionGridRow>[]>(
        () => [
            {
                field: "version",
                headerName: intl.formatMessage({ defaultMessage: "Version", id: "actionLog.actionLogVersionGrid.columns.version" }),
            },
            {
                field: "type",
                headerName: intl.formatMessage({ defaultMessage: "Action", id: "actionLog.actionLogVersionGrid.columns.type" }),
                sortable: false,
                width: 130,
                renderCell: ({ row }) => <ActionLogTypeChip actionLogType={row.type} label={row.type} />,
            },
            {
                field: "createdAt",
                headerName: intl.formatMessage({ defaultMessage: "Date", id: "actionLog.actionLogVersionGrid.columns.createdAt" }),
                minWidth: 200,
                renderCell: ({ row }) => {
                    return <FormattedDate dateStyle="medium" timeStyle="short" value={row.createdAt} />;
                },
            },
            {
                field: "user",
                headerName: intl.formatMessage({ defaultMessage: "Changed by", id: "actionLog.actionLogVersionGrid.columns.user" }),
                minWidth: 400,
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
                                onShowVersionClick(row.id);
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
        [intl, onShowVersionClick],
    );

    const rowCount = useBufferedRowCount(actionLogs?.totalCount);

    const selectedIds = Array.from(selectionModel.ids);
    const toolbarProps: ActionGridToolbarProps = {
        disableCompare: selectionModel.ids.size < 2,
        onClickCompare: () => {
            if (selectionModel.ids.size >= 2) {
                onCompareVersionsClick(selectedIds[0].toString(), selectedIds[1].toString());
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
                checkboxSelection={true}
                showToolbar
                columns={columns}
                isRowSelectable={(params) => {
                    if (selectionModel.ids.has(params.row.id)) {
                        return true;
                    }

                    return selectionModel.ids.size < 2;
                }}
                loading={loading}
                onRowClick={({ row }) => {
                    if (row.previousVersion) {
                        onCompareVersionsClick(row.previousVersion.id, row.id);
                    } else {
                        onShowVersionClick(row.id);
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
};
export { actionLogVersionGridFragment } from "./ActionLogVersionGrid.gql";
