import { type ChangeEvent, type CSSProperties, type DragEvent, type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from "react";

import { Breadcrumbs, type BreadcrumbsItem } from "../../../../components/breadcrumbs/Breadcrumbs";
import { BulkActionBar } from "../../../../components/bulkActionBar/BulkActionBar";
import { Button } from "../../../../components/button/Button";
import { EmptyState } from "../../../../components/emptyState/EmptyState";
import { FilterBar } from "../../../../components/filterBar/FilterBar";
import { FilterChip } from "../../../../components/filterChip/FilterChip";
import { Icon } from "../../../../components/icon/Icon";
import { IconButton } from "../../../../components/iconButton/IconButton";
import { Menu } from "../../../../components/menu/Menu";
import { MenuGroup } from "../../../../components/menu/MenuGroup";
import { MenuItem } from "../../../../components/menu/MenuItem";
import { MenuRadioGroup } from "../../../../components/menu/MenuRadioGroup";
import { MenuRadioItem } from "../../../../components/menu/MenuRadioItem";
import { MenuSeparator } from "../../../../components/menu/MenuSeparator";
import { PageHeader } from "../../../../components/pageHeader/PageHeader";
import { Pagination } from "../../../../components/pagination/Pagination";
import { Panel } from "../../../../components/panel/Panel";
import { ProgressBar } from "../../../../components/progressBar/ProgressBar";
import { SegmentedControl } from "../../../../components/segmentedControl/SegmentedControl";
import { useSelection } from "../../../../components/selection/useSelection";
import { Slider } from "../../../../components/slider/Slider";
import { Tooltip } from "../../../../components/tooltip/Tooltip";
import { PageTypeShell } from "../../../pageTypes/PageTypeShell";
import { landscapeImage } from "../../../sampleImages";
import styles from "./assetLibrary.module.scss";
import { type LibraryLocation, type LibrarySortKey, type LibraryView, type SmartFilter, useAssetLibrary } from "./AssetLibraryContext";
import { type AssetKind, getFolder, getFolderTrail, type LibraryAsset, today } from "./assetLibraryData";
import { AssetTable } from "./AssetTable";
import { AssetTile, FolderCard, LibraryItemContext, type LibraryItemHandlers } from "./LibraryItems";
import { countFolderItems, getLibraryContent, getRelativePath, kindFilterLabels, type LibraryItem } from "./libraryView";
import { useLibraryActions } from "./useLibraryActions";

const dragType = "application/x-dextinity-assets";

const kindFilters: { value: AssetKind | null; label: string }[] = [
    { value: null, label: "All" },
    { value: "image", label: "Images" },
    { value: "video", label: "Videos" },
    { value: "audio", label: "Audio" },
    { value: "document", label: "Documents" },
];

const sortLabels: Record<LibrarySortKey, string> = { name: "Name", modified: "Date modified", size: "Size", kind: "Type" };

interface Upload {
    id: string;
    name: string;
    progress: number;
    kind: AssetKind;
}

function kindOfFile(file: File): AssetKind {
    if (file.type.startsWith("image/")) {
        return "image";
    }
    if (file.type.startsWith("video/")) {
        return "video";
    }
    return file.type.startsWith("audio/") ? "audio" : "document";
}

function isFileDrag(event: DragEvent) {
    return event.dataTransfer.types.includes("Files");
}

export function AssetLibrary() {
    const { assets, setAssets, folders, location, setLocation, addToast } = useAssetLibrary();
    const actions = useLibraryActions();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [draggingIds, setDraggingIds] = useState<string[]>([]);
    const [dropTarget, setDropTarget] = useState<string | null>(null);
    const [fileDragOver, setFileDragOver] = useState(false);
    const [uploads, setUploads] = useState<Upload[]>([]);
    const [moreOpen, setMoreOpen] = useState(false);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const content = getLibraryContent(location, folders, assets);
    const { mode } = content;
    const pageItems = content.items.slice((location.page - 1) * location.pageSize, location.page * location.pageSize);
    const pageIds = pageItems.map((item) => item.id);
    const selection = useSelection({ ids: pageIds, selectedIds, onSelectionChange: setSelectedIds });
    const allItems = new Map(content.items.map((item) => [item.id, item]));
    const selectedItems = selectedIds.flatMap((id) => allItems.get(id) ?? []);
    const currentFolder = getFolder(folders, location.folderId);
    const currentFolderName = currentFolder?.name ?? "Assets";
    const acceptsUploads = mode === "folder" || mode === "flat";

    const activeAssets = assets.filter((asset) => !asset.archived);
    const archivedCount = assets.length - activeAssets.length;

    // A changed place in the library starts on page 1 with nothing selected
    function go(changes: Partial<LibraryLocation>) {
        setLocation((current) => ({ ...current, page: 1, ...changes }));
        setSelectedIds([]);
    }

    function openFolder(folderId: string | null) {
        go({ folderId, flat: false, smartFilter: null, search: "" });
    }

    function toggleSmartFilter(filter: SmartFilter) {
        if (location.smartFilter === filter) {
            go({ smartFilter: null, folderId: location.folderBeforeSmartFilter });
        } else {
            go({
                smartFilter: filter,
                flat: false,
                search: "",
                folderBeforeSmartFilter: location.smartFilter == null ? location.folderId : location.folderBeforeSmartFilter,
            });
        }
    }

    function sortBy(key: LibrarySortKey) {
        setLocation((current) => ({
            ...current,
            sort: { key, direction: current.sort.key === key && current.sort.direction === "ascending" ? "descending" : "ascending" },
        }));
    }

    function createFolder() {
        if (!acceptsUploads) {
            openFolder(location.folderId);
        }
        const id = actions.createFolder(location.folderId);
        setRenamingId(id);
    }

    useEffect(() => {
        if (uploads.length === 0 || uploads.every((upload) => upload.progress >= 100)) {
            return;
        }
        const timer = window.setTimeout(() => {
            setUploads((current) => current.map((upload) => ({ ...upload, progress: Math.min(100, upload.progress + 12 + Math.random() * 18) })));
        }, 180);
        return () => window.clearTimeout(timer);
    }, [uploads]);

    useEffect(() => {
        if (uploads.length === 0 || uploads.some((upload) => upload.progress < 100)) {
            return;
        }
        const folderId = location.folderId ?? "imagery";
        const created: LibraryAsset[] = uploads.map((upload) => ({
            ...activeAssets[0],
            id: upload.id,
            name: upload.name,
            folderId,
            kind: upload.kind,
            src: landscapeImage,
            width: 2400,
            height: 1600,
            duration: upload.kind === "video" || upload.kind === "audio" ? 30 : undefined,
            pages: upload.kind === "document" ? 1 : undefined,
            bytes: 1_200_000,
            modified: today,
            usages: [],
            archived: false,
            aiGenerated: false,
            alt: "",
            contentHash: upload.id,
        }));
        setAssets((current) => [...current, ...created]);
        addToast({
            message: `${created.length === 1 ? `“${created[0].name}”` : `${created.length} files`} uploaded to “${getFolder(folders, folderId)?.name ?? "Assets"}”`,
        });
        setUploads([]);
    }, [uploads, activeAssets, location.folderId, folders, setAssets, addToast]);

    function upload(files: File[]) {
        if (files.length === 0) {
            return;
        }
        setUploads(files.map((file, index) => ({ id: `upload-${Date.now()}-${index}`, name: file.name, progress: 0, kind: kindOfFile(file) })));
    }

    const handlers: LibraryItemHandlers = {
        isSelected: selection.isSelected,
        onItemClick: (item: LibraryItem, event: MouseEvent) => {
            if (renamingId === item.id) {
                return;
            }
            if (event.metaKey || event.ctrlKey) {
                selection.toggle(item.id, { range: false });
            } else if (event.shiftKey) {
                selection.toggle(item.id, { range: true });
            } else {
                actions.open(item);
            }
        },
        onCheckedChange: (item) => selection.toggle(item.id),
        onItemKeyDown: (item, event: KeyboardEvent) => {
            if (event.target !== event.currentTarget) {
                return;
            }
            const mod = event.metaKey || event.ctrlKey;
            if (event.key === " ") {
                event.preventDefault();
                selection.toggle(item.id);
            } else if (event.key === "Enter") {
                event.preventDefault();
                setRenamingId(item.id);
            } else if (mod && event.key.toLowerCase() === "o") {
                event.preventDefault();
                actions.open(item);
            } else if (mod && event.key === "Backspace") {
                event.preventDefault();
                actions.remove(handlers.getMenuTargets(item));
            }
        },
        getMenuTargets: (item) => (selectedIds.includes(item.id) ? selectedItems : [item]),
        onMenuOpen: (item) => {
            if (!selectedIds.includes(item.id)) {
                setSelectedIds([item.id]);
            }
        },
        menuActions: {
            open: actions.open,
            rename: (item) => setRenamingId(item.id),
            duplicate: (items) => setSelectedIds(actions.duplicate(items)),
            move: (items, folderId, folderName) => {
                actions.move(items, folderId, folderName);
                setSelectedIds([]);
            },
            canMove: actions.canMove,
            download: actions.download,
            setArchived: (items, archived) => {
                actions.setArchived(items, archived);
                setSelectedIds([]);
            },
            remove: (items) => {
                actions.remove(items);
                setSelectedIds([]);
            },
        },
        folderChoices: [
            { id: null, label: "Assets" },
            ...folders
                .map((folder) => ({
                    id: folder.id,
                    label: getFolderTrail(folders, folder.id)
                        .map((ancestor) => ancestor.name)
                        .join(" / "),
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        ],
        renamingId,
        onRenameEnd: (item, name) => {
            if (name != null) {
                actions.rename(item, name);
            }
            setRenamingId(null);
        },
        draggingIds,
        onDragStart: (item, event) => {
            const ids = selectedIds.includes(item.id) ? selectedIds : [item.id];
            setDraggingIds(ids);
            event.dataTransfer.setData(dragType, ids.join(","));
            event.dataTransfer.effectAllowed = "move";
        },
        onDragEnd: () => {
            setDraggingIds([]);
            setDropTarget(null);
        },
        getDropTargetProps: (folderId, folderName) => {
            const key = folderId ?? "root";
            const dragged = draggingIds.flatMap((id) => allItems.get(id) ?? []);
            return {
                onDragOver: (event: DragEvent) => {
                    if (!event.dataTransfer.types.includes(dragType) || dragged.length === 0 || !actions.canMove(dragged, folderId)) {
                        return;
                    }
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setDropTarget(key);
                },
                onDragLeave: () => setDropTarget((current) => (current === key ? null : current)),
                onDrop: (event: DragEvent) => {
                    if (!event.dataTransfer.types.includes(dragType)) {
                        return;
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    actions.move(dragged, folderId, folderName);
                    setSelectedIds([]);
                    setDraggingIds([]);
                    setDropTarget(null);
                },
                "data-drop-target": dropTarget === key ? "" : undefined,
            };
        },
    };

    const trail = getFolderTrail(folders, location.folderId);
    const crumbs: (BreadcrumbsItem & { folderId?: string | null })[] =
        mode === "search"
            ? [{ label: "Assets", folderId: null }, { label: `Search “${location.search.trim()}”` }]
            : mode === "smartFilter"
              ? [{ label: "Assets", folderId: null }, { label: location.smartFilter === "unused" ? "Unused" : "Archived" }]
              : [{ label: "Assets", folderId: null }, ...trail.map((folder) => ({ label: folder.name, folderId: folder.id }))];
    const breadcrumbItems: BreadcrumbsItem[] = crumbs.map((crumb, index) => {
        if (index === crumbs.length - 1 || crumb.folderId === undefined) {
            return { label: crumb.label };
        }
        const dropProps = handlers.getDropTargetProps(crumb.folderId, crumb.label);
        return {
            label: crumb.label,
            onClick: () => openFolder(crumb.folderId ?? null),
            render: <button type="button" className={styles.crumb} {...dropProps} />,
        };
    });

    const folderItems = pageItems.filter((item) => item.type === "folder");
    const fileItems = pageItems.filter((item) => item.type === "file");
    const kindLabel = location.kind == null ? "files" : kindFilterLabels[location.kind];

    function renderEmptyState() {
        if (mode === "search") {
            return (
                <EmptyState
                    icon={<Icon name="search" />}
                    title={`Nothing found for “${location.search.trim()}”`}
                    description="Searches names and alt texts in all folders."
                />
            );
        }
        if (mode === "smartFilter") {
            return location.smartFilter === "unused" ? (
                <EmptyState icon={<Icon name="check-circle" />} title="Every file is in use" />
            ) : (
                <EmptyState icon={<Icon name="archive" />} title="Nothing archived" />
            );
        }
        if (location.kind != null && content.deeperMatches > 0) {
            return (
                <EmptyState
                    icon={<Icon name="folder" />}
                    title={`No ${kindLabel} directly in here`}
                    description={`${content.deeperMatches} in subfolders.`}
                    actions={
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<Icon name="layers" />}
                            onClick={() => go({ flat: true })}
                        >
                            Include subfolders
                        </Button>
                    }
                />
            );
        }
        if (location.kind != null) {
            return <EmptyState icon={<Icon name="folder" />} title={`No ${kindLabel} in here`} />;
        }
        return <EmptyState icon={<Icon name="folder" />} title="This folder is empty" description="Drag files here or upload them." />;
    }

    function renderFlatGroups() {
        const groups: { folderId: string; items: typeof fileItems }[] = [];
        for (const item of fileItems) {
            if (item.type !== "file") {
                continue;
            }
            const group = groups.at(-1);
            if (group?.folderId === item.asset.folderId) {
                group.items.push(item);
            } else {
                groups.push({ folderId: item.asset.folderId, items: [item] });
            }
        }
        return groups.map((group) => (
            <section key={group.folderId} className={styles.section} aria-label={getRelativePath(folders, group.folderId, null)}>
                <h3 className={styles.groupHeading}>
                    <button type="button" className={styles.groupLink} onClick={() => openFolder(group.folderId)}>
                        <Icon name="folder" size="small" />
                        {getRelativePath(folders, group.folderId, location.folderId) || currentFolderName}
                    </button>
                    <span className={styles.count}>{group.items.length}</span>
                </h3>
                <div className={styles.fileGrid} role="listbox" aria-multiselectable aria-label={getRelativePath(folders, group.folderId, null)}>
                    {group.items.map((item) => item.type === "file" && <AssetTile key={item.id} item={item} />)}
                </div>
            </section>
        ));
    }

    function renderTiles() {
        if (mode === "flat") {
            return renderFlatGroups();
        }
        const both = folderItems.length > 0 && fileItems.length > 0;
        return (
            <>
                {folderItems.length > 0 && (
                    <section className={styles.section} aria-label="Folders">
                        {both && (
                            <h3 className={styles.sectionHeading}>
                                Folders <span className={styles.count}>{folderItems.length}</span>
                            </h3>
                        )}
                        <div className={styles.folderGrid} role="listbox" aria-multiselectable aria-label="Folders">
                            {folderItems.map(
                                (item) =>
                                    item.type === "folder" && (
                                        <FolderCard key={item.id} item={item} count={countFolderItems(item.folder.id, folders, assets)} />
                                    ),
                            )}
                        </div>
                    </section>
                )}
                {fileItems.length > 0 && (
                    <section className={styles.section} aria-label="Files">
                        {both && (
                            <h3 className={styles.sectionHeading}>
                                Files <span className={styles.count}>{fileItems.length}</span>
                            </h3>
                        )}
                        <div className={styles.fileGrid} role="listbox" aria-multiselectable aria-label="Files">
                            {fileItems.map((item) => item.type === "file" && <AssetTile key={item.id} item={item} />)}
                        </div>
                    </section>
                )}
            </>
        );
    }

    return (
        <PageTypeShell currentId="assets">
            <div className={styles.page}>
                <PageHeader
                    eyebrow={
                        <span className={styles.eyebrow}>
                            <Icon name="globe" size="small" />
                            Global, applies to all scopes
                        </span>
                    }
                    title="Assets"
                    subtitle={`${activeAssets.length} files in ${folders.length} folders, ${archivedCount} archived`}
                    actions={
                        <>
                            <Button variant="outlined" color="secondary" startIcon={<Icon name="folder-add" />} onClick={createFolder}>
                                New folder
                            </Button>
                            <Button startIcon={<Icon name="cloud-upload" />} onClick={() => uploadInputRef.current?.click()}>
                                Upload
                            </Button>
                        </>
                    }
                />
                <input
                    ref={uploadInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        upload(Array.from(event.target.files ?? []));
                        event.target.value = "";
                    }}
                />
                <Panel
                    className={styles.card}
                    padding="none"
                    onDragEnter={(event) => {
                        if (acceptsUploads && isFileDrag(event)) {
                            setFileDragOver(true);
                        }
                    }}
                    onDragOver={(event) => {
                        if (acceptsUploads && isFileDrag(event)) {
                            event.preventDefault();
                        }
                    }}
                    onDragLeave={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                            setFileDragOver(false);
                        }
                    }}
                    onDrop={(event) => {
                        if (acceptsUploads && isFileDrag(event)) {
                            event.preventDefault();
                            setFileDragOver(false);
                            upload(Array.from(event.dataTransfer.files));
                        }
                    }}
                >
                    <LibraryItemContext.Provider value={handlers}>
                        <div className={styles.toolbar}>
                            <FilterBar
                                searchValue={location.search}
                                onSearchChange={(search) => go({ search, flat: search.trim() === "" ? location.flat : false })}
                                labels={{ search: "Search all assets", searchPlaceholder: "Search all assets" }}
                                searchKeyboardShortcut={false}
                                actions={
                                    <>
                                        <SegmentedControl<LibraryView>
                                            aria-label="View"
                                            value={location.view}
                                            onChange={(view) => setLocation((current) => ({ ...current, view }))}
                                            options={[
                                                { value: "tiles", icon: <Icon name="grid" />, "aria-label": "Tiles" },
                                                { value: "list", icon: <Icon name="list" />, "aria-label": "List" },
                                            ]}
                                        />
                                        <Menu
                                            open={moreOpen}
                                            onOpenChange={setMoreOpen}
                                            placement="bottom-end"
                                            trigger={
                                                <IconButton variant="text" color="secondary" aria-label="More actions">
                                                    <Icon name="more-horizontal" />
                                                </IconButton>
                                            }
                                        >
                                            <MenuGroup label={currentFolderName}>
                                                <MenuItem
                                                    label="New folder"
                                                    icon={<Icon name="folder-add" />}
                                                    keyboardShortcut="shift+mod+n"
                                                    onClick={createFolder}
                                                />
                                                <MenuItem
                                                    label="Upload …"
                                                    icon={<Icon name="cloud-upload" />}
                                                    onClick={() => uploadInputRef.current?.click()}
                                                />
                                            </MenuGroup>
                                            <MenuSeparator />
                                            <MenuGroup label="View">
                                                <MenuRadioGroup
                                                    value={location.view}
                                                    onChange={(view) => setLocation((current) => ({ ...current, view: view as LibraryView }))}
                                                >
                                                    <MenuRadioItem value="tiles" label="Tiles" icon={<Icon name="grid" />} />
                                                    <MenuRadioItem value="list" label="List" icon={<Icon name="list" />} />
                                                </MenuRadioGroup>
                                            </MenuGroup>
                                            <MenuSeparator />
                                            <MenuGroup label="Sort by">
                                                <MenuRadioGroup
                                                    value={location.sort.key}
                                                    onChange={(key) =>
                                                        setLocation((current) => ({
                                                            ...current,
                                                            sort: { key: key as LibrarySortKey, direction: "ascending" },
                                                        }))
                                                    }
                                                >
                                                    {(Object.keys(sortLabels) as LibrarySortKey[]).map((key) => (
                                                        <MenuRadioItem key={key} value={key} label={sortLabels[key]} />
                                                    ))}
                                                </MenuRadioGroup>
                                            </MenuGroup>
                                        </Menu>
                                    </>
                                }
                            >
                                {kindFilters.map((filter) => (
                                    <FilterChip
                                        key={filter.label}
                                        selected={location.kind === filter.value}
                                        onClick={() => go({ kind: filter.value })}
                                    >
                                        {filter.label}
                                    </FilterChip>
                                ))}
                                <Tooltip content="Show the files of all subfolders in one view">
                                    <FilterChip
                                        selected={location.flat}
                                        disabled={mode === "search" || mode === "smartFilter"}
                                        onClick={() => go({ flat: !location.flat })}
                                        startAdornment={<Icon name="layers" size="small" />}
                                    >
                                        Include subfolders
                                    </FilterChip>
                                </Tooltip>
                                <span className={styles.chipDivider} aria-hidden />
                                <FilterChip
                                    selected={location.smartFilter === "unused"}
                                    onClick={() => toggleSmartFilter("unused")}
                                    startAdornment={<Icon name="eye-off" size="small" />}
                                >
                                    Unused
                                </FilterChip>
                                <FilterChip
                                    selected={location.smartFilter === "archived"}
                                    onClick={() => toggleSmartFilter("archived")}
                                    startAdornment={<Icon name="archive" size="small" />}
                                >
                                    Archived
                                </FilterChip>
                            </FilterBar>
                        </div>
                        <div className={styles.pathBar}>
                            {location.folderId != null && (mode === "folder" || mode === "flat") && (
                                <Tooltip content="Up one level">
                                    <IconButton
                                        variant="outlined"
                                        color="secondary"
                                        size="small"
                                        aria-label="Up one level"
                                        onClick={() => openFolder(currentFolder?.parentId ?? null)}
                                    >
                                        <Icon name="arrow-left" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Breadcrumbs items={breadcrumbItems} />
                            {mode === "flat" && <span className={styles.flatBadge}>incl. subfolders</span>}
                        </div>
                        {pageItems.length > 0 && mode === "folder" && content.deeperMatches > 0 && (
                            <p className={styles.hint}>
                                {content.deeperMatches} more {kindLabel} in subfolders.{" "}
                                <button type="button" className={styles.hintLink} onClick={() => go({ flat: true })}>
                                    Show all
                                </button>
                            </p>
                        )}
                        {/* The list's keys: ⌘A selects all on this page, Escape clears the selection */}
                        <div
                            className={styles.content}
                            style={{ "--tile-size": `${location.tileSize}px` } as CSSProperties}
                            onKeyDown={selection.onKeyDown}
                        >
                            {pageItems.length === 0 ? (
                                <div className={styles.empty}>{renderEmptyState()}</div>
                            ) : location.view === "tiles" ? (
                                renderTiles()
                            ) : (
                                <AssetTable
                                    items={pageItems}
                                    folders={folders}
                                    sort={location.sort}
                                    onSortChange={sortBy}
                                    allSelected={selection.allSelected}
                                    someSelected={selection.someSelected}
                                    onSelectAll={(checked) => (checked ? selection.selectAll() : selection.clear())}
                                    countItems={(folderId) => countFolderItems(folderId, folders, assets)}
                                    folderColumnFrom={mode === "flat" ? { folderId: location.folderId, onOpen: openFolder } : undefined}
                                />
                            )}
                            {fileDragOver && (
                                <div className={styles.dropZone}>
                                    <Icon name="cloud-upload" />
                                    <strong>Drop files here</strong>
                                    <span>They go into “{currentFolderName}”</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.footer}>
                            <span className={styles.muted}>
                                {selectedIds.length > 0 ? `${selectedIds.length} selected` : pageItems.length === 0 ? "0 items" : ""}
                            </span>
                            <div className={styles.footerEnd}>
                                {content.items.length > 0 && (
                                    <Pagination
                                        page={location.page}
                                        pageSize={location.pageSize}
                                        total={content.items.length}
                                        pageSizeOptions={[25, 50, 100, 200]}
                                        onPageChange={(page) => {
                                            setLocation((current) => ({ ...current, page }));
                                            setSelectedIds([]);
                                        }}
                                        onPageSizeChange={(pageSize) => go({ pageSize })}
                                    />
                                )}
                                {location.view === "tiles" && (
                                    <Slider
                                        className={styles.sizeSlider}
                                        aria-label="Tile size"
                                        min={96}
                                        max={300}
                                        step={1}
                                        value={location.tileSize}
                                        onChange={(tileSize) => setLocation((current) => ({ ...current, tileSize }))}
                                        startIcon={<Icon name="image" size="small" />}
                                        endIcon={<Icon name="image" />}
                                    />
                                )}
                            </div>
                        </div>
                        {selectedIds.length > 0 && (
                            <BulkActionBar
                                className={styles.bulkActionBar}
                                count={selectedIds.length}
                                onClear={selection.clear}
                                actions={[
                                    {
                                        label: "Move",
                                        icon: <Icon name="move" />,
                                        onClick: () =>
                                            addToast({ message: "Drag the items onto a folder, or use “Move to …” in their menu", color: "info" }),
                                    },
                                    { label: "Download", icon: <Icon name="download" />, onClick: () => actions.download(selectedItems) },
                                    {
                                        label: "Archive",
                                        icon: <Icon name="archive" />,
                                        onClick: () => handlers.menuActions.setArchived(selectedItems, location.smartFilter !== "archived"),
                                    },
                                    { label: "Delete", icon: <Icon name="trash" />, onClick: () => handlers.menuActions.remove(selectedItems) },
                                ]}
                            />
                        )}
                    </LibraryItemContext.Provider>
                </Panel>
            </div>
            {uploads.length > 0 && (
                <div className={styles.uploadTray} role="status" aria-label="Uploads">
                    <strong>Uploading to “{currentFolderName}”</strong>
                    {uploads.map((item) => (
                        <ProgressBar key={item.id} value={item.progress} label={item.name} size="small" />
                    ))}
                </div>
            )}
        </PageTypeShell>
    );
}
