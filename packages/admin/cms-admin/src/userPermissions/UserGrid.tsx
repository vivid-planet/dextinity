import { gql, useQuery } from "@apollo/client";
import {
    CrudContextMenu,
    DataGridToolbar,
    FillSpace,
    type GridColDef,
    GridFilterButton,
    GridToolbarQuickFilter,
    muiGridFilterToGql,
    muiGridSortToGql,
    StackSwitchApiContext,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Edit } from "@dextinity/admin-icons";
import { Chip, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { GridRenderCellParams, GridSlotsComponent, GridToolbarProps } from "@mui/x-data-grid";
import { type ReactNode, useContext, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { DataGrid } from "../dataGrid/DataGrid";
import { useUserPermissionCheck } from "./hooks/currentUser";
import { ImpersonateMenuItem } from "./ImpersonateMenuItem";
import type {
    GQLUserAvailablePermissionsAndContentScopesQuery,
    GQLUserForGridFragment,
    GQLUserGridQuery,
    GQLUserGridQueryVariables,
} from "./UserGrid.generated";

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

    const { data: availablePermissionsAndContentScopes } = useQuery<GQLUserAvailablePermissionsAndContentScopesQuery>(
        gql`
            query UserAvailablePermissionsAndContentScopes {
                permissions: userPermissionsAvailablePermissions
                contentScopes: userPermissionsAvailableContentScopes {
                    scope
                    label
                }
            }
        `,
        { skip: !isAllowed("userPermissions") },
    );

    const columns: GridColDef<GQLUserForGridFragment>[] = useMemo(() => {
        return [
            {
                field: "name",
                flex: 1,
                pinnable: false,
                headerName: intl.formatMessage({ id: "dextinity.userPermissions.name", defaultMessage: "Name" }),
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
                headerName: intl.formatMessage({ id: "dextinity.userPermissions.email", defaultMessage: "E-Mail" }),
            },
        ];
    }, [intl]);
    if (isAllowed("userPermissions")) {
        columns.push(
            {
                field: "permission",
                flex: 1,
                pinnable: false,
                sortable: false,
                type: "singleSelect",
                valueOptions: availablePermissionsAndContentScopes?.permissions,
                headerName: intl.formatMessage({ id: "dextinity.userPermissions.permissionsInfo", defaultMessage: "Permissions" }),
                renderCell: ({ row }) => {
                    if (row.permissionsCount === availablePermissionsAndContentScopes?.permissions.length) {
                        return (
                            <Chip
                                color="primary"
                                label={<FormattedMessage id="dextinity.userPermissions.allPermissions" defaultMessage="All permissions" />}
                            />
                        );
                    } else if (row.permissionsCount === 0) {
                        return (
                            <Chip
                                color="secondary"
                                label={<FormattedMessage id="dextinity.userPermissions.noPermissions" defaultMessage="No permissions" />}
                            />
                        );
                    } else {
                        return (
                            <Chip
                                color="default"
                                label={
                                    <FormattedMessage
                                        id="dextinity.userPermissions.permissionsCount"
                                        defaultMessage="{permissionsCount} of {availablePermissionsCount} permissions"
                                        values={{
                                            permissionsCount: row.permissionsCount,
                                            availablePermissionsCount: availablePermissionsAndContentScopes?.permissions.length,
                                        }}
                                    />
                                }
                            />
                        );
                    }
                },
            },
            {
                field: "scopesInfo",
                flex: 1,
                pinnable: false,
                sortable: false,
                filterable: false,
                headerName: intl.formatMessage({ id: "dextinity.userPermissions.contentScopesInfo", defaultMessage: "Scopes" }),
                renderCell: ({ row }) => {
                    if (row.contentScopesCount === availablePermissionsAndContentScopes?.contentScopes.length) {
                        return (
                            <Chip
                                color="primary"
                                label={<FormattedMessage id="dextinity.userPermissions.allContentScopes" defaultMessage="All scopes" />}
                            />
                        );
                    } else if (row.contentScopesCount === 0) {
                        return (
                            <Chip
                                color="secondary"
                                label={<FormattedMessage id="dextinity.userPermissions.noContentScopes" defaultMessage="No scopes" />}
                            />
                        );
                    } else {
                        return (
                            <Chip
                                color="default"
                                label={
                                    <FormattedMessage
                                        id="dextinity.userPermissions.contentScopesCount"
                                        defaultMessage="{contentScopesCount} of {availableContentScopesCount} scopes"
                                        values={{
                                            contentScopesCount: row.contentScopesCount,
                                            availableContentScopesCount: availablePermissionsAndContentScopes?.contentScopes.length,
                                        }}
                                    />
                                }
                            />
                        );
                    }
                },
            },
        );
    }
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
                permissionsCount
                contentScopesCount
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
    if (error) {
        throw new Error(error.message);
    }

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
            showToolbar
        />
    );
};

const NameBox = styled("div")({
    fontWeight: "bold",
    fontSize: "small",
});
