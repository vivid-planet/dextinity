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
    scope?: Record<string, unknown>;
    imageCropArea?: GQLImageCropAreaInput;
}

interface CopyDamFilesToScopeOptions {
    client: ApolloClient<unknown>;
    files: DamFileToCopy[];
    targetDamScope: Record<string, unknown>;
    updateProgress?: (progressFromZeroToOne: number) => void;
}

const progressShareForAnalyzingFiles = 0.9;

export async function copyDamFilesToScope({
    client,
    files,
    targetDamScope,
    updateProgress,
}: CopyDamFilesToScopeOptions): Promise<ReplaceDependencyObject[]> {
    const replacements: ReplaceDependencyObject[] = [];

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
                    replacements.push({ type: "DamFile", originalId: file.id, replaceWithId: data.findCopiesOfFileInScope[0].id });
                } else {
                    filesToCopy.push(file);
                }
            }
        }

        analyzedFiles++;
        updateProgress?.((analyzedFiles / files.length) * progressShareForAnalyzingFiles);
    }

    if (filesToCopy.length > 0) {
        const sourceScopes: Record<string, unknown>[] = [];
        for (const { scope } of filesToCopy) {
            if (scope && Object.keys(scope).length > 0 && !sourceScopes.some((sourceScope) => isEqual(sourceScope, scope))) {
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
