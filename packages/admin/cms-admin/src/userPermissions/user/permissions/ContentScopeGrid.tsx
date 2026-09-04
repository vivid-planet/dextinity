import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, DeleteDialog, FieldSet, type GridColDef, Loading } from "@dextinity/admin";
import { Add, Delete } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import isEqual from "lodash.isequal";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { deduplicateContentScopes } from "../../utils/deduplicateContentScopes";
import { AddContentScopeDialog } from "./AddContentScopeDialog";
import { type ContentScope, ContentScopeDataGrid } from "./ContentScopeDataGrid";
import type {
    GQLContentScopesQuery,
    GQLContentScopesQueryVariables,
    GQLUpdateContentScopesMutation,
    GQLUpdateContentScopesMutationVariables,
} from "./ContentScopeGrid.generated";

export const ContentScopeGrid = ({ userId }: { userId: string }) => {
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    const [scopeToDelete, setScopeToDelete] = useState<ContentScope | null>(null);

    const [updateContentScopes] = useMutation<GQLUpdateContentScopesMutation, GQLUpdateContentScopesMutationVariables>(gql`
        mutation UpdateContentScopes($userId: String!, $input: UserContentScopesInput!) {
            userPermissionsUpdateContentScopes(userId: $userId, input: $input)
        }
    `);

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

    if (!data) {
        return <Loading />;
    }

    // The user's content scopes are a union of rule-based and manually assigned scopes and can therefore contain duplicates.
    const userContentScopes = deduplicateContentScopes(data.userContentScopes);

    // A user has all content scopes (e.g. an admin) when the rule-based scopes cover every available content scope. Such a
    // user also has all values for dimensions that are not part of the available content scopes (e.g. an optional dimension).
    const hasAllContentScopes =
        data.availableContentScopes.length > 0 &&
        data.availableContentScopes.every((availableContentScope) =>
            data.userContentScopesSkipManual.some((scope) => isEqual(scope, availableContentScope.scope)),
        );

    // A scope is rule-based (as opposed to manually assigned) when it is part of the scopes granted by rule. Only manually
    // assigned scopes can be deleted here.
    const isRuleBasedScope = (scope: ContentScope) => data.userContentScopesSkipManual.some((ruleBasedScope) => isEqual(ruleBasedScope, scope));

    // Show manually assigned scopes before rule-based ones (sort is stable, so the order within each group is preserved).
    const sortedContentScopes = [...userContentScopes].sort((a, b) => Number(isRuleBasedScope(a)) - Number(isRuleBasedScope(b)));

    const manualContentScopes = userContentScopes.filter((contentScope) => !isRuleBasedScope(contentScope));

    const setManualContentScopes = async (contentScopes: ContentScope[]) => {
        await updateContentScopes({
            variables: { userId, input: { contentScopes } },
            refetchQueries: ["ContentScopes"],
            awaitRefetchQueries: true,
        });
    };

    const handleAddScope = async (scope: ContentScope) => {
        if (!manualContentScopes.some((contentScope) => isEqual(contentScope, scope))) {
            await setManualContentScopes([...manualContentScopes, scope]);
        }
    };

    const handleDeleteScope = async (scope: ContentScope) => {
        await setManualContentScopes(manualContentScopes.filter((contentScope) => !isEqual(contentScope, scope)));
    };

    const additionalColumns: GridColDef<ContentScope>[] = [
        {
            field: "source",
            width: 200,
            pinnable: false,
            sortable: false,
            filterable: false,
            headerName: intl.formatMessage({ id: "dextinity.userPermissions.source", defaultMessage: "Assignment type" }),
            renderCell: ({ row }) =>
                isRuleBasedScope(row) ? (
                    <FormattedMessage id="dextinity.userPermissions.assignmentType.byRule" defaultMessage="By rule" />
                ) : (
                    <FormattedMessage id="dextinity.userPermissions.assignmentType.manual" defaultMessage="Manual" />
                ),
        },
        {
            field: "actions",
            headerName: "",
            width: 52,
            align: "right",
            pinnable: false,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) =>
                isRuleBasedScope(row) ? null : (
                    <IconButton onClick={() => setScopeToDelete(row)}>
                        <Delete />
                    </IconButton>
                ),
        },
    ];

    return (
        <FieldSet title={intl.formatMessage({ id: "dextinity.userPermissions.assignedScopes", defaultMessage: "Assigned Scopes" })} disablePadding>
            <ContentScopeDataGrid
                rows={sortedContentScopes}
                availableContentScopes={data.availableContentScopes}
                availableContentScopeDimensions={data.availableContentScopeDimensions}
                hasAllContentScopes={hasAllContentScopes}
                additionalColumns={additionalColumns}
                toolbarAction={
                    <Button startIcon={<Add />} onClick={() => setOpen(true)} variant="primary">
                        <FormattedMessage id="dextinity.userPermissions.addScope" defaultMessage="Add scope" />
                    </Button>
                }
            />
            <AddContentScopeDialog open={open} onClose={() => setOpen(false)} onAdd={handleAddScope} />
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
        </FieldSet>
    );
};
