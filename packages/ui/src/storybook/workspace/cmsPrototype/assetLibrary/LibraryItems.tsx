import {
    createContext,
    type DragEvent,
    type HTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import { Checkbox } from "../../../../components/checkbox/Checkbox";
import { Icon } from "../../../../components/icon/Icon";
import { IconButton } from "../../../../components/iconButton/IconButton";
import { Menu } from "../../../../components/menu/Menu";
import { MenuGroup } from "../../../../components/menu/MenuGroup";
import { MenuItem } from "../../../../components/menu/MenuItem";
import { MenuSeparator } from "../../../../components/menu/MenuSeparator";
import { MenuSubmenu } from "../../../../components/menu/MenuSubmenu";
import { Tooltip } from "../../../../components/tooltip/Tooltip";
import styles from "./assetLibrary.module.scss";
import { describeAsset, formatDuration, type LibraryAsset, type LibraryFolder } from "./assetLibraryData";
import type { LibraryItem } from "./libraryView";
import { MoveToFolderMenu } from "./MoveToFolderMenu";

/** What the items need from the library: selection, the menu's actions, renaming, and drag and drop. */
export interface LibraryItemHandlers {
    isSelected: (id: string) => boolean;
    onItemClick: (item: LibraryItem, event: MouseEvent) => void;
    onCheckedChange: (item: LibraryItem) => void;
    onItemKeyDown: (item: LibraryItem, event: KeyboardEvent) => void;
    /** The items the menu of an item acts on: the selection when the item is part of it, else the item alone. */
    getMenuTargets: (item: LibraryItem) => LibraryItem[];
    onMenuOpen: (item: LibraryItem) => void;
    menuActions: MenuActions;
    folders: LibraryFolder[];
    renamingId: string | null;
    onRenameEnd: (item: LibraryItem, name: string | null) => void;
    draggingIds: string[];
    onDragStart: (item: LibraryItem, event: DragEvent) => void;
    onDragEnd: () => void;
    /** Makes an element a drop target for the dragged items, e.g. a folder card or a segment of the path. */
    getDropTargetProps: (folderId: string | null, folderName: string) => HTMLAttributes<HTMLElement> & { "data-drop-target"?: "" };
}

export interface MenuActions {
    open: (item: LibraryItem) => void;
    rename: (item: LibraryItem) => void;
    duplicate: (items: LibraryItem[]) => void;
    move: (items: LibraryItem[], folderId: string | null, folderName: string) => void;
    canMove: (items: LibraryItem[], folderId: string | null) => boolean;
    download: (items: LibraryItem[]) => void;
    setArchived: (items: LibraryItem[], archived: boolean) => void;
    remove: (items: LibraryItem[]) => void;
}

export const LibraryItemContext = createContext<LibraryItemHandlers | null>(null);

function useItemHandlers() {
    const handlers = useContext(LibraryItemContext);
    if (handlers == null) {
        throw new Error("Library items need a LibraryItemContext");
    }
    return handlers;
}

function itemName(item: LibraryItem) {
    return item.type === "folder" ? item.folder.name : item.asset.name;
}

/**
 * The context menu of an item, or of the selection it is part of. Shows only what applies, e.g. no "Rename" for several items.
 */
export function ItemMenu({ item, className }: { item: LibraryItem; className?: string }) {
    const { getMenuTargets, onMenuOpen, menuActions, folders } = useItemHandlers();
    const [open, setOpen] = useState(false);
    const [moveOpen, setMoveOpen] = useState(false);
    const targets = open ? getMenuTargets(item) : [item];
    const single = targets.length === 1;
    const onlyFiles = targets.every((target) => target.type === "file");
    const allArchived = onlyFiles && targets.every((target) => target.type === "file" && target.asset.archived);

    return (
        <Menu
            open={open}
            onOpenChange={(nextOpen) => {
                if (nextOpen) {
                    onMenuOpen(item);
                }
                setOpen(nextOpen);
            }}
            placement="bottom-end"
            trigger={
                <IconButton
                    className={className}
                    variant="text"
                    color="secondary"
                    size="small"
                    aria-label={`Actions for ${itemName(item)}`}
                    onClick={(event) => event.stopPropagation()}
                >
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <MenuGroup label={single ? itemName(targets[0]) : `${targets.length} items`}>
                {single && (
                    <MenuItem label="Open" icon={<Icon name="arrow-right" />} keyboardShortcut="mod+o" onClick={() => menuActions.open(targets[0])} />
                )}
                {single && (
                    <MenuItem
                        label="Rename"
                        icon={<Icon name="pencil-line" />}
                        keyboardShortcut="enter"
                        onClick={() => menuActions.rename(targets[0])}
                    />
                )}
                {onlyFiles && (
                    <MenuItem
                        label="Duplicate"
                        icon={<Icon name="duplicate" />}
                        keyboardShortcut="mod+d"
                        onClick={() => menuActions.duplicate(targets)}
                    />
                )}
                <MenuSubmenu label="Move to …" icon={<Icon name="folder" />} open={moveOpen} onOpenChange={setMoveOpen}>
                    <MoveToFolderMenu
                        folders={folders}
                        isDisabled={(folderId) => !menuActions.canMove(targets, folderId)}
                        onMove={(folderId, folderName) => menuActions.move(targets, folderId, folderName)}
                    />
                </MenuSubmenu>
                {onlyFiles && <MenuItem label="Download" icon={<Icon name="download" />} onClick={() => menuActions.download(targets)} />}
            </MenuGroup>
            {onlyFiles && (
                <>
                    <MenuSeparator />
                    {allArchived ? (
                        <MenuItem label="Restore" icon={<Icon name="restore" />} onClick={() => menuActions.setArchived(targets, false)} />
                    ) : (
                        <MenuItem label="Archive" icon={<Icon name="archive" />} onClick={() => menuActions.setArchived(targets, true)} />
                    )}
                </>
            )}
            {!onlyFiles && <MenuSeparator />}
            <MenuItem
                label="Delete"
                icon={<Icon name="trash" />}
                color="error"
                keyboardShortcut="mod+backspace"
                onClick={() => menuActions.remove(targets)}
            />
        </Menu>
    );
}

/** The name of an item, or the field that renames it. Selects the name without the extension, as the Finder does. */
export function ItemName({ item, className }: { item: LibraryItem; className?: string }) {
    const { renamingId, onRenameEnd } = useItemHandlers();
    const name = itemName(item);
    const [value, setValue] = useState(name);
    const inputRef = useRef<HTMLInputElement>(null);
    const renaming = renamingId === item.id;

    useEffect(() => {
        if (renaming && inputRef.current) {
            setValue(name);
            inputRef.current.focus();
            const dot = name.lastIndexOf(".");
            inputRef.current.setSelectionRange(0, item.type === "file" && dot > 0 ? dot : name.length);
        }
    }, [renaming, name, item.type]);

    if (!renaming) {
        return (
            <span className={className} title={name}>
                {name}
            </span>
        );
    }
    return (
        <input
            ref={inputRef}
            className={styles.renameInput}
            aria-label={`Rename ${name}`}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") {
                    onRenameEnd(item, value);
                } else if (event.key === "Escape") {
                    onRenameEnd(item, null);
                }
            }}
            onBlur={() => onRenameEnd(item, value)}
        />
    );
}

