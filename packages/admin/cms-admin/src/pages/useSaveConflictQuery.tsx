import { type DocumentNode, type OperationVariables, type QueryOptions, type TypedDocumentNode, useApolloClient } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";

import { type SaveConflictHookReturn, useSaveConflict } from "./useSaveConflict";

interface SaveConflictQueryHookOptions<TData, TVariables> extends Omit<QueryOptions<TVariables, TData>, "query"> {
    resolveHasConflict: (query: TData) => boolean;
    skip?: boolean;
}
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
            const { data, error } = await client.query({
                query,
                fetchPolicy: "no-cache",
                context: LocalErrorScopeApolloContext,
                ...restOptions,
            });
            if (error) {
                return false;
            }
            return resolveHasConflict(data);
        } catch {
            return false;
        }
    };
    return useSaveConflict({ checkConflict, ...dialogOptions, hasChanges: () => dialogOptions.hasChanges });
}
