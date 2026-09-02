import { gql, useQuery } from "@apollo/client";
import {
    CrudContextMenu,
    DataGridToolbar,
    FillSpace,
    type GridColDef,
    GridFilterButton,
    muiGridFilterToGql,
    muiGridSortToGql,
    StackSwitchApiContext,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@comet/admin";
import { Edit } from "@comet/admin-icons";
import { IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DataGrid, type GridRenderCellParams, GridToolbarQuickFilter } from "@mui/x-data-grid";
import type { GridToolbarProps } from "@mui/x-data-grid/components/toolbar/GridToolbar";
import { type GridSlotsComponent } from "@mui/x-data-grid/models/gridSlotsComponent";
import { type ReactNode, useContext, useMemo } from "react";
import { useIntl } from "react-intl";

import { useUserPermissionCheck } from "./hooks/currentUser";
import { ImpersonateMenuItem } from "./ImpersonateMenuItem";
import type { GQLUserForGridFragment, GQLUserGridQuery, GQLUserGridQueryVariables } from "./UserGrid.generated";

interface UserPermissionsUserGridToolbarProps extends GridToolbarProps {
    toolbarAction?: ReactNode;
}
function UserPermissionsUserGridToolbar({ toolbarAction }: UserPermissionsUserGridToolbarProps) {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <GridFilterButton />
            <FillSpace />
            {toolbarAction && <>{toolbarAction}</>}
        </DataGridToolbar>
    );
}
type Props = {
    toolbarAction?: ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rowAction?: (params: GridRenderCellParams<any, GQLUserForGridFragment, any>) => ReactNode;
    actionsColumnWidth?: number;
};

export const UserPermissionsUserGrid = ({ toolbarAction, rowAction, actionsColumnWidth = 52 }: Props) => {
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("UserPermissionsUserGrid") };
    const intl = useIntl();
    const stackApi = useContext(StackSwitchApiContext);
    const isAllowed = useUserPermissionCheck();

    const columns: GridColDef<GQLUserForGridFragment>[] = useMemo(() => {
        return [
            {
                field: "name",
                flex: 1,
                pinnable: false,
                headerName: intl.formatMessage({ id: "comet.userPermissions.name", defaultMessage: "Name" }),
                renderCell: ({ row }) => (
                    <NameBox>
                        <Typography>{row.name}</Typography>
                    </NameBox>
                ),
            },
            {
                field: "email",
                flex: 1,
                pinnable: false,
                headerName: intl.formatMessage({ id: "comet.userPermissions.email", defaultMessage: "E-Mail" }),
            },
        ];
    }, [intl]);
    columns.push({
        field: "actions",
        headerName: "",
        sortable: false,
        filterable: false,
        type: "actions",
        align: "right",
        pinned: "right",
        disableExport: true,
        renderCell: (params) => (
            <>
                <IconButton
                    onClick={() => {
                        stackApi.activatePage("edit", params.id.toString());
                    }}
                    color="primary"
                >
                    <Edit />
                </IconButton>
                {isAllowed("impersonation") && (
                    <CrudContextMenu>
                        <ImpersonateMenuItem userId={params.row.id} />
                    </CrudContextMenu>
                )}
            </>
        ),
    });

    const { data, loading, error } = useQuery<GQLUserGridQuery, GQLUserGridQueryVariables>(
        gql`
            query UserGrid($offset: Int!, $limit: Int!, $filter: UserPermissionsUserFilter, $sort: [UserPermissionsUserSort!], $search: String) {
                users: userPermissionsUsers(offset: $offset, limit: $limit, filter: $filter, sort: $sort, search: $search) {
                    nodes {
                        ...UserForGrid
                    }
                    totalCount
                }
            }
            fragment UserForGrid on UserPermissionsUser {
                id
                name
                email
            }
        `,
        {
            variables: {
                ...muiGridFilterToGql(columns, dataGridProps.filterModel),
                offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
                limit: dataGridProps.paginationModel.pageSize ?? 0,
                sort: muiGridSortToGql(dataGridProps.sortModel),
            },
        },
    );

    const rowCount = useBufferedRowCount(data?.users.totalCount);
    if (error) throw new Error(error.message);

    return (
        <DataGrid<GQLUserForGridFragment>
            {...dataGridProps}
            rows={data?.users.nodes ?? []}
            columns={columns}
            rowCount={rowCount}
            loading={loading}
            slots={{
                toolbar: UserPermissionsUserGridToolbar as GridSlotsComponent["toolbar"],
            }}
            slotProps={{
                toolbar: {
                    toolbarAction: toolbarAction,
                } as UserPermissionsUserGridToolbarProps,
            }}
        />
    );
};

const NameBox = styled("div")({
    fontWeight: "bold",
    fontSize: "small",
});
