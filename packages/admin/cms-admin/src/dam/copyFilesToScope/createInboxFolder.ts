import { type ApolloClient, gql } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { format } from "date-fns";

import type { GQLCreateInboxFolderMutation, GQLCreateInboxFolderMutationVariables } from "./createInboxFolder.generated";

export const createInboxFolder = async ({
    client,
    targetScope,
    sourceScopes,
}: {
    client: ApolloClient<unknown>;
    targetScope: Record<string, unknown>;
    sourceScopes: Record<string, unknown>[];
}) => {
    const scopeString = sourceScopes.length === 0 ? "unknown" : sourceScopes.map((scope) => Object.values(scope).join("-")).join(", ");
    const date = new Date();
    const name = `Copy from ${scopeString} ${format(date, "dd.MM.yyyy")}, ${format(date, "HH:mm:ss")}`;

    const { data } = await client.mutate<GQLCreateInboxFolderMutation, GQLCreateInboxFolderMutationVariables>({
        mutation: gql`
            mutation CreateInboxFolder($input: CreateDamFolderInput!, $contentScope: DamScopeInput!) {
                createDamFolder(input: $input, scope: $contentScope) {
                    id
                }
            }
        `,
        variables: {
            input: {
                name: name,
                isInboxFromOtherScope: true,
            },
            contentScope: targetScope,
        },
        context: LocalErrorScopeApolloContext,
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return data!.createDamFolder;
};
