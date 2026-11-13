import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Dialog, EmptyState, Icon, IconButton, Skeleton, Switch } from "@dextinity/ui";
import { deepEqual } from "fast-equals";
import { useState } from "react";
import { useIntl } from "react-intl";

import type { ContentScope } from "../../../contentScope/Provider";
import { DataGridRowActions } from "../../../dataGrid/dataGridCells";
import { AddContentScopeDialog } from "./AddContentScopeDialog";
import { ContentScopeDataGrid } from "./ContentScopeDataGrid";
import { RemoveScopeDialog } from "./ContentScopeGrid";
import {
    type GQLOverrideContentScopesMutation,
    type GQLOverrideContentScopesMutationVariables,
    type GQLPermissionContentScopesQuery,
    type GQLPermissionContentScopesQueryVariables,
    namedOperations,
} from "./OverrideContentScopesDialog.generated";
import { OverrideContent } from "./OverrideContentScopesDialog.sc";

interface FormProps {
    permissionId: string;
    userId: string;
    handleDialogClose: () => void;
}

/**
 * The content scopes of one permission. The switch and the scopes are saved right away, like the assigned scopes of the user, so the
 * dialog has no save button.
 */
export const OverrideContentScopesDialog = ({ permissionId, userId, handleDialogClose }: FormProps) => {
    const intl = useIntl();
    const [addScopeOpen, setAddScopeOpen] = useState(false);
    const [scopeToDelete, setScopeToDelete] = useState<ContentScope | null>(null);
    // Reflects a click on the switch right away while the mutation saves it; `null` means the saved value applies
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

    const title = intl.formatMessage({ id: "dextinity.userPermissions.overrideScopes", defaultMessage: "Permission-specific Content-Scopes" });
    const closeButton = (
        <Button variant="outlined" color="secondary" onClick={handleDialogClose}>
            {intl.formatMessage({ id: "dextinity.userPermissions.close", defaultMessage: "Close" })}
        </Button>
    );

    if (!data) {
        return (
            <Dialog open onOpenChange={handleDialogClose} title={title} size="large" footer={closeButton}>
                <Skeleton variant="row" count={4} />
            </Dialog>
        );
    }

    const isByRule = data.permission.source === "BY_RULE";
    const contentScopes = data.permission.contentScopes as ContentScope[];
    const isOverrideEnabled = overrideContentScopesToggle ?? data.permission.overrideContentScopes;

    // The switch is saved along with the scopes so that added scopes aren't hidden again on reopen
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
        const previous = isOverrideEnabled;
        setOverrideContentScopesToggle(checked);
        try {
            await persist({ overrideContentScopes: checked, contentScopes });
        } catch {
            setOverrideContentScopesToggle(previous);
        }
    };

    const handleAddScopes = async (scopes: ContentScope[]) => {
        const newScopes = scopes.filter((scope) => !contentScopes.some((contentScope) => deepEqual(contentScope, scope)));
        if (newScopes.length > 0) {
            await persist({ overrideContentScopes: isOverrideEnabled, contentScopes: [...contentScopes, ...newScopes] });
        }
    };

    const deleteScope = async () => {
        try {
            if (scopeToDelete !== null) {
                await persist({
                    overrideContentScopes: isOverrideEnabled,
                    contentScopes: contentScopes.filter((contentScope) => !deepEqual(contentScope, scopeToDelete)),
                });
            }
        } finally {
            setScopeToDelete(null);
        }
    };

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) {
                    handleDialogClose();
                }
            }}
            title={title}
            description={intl.formatMessage({
                id: "dextinity.userPermissions.overrideScopes.description",
                defaultMessage: "Limits this permission to its own scopes instead of the scopes assigned to the user.",
            })}
            size="large"
            footer={closeButton}
        >
            <OverrideContent>
                <Switch checked={isOverrideEnabled} onChange={(checked) => void handleToggleChange(checked)} disabled={isByRule || updateInProgress}>
                    {intl.formatMessage({ id: "dextinity.userPermissions.overrideScopes.switch", defaultMessage: "Use permission-specific scopes" })}
                </Switch>
                {isOverrideEnabled && (
                    <ContentScopeDataGrid
                        aria-label={title}
                        rows={contentScopes}
                        availableContentScopes={data.availableContentScopes}
                        availableContentScopeDimensions={data.availableContentScopeDimensions}
                        rowActions={
                            isByRule
                                ? undefined
                                : (row) => (
                                      <DataGridRowActions>
                                          <IconButton
                                              aria-label={intl.formatMessage({
                                                  id: "dextinity.userPermissions.removeScope",
                                                  defaultMessage: "Remove scope",
                                              })}
                                              variant="text"
                                              color="secondary"
                                              size="small"
                                              disabled={updateInProgress}
                                              onClick={() => setScopeToDelete(row)}
                                          >
                                              <Icon name="trash" />
                                          </IconButton>
                                      </DataGridRowActions>
                                  )
                        }
                        toolbarAction={
                            isByRule ? undefined : (
                                <Button
                                    size="small"
                                    startIcon={<Icon name="plus" />}
                                    onClick={() => setAddScopeOpen(true)}
                                    disabled={updateInProgress}
                                >
                                    {intl.formatMessage({ id: "dextinity.userPermissions.addScope", defaultMessage: "Add scope" })}
                                </Button>
                            )
                        }
                        emptyState={
                            <EmptyState
                                icon={<Icon name="globe" />}
                                title={intl.formatMessage({ id: "dextinity.userPermissions.noScopes", defaultMessage: "No scopes assigned" })}
                                description={intl.formatMessage({
                                    id: "dextinity.userPermissions.overrideScopes.empty",
                                    defaultMessage: "Without a scope, the permission applies to no content.",
                                })}
                            />
                        }
                    />
                )}
            </OverrideContent>
            <AddContentScopeDialog
                open={addScopeOpen}
                onClose={() => setAddScopeOpen(false)}
                assignedScopes={contentScopes}
                onAdd={handleAddScopes}
            />
            <RemoveScopeDialog
                open={scopeToDelete !== null}
                loading={updateInProgress}
                onCancel={() => setScopeToDelete(null)}
                onConfirm={deleteScope}
            />
        </Dialog>
    );
};