function useItemProps(item: LibraryItem) {
    const { isSelected, onItemClick, onItemKeyDown, draggingIds, onDragStart, onDragEnd, renamingId } = useItemHandlers();
    const selected = isSelected(item.id);
    return {
        selected,
        props: {
            role: "option",
            "aria-selected": selected,
            "aria-label": itemName(item),
            tabIndex: 0,
            draggable: renamingId !== item.id,
            "data-selected": selected ? "" : undefined,
            "data-dragging": draggingIds.includes(item.id) ? "" : undefined,
            onClick: (event: MouseEvent) => onItemClick(item, event),
            onKeyDown: (event: KeyboardEvent) => onItemKeyDown(item, event),
            onDragStart: (event: DragEvent) => onDragStart(item, event),
            onDragEnd,
        } satisfies HTMLAttributes<HTMLDivElement> & Record<`data-${string}`, string | undefined>,
    };
}

function ItemCheckbox({ item, selected, className }: { item: LibraryItem; selected: boolean; className?: string }) {
    const { onCheckedChange } = useItemHandlers();
    return (
        // The checkbox toggles the item; the click must not also open it
        <span className={className} onClick={(event) => event.stopPropagation()}>
            <Checkbox aria-label={`Select ${itemName(item)}`} checked={selected} onChange={() => onCheckedChange(item)} />
        </span>
    );
}

