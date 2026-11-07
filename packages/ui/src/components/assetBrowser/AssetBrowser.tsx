import { ContextMenu } from "@base-ui/react/context-menu";
import { clsx } from "clsx";
import {
    type ChangeEvent,
    type DragEvent,
    forwardRef,
    type HTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent,
    type ReactNode,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { AssetThumbnail, type AssetThumbnailBadge, type FocalPoint } from "../assetThumbnail/AssetThumbnail";
import { Breadcrumbs } from "../breadcrumbs/Breadcrumbs";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { MenuItem } from "../menu/MenuItem";
import { MenuSeparator } from "../menu/MenuSeparator";
import { SegmentedControl } from "../segmentedControl/SegmentedControl";
import { Spinner } from "../spinner/Spinner";
import { type TreeNode, TreeView } from "../treeView/TreeView";
import styles from "./AssetBrowser.module.scss";

export type AssetBrowserView = "icons" | "list" | "columns" | "gallery";

export interface AssetBrowserFolder {
    /** A stable id, unique across folders and assets. */
    id: string;
    /** The folder name, shown in the tree, the path bar, and the content. */
    name: string;
    /** The parent folder's id, `null` for the root folder. */
    parentId: string | null;
    /** Details below the folder's name, e.g. the number of items when its assets aren't loaded. Without it, the loaded items are counted. */
    meta?: string;
}

export interface AssetBrowserAsset {
    /** A stable id, unique across folders and assets. */
    id: string;
    /** The file name. */
    name: string;
    /** The id of the folder the asset is in. */
    folderId: string;
    /** What the asset is; decides how its thumbnail looks. */
    type: "image" | "video" | "document";
    /** The URL of the preview picture. */
    src?: string;
    /** The picture's text alternative. */
    alt?: string;
    /** The point the thumbnail crop is centered on. */
    focalPoint?: FocalPoint;
    /** Exceptions shown on the thumbnail, e.g. `ai` or `missingAlt`. */
    badges?: ReadonlyArray<AssetThumbnailBadge>;
    /** The file format shown on documents, e.g. "PDF". */
    fileType?: string;
    /** The length of videos, e.g. "0:42". */
    duration?: string;
    /** Details such as format and size, e.g. "JPG · 2.4 MB". */
    meta?: string;
    /** When the asset was last changed, formatted for display. */
    modified?: string;
}

export interface AssetBrowserLabels {
    /** The accessible name of the folder tree. */
    folders: string;
    /** The accessible name of the item list. */
    items: string;
    /** The accessible name of the view switch. */
    view: string;
    /** The view option showing the items as icons. */
    icons: string;
    /** The view option showing the items as a list. */
    list: string;
    /** The view option showing the folder path as columns. */
    columns: string;
    /** The view option showing one item large above a strip. */
    gallery: string;
    /** The button that goes to the parent folder. */
    up: string;
    /** The heading of the list view's name column. */
    name: string;
    /** The heading of the list view's details column. */
    details: string;
    /** The heading of the list view's last-changed column. */
    modified: string;
    /** Shown in a folder without items. */
    empty: string;
    /** The number of items in a folder, below its name. */
    itemCount: (count: number) => string;
    /** The number of selected items, in the path bar. */
    selectedCount: (selected: number, total: number) => string;
    /** The accessible name of the handle that resizes the folder tree. */
    resizeSidebar: string;
    /** The accessible name of the search field. */
    search: string;
    /** The placeholder of the search field. */
    searchPlaceholder: string;
    /** The button that clears the search. */
    clearSearch: string;
    /** The title above the search results, and their accessible name. */
    searchResults: string;
    /** The heading of the search results' folder column. */
    location: string;
    /** Shown while the search results load. */
    searching: string;
    /** Shown when nothing matches the search. */
    noResults: (search: string) => string;
    /** The number of search results. */
    resultCount: (count: number) => string;
    /** The context menu item that opens the item. */
    open: string;
    /** The context menu item that renames the item in place; also the accessible name of the name field. */
    rename: string;
    /** The context menu item that deletes the selection. */
    delete: string;
    /** The button and context menu item that create a folder in place. */
    newFolder: string;
    /** The name of a new folder whose name was left empty. */
    untitledFolder: string;
}

const defaultLabels: AssetBrowserLabels = {
    folders: "Folders",
    items: "Items",
    view: "View",
    icons: "Icons",
    list: "List",
    columns: "Columns",
    gallery: "Gallery",
    up: "Enclosing folder",
    name: "Name",
    details: "Details",
    modified: "Modified",
    empty: "This folder is empty",
    itemCount: (count) => (count === 1 ? "1 item" : `${count} items`),
    selectedCount: (selected, total) => `${selected} of ${total} selected`,
    resizeSidebar: "Resize folders",
    search: "Search",
    searchPlaceholder: "Search all folders",
    clearSearch: "Clear search",
    searchResults: "Search results",
    location: "Location",
    searching: "Searching…",
    noResults: (search) => `No results for “${search}”`,
    resultCount: (count) => (count === 1 ? "1 result" : `${count} results`),
    open: "Open",
    rename: "Rename",
    delete: "Delete",
    newFolder: "New folder",
    untitledFolder: "Untitled folder",
};

// Keeps the content usable when the sidebar is dragged wide in a narrow browser
const minContentWidth = 320;
const resizeStep = 16;
const largeResizeStep = 64;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type AssetBrowserOwnerState = {
    view: AssetBrowserView;
    mode: "manage" | "pick";
    searching: boolean;
};

export interface AssetBrowserSlotProps {
    /** Props for the `sidebar` slot, which holds the folder tree. */
    sidebar?: SlotPropsValue<AssetBrowserOwnerState, "nav">;
    /** Props for the `resizeHandle` slot, the separator on the sidebar's edge. Only rendered when the sidebar can be resized. */
    resizeHandle?: SlotPropsValue<AssetBrowserOwnerState, "div">;
    /** Props for the `toolbar` slot. */
    toolbar?: SlotPropsValue<AssetBrowserOwnerState, "div">;
    /** Props for the `content` slot, the area showing the folder's items. */
    content?: SlotPropsValue<AssetBrowserOwnerState, "div">;
    /** Props for the `pathBar` slot, the bar with the folder path and the count. */
    pathBar?: SlotPropsValue<AssetBrowserOwnerState, "div">;
    /** Props for the `search` slot, the box around the search input. Only rendered with `onSearchChange`. */
    search?: SlotPropsValue<AssetBrowserOwnerState, "label">;
    /** Props for the `searchInput` slot. */
    searchInput?: SlotPropsValue<AssetBrowserOwnerState, "input">;
}

export interface AssetBrowserProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** All folders, including the root folder (`parentId: null`). */
    folders: ReadonlyArray<AssetBrowserFolder>;
    /** All assets; each shows in the folder named by its `folderId`. */
    assets: ReadonlyArray<AssetBrowserAsset>;
    /** The id of the folder whose items are shown. */
    folderId: string;
    /** Called with the folder to show, from the tree, the path bar, or opening a folder. */
    onFolderChange: (folderId: string) => void;
    /** How the items are shown. Remember it per user. */
    view: AssetBrowserView;
    /** Called with the view chosen in the switch. */
    onViewChange: (view: AssetBrowserView) => void;
    /** The ids of the selected folders and assets. */
    selectedIds: ReadonlyArray<string>;
    /** Called with the new selection: click, ⌘/Ctrl-click to add, Shift-click or Shift-arrow for a range, ⌘/Ctrl+A for all. */
    onSelectionChange: (ids: string[]) => void;
    /**
     * `manage` for the asset area, `pick` for choosing assets in a field's dialog, which can't move or delete.
     *
     * @defaultValue `"manage"`
     */
    mode?: "manage" | "pick";
    /** Called when an asset is opened by double-click or Enter. */
    onOpen?: (asset: AssetBrowserAsset) => void;
    /** Called with the focused asset on Space, which then selects it and opens a quick look instead of toggling the selection. */
    onQuickLook?: (asset: AssetBrowserAsset) => void;
    /** Called when items are dragged onto a folder, in the content or the tree. Only in `manage` mode. */
    onMove?: (ids: string[], folderId: string) => void;
    /** Called with the selected ids on Delete or Backspace, or from the context menu. Only in `manage` mode. */
    onDelete?: (ids: string[]) => void;
    /**
     * Called with an item's new name after it was renamed in place: F2 on the item, or Rename in its context menu. Enter or leaving the
     * field saves, Escape cancels. Only in `manage` mode.
     */
    onRename?: (id: string, name: string) => void;
    /**
     * Called with the name of a folder created in place in the open folder, from the toolbar's New folder button or the context menu of
     * the empty area; add it to `folders`. Only in `manage` mode.
     */
    onCreateFolder?: (name: string, parentId: string) => void;
    /**
     * Further items in the context menu of the selected items, e.g. `MenuItem`s to download or move them. The context menu opens on a
     * right-click, Shift+F10, or the context menu key, and selects the item first if it isn't selected.
     */
    contextMenuItems?: (ids: string[]) => ReactNode;
    /** Further controls in the toolbar, e.g. "New folder" and "Upload". */
    toolbar?: ReactNode;
    /**
     * The id of a folder or asset to scroll into view, e.g. a file just uploaded. It scrolls once the item shows in the content, and
     * again whenever the id changes; set `undefined` in between to reveal the same item again.
     */
    scrollToItemId?: string;
    /**
     * The search text. While it isn't empty, the content shows `searchResults` instead of the folder's items.
     *
     * @defaultValue `""`
     */
    search?: string;
    /**
     * Called with the new search text, and with `""` on Escape in the search field and when a folder is opened. The toolbar shows a
     * search field only when set; ⌘/Ctrl+F in the browser moves the focus there.
     */
    onSearchChange?: (search: string) => void;
    /**
     * The assets matching `search`, across all folders, in the order to show them. Each shows with the path of its folder, taken from
     * `folders`; choosing a folder on that path in the path bar, the up button, or ⌘/Ctrl+↑, opens the folder and selects what the
     * result is in. The columns view shows them as a list.
     */
    searchResults?: ReadonlyArray<AssetBrowserAsset>;
    /**
     * The folders matching `search`, shown before `searchResults` with the path of their parent folder. Opening one ends the search and
     * shows the folder.
     */
    searchFolderResults?: ReadonlyArray<AssetBrowserFolder>;
    /**
     * Shows that the results for `search` are loading.
     *
     * @defaultValue `false`
     */
    searchLoading?: boolean;
    /** The width of the folder tree in pixels; `undefined` uses the theme's width. Remember it per user. */
    sidebarWidth?: number;
    /**
     * Called with the width the folder tree is resized to by dragging its edge or with the arrow keys, Home, and End on it, and with
     * `undefined` when the edge is double-clicked to go back to the theme's width. The folder tree can only be resized when set.
     */
    onSidebarWidthChange?: (width: number | undefined) => void;
    /**
     * The narrowest the folder tree can be resized to, in pixels.
     *
     * @defaultValue `160`
     */
    sidebarMinWidth?: number;
    /**
     * The widest the folder tree can be resized to, in pixels. It also leaves the content at least 320 pixels.
     *
     * @defaultValue `560`
     */
    sidebarMaxWidth?: number;
    /** The built-in texts. */
    labels?: Partial<AssetBrowserLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: AssetBrowserSlotProps;
}

