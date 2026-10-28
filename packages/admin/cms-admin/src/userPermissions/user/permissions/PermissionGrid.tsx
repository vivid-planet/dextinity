import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, DataGridToolbar, DeleteDialog, FieldSet, FillSpace, GridCellContent, type GridColDef } from "@dextinity/admin";
import { Add, Delete, Edit, StateFilled } from "@dextinity/admin-icons";
import { IconButton, Typography } from "@mui/material";
import type { GridToolbarProps } from "@mui/x-data-grid";
import { differenceInDays, parseISO } from "date-fns";
import { type ReactNode, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { DataGrid } from "../../../dataGrid/DataGrid";
import { camelCaseToHumanReadable } from "../../utils/camelCaseToHumanReadable";
import { OverrideContentScopesDialog } from "./OverrideContentScopesDialog";
import { PermissionDialog } from "./PermissionDialog";
import {
    type GQLDeletePermissionMutation,
    type GQLDeletePermissionMutationVariables,
    type GQLPermissionForGridFragment,
    type GQLPermissionsQuery,
    type GQLPermissionsQueryVariables,
    namedOperations,
} from "./PermissionGrid.generated";

interface ToolbarProps extends GridToolbarProps {
    toolbarAction?: ReactNode;
}

function PermissionGridToolbar({ toolbarAction }: ToolbarProps) {
    return (
        <DataGridToolbar>
            <FillSpace />
            {toolbarAction}
        </DataGridToolbar>
    );
}

export const PermissionGrid = ({ userId }: { userId: string }) => {
    const intl = useIntl();
    const [permissionId, setPermissionId] = useState<string | "add" | null>(null);
    const [overrideContentScopesId, setOverrideContentScopesId] = useState<string | null>(null);
    const [permissionToDelete, setPermissionToDelete] = useState<string | null>(null);

    const [deletePermission] = useMutation<GQLDeletePermissionMutation, GQLDeletePermissionMutationVariables>(gql`
        mutation DeletePermission($id: ID!) {
            userPermissionsDeletePermission(id: $id)
        }
    `);

    const { data, loading, error } = useQuery<GQLPermissionsQuery, GQLPermissionsQueryVariables>(
        gql`
            query Permissions($userId: String!) {
                permissions: userPermissionsPermissionList(userId: $userId) {
                    ...PermissionForGrid
                }
            }
            fragment PermissionForGrid on UserPermission {
                id
                permission
                source
                validFrom
                validTo
                reason
                requestedBy
                approvedBy
                overrideContentScopes
            }
        `,
        {
            variables: {
                userId,
            },
        },
    );

    const columns: GridColDef<GQLPermissionForGridFragment>[] = [
        {
            field: "name",
            flex: 1,
            pinnable: false,
            headerName: intl.formatMessage({ id: "dextinity.userPermissions.permission", defaultMessage: "Permission" }),
            renderCell: ({ row }) => <Typography variant="subtitle2">{camelCaseToHumanReadable(row.permission)}</Typography>,
        },
        {
            field: "status",
            width: 200,
            filterable: false,
            pinnable: false,
            headerName: intl.formatMessage({ id: "dextinity.userPermissions.status", defaultMessage: "Status" }),
            renderCell: ({ row }) => (
                <>
                    {row.validTo && differenceInDays(parseISO(row.validTo), new Date()) < 0 && (
                        <GridCellContent
                            icon={<StateFilled color="error" />}
                            primaryText={<FormattedMessage id="dextinity.userPermissions.expired" defaultMessage="Expired" />}
                        />
                    )}
                    {row.validTo &&
                    differenceInDays(parseISO(row.validTo), new Date()) >= 0 &&
                    differenceInDays(parseISO(row.validTo), new Date()) < 30 ? (
                        <GridCellContent
                            icon={<StateFilled color="warning" />}
                            primaryText={<FormattedMessage id="dextinity.userPermissions.expiringSoon" defaultMessage="Expiring soon" />}
                        />
                    ) : (
                        <GridCellContent
                            icon={<StateFilled color="success" />}
                            primaryText={<FormattedMessage id="dextinity.userPermissions.active" defaultMessage="Active" />}
                        />
                    )}
                </>
            ),
        },
        {
            field: "validityPeriod",
            width: 200,
            pinnable: false,
            headerName: intl.formatMessage({ id: "dextinity.userPermissions.validityPeriod", defaultMessage: "Validity period" }),
            renderCell: ({ row }) =>
                `${row.validFrom ? new Date(row.validFrom).toLocaleDateString() : "∞"} - ${
                    row.validTo ? new Date(row.validTo).toLocaleDateString() : "∞"
                }`,
        },
        {
            field: "overrideContentScopes",
            headerName: "",
            flex: 1,
            sortable: false,
            pinnable: false,
            filterable: false,
            renderCell: ({ row }) =>
                (row.source === "MANUAL" || row.overrideContentScopes) && (
                    <Button onClick={() => setOverrideContentScopesId(row.id)}>
                        <FormattedMessage id="dextinity.userPermissions.overrideContentScopes" defaultMessage="Permission-specific Content-Scopes" />
                    </Button>
                ),
        },
        {
            field: "source",
            width: 200,
            pinnable: false,
            headerName: intl.formatMessage({ id: "dextinity.userPermissions.source", defaultMessage: "Assignment type" }),
            renderCell: ({ row }) =>
                row.source === "BY_RULE" ? (
                    <FormattedMessage id="dextinity.userPermissions.assignmentType.byRule" defaultMessage="By rule" />
                ) : (
                    <FormattedMessage id="dextinity.userPermissions.assignmentType.manual" defaultMessage="Manual" />
                ),
        },
        {
            field: "actions",
            type: "actions",
            headerName: "",
            sortable: false,
            pinnable: false,
            filterable: false,
            width: 116,
            pinned: "right",
            renderCell: ({ row }) => {
                return (
                    <>
                        <IconButton
                            onClick={() => {
                                setPermissionId(row.id);
                            }}
                            color="primary"
                        >
                            <Edit />
                        </IconButton>

                        {row.source !== "BY_RULE" && (
                            <IconButton onClick={() => setPermissionToDelete(row.id)}>
                                <Delete />
                            </IconButton>
                        )}
                    </>
                );
            },
        },
    ];

    if (error) {
        throw new Error(error.message);
    }

    const toolbarSlotProps: ToolbarProps = {
        toolbarAction: (
            <Button
                startIcon={<Add />}
                onClick={() => {
                    setPermissionId("add");
                }}
            >
                <FormattedMessage id="dextinity.userPermissions.addPermission" defaultMessage="Add new permission" />
            </Button>
        ),
    };

    return (
        <FieldSet
            title={intl.formatMessage({ id: "dextinity.userPermissions.assignedPermissions", defaultMessage: "Assigned Permissions" })}
            disablePadding
        >
            <DataGrid<GQLPermissionForGridFragment>
                rows={data?.permissions ?? []}
                columns={columns}
                rowCount={data?.permissions.length ?? 0}
                loading={loading}
                slots={{
                    toolbar: PermissionGridToolbar,
                }}
                slotProps={{
                    toolbar: toolbarSlotProps,
                }}
                showToolbar
            />
            {overrideContentScopesId && (
                <OverrideContentScopesDialog
                    userId={userId}
                    permissionId={overrideContentScopesId}
                    handleDialogClose={() => setOverrideContentScopesId(null)}
                />
            )}
            {permissionId && <PermissionDialog userId={userId} permissionId={permissionId} handleDialogClose={() => setPermissionId(null)} />}
            <DeleteDialog
                dialogOpen={permissionToDelete !== null}
                deleteType="remove"
                onCancel={() => setPermissionToDelete(null)}
                onDelete={async () => {
                    if (permissionToDelete !== null) {
                        await deletePermission({
                            variables: { id: permissionToDelete },
                            refetchQueries: [namedOperations.Query.Permissions],
                            awaitRefetchQueries: true,
                        });
                    }
                    setPermissionToDelete(null);
                }}
            />
        </FieldSet>
    );
};
