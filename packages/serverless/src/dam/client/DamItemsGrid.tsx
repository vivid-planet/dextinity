import {
    DataGridToolbar,
    FillSpace,
    type GridColDef,
    GridToolbarQuickFilter,
    useBufferedRowCount,
    useDataGridRemote,
    useStackSwitchApi,
} from "@dextinity/admin";
import { DataGrid, type GridToolbarProps, type ToolbarPropsOverrides } from "@mui/x-data-grid";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { AddFolderButton } from "./AddFolderButton.js";
import { type DamItem, damQueryKeys } from "./damApi.types.js";
import { useDamApi } from "./DamApiProvider.js";
import { DamItemActions } from "./DamItemActions.js";
import { DamItemLabel } from "./DamItemLabel.js";
import { FormattedFileSize } from "./FormattedFileSize.js";
import { UploadFilesButton } from "./UploadFilesButton.js";

declare module "@mui/x-data-grid" {
    interface ToolbarPropsOverrides {
        folderId?: string;
    }
}

const sortableColumns = ["name", "size", "mimetype", "createdAt", "updatedAt"] as const;
type SortableColumn = (typeof sortableColumns)[number];

function isSortableColumn(field: string): field is SortableColumn {
    return (sortableColumns as readonly string[]).includes(field);
}

export function DamItemsGrid({ folderId }: { folderId?: string }) {
    const intl = useIntl();
    const { client, scope } = useDamApi();
    const stackSwitchApi = useStackSwitchApi();
    const dataGridProps = useDataGridRemote({ queryParamsPrefix: "dam", pageSize: 20 });

    const sort = dataGridProps.sortModel[0];
    const searchText = dataGridProps.filterModel?.quickFilterValues?.join(" ");
    const query = {
        ...scope,
        ...(folderId && { folderId }),
        ...(searchText && { searchText }),
        ...(sort &&
            isSortableColumn(sort.field) && {
                sortColumnName: sort.field,
                sortDirection: sort.sort === "desc" ? ("DESC" as const) : ("ASC" as const),
            }),
        offset: String(dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize),
        limit: String(dataGridProps.paginationModel.pageSize),
    };

    const { data, isFetching } = useQuery({
        queryKey: damQueryKeys.items(query),
        queryFn: () => parseResponse(client.items.$get({ query })),
        placeholderData: keepPreviousData,
    });
    const rowCount = useBufferedRowCount(data?.totalCount);

    const columns = useMemo<GridColDef<DamItem>[]>(
        () => [
            {
                field: "name",
                headerName: intl.formatMessage({ id: "dextinity.dam.name", defaultMessage: "Name" }),
                flex: 1,
                minWidth: 250,
                renderCell: ({ row }) => <DamItemLabel item={row} />,
            },
            {
                field: "size",
                headerName: intl.formatMessage({ id: "dextinity.dam.size", defaultMessage: "Size" }),
                width: 140,
                renderCell: ({ row }) =>
                    row.__typename === "DamFile" ? (
                        <FormattedFileSize bytes={row.size} />
                    ) : (
                        <FormattedMessage
                            id="dextinity.dam.numberOfItems"
                            defaultMessage="{count, plural, one {# item} other {# items}}"
                            values={{ count: row.numberOfChildFolders + row.numberOfFiles }}
                        />
                    ),
            },
            {
                field: "mimetype",
                headerName: intl.formatMessage({ id: "dextinity.dam.type", defaultMessage: "Type" }),
                width: 160,
                valueGetter: (_value, row) =>
                    row.__typename === "DamFile" ? row.mimetype : intl.formatMessage({ id: "dextinity.dam.folder", defaultMessage: "Folder" }),
            },
            {
                field: "updatedAt",
                headerName: intl.formatMessage({ id: "dextinity.dam.latestChange", defaultMessage: "Latest change" }),
                width: 180,
                valueFormatter: (value: string) => intl.formatDate(value, { dateStyle: "medium", timeStyle: "short" }),
            },
            {
                field: "actions",
                headerName: "",
                type: "actions",
                align: "right",
                width: 52,
                sortable: false,
                renderCell: ({ row }) => <DamItemActions item={row} />,
            },
        ],
        [intl],
    );

    return (
        <DataGrid
            {...dataGridProps}
            rows={data?.nodes ?? []}
            rowCount={rowCount}
            loading={isFetching}
            columns={columns}
            rowHeight={58}
            pageSizeOptions={[10, 20, 50]}
            disableColumnMenu
            onRowClick={({ row }: { row: DamItem }) => {
                stackSwitchApi.activatePage(row.__typename === "DamFolder" ? "folder" : "edit", row.id);
            }}
            slots={{ toolbar: DamItemsGridToolbar }}
            slotProps={{ toolbar: { folderId } }}
            showToolbar
        />
    );
}

function DamItemsGridToolbar({ folderId }: GridToolbarProps & ToolbarPropsOverrides) {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <FillSpace />
            <AddFolderButton parentId={folderId} />
            <UploadFilesButton folderId={folderId} />
        </DataGridToolbar>
    );
}
