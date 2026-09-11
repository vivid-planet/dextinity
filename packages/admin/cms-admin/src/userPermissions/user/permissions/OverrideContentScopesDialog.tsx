import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, CancelButton, DeleteDialog, type GridColDef } from "@dextinity/admin";
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
    // Optimistic override toggle: reflects the click immediately while the mutation persists in the background. `null` means
    // "not changed locally, use the persisted value".
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

    // The toggle and the scopes are both persisted immediately (like the assigned scopes grid), so the dialog needs no save
    // button. The toggle value is persisted along with the scopes so added scopes aren't hidden again on reopen.
    const persist = async ({
        overrideContentScopes,
        contentScopes: newContentScopes,
    }: {
        overrideContentScopes: boolean;
        contentScopes: ContentScope[];
    }) => {
        await updateOverrideContentScopes({
            variables: {
                input: { permissionId, overrideContentScopes, contentScopes: newContentScopes },
            },
            refetchQueries: [namedOperations.Query.PermissionContentScopes, "Permissions"],
            awaitRefetchQueries: true,
        });
    };

    const handleToggleChange = async (checked: boolean) => {
        const previous = overrideContentScopesEnabled;
        setOverrideContentScopesToggle(checked);
        try {
            await persist({ overrideContentScopes: checked, contentScopes });
        } catch {
            setOverrideContentScopesToggle(previous);
        }
    };

    const handleAddScope = async (scope: ContentScope) => {
        if (!contentScopes.some((contentScope) => isEqual(contentScope, scope))) {
            await persist({ overrideContentScopes: overrideContentScopesEnabled, contentScopes: [...contentScopes, scope] });
        }
    };

    const handleDeleteScope = async (scope: ContentScope) => {
        await persist({
            overrideContentScopes: overrideContentScopesEnabled,
            contentScopes: contentScopes.filter((contentScope) => !isEqual(contentScope, scope)),
        });
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
                            onChange={(event) => handleToggleChange(event.target.checked)}
                            disabled={disabled || updateInProgress}
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
                                try {
                                    if (scopeToDelete !== null) {
                                        await handleDeleteScope(scopeToDelete);
                                    }
                                } finally {
                                    setScopeToDelete(null);
                                }
                            }}
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={() => handleDialogClose()}>
                    <FormattedMessage id="dextinity.userPermissions.close" defaultMessage="Close" />
                </CancelButton>
            </DialogActions>
        </Dialog>
    );
};
