import type { LibraryLocation, LibrarySortKey } from "./AssetLibraryContext";
import { type AssetKind, getDescendantFolderIds, getFolderTrail, type LibraryAsset, type LibraryFolder } from "./assetLibraryData";

export type LibraryItem = { type: "folder"; id: string; folder: LibraryFolder } | { type: "file"; id: string; asset: LibraryAsset };

export function folderItemId(folderId: string) {
    return `folder:${folderId}`;
}

export function fileItemId(assetId: string) {
    return `file:${assetId}`;
}

export const kindFilterLabels: Record<AssetKind, string> = { image: "images", video: "videos", audio: "audio files", document: "documents" };

export interface LibraryContent {
    mode: "folder" | "flat" | "search" | "smartFilter";
    /** Folders first, then files, sorted, before paging. */
    items: LibraryItem[];
    /** Files of the kind filter that are only deeper down, for the hint. */
    deeperMatches: number;
}

function countItemsIn(folderId: string, folders: LibraryFolder[], assets: LibraryAsset[]) {
    return (
        folders.filter((folder) => folder.parentId === folderId).length +
        assets.filter((asset) => !asset.archived && asset.folderId === folderId).length
    );
}

function compare(a: LibraryItem, b: LibraryItem, key: LibrarySortKey, folders: LibraryFolder[], assets: LibraryAsset[]) {
    const name = (item: LibraryItem) => (item.type === "folder" ? item.folder.name : item.asset.name);
    switch (key) {
        case "modified":
            return (a.type === "folder" ? a.folder.modified : a.asset.modified).localeCompare(
                b.type === "folder" ? b.folder.modified : b.asset.modified,
            );
        case "size": {
            const size = (item: LibraryItem) => (item.type === "folder" ? countItemsIn(item.folder.id, folders, assets) : item.asset.bytes);
            return size(a) - size(b);
        }
        case "kind":
            return (a.type === "file" ? a.asset.kind : "").localeCompare(b.type === "file" ? b.asset.kind : "") || name(a).localeCompare(name(b));
        default:
            return name(a).localeCompare(name(b), "en", { numeric: true });
    }
}

export function getLibraryContent(location: LibraryLocation, folders: LibraryFolder[], assets: LibraryAsset[]): LibraryContent {
    const active = assets.filter((asset) => !asset.archived);
    const matchesKind = (asset: LibraryAsset) => location.kind == null || asset.kind === location.kind;
    let mode: LibraryContent["mode"] = "folder";
    let folderItems: LibraryFolder[] = [];
    let files: LibraryAsset[] = [];
    let deeperMatches = 0;

    if (location.search.trim() !== "") {
        mode = "search";
        const term = location.search.trim().toLowerCase();
        folderItems = folders.filter((folder) => folder.name.toLowerCase().includes(term));
        files = active.filter((asset) => matchesKind(asset) && `${asset.name} ${asset.alt}`.toLowerCase().includes(term));
    } else if (location.smartFilter != null) {
        mode = "smartFilter";
        files =
            location.smartFilter === "archived"
                ? assets.filter((asset) => asset.archived && matchesKind(asset))
                : active.filter((asset) => asset.usages.length === 0 && matchesKind(asset));
    } else {
        const deeperFolderIds = getDescendantFolderIds(folders, location.folderId);
        const deeper = active.filter((asset) => matchesKind(asset) && deeperFolderIds.includes(asset.folderId));
        if (location.flat) {
            mode = "flat";
            files = [...active.filter((asset) => asset.folderId === location.folderId && matchesKind(asset)), ...deeper];
        } else {
            folderItems = location.kind == null ? folders.filter((folder) => folder.parentId === location.folderId) : [];
            files = active.filter((asset) => asset.folderId === location.folderId && matchesKind(asset));
            deeperMatches = location.kind == null ? 0 : deeper.length;
        }
    }

    const direction = location.sort.direction === "ascending" ? 1 : -1;
    const sort = (items: LibraryItem[]) => items.sort((a, b) => compare(a, b, location.sort.key, folders, assets) * direction);
    const fileItems = sort(files.map((asset) => ({ type: "file" as const, id: fileItemId(asset.id), asset })));
    // The flat view groups the files by folder, in the order of the folder tree
    if (mode === "flat") {
        const order = [location.folderId, ...getDescendantFolderIds(folders, location.folderId)];
        fileItems.sort((a, b) => (a.type === "file" && b.type === "file" ? order.indexOf(a.asset.folderId) - order.indexOf(b.asset.folderId) : 0));
    }
    return {
        mode,
        items: [...sort(folderItems.map((folder) => ({ type: "folder" as const, id: folderItemId(folder.id), folder }))), ...fileItems],
        deeperMatches,
    };
}

export function countFolderItems(folderId: string, folders: LibraryFolder[], assets: LibraryAsset[]) {
    return countItemsIn(folderId, folders, assets);
}

/** The path of a folder below another one, e.g. "Imagery / Mountains & lakes". */
export function getRelativePath(folders: LibraryFolder[], folderId: string, fromFolderId: string | null) {
    const trail = getFolderTrail(folders, folderId);
    const start = fromFolderId == null ? 0 : trail.findIndex((folder) => folder.id === fromFolderId) + 1;
    return trail
        .slice(start)
        .map((folder) => folder.name)
        .join(" / ");
}
