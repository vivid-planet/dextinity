import { useContext } from "react";

import { Checkbox } from "../../../../components/checkbox/Checkbox";
import { Icon } from "../../../../components/icon/Icon";
import styles from "./assetLibrary.module.scss";
import type { LibraryLocation, LibrarySortKey } from "./AssetLibraryContext";
import { formatBytes, formatModified, kindLabels, type LibraryFolder } from "./assetLibraryData";
import { AssetBadges, AssetPreview, ItemMenu, ItemName, LibraryItemContext } from "./LibraryItems";
import { getRelativePath, type LibraryItem } from "./libraryView";

interface AssetTableProps {
    items: LibraryItem[];
    folders: LibraryFolder[];
    sort: LibraryLocation["sort"];
    onSortChange: (key: LibrarySortKey) => void;
    allSelected: boolean;
    someSelected: boolean;
    onSelectAll: (checked: boolean) => void;
    countItems: (folderId: string) => number;
    /** Shows the column with each file's folder, in the flat view. */
    folderColumnFrom?: { folderId: string | null; onOpen: (folderId: string) => void };
}

const sortableColumns: { key: LibrarySortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "kind", label: "Type" },
    { key: "size", label: "Size" },
    { key: "modified", label: "Modified" },
];

function SortHeader({
    column,
    sort,
    onSortChange,
}: {
    column: (typeof sortableColumns)[number];
    sort: AssetTableProps["sort"];
    onSortChange: AssetTableProps["onSortChange"];
}) {
    const active = sort.key === column.key;
    return (
        <th scope="col" aria-sort={active ? sort.direction : undefined}>
            <button type="button" className={styles.sortButton} onClick={() => onSortChange(column.key)}>
                {column.label}
                {active && <Icon name={sort.direction === "ascending" ? "arrow-up" : "arrow-down"} size="small" />}
            </button>
        </th>
    );
}

/**
 * The list view: one row per folder or file, sortable by one column at a time. Until `@dextinity/ui` has a data grid, the table
 * is built here.
 */
export function AssetTable({
    items,
    folders,
    sort,
    onSortChange,
    allSelected,
    someSelected,
    onSelectAll,
    countItems,
    folderColumnFrom,
}: AssetTableProps) {
    const handlers = useContext(LibraryItemContext);
    if (handlers == null) {
        return null;
    }
    const [nameColumn, ...otherColumns] = sortableColumns;
    return (
        <table className={styles.table} aria-label="Assets">
            <thead>
                <tr>
                    <th scope="col" className={styles.checkboxCell}>
                        <Checkbox aria-label="Select all on this page" checked={allSelected} indeterminate={someSelected} onChange={onSelectAll} />
                    </th>
                    <SortHeader column={nameColumn} sort={sort} onSortChange={onSortChange} />
                    {folderColumnFrom && <th scope="col">Folder</th>}
                    {otherColumns.map((column) => (
                        <SortHeader key={column.key} column={column} sort={sort} onSortChange={onSortChange} />
                    ))}
                    <th scope="col">Used</th>
                    <th scope="col">
                        <span className={styles.visuallyHidden}>Actions</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => {
                    const selected = handlers.isSelected(item.id);
                    const dropProps = item.type === "folder" ? handlers.getDropTargetProps(item.folder.id, item.folder.name) : {};
                    return (
                        <tr
                            key={item.id}
                            {...dropProps}
                            data-selected={selected ? "" : undefined}
                            data-dragging={handlers.draggingIds.includes(item.id) ? "" : undefined}
                            draggable={handlers.renamingId !== item.id}
                            tabIndex={0}
                            onClick={(event) => handlers.onItemClick(item, event)}
                            onKeyDown={(event) => handlers.onItemKeyDown(item, event)}
                            onDragStart={(event) => handlers.onDragStart(item, event)}
                            onDragEnd={handlers.onDragEnd}
                        >
                            <td className={styles.checkboxCell} onClick={(event) => event.stopPropagation()}>
                                <Checkbox
                                    aria-label={`Select ${item.type === "folder" ? item.folder.name : item.asset.name}`}
                                    checked={selected}
                                    onChange={() => handlers.onCheckedChange(item)}
                                />
                            </td>
                            <td>
                                <span className={styles.nameCell}>
                                    {item.type === "folder" ? (
                                        <span className={styles.rowFolderIcon} aria-hidden>
                                            <Icon name="folder" />
                                        </span>
                                    ) : (
                                        <span className={styles.rowPreview}>
                                            <AssetPreview asset={item.asset} />
                                        </span>
                                    )}
                                    <ItemName item={item} className={styles.rowName} />
                                    {item.type === "file" && <AssetBadges asset={item.asset} />}
                                </span>
                            </td>
                            {folderColumnFrom && (
                                <td>
                                    {item.type === "file" && (
                                        <button
                                            type="button"
                                            className={styles.folderLink}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                folderColumnFrom.onOpen(item.asset.folderId);
                                            }}
                                        >
                                            <Icon name="folder" size="small" />
                                            {getRelativePath(folders, item.asset.folderId, folderColumnFrom.folderId) || "This folder"}
                                        </button>
                                    )}
                                </td>
                            )}
                            <td className={styles.muted}>{item.type === "folder" ? "Folder" : kindLabels[item.asset.kind]}</td>
                            <td className={styles.muted}>
                                {item.type === "folder" ? `${countItems(item.folder.id)} items` : formatBytes(item.asset.bytes)}
                            </td>
                            <td className={styles.muted}>{formatModified(item.type === "folder" ? item.folder.modified : item.asset.modified)}</td>
                            <td className={styles.muted}>
                                {item.type === "file" && item.asset.usages.length > 0 ? `${item.asset.usages.length}×` : "–"}
                            </td>
                            <td className={styles.actionsCell}>
                                <ItemMenu item={item} className={styles.rowMenu} />
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
