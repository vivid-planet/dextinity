import { gql, useMutation, useQuery } from "@apollo/client";
import {
    Button,
    Chip,
    ConfirmDialog,
    DataGrid,
    type DataGridColumn,
    EmptyState,
    Icon,
    IconButton,
    Menu,
    MenuItem,
    MenuSeparator,
    Panel,
    StatusIndicator,
    type StatusIndicatorStatus,
} from "@dextinity/ui";
import { differenceInDays, parseISO } from "date-fns";
import { useState } from "react";
import { type IntlShape, useIntl } from "react-intl";

import { DataGridRowActions, DataGridSecondaryText, DataGridTitle, DataGridTitleCell } from "../../../dataGrid/dataGridCells";
import { useDataGridLabels } from "../../../dataGrid/remoteList/useDataGridLabels";
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
import { useAssignmentTypeLabels } from "./useAssignmentTypeLabels";

const expiringSoonDays = 30;

type PermissionValidity = "active" | "expiringSoon" | "expired" | "scheduled";

const permissionValidityStatus: Record<PermissionValidity, StatusIndicatorStatus> = {
    active: "published",
    expiringSoon: "warning",
    expired: "critical",
    scheduled: "info",
};

function getPermissionValidity(permission: GQLPermissionForGridFragment, now: Date): PermissionValidity {
    if (permission.validTo && differenceInDays(parseISO(permission.validTo), now) < 0) {
        return "expired";
    }
    if (permission.validFrom && parseISO(permission.validFrom) > now) {
        return "scheduled";
    }
    if (permission.validTo && differenceInDays(parseISO(permission.validTo), now) < expiringSoonDays) {
        return "expiringSoon";
    }
    return "active";
}

function getPermissionValidityLabel(validity: PermissionValidity, intl: IntlShape) {
    switch (validity) {
        case "expired":
            return intl.formatMessage({ id: "dextinity.userPermissions.expired", defaultMessage: "Expired" });
        case "expiringSoon":
            return intl.formatMessage({ id: "dextinity.userPermissions.expiringSoon", defaultMessage: "Expiring soon" });
        case "scheduled":
            return intl.formatMessage({ id: "dextinity.userPermissions.scheduled", defaultMessage: "Not valid yet" });
        case "active":
            return intl.formatMessage({ id: "dextinity.userPermissions.active", defaultMessage: "Active" });
    }
}

function formatValidityDate(value: string | null, intl: IntlShape) {
    return value ? intl.formatDate(value, { dateStyle: "medium" }) : "∞";
}

const hasPermissionSpecificScopes = (permission: GQLPermissionForGridFragment) => permission.source === "MANUAL" || permission.overrideContentScopes;

