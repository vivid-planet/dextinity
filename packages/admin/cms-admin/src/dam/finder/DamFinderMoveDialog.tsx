import { Button, Dialog, EmptyState, FilterBar, Icon, type TreeNode, TreeView } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { damFinderRootFolderId } from "./damFinderItems";

interface DamFinderMoveDialogFolder {
    id: string;
    name: string;
    parentId: string | null;
}

interface DamFinderMoveDialogProps {
    open: boolean;
    onClose: () => void;
    /** All folders, including the root folder (`parentId: null`). */
    folders: ReadonlyArray<DamFinderMoveDialogFolder>;
    /** The number of files and folders that are moved, for the title. */
    count: number;
    /** The folders that are moved; they and their subfolders can't be the target. */
    movedFolderIds: ReadonlyArray<string>;
    /** The folder all items are in, which can't be the target; its ancestors are expanded. Unknown for items from a search. */
    sourceFolderId?: string;
    onMove: (targetFolderId: string) => void;
}

function matchesSearch(folder: DamFinderMoveDialogFolder, search: string) {
    const query = search.trim().toLowerCase();
    return query === "" || folder.name.toLowerCase().includes(query);
}

/** A dialog to choose the folder files and folders are moved to, from the folder tree. */
export function DamFinderMoveDialog({ open, onClose, folders, count, movedFolderIds, sourceFolderId, onMove }: DamFinderMoveDialogProps) {
    const intl = useIntl();
    const [selectedId, setSelectedId] = useState<string>();
    const [expandedIds, setExpandedIds] = useState<string[]>([damFinderRootFolderId]);
    const [search, setSearch] = useState("");

    const childrenByParentId = useMemo(() => {
        const map = new Map<string | null, DamFinderMoveDialogFolder[]>();
        for (const folder of folders) {
            map.set(folder.parentId, [...(map.get(folder.parentId) ?? []), folder]);
        }
        return map;
    }, [folders]);
    const folderById = useMemo(() => new Map(folders.map((folder) => [folder.id, folder])), [folders]);

    const excludedIds = useMemo(() => {
        const ids = new Set<string>();
        const exclude = (id: string) => {
            ids.add(id);
            for (const child of childrenByParentId.get(id) ?? []) {
                exclude(child.id);
            }
        };
        movedFolderIds.forEach(exclude);
        return ids;
    }, [movedFolderIds, childrenByParentId]);

    const treeNodes = useMemo(() => {
        const toNodes = (parentId: string | null): TreeNode[] =>
            (childrenByParentId.get(parentId) ?? [])
                .filter((folder) => !excludedIds.has(folder.id))
                .sort((first, second) => first.name.localeCompare(second.name))
                .map((folder) => {
                    const children = toNodes(folder.id);
                    return {
                        id: folder.id,
                        label: folder.name,
                        type: "folder",
                        icon: folder.parentId == null ? <Icon name="assets" /> : undefined,
                        children: children.length > 0 ? children : undefined,
                    };
                });
        return toNodes(null);
    }, [childrenByParentId, excludedIds]);

    useEffect(() => {
        if (open) {
            const ancestorIds: string[] = [];
            let parentId = sourceFolderId != null ? folderById.get(sourceFolderId)?.parentId : undefined;
            while (parentId != null) {
                ancestorIds.push(parentId);
                parentId = folderById.get(parentId)?.parentId;
            }
            setSelectedId(undefined);
            setSearch("");
            setExpandedIds([damFinderRootFolderId, ...ancestorIds]);
        }
    }, [open, sourceFolderId, folderById]);

    const isSearching = search.trim() !== "";
    const matchCount = isSearching ? folders.filter((folder) => !excludedIds.has(folder.id) && matchesSearch(folder, search)).length : undefined;
    const isValidTarget = (id: string | undefined): id is string => id != null && id !== sourceFolderId && folderById.has(id) && !excludedIds.has(id);
    const canMove = isValidTarget(selectedId);
    const selectedFolderName = selectedId != null ? folderById.get(selectedId)?.name : undefined;

    const move = (targetFolderId: string | undefined) => {
        if (isValidTarget(targetFolderId)) {
            onMove(targetFolderId);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onClose();
                }
            }}
            size="default"
            title={intl.formatMessage(
                { id: "dextinity.damFinder.move.title", defaultMessage: "Move {count, plural, one {# item} other {# items}}" },
                { count },
            )}
            description={intl.formatMessage({ id: "dextinity.damFinder.move.description", defaultMessage: "Choose the folder to move them to." })}
            labels={{ close: intl.formatMessage({ id: "dextinity.damFinder.move.close", defaultMessage: "Close" }) }}
            footer={
                <>
                    <Button variant="outlined" color="secondary" onClick={onClose}>
                        {intl.formatMessage({ id: "dextinity.damFinder.move.cancel", defaultMessage: "Cancel" })}
                    </Button>
                    <Button startIcon={<Icon name="move" />} disabled={!canMove} onClick={() => move(selectedId)}>
                        {canMove && selectedFolderName != null
                            ? intl.formatMessage(
                                  { id: "dextinity.damFinder.move.confirmTo", defaultMessage: "Move to “{folder}”" },
                                  { folder: selectedFolderName },
                              )
                            : intl.formatMessage({ id: "dextinity.damFinder.move.confirm", defaultMessage: "Move" })}
                    </Button>
                </>
            }
        >
            <Content>
                <FilterBar
                    searchValue={search}
                    onSearchChange={setSearch}
                    resultCount={matchCount}
                    searchShortcut={false}
                    labels={{
                        search: intl.formatMessage({ id: "dextinity.damFinder.move.search", defaultMessage: "Search folders" }),
                        searchPlaceholder: intl.formatMessage({ id: "dextinity.damFinder.move.searchPlaceholder", defaultMessage: "Folder name" }),
                        resultCount: (resultCount) =>
                            intl.formatMessage(
                                { id: "dextinity.damFinder.move.resultCount", defaultMessage: "{count, plural, one {# folder} other {# folders}}" },
                                { count: resultCount },
                            ),
                    }}
                />
                <TreeArea>
                    {matchCount === 0 ? (
                        <EmptyState
                            icon={<Icon name="search" />}
                            title={intl.formatMessage({ id: "dextinity.damFinder.move.noMatches", defaultMessage: "No folders match the search" })}
                        />
                    ) : (
                        <TreeView
                            aria-label={intl.formatMessage({ id: "dextinity.damFinder.move.tree", defaultMessage: "Folders" })}
                            nodes={treeNodes}
                            expandedIds={expandedIds}
                            onExpandedChange={setExpandedIds}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onOpen={move}
                            filter={
                                isSearching
                                    ? (node) =>
                                          node.id !== damFinderRootFolderId &&
                                          matchesSearch({ id: node.id, name: node.label, parentId: null }, search)
                                    : undefined
                            }
                        />
                    )}
                </TreeArea>
            </Content>
        </Dialog>
    );
}

const Content = styled("div")`
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: var(--dextinity-space-3);
    block-size: min(60vh, 480px);
`;

const TreeArea = styled("div")`
    min-block-size: 0;
    overflow-y: auto;
`;
