import { usePrototypeNavigation } from "../../../pageTypes/prototypeNavigation";
import { useAssetLibrary } from "./AssetLibraryContext";
import { getDescendantFolderIds, type LibraryAsset, type LibraryFolder } from "./assetLibraryData";
import { fileItemId, folderItemId, type LibraryItem } from "./libraryView";

function describeCount(items: LibraryItem[], verb: string) {
    if (items.length === 1) {
        const item = items[0];
        return `“${item.type === "folder" ? item.folder.name : item.asset.name}” ${verb}`;
    }
    return `${items.length} items ${verb}`;
}

/**
 * The actions on items of the library, shared by the context menu, the bulk action bar, and drag and drop. Moving, archiving, and
 * deleting run right away and offer Undo.
 */
export function useLibraryActions() {
    const { assets, setAssets, folders, setFolders, setLocation, addToast, undoToast } = useAssetLibrary();
    const prototype = usePrototypeNavigation();

    function openFolder(folderId: string | null) {
        setLocation((current) => ({ ...current, folderId, flat: false, smartFilter: null, search: "", page: 1 }));
    }

    function open(item: LibraryItem) {
        if (item.type === "folder") {
            openFolder(item.folder.id);
        } else {
            prototype?.navigate(`assets/${item.asset.id}`);
        }
    }

    function rename(item: LibraryItem, name: string) {
        const trimmed = name.trim();
        if (trimmed === "") {
            return;
        }
        if (item.type === "folder") {
            setFolders((current) => current.map((folder) => (folder.id === item.folder.id ? { ...folder, name: trimmed } : folder)));
        } else {
            setAssets((current) => current.map((asset) => (asset.id === item.asset.id ? { ...asset, name: trimmed } : asset)));
        }
    }

    function duplicate(items: LibraryItem[]) {
        const copies: LibraryAsset[] = items.flatMap((item) => {
            if (item.type !== "file") {
                return [];
            }
            const { asset } = item;
            const dot = asset.name.lastIndexOf(".");
            const name = dot > 0 ? `${asset.name.slice(0, dot)} copy${asset.name.slice(dot)}` : `${asset.name} copy`;
            return [{ ...asset, id: `${asset.id}-copy-${Date.now()}`, name, usages: [] }];
        });
        setAssets((current) => [...current, ...copies]);
        addToast({ message: copies.length === 1 ? `“${copies[0].name}” created` : `${copies.length} copies created` });
        return copies.map((copy) => fileItemId(copy.id));
    }

    /** Whether the items may go into the folder: not into itself or one of its subfolders. */
    function canMove(items: LibraryItem[], targetFolderId: string | null) {
        return items.every((item) => {
            if (item.type === "file") {
                return item.asset.folderId !== targetFolderId;
            }
            const { id, parentId } = item.folder;
            return id !== targetFolderId && parentId !== targetFolderId && !getDescendantFolderIds(folders, id).includes(targetFolderId ?? "");
        });
    }

    function move(items: LibraryItem[], targetFolderId: string | null, targetName: string) {
        if (!canMove(items, targetFolderId)) {
            return;
        }
        const previousAssets = assets;
        const previousFolders = folders;
        const fileIds = items.flatMap((item) => (item.type === "file" ? [item.asset.id] : []));
        const folderIds = items.flatMap((item) => (item.type === "folder" ? [item.folder.id] : []));
        undoToast.perform({
            run: () => {
                setAssets((current) =>
                    current.map((asset) => (fileIds.includes(asset.id) ? { ...asset, folderId: targetFolderId ?? asset.folderId } : asset)),
                );
                setFolders((current) => current.map((folder) => (folderIds.includes(folder.id) ? { ...folder, parentId: targetFolderId } : folder)));
            },
            undo: () => {
                setAssets(previousAssets);
                setFolders(previousFolders);
            },
            message: `${describeCount(items, "moved")} to “${targetName}”`,
        });
    }

    function download(items: LibraryItem[]) {
        addToast({ message: items.length === 1 ? "Download started" : `Download of ${items.length} items started`, color: "info" });
    }

    function setArchived(items: LibraryItem[], archived: boolean) {
        const ids = items.flatMap((item) => (item.type === "file" ? [item.asset.id] : []));
        const previous = assets;
        undoToast.perform({
            run: () => setAssets((current) => current.map((asset) => (ids.includes(asset.id) ? { ...asset, archived } : asset))),
            undo: () => setAssets(previous),
            message: describeCount(items, archived ? "archived" : "restored"),
        });
    }

    function remove(items: LibraryItem[], onRemoved?: () => void) {
        const used = items.find((item) => item.type === "file" && item.asset.usages.length > 0);
        if (used?.type === "file") {
            undoToast.block(`“${used.asset.name}” is still used ${used.asset.usages.length}× and was not deleted`);
            return;
        }
        const fileIds = items.flatMap((item) => (item.type === "file" ? [item.asset.id] : []));
        const folderIds = items.flatMap((item) =>
            item.type === "folder" ? [item.folder.id, ...getDescendantFolderIds(folders, item.folder.id)] : [],
        );
        const previousAssets = assets;
        const previousFolders = folders;
        undoToast.perform({
            run: () => {
                setAssets((current) => current.filter((asset) => !fileIds.includes(asset.id) && !folderIds.includes(asset.folderId)));
                setFolders((current) => current.filter((folder) => !folderIds.includes(folder.id)));
                onRemoved?.();
            },
            undo: () => {
                setAssets(previousAssets);
                setFolders(previousFolders);
            },
            message: describeCount(items, "deleted"),
        });
    }

    function createFolder(parentId: string | null) {
        const folder: LibraryFolder = { id: `folder-${Date.now()}`, name: "New folder", parentId, modified: "2026-11-19" };
        setFolders((current) => [...current, folder]);
        return folderItemId(folder.id);
    }

    return { open, openFolder, rename, duplicate, canMove, move, download, setArchived, remove, createFolder };
}
