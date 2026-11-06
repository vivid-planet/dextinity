import { clsx } from "clsx";
import {
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
    useRef,
    useState,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { AssetThumbnail, type AssetThumbnailBadge, type FocalPoint } from "../assetThumbnail/AssetThumbnail";
import { Breadcrumbs } from "../breadcrumbs/Breadcrumbs";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { SegmentedControl } from "../segmentedControl/SegmentedControl";
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
    /** Called with the selected ids on Delete or Backspace. Only in `manage` mode. */
    onDelete?: (ids: string[]) => void;
    /** Further controls in the toolbar, e.g. search, "New folder", and "Upload". */
    toolbar?: ReactNode;
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

/**
 * The finder for assets: a folder tree, the folder's items as icons, a list, columns, or a gallery, and a path bar. Behaves like the
 * macOS Finder for selecting, opening, and moving items.
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
        toolbar,
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
    const ownerState: AssetBrowserOwnerState = { view, mode };
    const baseId = useId();
    const optionRefs = useRef(new Map<string, HTMLElement>());
    const [activeId, setActiveId] = useState<string>();
    const [anchorId, setAnchorId] = useState<string>();
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
    const [draggedIds, setDraggedIds] = useState<string[]>();
    const [dropFolderId, setDropFolderId] = useState<string>();
    const treeRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
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
            if (typeof ref === "function") {
                ref(element);
            } else if (ref != null) {
                ref.current = element;
            }
        },
        [ref],
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

    const path = ancestorsOf(folderId);
    const pathAncestorIds = path.slice(0, -1).map((folder) => folder.id);
    const pathAncestorIdsKey = JSON.stringify(pathAncestorIds);
    const currentFolder = folderById.get(folderId);
    const items = itemsOf(folderId);
    const itemIds = items.map(itemId);
    const selected = new Set(selectedIds);
    const canManage = ownerState.mode === "manage";
    const tabStopId = activeId != null && itemIds.includes(activeId) ? activeId : (itemIds.find((id) => selected.has(id)) ?? itemIds[0]);

    useEffect(() => {
        setActiveId(undefined);
        setAnchorId(undefined);
        if (focusContentAfterNavigation.current) {
            focusContentAfterNavigation.current = false;
            const firstOption = contentRef.current?.querySelector<HTMLElement>("[role='option'][tabindex='0']");
            (firstOption ?? contentRef.current)?.focus();
        }
    }, [folderId]);

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

    useEffect(() => {
        const root = rootRef.current;
        const sidebar = sidebarRef.current;
        if (!isResizable || root == null || sidebar == null || typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(() => {
            setMeasured({ sidebar: sidebar.getBoundingClientRect().width, root: root.getBoundingClientRect().width });
        });
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
        onFolderChange(id);
        onSelectionChange([]);
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
        } else if (ownerState.view === "columns" && item.kind === "folder") {
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
            const parentId = currentFolder?.parentId;
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

        if (ownerState.view === "columns" && !modifier && !event.shiftKey) {
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
        if (modifier && event.key.toLowerCase() === "a") {
            event.preventDefault();
            onSelectionChange([...itemIds]);
            return;
        }
        if (event.key === "Escape") {
            onSelectionChange([]);
            return;
        }
        if ((event.key === "Delete" || event.key === "Backspace") && canManage && onDelete != null && selectedIds.length > 0) {
            event.preventDefault();
            onDelete([...selectedIds]);
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
        if (!canManage || onMove == null) {
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

    const listboxProps = {
        role: "listbox",
        "aria-label": labels.items,
        "aria-multiselectable": true,
    } as const;

    const emptyState = <p className={styles.empty}>{labels.empty}</p>;

    const renderIcons = () =>
        items.length === 0 ? (
            emptyState
        ) : (
            <ul {...listboxProps} className={styles.grid}>
                {items.map((item, index) => (
                    <li key={itemId(item)} {...optionProps(item, index)} className={styles.tile}>
                        {renderThumbnail(item)}
                        <span className={styles.tileName}>{itemName(item)}</span>
                        <span className={styles.tileMeta}>{itemMeta(item)}</span>
                    </li>
                ))}
            </ul>
        );

    const renderList = () => (
        <div className={styles.table}>
            <div className={styles.tableHeader} aria-hidden="true">
                <span>{labels.name}</span>
                <span>{labels.details}</span>
                <span>{labels.modified}</span>
            </div>
            {items.length === 0 ? (
                emptyState
            ) : (
                <ul {...listboxProps} className={styles.rows}>
                    {items.map((item, index) => (
                        <li key={itemId(item)} {...optionProps(item, index)} className={styles.row}>
                            <span className={styles.rowName}>
                                <span className={styles.rowThumbnail}>{renderThumbnail(item, true)}</span>
                                <span className={styles.ellipsis}>{itemName(item)}</span>
                            </span>
                            <span className={styles.rowMeta}>{itemMeta(item)}</span>
                            <span className={styles.rowMeta}>{item.kind === "asset" ? item.asset.modified : undefined}</span>
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
                {items.length === 0 ? (
                    <div className={styles.column}>{emptyState}</div>
                ) : (
                    <ul {...listboxProps} className={styles.column}>
                        {items.map((item, index) => (
                            <li key={itemId(item)} {...optionProps(item, index)} className={styles.columnRow}>
                                <span className={styles.ellipsis}>{itemName(item)}</span>
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
                    {shown == null ? (
                        emptyState
                    ) : shown.kind === "asset" && shown.asset.src != null ? (
                        <img className={styles.galleryImage} src={shown.asset.src} alt={shown.asset.alt ?? ""} />
                    ) : (
                        <span className={styles.galleryFallback}>{renderThumbnail(shown)}</span>
                    )}
                </div>
                {shown != null && (
                    <div className={styles.galleryInfo}>
                        <span className={styles.previewName}>{itemName(shown)}</span>
                        <span className={styles.tileMeta}>{itemMeta(shown)}</span>
                    </div>
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
            ...dropProps(folderId),
        },
        slotProps: slotProps?.content,
        ownerState,
    });
    const pathBarProps = resolveSlotProps<AssetBrowserOwnerState, "div", "div">({
        ownProps: { className: styles.pathBar },
        slotProps: slotProps?.pathBar,
        ownerState,
    });

    const parentId = currentFolder?.parentId;
    const visibleSelectedCount = itemIds.filter((id) => selected.has(id)).length;

    return (
        <div
            {...restProps}
            ref={setRootRef}
            data-view={ownerState.view}
            data-mode={ownerState.mode}
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
                        selectedId={folderId}
                        onSelect={(id) => {
                            if (id !== folderId) {
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
                    <IconButton
                        variant="text"
                        color="secondary"
                        size="small"
                        aria-label={labels.up}
                        disabled={parentId == null}
                        onClick={() => parentId != null && openFolder(parentId)}
                    >
                        <Icon name="arrow-up" />
                    </IconButton>
                    <span className={styles.title}>
                        <span className={styles.titleName}>{currentFolder?.name}</span>
                        <span className={styles.titleMeta}>{labels.itemCount(items.length)}</span>
                    </span>
                    <span className={styles.spacer} />
                    {toolbar}
                    <SegmentedControl<AssetBrowserView>
                        size="small"
                        aria-label={labels.view}
                        value={ownerState.view}
                        onChange={onViewChange}
                        options={[
                            { value: "icons", icon: <Icon name="grid" />, "aria-label": labels.icons },
                            { value: "list", icon: <Icon name="list" />, "aria-label": labels.list },
                            { value: "columns", icon: <Icon name="columns-3" />, "aria-label": labels.columns },
                            { value: "gallery", icon: <Icon name="assets" />, "aria-label": labels.gallery },
                        ]}
                    />
                </div>
                <div {...contentProps}>
                    {ownerState.view === "icons" && renderIcons()}
                    {ownerState.view === "list" && renderList()}
                    {ownerState.view === "columns" && renderColumns()}
                    {ownerState.view === "gallery" && renderGallery()}
                </div>
                <div {...pathBarProps}>
                    <Breadcrumbs
                        className={styles.path}
                        separator="›"
                        maxItems={5}
                        items={path.map((folder) => ({
                            label: folder.name,
                            onClick: folder.id === folderId ? undefined : () => openFolder(folder.id),
                        }))}
                    />
                    <span className={styles.count}>
                        {visibleSelectedCount > 0 ? labels.selectedCount(visibleSelectedCount, items.length) : labels.itemCount(items.length)}
                    </span>
                </div>
            </div>
        </div>
    );
});