type Item = { kind: "folder"; folder: AssetBrowserFolder } | { kind: "asset"; asset: AssetBrowserAsset };

function itemId(item: Item) {
    return item.kind === "folder" ? item.folder.id : item.asset.id;
}

function itemName(item: Item) {
    return item.kind === "folder" ? item.folder.name : item.asset.name;
}

function byName(first: { name: string }, second: { name: string }) {
    return first.name.localeCompare(second.name);
}

function stopPropagation(event: { stopPropagation: () => void }) {
    event.stopPropagation();
}

/**
 * The field that renames an item or names a new folder in place. Enter or leaving it saves, Escape cancels.
 */
function NameField({
    initialName,
    label,
    selectStem,
    className,
    onCommit,
    onCancel,
}: {
    initialName: string;
    label: string;
    selectStem: boolean;
    className?: string;
    onCommit: (name: string) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(initialName);
    const inputRef = useRef<HTMLInputElement>(null);
    const done = useRef(false);

    useLayoutEffect(() => {
        const input = inputRef.current;
        if (input == null) {
            return;
        }
        input.focus();
        // Like the Finder, a file's extension stays unselected, so typing replaces only the name
        const extensionStart = initialName.lastIndexOf(".");
        input.setSelectionRange(0, selectStem && extensionStart > 0 ? extensionStart : initialName.length);
    }, [initialName, selectStem]);

    const finish = (save: boolean) => {
        if (done.current) {
            return;
        }
        done.current = true;
        if (save) {
            onCommit(name);
        } else {
            onCancel();
        }
    };

    return (
        <input
            ref={inputRef}
            className={clsx(styles.nameField, className)}
            aria-label={label}
            value={name}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") {
                    event.preventDefault();
                    finish(true);
                } else if (event.key === "Escape") {
                    event.preventDefault();
                    finish(false);
                }
            }}
            onBlur={() => finish(true)}
            onClick={stopPropagation}
            onDoubleClick={stopPropagation}
            onContextMenu={stopPropagation}
        />
    );
}

/**
 * The finder for assets: a folder tree, the folder's items as icons, a list, columns, or a gallery, and a path bar. Behaves like the
 * macOS Finder for selecting, opening, and moving items. With a search, it lists the matching assets across all folders.
 */