export function FolderCard({ item, count }: { item: Extract<LibraryItem, { type: "folder" }>; count: number }) {
    const { getDropTargetProps } = useItemHandlers();
    const { selected, props } = useItemProps(item);
    return (
        <div {...props} {...getDropTargetProps(item.folder.id, item.folder.name)} className={styles.folderCard}>
            <span className={styles.folderIcon} aria-hidden>
                <Icon name="folder" />
            </span>
            <ItemCheckbox item={item} selected={selected} className={styles.folderCheckbox} />
            <span className={styles.folderText}>
                <ItemName item={item} className={styles.itemName} />
                <span className={styles.itemMeta}>
                    {count} {count === 1 ? "item" : "items"}
                </span>
            </span>
            <ItemMenu item={item} className={styles.itemMenu} />
        </div>
    );
}

/** The preview of a file: a photo fills its tile, a document or audio file sits inside it. */
export function AssetPreview({ asset, className }: { asset: LibraryAsset; className?: string }) {
    const contained = asset.kind === "document" || asset.kind === "audio";
    return (
        <span className={[styles.preview, className].filter(Boolean).join(" ")} data-contained={contained ? "" : undefined}>
            <img src={asset.src} alt="" draggable={false} />
            {asset.duration != null && (
                <span className={styles.durationBadge}>
                    <Icon name="play" size="small" />
                    {formatDuration(asset.duration)}
                </span>
            )}
        </span>
    );
}

export function AssetBadges({ asset }: { asset: LibraryAsset }) {
    const badges: ReactNode[] = [];
    if (asset.aiGenerated) {
        badges.push(
            <Tooltip key="ai" content="AI-generated, EU AI Act Art. 50">
                <span className={styles.aiBadge} role="img" aria-label="AI-generated">
                    AI
                </span>
            </Tooltip>,
        );
    }
    if (asset.kind === "image" && asset.alt.trim() === "") {
        badges.push(
            <Tooltip key="alt" content="Alt text missing">
                <span className={styles.warningBadge} role="img" aria-label="Alt text missing">
                    <Icon name="alert" size="small" />
                </span>
            </Tooltip>,
        );
    }
    return badges.length > 0 ? <span className={styles.badges}>{badges}</span> : null;
}

export function AssetTile({ item }: { item: Extract<LibraryItem, { type: "file" }> }) {
    const { selected, props } = useItemProps(item);
    const { asset } = item;
    return (
        <div {...props} className={styles.tile} data-archived={asset.archived ? "" : undefined}>
            <span className={styles.tilePreview}>
                <AssetPreview asset={asset} />
                <AssetBadges asset={asset} />
                <ItemCheckbox item={item} selected={selected} className={styles.tileCheckbox} />
                <ItemMenu item={item} className={styles.tileMenu} />
            </span>
            <span className={styles.tileText}>
                <ItemName item={item} className={styles.itemName} />
                <span className={styles.itemMeta}>{describeAsset(asset)}</span>
            </span>
        </div>
    );
}
