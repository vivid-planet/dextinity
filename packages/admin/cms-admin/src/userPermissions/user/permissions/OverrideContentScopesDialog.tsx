import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, CancelButton, DeleteDialog, type GridColDef, SaveButton } from "@dextinity/admin";
import { Add, Delete } from "@dextinity/admin-icons";
import {
    CircularProgress,
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Switch,
} from "@mui/material";
import isEqual from "lodash.isequal";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { AddContentScopeDialog } from "./AddContentScopeDialog";
import { type ContentScope, ContentScopeDataGrid } from "./ContentScopeDataGrid";
import {
    type GQLOverrideContentScopesMutation,
    type GQLOverrideContentScopesMutationVariables,
    type GQLPermissionContentScopesQuery,
    type GQLPermissionContentScopesQueryVariables,
    namedOperations,
} from "./OverrideContentScopesDialog.generated";

interface FormProps {
    permissionId: string;
    userId: string;
    handleDialogClose: () => void;
}

export const OverrideContentScopesDialog = ({ permissionId, userId, handleDialogClose }: FormProps) => {
    const [addScopeOpen, setAddScopeOpen] = useState(false);
    const [scopeToDelete, setScopeToDelete] = useState<ContentScope | null>(null);
    // Local override toggle state; only persisted when clicking save. `null` means "not yet changed, use the persisted value".
    const [overrideContentScopesToggle, setOverrideContentScopesToggle] = useState<boolean | null>(null);

    const [updateOverrideContentScopes, { loading: updateInProgress }] = useMutation<
        GQLOverrideContentScopesMutation,
        GQLOverrideContentScopesMutationVariables
    >(gql`
        mutation OverrideContentScopes($input: UserPermissionOverrideContentScopesInput!) {
            userPermissionsUpdateOverrideContentScopes(input: $input) {
                id
            }
        }
    `);

    const { data, error } = useQuery<GQLPermissionContentScopesQuery, GQLPermissionContentScopesQueryVariables>(
        gql`
            query PermissionContentScopes($permissionId: ID!, $userId: String!) {
                availableContentScopes: userPermissionsAvailableContentScopes {
                    scope
                    label
                }
                availableContentScopeDimensions: userPermissionsAvailableContentScopeDimensions {
                    name
                    label
                }
                permission: userPermissionsPermission(id: $permissionId, userId: $userId) {
                    source
                    overrideContentScopes
                    contentScopes
                }
            }
        `,
        {
            variables: { permissionId, userId },
        },
    );

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        return <CircularProgress />;
    }

    const disabled = data.permission.source === "BY_RULE";
    const contentScopes = data.permission.contentScopes as ContentScope[];
    const overrideContentScopesEnabled = overrideContentScopesToggle ?? data.permission.overrideContentScopes;

    // Adding/removing a scope is persisted immediately (like the assigned scopes grid). Scopes can only be edited while the
    // toggle is enabled, so the current toggle value is persisted along with them (otherwise added scopes would be hidden
    // again on reopen because the permission still had the override disabled).
    const persistContentScopes = async (newContentScopes: ContentScope[]) => {
        await updateOverrideContentScopes({
            variables: {
                input: { permissionId, overrideContentScopes: overrideContentScopesEnabled, contentScopes: newContentScopes },
            },
            refetchQueries: [namedOperations.Query.PermissionContentScopes, "Permissions"],
            awaitRefetchQueries: true,
        });
    };

    const handleAddScope = async (scope: ContentScope) => {
        if (!contentScopes.some((contentScope) => isEqual(contentScope, scope))) {
            await persistContentScopes([...contentScopes, scope]);
        }
    };

    const handleDeleteScope = async (scope: ContentScope) => {
        await persistContentScopes(contentScopes.filter((contentScope) => !isEqual(contentScope, scope)));
    };

    // The save button only persists the "permission-specific content scopes" toggle; the scopes are persisted on add/remove.
    const handleSave = async () => {
        await updateOverrideContentScopes({
            variables: {
                input: { permissionId, overrideContentScopes: overrideContentScopesEnabled, contentScopes },
            },
            refetchQueries: [namedOperations.Query.PermissionContentScopes, "Permissions"],
        });
        handleDialogClose();
    };

    const additionalColumns: GridColDef<ContentScope>[] = disabled
        ? []
        : [
              {
                  field: "actions",
                  headerName: "",
                  width: 52,
                  align: "right",
                  pinnable: false,
                  sortable: false,
                  filterable: false,
                  renderCell: ({ row }) => (
                      <IconButton onClick={() => setScopeToDelete(row)} disabled={updateInProgress}>
                          <Delete />
                      </IconButton>
                  ),
              },
          ];

    return (
        <Dialog maxWidth="lg" open={true}>
            <DialogTitle>
                <FormattedMessage id="dextinity.userPermissions.scopes" defaultMessage="Scopes" />
            </DialogTitle>
            <DialogContent>
                <FormControlLabel
                    labelPlacement="start"
                    control={
                        <Switch
                            checked={overrideContentScopesEnabled}
                            onChange={(event) => setOverrideContentScopesToggle(event.target.checked)}
                            disabled={disabled}
                        />
                    }
                    label={<FormattedMessage id="dextinity.userPermissions.overrideScopes" defaultMessage="Permission-specific Content-Scopes" />}
                />
                {overrideContentScopesEnabled && (
                    <>
                        <ContentScopeDataGrid
                            rows={contentScopes}
                            availableContentScopes={data.availableContentScopes}
                            availableContentScopeDimensions={data.availableContentScopeDimensions}
                            additionalColumns={additionalColumns}
                            toolbarAction={
                                disabled ? undefined : (
                                    <Button startIcon={<Add />} onClick={() => setAddScopeOpen(true)} variant="primary" disabled={updateInProgress}>
                                        <FormattedMessage id="dextinity.userPermissions.addScope" defaultMessage="Add scope" />
                                    </Button>
                                )
                            }
                        />
                        <AddContentScopeDialog open={addScopeOpen} onClose={() => setAddScopeOpen(false)} onAdd={handleAddScope} />
                        <DeleteDialog
                            dialogOpen={scopeToDelete !== null}
                            deleteType="remove"
                            onCancel={() => setScopeToDelete(null)}
                            onDelete={async () => {
                                if (scopeToDelete !== null) {
                                    await handleDeleteScope(scopeToDelete);
                                }
                                setScopeToDelete(null);
                            }}
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={() => handleDialogClose()}>
                    <FormattedMessage id="dextinity.userPermissions.close" defaultMessage="Close" />
                </CancelButton>
                {!disabled && <SaveButton onClick={handleSave} disabled={updateInProgress} />}
            </DialogActions>
        </Dialog>
    );
};
