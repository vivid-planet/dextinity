import type { ApolloClient, DocumentNode, OperationVariables, TypedDocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";

import { type SaveConflictHookReturn, useSaveConflict } from "./useSaveConflict";

type SaveConflictQueryHookOptions<TData, TVariables extends OperationVariables> = Omit<
    ApolloClient.QueryOptions<TData, TVariables>,
    "query" | "variables"
> & {
    variables?: TVariables;
    resolveHasConflict: (query: TData) => boolean;
    skip?: boolean;
};
interface SaveConflictDialogOptions {
    hasChanges: boolean;
    loadLatestVersion: () => Promise<void>;
    onDiscardButtonPressed: () => Promise<void>;
}
export function useSaveConflictQuery<TData, TVariables extends OperationVariables>(
    query: DocumentNode | TypedDocumentNode<TData, TVariables>,
    options: SaveConflictQueryHookOptions<TData, TVariables>,
    dialogOptions: SaveConflictDialogOptions,
): SaveConflictHookReturn {
    const client = useApolloClient();
    const { resolveHasConflict, skip, ...restOptions } = options;
    const checkConflict = async () => {
        if (skip) {
            return false;
        }
        try {
            const { data, error } = await client.query<TData, OperationVariables>({
                query,
                fetchPolicy: "no-cache",
                context: LocalErrorScopeApolloContext,
                ...restOptions,
            });
            if (error || !data) {
                return false;
            }
            return resolveHasConflict(data);
        } catch {
            return false;
        }
    };
    return useSaveConflict({ checkConflict, ...dialogOptions, hasChanges: () => dialogOptions.hasChanges });
}