export const AssetBrowser = forwardRef<HTMLDivElement, AssetBrowserProps>(function AssetBrowser(
    {
        folders,
        assets,
        folderId,
        onFolderChange,
        view,
        onViewChange,
        selectedIds,
        onSelectionChange,
        mode = "manage",
        onOpen,
        onQuickLook,
        onMove,
        onDelete,
        onRename,
        onCreateFolder,
        contextMenuItems,
        toolbar,
        scrollToItemId,
        search = "",
        onSearchChange,
        searchResults,
        searchFolderResults,
        searchLoading = false,
        sidebarWidth,
        onSidebarWidthChange,
        sidebarMinWidth = 160,
        sidebarMaxWidth = 560,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const isSearching = search.trim() !== "";
    const ownerState: AssetBrowserOwnerState = { view, mode, searching: isSearching };
    const baseId = useId();
    const optionRefs = useRef(new Map<string, HTMLElement>());
    const [activeId, setActiveId] = useState<string>();
    const [anchorId, setAnchorId] = useState<string>();
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
    const [draggedIds, setDraggedIds] = useState<string[]>();
    const [renamingId, setRenamingId] = useState<string>();
    const [creatingFolder, setCreatingFolder] = useState(false);
    const [contextMenuOpen, setContextMenuOpen] = useState(false);
    const [contextMenuIds, setContextMenuIds] = useState<string[]>([]);
    const contextMenuIdsRef = useRef<string[]>([]);
    const { container: portalContainer, anchorRef: portalAnchorRef } = useThemePortalContainer<HTMLDivElement>();
    const [dropFolderId, setDropFolderId] = useState<string>();
    const treeRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const focusContentAfterNavigation = useRef(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const resizeStart = useRef<{ pointerX: number; width: number; direction: 1 | -1 } | undefined>(undefined);
    const [isResizing, setIsResizing] = useState(false);
    const [measured, setMeasured] = useState<{ sidebar: number; root: number }>();
    const isResizable = onSidebarWidthChange != null;
    const setRootRef = useCallback(
        (element: HTMLDivElement | null) => {
            rootRef.current = element;
            portalAnchorRef(element);
            if (typeof ref === "function") {
                ref(element);
            } else if (ref != null) {
                ref.current = element;
            }
        },
        [ref, portalAnchorRef],
    );

    const folderById = new Map(folders.map((folder) => [folder.id, folder]));
    const ancestorsOf = (id: string) => {
        const path: AssetBrowserFolder[] = [];
        let current = folderById.get(id);
        while (current != null) {
            path.unshift(current);
            current = current.parentId != null ? folderById.get(current.parentId) : undefined;
        }
        return path;
    };
    const itemsOf = (id: string): Item[] => [
        ...folders
            .filter((folder) => folder.parentId === id)
            .sort(byName)
            .map((folder): Item => ({ kind: "folder", folder })),
        ...assets
            .filter((asset) => asset.folderId === id)
            .sort(byName)
            .map((asset): Item => ({ kind: "asset", asset })),
    ];
    const countOf = (id: string) =>
        folders.filter((folder) => folder.parentId === id).length + assets.filter((asset) => asset.folderId === id).length;

    const containerOf = (item: Item) => (item.kind === "folder" ? (item.folder.parentId ?? undefined) : item.asset.folderId);

    const path = ancestorsOf(folderId);
    const pathAncestorIds = path.slice(0, -1).map((folder) => folder.id);
    const pathAncestorIdsKey = JSON.stringify(pathAncestorIds);
    const currentFolder = folderById.get(folderId);
    const items = isSearching
        ? [
              ...(searchFolderResults ?? []).map((folder): Item => ({ kind: "folder", folder })),
              ...(searchResults ?? []).map((asset): Item => ({ kind: "asset", asset })),
          ]
        : itemsOf(folderId);
    const itemIds = items.map(itemId);
    const selected = new Set(selectedIds);
    const canManage = ownerState.mode === "manage";
    const canRename = canManage && onRename != null;
    const canCreateFolder = canManage && onCreateFolder != null && !isSearching;
    const showsNewFolder = creatingFolder && canCreateFolder;
    const tabStopId = activeId != null && itemIds.includes(activeId) ? activeId : (itemIds.find((id) => selected.has(id)) ?? itemIds[0]);

    useEffect(() => {
        setActiveId(undefined);
        setAnchorId(undefined);
        setRenamingId(undefined);
        setCreatingFolder(false);
        if (focusContentAfterNavigation.current) {
            focusContentAfterNavigation.current = false;
            const firstOption = contentRef.current?.querySelector<HTMLElement>("[role='option'][tabindex='0']");
            (firstOption ?? contentRef.current)?.focus();
        }
    }, [folderId, isSearching]);

    const scrolledToItemId = useRef<string>(undefined);
    const isScrollTargetShown = scrollToItemId != null && itemIds.includes(scrollToItemId);
    useEffect(() => {
        if (scrollToItemId == null) {
            scrolledToItemId.current = undefined;
            return;
        }
        if (!isScrollTargetShown || scrolledToItemId.current === scrollToItemId) {
            return;
        }
        const element = optionRefs.current.get(scrollToItemId);
        if (element == null) {
            return;
        }
        scrolledToItemId.current = scrollToItemId;
        element.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    }, [scrollToItemId, isScrollTargetShown]);

    useEffect(() => {
        const columns = columnsRef.current;
        columns?.scrollTo({ left: columns.scrollWidth });
    }, [folderId, view, selectedIds]);

    // The tree renders its own rows, so the drop target is marked on the row element directly
    useEffect(() => {
        const rows = treeRef.current?.querySelectorAll<HTMLElement>("[role='treeitem']") ?? [];
        rows.forEach((row) => {
            row.toggleAttribute("data-drop-target", row.dataset.id === dropFolderId);
        });
    }, [dropFolderId]);

    // Measured before the first paint, so the separator never announces a width the sidebar doesn't have
    useLayoutEffect(() => {
        const root = rootRef.current;
        const sidebar = sidebarRef.current;
        if (!isResizable || root == null || sidebar == null || typeof ResizeObserver === "undefined") {
            return;
        }
        const measure = () => setMeasured({ sidebar: sidebar.getBoundingClientRect().width, root: root.getBoundingClientRect().width });
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(root);
        observer.observe(sidebar);
        return () => observer.disconnect();
    }, [isResizable]);

    const effectiveMaxWidth = () => {
        const rootWidth = rootRef.current?.getBoundingClientRect().width ?? 0;
        const available = rootWidth > 0 ? rootWidth - minContentWidth : sidebarMaxWidth;
        return Math.max(sidebarMinWidth, Math.min(sidebarMaxWidth, available));
    };
    const clampSidebarWidth = (width: number) => Math.round(Math.min(effectiveMaxWidth(), Math.max(sidebarMinWidth, width)));
    const currentSidebarWidth = () => {
        const renderedWidth = sidebarRef.current?.getBoundingClientRect().width ?? 0;
        return renderedWidth > 0 ? renderedWidth : (sidebarWidth ?? sidebarMinWidth);
    };

    const handleResizePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 || rootRef.current == null) {
            return;
        }
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            // Synthetic pointers, e.g. from testing tools, can't be captured; the drag then follows the handle only
        }
        resizeStart.current = {
            pointerX: event.clientX,
            width: currentSidebarWidth(),
            direction: getComputedStyle(rootRef.current).direction === "rtl" ? -1 : 1,
        };
        setIsResizing(true);
    };
    const handleResizePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const start = resizeStart.current;
        if (start == null) {
            return;
        }
        onSidebarWidthChange?.(clampSidebarWidth(start.width + (event.clientX - start.pointerX) * start.direction));
    };
    const handleResizePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
        if (resizeStart.current == null) {
            return;
        }
        resizeStart.current = undefined;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setIsResizing(false);
    };
    const handleResizeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const isRtl = rootRef.current != null && getComputedStyle(rootRef.current).direction === "rtl";
        const step = event.shiftKey ? largeResizeStep : resizeStep;
        const widen = isRtl ? "ArrowLeft" : "ArrowRight";
        const narrow = isRtl ? "ArrowRight" : "ArrowLeft";
        let width: number | undefined;
        if (event.key === widen) {
            width = currentSidebarWidth() + step;
        } else if (event.key === narrow) {
            width = currentSidebarWidth() - step;
        } else if (event.key === "Home") {
            width = sidebarMinWidth;
        } else if (event.key === "End") {
            width = effectiveMaxWidth();
        }
        if (width == null) {
            return;
        }
        event.preventDefault();
        onSidebarWidthChange?.(clampSidebarWidth(width));
    };

    // Opening a folder reveals it in the tree, even inside a folder the user collapsed before
    useEffect(() => {
        const ancestorIds: string[] = JSON.parse(pathAncestorIdsKey);
        setCollapsedIds((ids) => (ids.some((id) => ancestorIds.includes(id)) ? ids.filter((id) => !ancestorIds.includes(id)) : ids));
    }, [pathAncestorIdsKey]);

    const focusItem = (id: string) => {
        setActiveId(id);
        optionRefs.current.get(id)?.focus();
    };

    const openFolder = (id: string, focusContent = true) => {
        focusContentAfterNavigation.current = focusContent;
        if (isSearching) {
            onSearchChange?.("");
        }
        onFolderChange(id);
        onSelectionChange([]);
    };

    // Opens a folder on the path of a search result and selects what leads to the result: the result itself or a subfolder. A result
    // without a parent folder only ends the search
    const revealResult = (result: Item, targetFolderId = containerOf(result)) => {
        const containerId = containerOf(result);
        if (containerId == null || targetFolderId == null) {
            onSearchChange?.("");
            return;
        }
        const resultPath = ancestorsOf(containerId);
        const index = resultPath.findIndex((folder) => folder.id === targetFolderId);
        focusContentAfterNavigation.current = true;
        onSearchChange?.("");
        onFolderChange(targetFolderId);
        onSelectionChange([index === -1 || index === resultPath.length - 1 ? itemId(result) : resultPath[index + 1].id]);
    };

    const openItem = (item: Item) => {
        if (item.kind === "folder") {
            openFolder(item.folder.id);
        } else {
            onOpen?.(item.asset);
        }
    };

    const selectRange = (fromId: string, toId: string) => {
        const fromIndex = itemIds.indexOf(fromId);
        const toIndex = itemIds.indexOf(toId);
        if (fromIndex === -1 || toIndex === -1) {
            return [toId];
        }
        return itemIds.slice(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex) + 1);
    };

    const handleItemClick = (event: MouseEvent, item: Item) => {
        event.stopPropagation();
        const id = itemId(item);
        setActiveId(id);
        if (event.shiftKey) {
            onSelectionChange(selectRange(anchorId ?? tabStopId ?? id, id));
            return;
        }
        setAnchorId(id);
        if (event.metaKey || event.ctrlKey) {
            onSelectionChange(selected.has(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id]);
        } else if (ownerState.view === "columns" && !isSearching && item.kind === "folder") {
            openFolder(item.folder.id);
        } else {
            onSelectionChange([id]);
        }
    };

    const columnCount = () => {
        if (ownerState.view !== "icons") {
            return 1;
        }
        const tops = itemIds.map((id) => optionRefs.current.get(id)?.offsetTop ?? 0);
        const perRow = tops.filter((top) => top === tops[0]).length;
        return Math.max(1, perRow);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        const modifier = event.metaKey || event.ctrlKey;
        if (modifier && event.key === "ArrowUp") {
            event.preventDefault();
            const focusedResult = isSearching ? items.find((item) => itemId(item) === tabStopId) : undefined;
            if (focusedResult != null) {
                revealResult(focusedResult);
                return;
            }
            const parentId = isSearching ? undefined : currentFolder?.parentId;
            if (parentId != null) {
                openFolder(parentId);
            }
            return;
        }
        const currentId = tabStopId;
        if (currentId == null) {
            return;
        }
        const index = itemIds.indexOf(currentId);
        const horizontal = ownerState.view === "icons" || ownerState.view === "gallery";
        const offsets: Record<string, number> = horizontal
            ? { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columnCount(), ArrowDown: columnCount() }
            : { ArrowUp: -1, ArrowDown: 1 };

        if (ownerState.view === "columns" && !isSearching && !modifier && !event.shiftKey) {
            const current = items[index];
            if (event.key === "ArrowRight" && current.kind === "folder") {
                event.preventDefault();
                openFolder(current.folder.id);
                return;
            }
            if (event.key === "ArrowLeft" && currentFolder?.parentId != null) {
                event.preventDefault();
                focusContentAfterNavigation.current = true;
                onFolderChange(currentFolder.parentId);
                onSelectionChange([currentFolder.id]);
                return;
            }
        }
        if ((modifier && event.key === "ArrowDown") || event.key === "Enter") {
            event.preventDefault();
            openItem(items[index]);
            return;
        }
        if (event.key === "F2" && canRename) {
            event.preventDefault();
            setRenamingId(currentId);
            return;
        }
        if (modifier && event.key.toLowerCase() === "a") {
            event.preventDefault();
            onSelectionChange([...itemIds]);
            return;
        }
        if (event.key === "Escape") {
            onSelectionChange([]);
            return;
        }
        const visibleSelectedIds = itemIds.filter((id) => selected.has(id));
        if ((event.key === "Delete" || event.key === "Backspace") && canManage && onDelete != null && visibleSelectedIds.length > 0) {
            event.preventDefault();
            onDelete(visibleSelectedIds);
            return;
        }
        const focusedItem = items[index];
        if (event.key === " " && !modifier && onQuickLook != null && focusedItem.kind === "asset") {
            event.preventDefault();
            if (!selected.has(currentId)) {
                onSelectionChange([currentId]);
            }
            setAnchorId(currentId);
            onQuickLook(focusedItem.asset);
            return;
        }
        if (event.key === " ") {
            event.preventDefault();
            onSelectionChange(
                modifier && selected.has(currentId)
                    ? selectedIds.filter((id) => id !== currentId)
                    : modifier
                      ? [...selectedIds, currentId]
                      : [currentId],
            );
            setAnchorId(currentId);
            return;
        }

        let nextIndex: number | undefined;
        if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = itemIds.length - 1;
        } else if (offsets[event.key] != null) {
            nextIndex = Math.max(0, Math.min(itemIds.length - 1, index + offsets[event.key]));
        }
        if (nextIndex == null) {
            return;
        }
        event.preventDefault();
        const nextId = itemIds[nextIndex];
        focusItem(nextId);
        if (event.shiftKey) {
            onSelectionChange(selectRange(anchorId ?? currentId, nextId));
        } else if (!modifier) {
            setAnchorId(nextId);
            onSelectionChange([nextId]);
        }
    };

    const isInvalidDrop = (ids: string[], targetFolderId: string) =>
        ids.includes(targetFolderId) || ancestorsOf(targetFolderId).some((folder) => ids.includes(folder.id));

    const dragProps = (item: Item) => {
        const id = itemId(item);
        if (!canManage || onMove == null || renamingId === id) {
            return {};
        }
        return {
            draggable: true,
            onDragStart: (event: DragEvent<HTMLElement>) => {
                const ids = selected.has(id) ? [...selectedIds] : [id];
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", ids.join(","));
                setDraggedIds(ids);
            },
            onDragEnd: () => {
                setDraggedIds(undefined);
                setDropFolderId(undefined);
            },
        };
    };

    const dropProps = (targetFolderId: string) => {
        if (!canManage || onMove == null) {
            return {};
        }
        return {
            onDragOver: (event: DragEvent<HTMLElement>) => {
                if (draggedIds == null || isInvalidDrop(draggedIds, targetFolderId)) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                event.dataTransfer.dropEffect = "move";
                setDropFolderId(targetFolderId);
            },
            onDragLeave: (event: DragEvent<HTMLElement>) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setDropFolderId((current) => (current === targetFolderId ? undefined : current));
                }
            },
            onDrop: (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
                event.stopPropagation();
                if (draggedIds != null && !isInvalidDrop(draggedIds, targetFolderId)) {
                    onMove(draggedIds, targetFolderId);
                }
                setDraggedIds(undefined);
                setDropFolderId(undefined);
            },
        };
    };

    const optionProps = (item: Item, index: number) => {
        const id = itemId(item);
        return {
            id: `${baseId}-${index}`,
            role: "option",
            "aria-selected": selected.has(id),
            tabIndex: id === tabStopId ? 0 : -1,
            "data-selected": selected.has(id) ? "" : undefined,
            "data-drop-target": item.kind === "folder" && dropFolderId === item.folder.id ? "" : undefined,
            "data-dragging": draggedIds?.includes(id) ? "" : undefined,
            "data-id": id,
            ref: (element: HTMLElement | null) => {
                if (element == null) {
                    optionRefs.current.delete(id);
                } else {
                    optionRefs.current.set(id, element);
                }
            },
            onFocus: () => setActiveId(id),
            onClick: (event: MouseEvent) => handleItemClick(event, item),
            onDoubleClick: () => openItem(item),
            ...dragProps(item),
            ...(item.kind === "folder" ? dropProps(item.folder.id) : {}),
        };
    };

    const commitRename = (item: Item, name: string) => {
        const id = itemId(item);
        const trimmed = name.trim();
        setRenamingId(undefined);
        if (trimmed !== "" && trimmed !== itemName(item)) {
            onRename?.(id, trimmed);
        }
        focusItem(id);
    };

    const cancelRename = (item: Item) => {
        setRenamingId(undefined);
        focusItem(itemId(item));
    };

    const focusTabStop = () => {
        const option = contentRef.current?.querySelector<HTMLElement>("[role='option'][tabindex='0']");
        (option ?? contentRef.current)?.focus();
    };

    const startCreatingFolder = () => {
        setRenamingId(undefined);
        onSelectionChange([]);
        setCreatingFolder(true);
    };

    const commitNewFolder = (name: string) => {
        setCreatingFolder(false);
        onCreateFolder?.(name.trim() === "" ? labels.untitledFolder : name.trim(), folderId);
        focusTabStop();
    };

    const cancelNewFolder = () => {
        setCreatingFolder(false);
        focusTabStop();
    };

    const renderName = (item: Item, className: string) =>
        renamingId === itemId(item) ? (
            <NameField
                initialName={itemName(item)}
                label={labels.rename}
                selectStem={item.kind === "asset"}
                className={className}
                onCommit={(name) => commitRename(item, name)}
                onCancel={() => cancelRename(item)}
            />
        ) : (
            <span className={className}>{itemName(item)}</span>
        );

    const renderNewFolderField = (className: string) => (
        <NameField
            initialName={labels.untitledFolder}
            label={labels.newFolder}
            selectStem={false}
            className={className}
            onCommit={commitNewFolder}
            onCancel={cancelNewFolder}
        />
    );

    const renderThumbnail = (item: Item, compact = false) =>
        item.kind === "folder" ? (
            <AssetThumbnail type="folder" />
        ) : (
            <AssetThumbnail
                type={item.asset.type}
                src={item.asset.src}
                alt={item.asset.alt}
                focalPoint={item.asset.focalPoint}
                badges={compact ? undefined : item.asset.badges}
                slotProps={{ badge: { tabIndex: -1 } }}
                fileType={compact ? undefined : item.asset.fileType}
                duration={compact ? undefined : item.asset.duration}
            />
        );

    const itemMeta = (item: Item) => (item.kind === "folder" ? (item.folder.meta ?? labels.itemCount(countOf(item.folder.id))) : item.asset.meta);

    const locationOf = (item: Item) => {
        const containerId = containerOf(item);
        return containerId == null
            ? ""
            : ancestorsOf(containerId)
                  .map((folder) => folder.name)
                  .join(" › ");
    };

    const listboxProps = {
        role: "listbox",
        "aria-label": isSearching ? labels.searchResults : labels.items,
        "aria-multiselectable": true,
        "aria-busy": isSearching && searchLoading ? true : undefined,
    } as const;

    const emptyState =
        isSearching && searchLoading ? (
            <p className={styles.empty}>
                <Spinner size="small" />
                {labels.searching}
            </p>
        ) : (
            <p className={styles.empty}>{isSearching ? labels.noResults(search.trim()) : labels.empty}</p>
        );

    let searchStatus = "";
    if (isSearching) {
        if (searchLoading) {
            searchStatus = labels.searching;
        } else if (items.length === 0) {
            searchStatus = labels.noResults(search.trim());
        } else {
            searchStatus = labels.resultCount(items.length);
        }
    }

    const renderIcons = () =>
        items.length === 0 && !showsNewFolder ? (
            emptyState
        ) : (
            <ul {...listboxProps} className={styles.grid}>
                {showsNewFolder && (
                    <li role="none" className={styles.tile}>
                        <AssetThumbnail type="folder" />
                        {renderNewFolderField(styles.tileName)}
                    </li>
                )}
                {items.map((item, index) => (
                    <li key={itemId(item)} {...optionProps(item, index)} className={styles.tile}>
                        {renderThumbnail(item)}
                        {renderName(item, styles.tileName)}
                        <span className={styles.tileMeta}>{isSearching ? folderById.get(containerOf(item) ?? "")?.name : itemMeta(item)}</span>
                    </li>
                ))}
            </ul>
        );

    const renderList = () => (
        <div className={styles.table}>
            <div className={styles.tableHeader} aria-hidden="true">
                <span>{labels.name}</span>
                {isSearching && <span>{labels.location}</span>}
                <span>{labels.details}</span>
                {!isSearching && <span>{labels.modified}</span>}
            </div>
            {items.length === 0 && !showsNewFolder ? (
                emptyState
            ) : (
                <ul {...listboxProps} className={styles.rows}>
                    {showsNewFolder && (
                        <li role="none" className={styles.row}>
                            <span className={styles.rowName}>
                                <span className={styles.rowThumbnail}>
                                    <AssetThumbnail type="folder" />
                                </span>
                                {renderNewFolderField(styles.ellipsis)}
                            </span>
                        </li>
                    )}
                    {items.map((item, index) => (
                        <li key={itemId(item)} {...optionProps(item, index)} className={styles.row}>
                            <span className={styles.rowName}>
                                <span className={styles.rowThumbnail}>{renderThumbnail(item, true)}</span>
                                {renderName(item, styles.ellipsis)}
                            </span>
                            {isSearching && (
                                <span className={styles.rowMeta} title={locationOf(item)}>
                                    {locationOf(item)}
                                </span>
                            )}
                            <span className={styles.rowMeta}>{itemMeta(item)}</span>
                            {!isSearching && <span className={styles.rowMeta}>{item.kind === "asset" ? item.asset.modified : undefined}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    const renderColumns = () => {
        const selectedAsset =
            selectedIds.length === 1 ? assets.find((asset) => asset.id === selectedIds[0] && asset.folderId === folderId) : undefined;
        return (
            <div ref={columnsRef} className={styles.columns}>
                {path.slice(0, -1).map((folder, columnIndex) => {
                    const openId = path[columnIndex + 1].id;
                    return (
                        <ul key={folder.id} className={styles.column} aria-label={folder.name}>
                            {itemsOf(folder.id).map((item) => {
                                const id = itemId(item);
                                return (
                                    <li key={id} {...(item.kind === "folder" ? dropProps(item.folder.id) : {})}>
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            className={styles.columnRow}
                                            data-path={id === openId ? "" : undefined}
                                            data-drop-target={id === dropFolderId ? "" : undefined}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                if (item.kind === "folder") {
                                                    openFolder(item.folder.id);
                                                } else {
                                                    onFolderChange(folder.id);
                                                    onSelectionChange([id]);
                                                }
                                            }}
                                        >
                                            <span className={styles.ellipsis}>{itemName(item)}</span>
                                            {item.kind === "folder" && <Icon name="chevron-right" className={styles.columnChevron} />}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    );
                })}
                {items.length === 0 && !showsNewFolder ? (
                    <div className={styles.column}>{emptyState}</div>
                ) : (
                    <ul {...listboxProps} className={styles.column}>
                        {showsNewFolder && (
                            <li role="none" className={styles.columnRow}>
                                {renderNewFolderField(styles.ellipsis)}
                            </li>
                        )}
                        {items.map((item, index) => (
                            <li key={itemId(item)} {...optionProps(item, index)} className={styles.columnRow}>
                                {renderName(item, styles.ellipsis)}
                                {item.kind === "folder" && <Icon name="chevron-right" className={styles.columnChevron} />}
                            </li>
                        ))}
                    </ul>
                )}
                {selectedAsset != null && (
                    <div className={styles.columnPreview}>
                        {renderThumbnail({ kind: "asset", asset: selectedAsset })}
                        <span className={styles.previewName}>{selectedAsset.name}</span>
                        <span className={styles.tileMeta}>{selectedAsset.meta}</span>
                        <span className={styles.tileMeta}>{selectedAsset.modified}</span>
                    </div>
                )}
            </div>
        );
    };

    const renderGallery = () => {
        const shownId = tabStopId != null && selected.has(tabStopId) ? tabStopId : (itemIds.find((id) => selected.has(id)) ?? tabStopId);
        const shown = items.find((item) => itemId(item) === shownId);
        return (
            <div className={styles.gallery}>
                <div className={styles.galleryStage}>
                    {showsNewFolder ? (
                        <span className={styles.galleryFallback}>
                            <AssetThumbnail type="folder" />
                        </span>
                    ) : shown == null ? (
                        emptyState
                    ) : shown.kind === "asset" && shown.asset.src != null ? (
                        <img className={styles.galleryImage} src={shown.asset.src} alt={shown.asset.alt ?? ""} />
                    ) : (
                        <span className={styles.galleryFallback}>{renderThumbnail(shown)}</span>
                    )}
                </div>
                {showsNewFolder ? (
                    <div className={styles.galleryInfo}>{renderNewFolderField(styles.previewName)}</div>
                ) : (
                    shown != null && (
                        <div className={styles.galleryInfo}>
                            {renderName(shown, styles.previewName)}
                            <span className={styles.tileMeta}>{itemMeta(shown)}</span>
                        </div>
                    )
                )}
                {items.length > 0 && (
                    <ul {...listboxProps} aria-orientation="horizontal" className={styles.strip}>
                        {items.map((item, index) => (
                            <li key={itemId(item)} {...optionProps(item, index)} aria-label={itemName(item)} className={styles.stripItem}>
                                {renderThumbnail(item, true)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const treeNodes = (parentId: string | null): TreeNode[] =>
        folders
            .filter((folder) => folder.parentId === parentId)
            .sort(byName)
            .map((folder) => {
                const children = treeNodes(folder.id);
                return { id: folder.id, label: folder.name, type: "folder", children: children.length > 0 ? children : undefined };
            });
    const rootIds = folders.filter((folder) => folder.parentId == null).map((folder) => folder.id);
    const treeExpandedIds = Array.from(new Set([...rootIds, ...expandedIds, ...pathAncestorIds])).filter((id) => !collapsedIds.includes(id));
    const changeTreeExpandedIds = (ids: string[]) => {
        setExpandedIds(ids);
        setCollapsedIds((previousIds) => [
            ...previousIds.filter((id) => !ids.includes(id)),
            ...treeExpandedIds.filter((id) => !ids.includes(id) && !previousIds.includes(id)),
        ]);
    };

    const findTreeFolderId = (event: DragEvent<HTMLElement>) => {
        const treeItem = (event.target as HTMLElement).closest<HTMLElement>("[role='treeitem']");
        return treeItem?.dataset.id;
    };

    const singleContextItem = contextMenuIds.length === 1 ? items.find((item) => itemId(item) === contextMenuIds[0]) : undefined;
    const contextMenuHasEntries = (ids: string[]) => {
        if (ids.length === 0) {
            return canCreateFolder;
        }
        const single = ids.length === 1 ? items.find((item) => itemId(item) === ids[0]) : undefined;
        return (
            (single != null && (single.kind === "folder" || onOpen != null || canRename)) ||
            contextMenuItems != null ||
            (canManage && onDelete != null)
        );
    };

    const handleContextMenuCapture = (event: MouseEvent<HTMLElement>) => {
        const target = event.target as HTMLElement;
        const option = target.closest<HTMLElement>("[role='option'][data-id]");
        const id = option?.dataset.id;
        let ids: string[] = [];
        if (id != null && itemIds.includes(id)) {
            ids = selected.has(id) ? itemIds.filter((candidate) => selected.has(candidate)) : [id];
            if (!selected.has(id)) {
                onSelectionChange([id]);
                setAnchorId(id);
            }
            setActiveId(id);
        } else if (selectedIds.length > 0) {
            onSelectionChange([]);
        }
        contextMenuIdsRef.current = ids;
        setContextMenuIds(ids);
    };

    // An action that moves the focus into a name field keeps the closing menu from taking it back
    const keepFocusAfterContextMenu = useRef(false);
    const contextMenuEntries = () => {
        if (contextMenuIds.length === 0) {
            return canCreateFolder ? (
                <MenuItem
                    label={labels.newFolder}
                    icon={<Icon name="add-folder" />}
                    onClick={() => {
                        keepFocusAfterContextMenu.current = true;
                        startCreatingFolder();
                    }}
                />
            ) : null;
        }
        const itemEntries = [
            singleContextItem != null && (singleContextItem.kind === "folder" || onOpen != null) && (
                <MenuItem key="open" label={labels.open} onClick={() => openItem(singleContextItem)} />
            ),
            singleContextItem != null && canRename && (
                <MenuItem
                    key="rename"
                    label={labels.rename}
                    icon={<Icon name="edit" />}
                    onClick={() => {
                        keepFocusAfterContextMenu.current = true;
                        setRenamingId(itemId(singleContextItem));
                    }}
                />
            ),
        ].filter(Boolean);
        const customEntries = contextMenuItems?.(contextMenuIds);
        const deleteEntry = canManage && onDelete != null && (
            <MenuItem label={labels.delete} icon={<Icon name="delete" />} color="error" onClick={() => onDelete(contextMenuIds)} />
        );
        return (
            <>
                {itemEntries}
                {itemEntries.length > 0 && customEntries != null && <MenuSeparator />}
                {customEntries}
                {(itemEntries.length > 0 || customEntries != null) && deleteEntry && <MenuSeparator />}
                {deleteEntry}
            </>
        );
    };

    const sidebarId = `${baseId}-sidebar`;
    const sidebarProps = resolveSlotProps<AssetBrowserOwnerState, "nav", "nav">({
        ownProps: { ref: sidebarRef, id: sidebarId, className: styles.sidebar, "aria-label": labels.folders },
        slotProps: slotProps?.sidebar,
        ownerState,
    });
    const resizeHandleProps = resolveSlotProps<AssetBrowserOwnerState, "div", "div">({
        ownProps: {
            className: styles.resizeHandle,
            role: "separator",
            tabIndex: 0,
            "aria-label": labels.resizeSidebar,
            "aria-controls": sidebarId,
            "aria-orientation": "vertical",
            "aria-valuemin": sidebarMinWidth,
            "aria-valuemax":
                measured != null ? Math.max(sidebarMinWidth, Math.min(sidebarMaxWidth, measured.root - minContentWidth)) : sidebarMaxWidth,
            "aria-valuenow": Math.round(measured?.sidebar ?? sidebarWidth ?? sidebarMinWidth),
            onPointerDown: handleResizePointerDown,
            onPointerMove: handleResizePointerMove,
            onPointerUp: handleResizePointerEnd,
            onPointerCancel: handleResizePointerEnd,
            onKeyDown: handleResizeKeyDown,
            onDoubleClick: () => onSidebarWidthChange?.(undefined),
        },
        slotProps: slotProps?.resizeHandle,
        ownerState,
    });
    const toolbarProps = resolveSlotProps<AssetBrowserOwnerState, "div", "div">({
        ownProps: { className: styles.toolbar },
        slotProps: slotProps?.toolbar,
        ownerState,
    });
    const contentProps = resolveSlotProps<AssetBrowserOwnerState, "div", "div">({
        ownProps: {
            ref: contentRef,
            className: styles.content,
            tabIndex: -1,
            onKeyDown: handleKeyDown,
            onClick: () => {
                if (selectedIds.length > 0) {
                    onSelectionChange([]);
                }
            },
            onContextMenuCapture: handleContextMenuCapture,
            ...(isSearching ? {} : dropProps(folderId)),
        },
        slotProps: slotProps?.content,
        ownerState,
    });
    const pathBarProps = resolveSlotProps<AssetBrowserOwnerState, "div", "div">({
        ownProps: { className: styles.pathBar },
        slotProps: slotProps?.pathBar,
        ownerState,
    });

    const searchProps = resolveSlotProps<AssetBrowserOwnerState, "label", "label">({
        ownProps: { className: styles.search },
        slotProps: slotProps?.search,
        ownerState,
    });
    const searchInputProps = resolveSlotProps<AssetBrowserOwnerState, "input", "input">({
        ownProps: {
            ref: searchInputRef,
            className: styles.searchInput,
            type: "search",
            autoComplete: "off",
            "aria-label": labels.search,
            placeholder: labels.searchPlaceholder,
            value: search,
            onChange: (event: ChangeEvent<HTMLInputElement>) => onSearchChange?.(event.target.value),
            onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Escape" && search !== "") {
                    event.preventDefault();
                    event.stopPropagation();
                    onSearchChange?.("");
                } else if (event.key === "ArrowDown") {
                    const option = contentRef.current?.querySelector<HTMLElement>("[role='option'][tabindex='0']");
                    if (option != null) {
                        event.preventDefault();
                        option.focus();
                    }
                }
            },
        },
        slotProps: slotProps?.searchInput,
        ownerState,
    });

    const parentId = isSearching ? undefined : currentFolder?.parentId;
    const visibleSelectedCount = itemIds.filter((id) => selected.has(id)).length;
    const pathResultId = tabStopId != null && selected.has(tabStopId) ? tabStopId : itemIds.find((id) => selected.has(id));
    const pathResult = isSearching ? items.find((item) => itemId(item) === pathResultId) : undefined;
    const pathResultContainerId = pathResult != null ? containerOf(pathResult) : undefined;
    // The columns view can't show results from many folders, so they show as a list, and the switch says so
    const renderedView = isSearching && ownerState.view === "columns" ? "list" : ownerState.view;
    const canGoUp = isSearching || parentId != null;
    const goUp = () => {
        if (isSearching) {
            if (pathResult != null) {
                revealResult(pathResult);
            } else {
                onSearchChange?.("");
            }
        } else if (parentId != null) {
            openFolder(parentId);
        }
    };

    return (
        <div
            {...restProps}
            ref={setRootRef}
            data-view={ownerState.view}
            data-mode={ownerState.mode}
            data-searching={ownerState.searching ? "" : undefined}
            onKeyDown={(event) => {
                restProps.onKeyDown?.(event);
                if (
                    !event.defaultPrevented &&
                    onSearchChange != null &&
                    (event.metaKey || event.ctrlKey) &&
                    !event.altKey &&
                    event.key.toLowerCase() === "f"
                ) {
                    event.preventDefault();
                    searchInputRef.current?.focus();
                    searchInputRef.current?.select();
                }
            }}
            data-resizable={isResizable || undefined}
            data-resizing={isResizing || undefined}
            className={clsx(styles.root, className)}
            style={
                sidebarWidth != null
                    ? {
                          ...restProps.style,
                          ["--dextinity-asset-browser-sidebar-width" as string]: `${Math.max(sidebarMinWidth, Math.min(sidebarMaxWidth, sidebarWidth))}px`,
                      }
                    : restProps.style
            }
        >
            <nav {...sidebarProps}>
                <div ref={treeRef} className={styles.tree}>
                    <TreeView
                        aria-label={labels.folders}
                        nodes={treeNodes(null)}
                        expandedIds={treeExpandedIds}
                        onExpandedChange={changeTreeExpandedIds}
                        selectedId={isSearching ? undefined : folderId}
                        onSelect={(id) => {
                            if (id !== folderId || isSearching) {
                                openFolder(id);
                            }
                        }}
                        onDragOver={(event) => {
                            const targetId = findTreeFolderId(event);
                            if (!canManage || onMove == null || draggedIds == null || targetId == null || isInvalidDrop(draggedIds, targetId)) {
                                return;
                            }
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "move";
                            setDropFolderId(targetId);
                        }}
                        onDragLeave={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                setDropFolderId(undefined);
                            }
                        }}
                        onDrop={(event) => {
                            const targetId = findTreeFolderId(event);
                            event.preventDefault();
                            if (onMove != null && draggedIds != null && targetId != null && !isInvalidDrop(draggedIds, targetId)) {
                                onMove(draggedIds, targetId);
                            }
                            setDraggedIds(undefined);
                            setDropFolderId(undefined);
                        }}
                    />
                </div>
            </nav>
            {isResizable && <div {...resizeHandleProps} />}
            <div className={styles.main}>
                <div {...toolbarProps}>
                    <IconButton variant="text" color="secondary" size="small" aria-label={labels.up} disabled={!canGoUp} onClick={goUp}>
                        <Icon name="arrow-up" />
                    </IconButton>
                    <span className={styles.title}>
                        <span className={styles.titleName}>{isSearching ? labels.searchResults : currentFolder?.name}</span>
                        <span className={styles.titleMeta}>
                            {!isSearching ? labels.itemCount(items.length) : searchLoading ? labels.searching : labels.resultCount(items.length)}
                        </span>
                    </span>
                    <span className={styles.spacer} />
                    {onSearchChange != null && (
                        // Stays rendered while the search is empty, so screen readers announce the first results too
                        <span className={styles.visuallyHidden} role="status">
                            {searchStatus}
                        </span>
                    )}
                    {onSearchChange != null && (
                        <label {...searchProps}>
                            <Icon name="search" />
                            <input {...searchInputProps} />
                            {search !== "" && (
                                <button
                                    type="button"
                                    className={styles.searchClear}
                                    aria-label={labels.clearSearch}
                                    onClick={() => {
                                        onSearchChange("");
                                        searchInputRef.current?.focus();
                                    }}
                                >
                                    <Icon name="close" />
                                </button>
                            )}
                        </label>
                    )}
                    {canManage && onCreateFolder != null && (
                        <IconButton
                            variant="text"
                            color="secondary"
                            size="small"
                            aria-label={labels.newFolder}
                            disabled={!canCreateFolder}
                            onClick={startCreatingFolder}
                        >
                            <Icon name="add-folder" />
                        </IconButton>
                    )}
                    {toolbar}
                    <SegmentedControl<AssetBrowserView>
                        size="small"
                        aria-label={labels.view}
                        value={renderedView}
                        onChange={onViewChange}
                        options={[
                            { value: "icons", icon: <Icon name="grid" />, "aria-label": labels.icons },
                            { value: "list", icon: <Icon name="list" />, "aria-label": labels.list },
                            { value: "columns", icon: <Icon name="columns-3" />, "aria-label": labels.columns, disabled: isSearching },
                            { value: "gallery", icon: <Icon name="assets" />, "aria-label": labels.gallery },
                        ]}
                    />
                </div>
                <ContextMenu.Root
                    open={contextMenuOpen}
                    onOpenChange={(open) => {
                        if (open && !contextMenuHasEntries(contextMenuIdsRef.current)) {
                            return;
                        }
                        if (open) {
                            keepFocusAfterContextMenu.current = false;
                        }
                        setContextMenuOpen(open);
                    }}
                >
                    <ContextMenu.Trigger render={<div {...contentProps} />}>
                        {renderedView === "icons" && renderIcons()}
                        {renderedView === "list" && renderList()}
                        {renderedView === "columns" && renderColumns()}
                        {renderedView === "gallery" && renderGallery()}
                    </ContextMenu.Trigger>
                    <ContextMenu.Portal container={portalContainer}>
                        <ContextMenu.Positioner className={styles.contextMenuPositioner} collisionPadding={8}>
                            <ContextMenu.Popup className={styles.contextMenu} finalFocus={() => !keepFocusAfterContextMenu.current}>
                                {contextMenuEntries()}
                            </ContextMenu.Popup>
                        </ContextMenu.Positioner>
                    </ContextMenu.Portal>
                </ContextMenu.Root>
                <div {...pathBarProps}>
                    {!isSearching ? (
                        <Breadcrumbs
                            className={styles.path}
                            separator="›"
                            maxItems={5}
                            items={path.map((folder) => ({
                                label: folder.name,
                                onClick: folder.id === folderId ? undefined : () => openFolder(folder.id),
                            }))}
                        />
                    ) : pathResult != null && pathResultContainerId != null ? (
                        <Breadcrumbs
                            className={styles.path}
                            separator="›"
                            maxItems={5}
                            items={[
                                ...ancestorsOf(pathResultContainerId).map((folder) => ({
                                    label: folder.name,
                                    onClick: () => revealResult(pathResult, folder.id),
                                })),
                                { label: itemName(pathResult) },
                            ]}
                        />
                    ) : (
                        <span className={styles.path} />
                    )}
                    <span className={styles.count}>
                        {isSearching && searchLoading && items.length === 0
                            ? undefined
                            : visibleSelectedCount > 0
                              ? labels.selectedCount(visibleSelectedCount, items.length)
                              : isSearching
                                ? labels.resultCount(items.length)
                                : labels.itemCount(items.length)}
                    </span>
                </div>
            </div>
        </div>
    );
});
