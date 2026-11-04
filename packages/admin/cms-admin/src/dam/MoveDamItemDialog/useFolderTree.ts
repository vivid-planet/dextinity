import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";

import { traversePreOrder, TreeMap } from "../../pages/pageTree/treemap/TreeMapUtils";
import type { GQLAllFoldersWithoutFiltersQuery } from "./ChooseFolder";

interface FolderTreeFolder {
    id: string;
    name: string;
    mpath: string[];
    parentId: string | null;
}
export interface FolderWithRenderInformation extends FolderTreeFolder {
    level: number;
    expanded: boolean;
}

export type FolderTreeMap = TreeMap<FolderTreeFolder>;

interface UseFolderTreeProps {
    damFoldersFlat?: GQLAllFoldersWithoutFiltersQuery["damFoldersFlat"];
}
interface UseFolderTreeApi {
    tree: FolderTreeMap;
    foldersToRender: Array<FolderWithRenderInformation>;
    expandedIds: Set<string>;
    setExpandedIds: Dispatch<SetStateAction<Set<string>>>;
    toggleExpand: (id: string) => void;
    selectedId: string | null | undefined;
    setSelectedId: Dispatch<SetStateAction<string | null | undefined>>;
}

export const useFolderTree = ({ damFoldersFlat }: UseFolderTreeProps): UseFolderTreeApi => {
    const [selectedId, setSelectedId] = useState<string | null>();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [foldersToRender, setFoldersToRender] = useState<Array<FolderWithRenderInformation>>([]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds((expandedIds) => {
            const newExpandedIds = new Set(expandedIds);

            if (expandedIds.has(id)) {
                newExpandedIds.delete(id);
            } else {
                newExpandedIds.add(id);
            }

            return newExpandedIds;
        });
    }, []);

    const tree = useMemo(() => {
        const folderTreeMap: FolderTreeMap = new TreeMap();
        if (damFoldersFlat === undefined) {
            return folderTreeMap;
        }

        for (const folder of damFoldersFlat) {
            const parentId = folder.parent?.id ?? "root";

            let existingSiblingFolders: FolderTreeFolder[] = [];
            if (folderTreeMap.has(parentId)) {
                existingSiblingFolders = folderTreeMap.get(parentId) as FolderTreeFolder[];
            }

            folderTreeMap.set(parentId, [
                ...existingSiblingFolders,
                {
                    id: folder.id,
                    name: folder.name,
                    mpath: folder.mpath,
                    parentId: folder.parent?.id ?? null,
                },
            ]);
        }

        return folderTreeMap;
    }, [damFoldersFlat]);

    useEffect(() => {
        const newFoldersToRender: Array<FolderWithRenderInformation> = [];

        traversePreOrder(tree, (element, level) => {
            const isParentVisible = element.parentId !== null ? newFoldersToRender.find((node) => node.id === element.parentId) : true;
            const isParentExpanded = element.parentId !== null ? expandedIds.has(element.parentId) : true;

            if (isParentVisible && isParentExpanded) {
                newFoldersToRender.push({ ...element, level, expanded: expandedIds.has(element.id) });
            }
        });

        setFoldersToRender(newFoldersToRender);
    }, [expandedIds, tree]);

    return { tree, foldersToRender, expandedIds, setExpandedIds, toggleExpand, selectedId, setSelectedId };
};
