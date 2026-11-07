import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Chip, ConfirmDialog, EmptyState, Icon, IconButton, Panel, Skeleton } from "@dextinity/ui";
import { deepEqual } from "fast-equals";
import { useState } from "react";
import { useIntl } from "react-intl";

import type { ContentScope } from "../../../contentScope/Provider";
import { DataGridRowActions } from "../../../dataGrid/dataGridCells";
import { deduplicateContentScopes } from "../../utils/deduplicateContentScopes";
import { AddContentScopeDialog } from "./AddContentScopeDialog";
import { ContentScopeDataGrid } from "./ContentScopeDataGrid";
import type {
    GQLContentScopesQuery,
    GQLContentScopesQueryVariables,
    GQLUpdateContentScopesMutation,
    GQLUpdateContentScopesMutationVariables,
} from "./ContentScopeGrid.generated";
import { useAssignmentTypeLabels } from "./useAssignmentTypeLabels";

export const ContentScopeGrid = ({ userId }: { userId: string }) => {
    const intl = useIntl();
    const assignmentTypeLabels = useAssignmentTypeLabels();
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [scopeToDelete, setScopeToDelete] = useState<ContentScope | null>(null);

    const [updateContentScopes, { loading: updateInProgress }] = useMutation<GQLUpdateContentScopesMutation, GQLUpdateContentScopesMutationVariables>(
        gql`
            mutation UpdateContentScopes($userId: String!, $input: UserContentScopesInput!) {
                userPermissionsUpdateContentScopes(userId: $userId, input: $input)
            }
        `,
    );

    const { data, error } = useQuery<GQLContentScopesQuery, GQLContentScopesQueryVariables>(
        gql`
            query ContentScopes($userId: String!) {
                userContentScopes: userPermissionsContentScopes(userId: $userId)
                userContentScopesSkipManual: userPermissionsContentScopes(userId: $userId, skipManual: true)
                availableContentScopes: userPermissionsAvailableContentScopes {
                    scope
                    label
                }
                availableContentScopeDimensions: userPermissionsAvailableContentScopeDimensions {
                    name
                    label
                }
            }
        `,
        {
            variables: { userId },
        },
    );

    if (error) {
        throw new Error(error.message);
    }

    const title = intl.formatMessage({ id: "dextinity.userPermissions.assignedScopes", defaultMessage: "Assigned Scopes" });
    const addScopeLabel = intl.formatMessage({ id: "dextinity.userPermissions.addScope", defaultMessage: "Add scope" });

    if (!data) {
        return (
            <Panel title={title}>
                <Skeleton variant="row" count={3} />
            </Panel>
        );
    }

    // The user's content scopes are a union of rule-based and manually assigned scopes and can therefore contain duplicates.
    const userContentScopes = deduplicateContentScopes(data.userContentScopes as ContentScope[]);

    // A user has all content scopes (e.g. an admin) when the rule-based scopes cover every available content scope. Such a
    // user also has all values for dimensions that are not part of the available content scopes (e.g. an optional dimension).
    const hasAllContentScopes =
        data.availableContentScopes.length > 0 &&
        data.availableContentScopes.every((availableContentScope) =>
            data.userContentScopesSkipManual.some((scope) => deepEqual(scope, availableContentScope.scope)),
        );

    // Only manually assigned scopes can be deleted here.
    const isRuleBasedScope = (scope: ContentScope) => data.userContentScopesSkipManual.some((ruleBasedScope) => deepEqual(ruleBasedScope, scope));

    // Manually assigned scopes first; the sort is stable, so the order within each group is preserved.
    const sortedContentScopes = [...userContentScopes].sort((a, b) => Number(isRuleBasedScope(a)) - Number(isRuleBasedScope(b)));

    const manualContentScopes = userContentScopes.filter((contentScope) => !isRuleBasedScope(contentScope));

    const setManualContentScopes = async (contentScopes: ContentScope[]) => {
        await updateContentScopes({
            variables: { userId, input: { contentScopes } },
            refetchQueries: ["ContentScopes"],
            awaitRefetchQueries: true,
        });
    };

    const handleAddScopes = async (scopes: ContentScope[]) => {
        const newScopes = scopes.filter((scope) => !manualContentScopes.some((contentScope) => deepEqual(contentScope, scope)));
        if (newScopes.length > 0) {
            await setManualContentScopes([...manualContentScopes, ...newScopes]);
        }
    };

    const deleteScope = async () => {
        try {
            if (scopeToDelete !== null) {
                await setManualContentScopes(manualContentScopes.filter((contentScope) => !deepEqual(contentScope, scopeToDelete)));
            }
        } finally {
            setScopeToDelete(null);
        }
    };

    return (
        <Panel
            title={title}
            description={
                hasAllContentScopes
                    ? intl.formatMessage({
                          id: "dextinity.userPermissions.assignedScopes.all",
                          defaultMessage: "Has access to all scopes by rule.",
                      })
                    : intl.formatMessage(
                          { id: "dextinity.userPermissions.assignedScopes.count", defaultMessage: "{count, plural, one {# scope} other {# scopes}}" },
                          { count: userContentScopes.length },
                      )
            }
            padding="none"
        >
            <ContentScopeDataGrid
                aria-label={title}
                isInPanel
                rows={sortedContentScopes}
                availableContentScopes={data.availableContentScopes}
                availableContentScopeDimensions={data.availableContentScopeDimensions}
                hasAllContentScopes={hasAllContentScopes}
                additionalColumns={[
                    {
                        key: "source",
                        header: assignmentTypeLabels.header,
                        width: 160,
                        render: (row) =>
                            isRuleBasedScope(row) ? (
                                <Chip size="small" color="secondary">
                                    {assignmentTypeLabels.byRule}
                                </Chip>
                            ) : (
                                <Chip size="small" color="primary" variant="outlined">
                                    {assignmentTypeLabels.manual}
                                </Chip>
                            ),
                    },
                ]}
                rowActions={(row) =>
                    isRuleBasedScope(row) ? null : (
                        <DataGridRowActions>
                            <IconButton
                                aria-label={intl.formatMessage({ id: "dextinity.userPermissions.removeScope", defaultMessage: "Remove scope" })}
                                variant="text"
                                color="secondary"
                                size="small"
                                disabled={updateInProgress}
                                onClick={() => setScopeToDelete(row)}
                            >
                                <Icon name="delete" />
                            </IconButton>
                        </DataGridRowActions>
                    )
                }
                toolbarAction={
                    <Button size="small" startIcon={<Icon name="plus" />} onClick={() => setAddDialogOpen(true)} disabled={updateInProgress}>
                        {addScopeLabel}
                    </Button>
                }
                emptyState={
                    <EmptyState
                        icon={<Icon name="domain" />}
                        title={intl.formatMessage({ id: "dextinity.userPermissions.noScopes", defaultMessage: "No scopes assigned" })}
                        description={intl.formatMessage({
                            id: "dextinity.userPermissions.noScopesDescription",
                            defaultMessage: "Without a scope, the user can't access any content.",
                        })}
                    />
                }
            />
            <AddContentScopeDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                assignedScopes={userContentScopes}
                onAdd={handleAddScopes}
            />
            <RemoveScopeDialog
                open={scopeToDelete !== null}
                loading={updateInProgress}
                onCancel={() => setScopeToDelete(null)}
                onConfirm={deleteScope}
            />
        </Panel>
    );
};

interface RemoveScopeDialogProps {
    open: boolean;
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => Promise<void>;
}

export function RemoveScopeDialog({ open, loading, onCancel, onConfirm }: RemoveScopeDialogProps) {
    const intl = useIntl();
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen && !loading) {
                    onCancel();
                }
            }}
            tone="danger"
            title={intl.formatMessage({ id: "dextinity.userPermissions.removeScopeDialog.title", defaultMessage: "Remove the scope?" })}
            description={intl.formatMessage({
                id: "dextinity.userPermissions.removeScopeDialog.description",
                defaultMessage: "The user loses access to the content of this scope.",
            })}
            confirmLabel={intl.formatMessage({ id: "dextinity.userPermissions.removeScopeDialog.confirm", defaultMessage: "Remove" })}
            confirmIcon={<Icon name="delete" />}
            onConfirm={() => void onConfirm()}
            loading={loading}
            labels={{ cancel: intl.formatMessage({ id: "dextinity.userPermissions.cancel", defaultMessage: "Cancel" }) }}
        />
    );
}