export const PermissionGrid = ({ userId }: { userId: string }) => {
    const intl = useIntl();
    const { labels: dataGridLabels } = useDataGridLabels();
    const assignmentTypeLabels = useAssignmentTypeLabels();
    const [permissionId, setPermissionId] = useState<string | "add" | null>(null);
    const [overrideContentScopesId, setOverrideContentScopesId] = useState<string | null>(null);
    const [permissionToDelete, setPermissionToDelete] = useState<GQLPermissionForGridFragment | null>(null);

    const [deletePermission, { loading: deleting }] = useMutation<GQLDeletePermissionMutation, GQLDeletePermissionMutationVariables>(gql`
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

    if (error) {
        throw new Error(error.message);
    }

    const now = new Date();
    const title = intl.formatMessage({ id: "dextinity.userPermissions.assignedPermissions", defaultMessage: "Assigned Permissions" });
    const addPermissionLabel = intl.formatMessage({ id: "dextinity.userPermissions.addPermission", defaultMessage: "Add permission" });

    const columns: DataGridColumn<GQLPermissionForGridFragment>[] = [
        {
            key: "permission",
            header: intl.formatMessage({ id: "dextinity.userPermissions.permission", defaultMessage: "Permission" }),
            render: (permission) => (
                <DataGridTitleCell>
                    <DataGridTitle>{camelCaseToHumanReadable(permission.permission)}</DataGridTitle>
                    {permission.reason && <DataGridSecondaryText>{permission.reason}</DataGridSecondaryText>}
                </DataGridTitleCell>
            ),
        },
        {
            key: "status",
            header: intl.formatMessage({ id: "dextinity.userPermissions.status", defaultMessage: "Status" }),
            width: 150,
            render: (permission) => {
                const validity = getPermissionValidity(permission, now);
                return <StatusIndicator status={permissionValidityStatus[validity]}>{getPermissionValidityLabel(validity, intl)}</StatusIndicator>;
            },
        },
        {
            key: "validityPeriod",
            header: intl.formatMessage({ id: "dextinity.userPermissions.validityPeriod", defaultMessage: "Validity period" }),
            width: 220,
            priority: "low",
            render: (permission) => (
                <DataGridSecondaryText>
                    {`${formatValidityDate(permission.validFrom, intl)} – ${formatValidityDate(permission.validTo, intl)}`}
                </DataGridSecondaryText>
            ),
        },
        {
            key: "contentScopes",
            header: intl.formatMessage({ id: "dextinity.userPermissions.contentScopes", defaultMessage: "Content scopes" }),
            width: 200,
            priority: "low",
            render: (permission) =>
                permission.overrideContentScopes ? (
                    <Chip size="small" color="info" startIcon={<Icon name="domain" />}>
                        {intl.formatMessage({ id: "dextinity.userPermissions.contentScopes.specific", defaultMessage: "Permission-specific" })}
                    </Chip>
                ) : (
                    <DataGridSecondaryText>
                        {intl.formatMessage({ id: "dextinity.userPermissions.contentScopes.assigned", defaultMessage: "Assigned scopes" })}
                    </DataGridSecondaryText>
                ),
        },
        {
            key: "source",
            header: assignmentTypeLabels.header,
            width: 150,
            render: (permission) =>
                permission.source === "BY_RULE" ? (
                    <Chip size="small" color="secondary">
                        {assignmentTypeLabels.byRule}
                    </Chip>
                ) : (
                    <Chip size="small" color="primary" variant="outlined">
                        {assignmentTypeLabels.manual}
                    </Chip>
                ),
        },
    ];

    const confirmDelete = async () => {
        if (permissionToDelete) {
            await deletePermission({
                variables: { id: permissionToDelete.id },
                refetchQueries: [namedOperations.Query.Permissions],
                awaitRefetchQueries: true,
            });
        }
        setPermissionToDelete(null);
    };

    return (
        <Panel
            title={title}
            description={
                data
                    ? intl.formatMessage(
                          {
                              id: "dextinity.userPermissions.assignedPermissions.count",
                              defaultMessage: "{count, plural, one {# permission} other {# permissions}}",
                          },
                          { count: data.permissions.length },
                      )
                    : undefined
            }
            actions={
                <Button size="small" startIcon={<Icon name="plus" />} onClick={() => setPermissionId("add")}>
                    {addPermissionLabel}
                </Button>
            }
            padding="none"
        >
            <DataGrid
                aria-label={title}
                variant="plain"
                columns={columns}
                rows={data?.permissions ?? []}
                getRowId={(permission) => permission.id}
                loading={loading && !data}
                loadingRowCount={3}
                onRowClick={(permission) => setPermissionId(permission.id)}
                rowActions={(permission) => (
                    <PermissionRowMenu
                        permission={permission}
                        onEdit={() => setPermissionId(permission.id)}
                        onEditContentScopes={() => setOverrideContentScopesId(permission.id)}
                        onDelete={() => setPermissionToDelete(permission)}
                    />
                )}
                labels={dataGridLabels}
                emptyState={
                    <EmptyState
                        icon={<Icon name="security" />}
                        title={intl.formatMessage({ id: "dextinity.userPermissions.noPermissions", defaultMessage: "No permissions assigned" })}
                        description={intl.formatMessage({
                            id: "dextinity.userPermissions.noPermissionsDescription",
                            defaultMessage: "Permissions decide which areas of the admin the user can use.",
                        })}
                        actions={
                            <Button variant="outlined" color="secondary" size="small" onClick={() => setPermissionId("add")}>
                                {addPermissionLabel}
                            </Button>
                        }
                    />
                }
            />
            {overrideContentScopesId && (
                <OverrideContentScopesDialog
                    userId={userId}
                    permissionId={overrideContentScopesId}
                    handleDialogClose={() => setOverrideContentScopesId(null)}
                />
            )}
            {permissionId && <PermissionDialog userId={userId} permissionId={permissionId} handleDialogClose={() => setPermissionId(null)} />}
            <ConfirmDialog
                open={permissionToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setPermissionToDelete(null);
                    }
                }}
                tone="danger"
                title={intl.formatMessage(
                    { id: "dextinity.userPermissions.removePermissionDialog.title", defaultMessage: "Remove the permission “{permission}”?" },
                    { permission: permissionToDelete ? camelCaseToHumanReadable(permissionToDelete.permission) : "" },
                )}
                description={intl.formatMessage({
                    id: "dextinity.userPermissions.removePermissionDialog.description",
                    defaultMessage: "The user can't use this area of the admin anymore.",
                })}
                confirmLabel={intl.formatMessage({ id: "dextinity.userPermissions.removePermissionDialog.confirm", defaultMessage: "Remove" })}
                confirmIcon={<Icon name="delete" />}
                onConfirm={() => void confirmDelete()}
                loading={deleting}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.userPermissions.cancel", defaultMessage: "Cancel" }) }}
            />
        </Panel>
    );
};

interface PermissionRowMenuProps {
    permission: GQLPermissionForGridFragment;
    onEdit: () => void;
    onEditContentScopes: () => void;
    onDelete: () => void;
}

function PermissionRowMenu({ permission, onEdit, onEditContentScopes, onDelete }: PermissionRowMenuProps) {
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    const isByRule = permission.source === "BY_RULE";

    return (
        <DataGridRowActions>
            <Menu
                open={open}
                onOpenChange={setOpen}
                placement="bottom-end"
                trigger={
                    <IconButton
                        aria-label={intl.formatMessage(
                            { id: "dextinity.userPermissions.permissionActions", defaultMessage: "Actions for {permission}" },
                            { permission: camelCaseToHumanReadable(permission.permission) },
                        )}
                        variant="text"
                        color="secondary"
                        size="small"
                    >
                        <Icon name="more-vertical" />
                    </IconButton>
                }
            >
                <MenuItem
                    label={
                        isByRule
                            ? intl.formatMessage({ id: "dextinity.userPermissions.showPermission", defaultMessage: "Show details" })
                            : intl.formatMessage({ id: "dextinity.userPermissions.editPermission", defaultMessage: "Edit" })
                    }
                    icon={<Icon name={isByRule ? "view" : "edit"} />}
                    onClick={onEdit}
                />
                {hasPermissionSpecificScopes(permission) && (
                    <MenuItem
                        label={intl.formatMessage({
                            id: "dextinity.userPermissions.overrideContentScopes",
                            defaultMessage: "Permission-specific Content-Scopes",
                        })}
                        icon={<Icon name="domain" />}
                        onClick={onEditContentScopes}
                    />
                )}
                <MenuSeparator />
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.userPermissions.removePermission", defaultMessage: "Remove" })}
                    icon={<Icon name="delete" />}
                    color="error"
                    onClick={onDelete}
                    disabled={isByRule}
                    disabledReason={
                        isByRule
                            ? intl.formatMessage({
                                  id: "dextinity.userPermissions.removePermission.byRule",
                                  defaultMessage: "Assigned by a rule, so it can't be removed here",
                              })
                            : undefined
                    }
                />
            </Menu>
        </DataGridRowActions>
    );
}
