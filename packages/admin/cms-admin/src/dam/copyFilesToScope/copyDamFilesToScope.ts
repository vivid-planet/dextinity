import { type ApolloClient, gql } from "@apollo/client";
import isEqual from "lodash.isequal";

import type { ReplaceDependencyObject } from "../../blocks/types";
import type { GQLImageCropAreaInput } from "../../graphql.generated";
import type {
    GQLCopyFilesToScopeMutation,
    GQLCopyFilesToScopeMutationVariables,
    GQLFindCopiesOfFileInScopeQuery,
    GQLFindCopiesOfFileInScopeQueryVariables,
} from "./copyDamFilesToScope.generated";
import { createInboxFolder } from "./createInboxFolder";

const findCopiesOfFileInScopeQuery = gql`
    query FindCopiesOfFileInScope($id: ID!, $scope: DamScopeInput!, $imageCropArea: ImageCropAreaInput) {
        findCopiesOfFileInScope(id: $id, scope: $scope, imageCropArea: $imageCropArea) {
            id
        }
    }
`;

const copyFilesToScopeMutation = gql`
    mutation CopyFilesToScope($fileIds: [ID!]!, $inboxFolderId: ID!) {
        copyFilesToScope(fileIds: $fileIds, inboxFolderId: $inboxFolderId) {
            mappedFiles {
                rootFile {
                    id
                }
                copy {
                    id
                }
            }
        }
    }
`;

export interface DamFileToCopy {
    id: string;
    /** The scope the file currently lives in. Files without a scope are treated as being outside the target scope. */
    scope?: Record<string, unknown>;
    imageCropArea?: GQLImageCropAreaInput;
}

interface CopyDamFilesToScopeOptions {
    client: ApolloClient<unknown>;
    files: DamFileToCopy[];
    targetDamScope: Record<string, unknown>;
    /** Reports the progress of the copy process as a value between 0 and 1. */
    updateProgress?: (progress: number) => void;
}

/**
 * Makes DAM files usable in the target scope and returns the dependency replacements required to point to them.
 *
 * Files that already live in the target scope are left alone. For the remaining files an existing copy in the target
 * scope is reused if there is one, otherwise the files are copied into a newly created inbox folder.
 */
export async function copyDamFilesToScope({
    client,
    files,
    targetDamScope,
    updateProgress,
}: CopyDamFilesToScopeOptions): Promise<ReplaceDependencyObject[]> {
    const replacements: ReplaceDependencyObject[] = [];

    // Without DAM scoping every file can be used everywhere, so there is nothing to copy
    if (Object.keys(targetDamScope).length === 0) {
        updateProgress?.(1);
        return replacements;
    }

    const filesToCopy: DamFileToCopy[] = [];
    const handledFileIds = new Set<string>();
    let analyzedFiles = 0;

    for (const file of files) {
        if (!handledFileIds.has(file.id)) {
            handledFileIds.add(file.id);

            if (!isEqual(file.scope, targetDamScope)) {
                // TODO eventually handle multiple files in one request for better performance
                const { data } = await client.query<GQLFindCopiesOfFileInScopeQuery, GQLFindCopiesOfFileInScopeQueryVariables>({
                    query: findCopiesOfFileInScopeQuery,
                    variables: {
                        id: file.id,
                        scope: targetDamScope,
                        imageCropArea: file.imageCropArea,
                    },
                });

                if (data.findCopiesOfFileInScope.length > 0) {
                    // use already existing copy
                    replacements.push({ type: "DamFile", originalId: file.id, replaceWithId: data.findCopiesOfFileInScope[0].id });
                } else {
                    filesToCopy.push(file);
                }
            }
        }

        analyzedFiles++;
        // Analyzing the files is the expensive part, copying them is a single request
        updateProgress?.((analyzedFiles / files.length) * 0.9);
    }

    if (filesToCopy.length > 0) {
        const sourceScopes: Record<string, unknown>[] = [];
        for (const { scope } of filesToCopy) {
            if (scope && !sourceScopes.some((sourceScope) => isEqual(sourceScope, scope))) {
                sourceScopes.push(scope);
            }
        }

        const inboxFolder = await createInboxFolder({ client, targetScope: targetDamScope, sourceScopes });

        const { data } = await client.mutate<GQLCopyFilesToScopeMutation, GQLCopyFilesToScopeMutationVariables>({
            mutation: copyFilesToScopeMutation,
            variables: { fileIds: filesToCopy.map((file) => file.id), inboxFolderId: inboxFolder.id },
            update: (cache) => {
                cache.evict({ fieldName: "damItemsList" });
            },
        });

        for (const { rootFile, copy } of data?.copyFilesToScope.mappedFiles ?? []) {
            replacements.push({ type: "DamFile", originalId: rootFile.id, replaceWithId: copy.id });
        }
    }

    updateProgress?.(1);

    return replacements;
}
