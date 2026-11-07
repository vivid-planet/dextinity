import { useApolloClient } from "@apollo/client";
import { useCallback, useEffect, useRef, useState } from "react";

import { useDamScope } from "../config/useDamScope";
import { damFinderRootFolderId } from "./damFinderItems";
import type { GQLDamFinderFileFragment } from "./damFinderItems.fragment.generated";
import { damFinderFilesQuery } from "./useDamFinderFiles.gql";
import type { GQLDamFinderFilesQuery, GQLDamFinderFilesQueryVariables } from "./useDamFinderFiles.gql.generated";

const pageSize = 100;

/**
 * Loads the files of the given folders, all pages each, and keeps them until `reload` is called for a folder. Archived files are only
 * loaded with `includeArchived`.
 */
export function useDamFinderFiles(folderIds: string[], { includeArchived = false }: { includeArchived?: boolean } = {}) {
    const client = useApolloClient();
    const scope = useDamScope();
    const [filesByFolderId, setFilesByFolderId] = useState<Record<string, GQLDamFinderFileFragment[]>>({});
    const [loadingFolderIds, setLoadingFolderIds] = useState<string[]>([]);
    const [error, setError] = useState<Error>();
    const requestedFolderIds = useRef(new Set<string>());

    const load = useCallback(
        async (folderId: string) => {
            requestedFolderIds.current.add(folderId);
            setLoadingFolderIds((ids) => [...ids, folderId]);
            try {
                const files: GQLDamFinderFileFragment[] = [];
                let totalCount = Infinity;
                while (files.length < totalCount) {
                    const { data } = await client.query<GQLDamFinderFilesQuery, GQLDamFinderFilesQueryVariables>({
                        query: damFinderFilesQuery,
                        variables: {
                            folderId: folderId === damFinderRootFolderId ? undefined : folderId,
                            scope,
                            offset: files.length,
                            limit: pageSize,
                            includeArchived,
                        },
                        fetchPolicy: "network-only",
                    });
                    files.push(...data.damFilesList.nodes);
                    totalCount = data.damFilesList.nodes.length === 0 ? files.length : data.damFilesList.totalCount;
                }
                setFilesByFolderId((current) => ({ ...current, [folderId]: files }));
            } catch (loadError) {
                requestedFolderIds.current.delete(folderId);
                setError(loadError instanceof Error ? loadError : new Error(String(loadError)));
            } finally {
                setLoadingFolderIds((ids) => ids.filter((id) => id !== folderId));
            }
        },
        [client, scope, includeArchived],
    );

    useEffect(() => {
        requestedFolderIds.current.clear();
        setFilesByFolderId({});
    }, [scope, includeArchived]);

    useEffect(() => {
        for (const folderId of folderIds) {
            if (!requestedFolderIds.current.has(folderId)) {
                load(folderId);
            }
        }
    }, [folderIds, load]);

    const reload = useCallback((ids: string[]) => Promise.all(Array.from(new Set(ids)).map((folderId) => load(folderId))), [load]);

    return { filesByFolderId, loadingFolderIds, error, reload };
}
