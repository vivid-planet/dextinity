import {
    type ChangeEvent,
    type CSSProperties,
    type DragEvent,
    type KeyboardEvent,
    type MouseEvent,
    type RefObject,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { useMediaQuery } from "../../../../components/appShell/useMediaQuery";
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
import { ScenarioContent, useScenario } from "../../../scenario";
import styles from "./assetLibrary.module.scss";
import { type LibraryLocation, type LibrarySortKey, type LibraryView, type SmartFilter, useAssetLibrary } from "./AssetLibraryContext";
import { type AssetKind, getFolder, getFolderTrail, type LibraryAsset, type LibraryFolder, today } from "./assetLibraryData";
import { AssetTable } from "./AssetTable";
import { countActiveFilters, kindFilters, LibraryFilterDrawer, pageSizes, sortLabels } from "./LibraryFilterDrawer";
import { AssetTile, FolderCard, LibraryItemContext, type LibraryItemHandlers } from "./LibraryItems";
import { countFolderItems, getLibraryContent, getRelativePath, kindFilterLabels, type LibraryItem } from "./libraryView";
import { MoveToFolderMenu } from "./MoveToFolderMenu";
import { useLibraryActions } from "./useLibraryActions";

const dragType = "application/x-dextinity-assets";

interface Upload {
    id: string;
    name: string;
    progress: number;
    kind: AssetKind;
    folderId: string;
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

/** Space kept free below the card, so that its edge stays visible. */
const cardBottomGap = 24;

/**
 * The height that lets the element end at the bottom of the window, so that the card's footer always stays in view while its
 * content scrolls. Never less than a usable minimum, e.g. in a short window. Off in smaller windows, where the page scrolls.
 */
function useFillViewportHeight(ref: RefObject<HTMLElement | null>, enabled: boolean) {
    const [height, setHeight] = useState<number>();
    useLayoutEffect(() => {
        if (!enabled) {
            setHeight(undefined);
            return;
        }
        const measure = () => {
            const element = ref.current;
            if (element == null) {
                return;
            }
            const top = element.getBoundingClientRect().top + window.scrollY;
            setHeight(Math.max(480, window.innerHeight - top - cardBottomGap));
        };
        measure();
        window.addEventListener("resize", measure);
        const observer = new ResizeObserver(measure);
        if (ref.current?.parentElement) {
            observer.observe(ref.current.parentElement);
        }
        return () => {
            window.removeEventListener("resize", measure);
            observer.disconnect();
        };
    }, [ref, enabled]);
    return height;
}

function quoteFolderNames(folders: LibraryFolder[], folderIds: string[]) {
    // A folder deleted while its upload was running has no name anymore
    return [...new Set(folderIds)].map((folderId) => `“${getFolder(folders, folderId)?.name ?? "Assets"}”`).join(", ");
}

function isFileDrag(event: DragEvent) {
    return event.dataTransfer.types.includes("Files");
}

export function AssetLibrary() {
    const { assets, setAssets, folders, location, setLocation, addToast } = useAssetLibrary();
    const scenario = useScenario();
    const actions = useLibraryActions();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [draggingIds, setDraggingIds] = useState<string[]>([]);
    const [dropTarget, setDropTarget] = useState<string | null>(null);
    const [fileDragOver, setFileDragOver] = useState(false);
    const [uploads, setUploads] = useState<Upload[]>([]);
    const [sortOpen, setSortOpen] = useState(false);
    const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    // Wide windows keep the card at the window's height and scroll inside it; smaller ones scroll the page, with the toolbar and the
    // footer sticking to the edges, so that the files get all the room
    const fillsWindow = useMediaQuery("(width >= 1024px)");
    const isPhone = useMediaQuery("(width < 768px)");
    const cardHeight = useFillViewportHeight(cardRef, fillsWindow);
    const [filterOpen, setFilterOpen] = useState(false);
    const activeFilterCount = countActiveFilters(location);

    const content = getLibraryContent(location, folders, assets);
    const { mode } = content;
    // Archiving, moving, or deleting the files of the last page leaves fewer pages than before
    const currentPage = Math.min(location.page, Math.max(1, Math.ceil(content.items.length / location.pageSize)));
    const pageItems = content.items.slice((currentPage - 1) * location.pageSize, currentPage * location.pageSize);
    const pageIds = pageItems.map((item) => item.id);
    const selection = useSelection({ ids: pageIds, selectedIds, onSelectionChange: setSelectedIds });
    const allItems = new Map(content.items.map((item) => [item.id, item]));
    const selectedItems = selectedIds.flatMap((id) => allItems.get(id) ?? []);
    const currentFolder = getFolder(folders, location.folderId);
    const currentFolderName = currentFolder?.name ?? "Assets";
    // Files always live in a folder, so uploads at the top level go into Imagery
    const uploadFolderId = location.folderId ?? "imagery";
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
        const created: LibraryAsset[] = uploads.map((upload) => ({
            ...activeAssets[0],
            id: upload.id,
            name: upload.name,
            folderId: upload.folderId,
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
            message: `${created.length === 1 ? `“${created[0].name}”` : `${created.length} files`} uploaded to ${quoteFolderNames(
                folders,
                created.map((asset) => asset.folderId),
            )}`,
        });
        setUploads([]);
    }, [uploads, activeAssets, folders, setAssets, addToast]);

    function upload(files: File[]) {
        if (files.length === 0) {
            return;
        }
        setUploads((current) => [
            ...current,
            ...files.map((file, index) => ({
                id: `upload-${Date.now()}-${index}`,
                name: file.name,
                progress: 0,
                kind: kindOfFile(file),
                folderId: uploadFolderId,
            })),
        ]);
    }

    const handlers: LibraryItemHandlers = {
        isSelected: selection.isSelected,
        onItemClick: (item: LibraryItem, event: MouseEvent) => {
            // Clicks in the item's menu reach the item too, since React passes events up through the menu's portal
            if (renamingId === item.id || !event.currentTarget.contains(event.target as Node)) {
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
        folders,
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
                        <Tooltip content="Applies to all scopes">
                            {/* Focusable, so that the tooltip also opens from the keyboard */}
                            <span className={styles.eyebrow} tabIndex={0}>
                                <Icon name="globe" size="small" />
                                Global
                            </span>
                        </Tooltip>
                    }
                    title="Assets"
                    subtitle={`${activeAssets.length} files in ${folders.length} folders, ${archivedCount} archived`}
                    secondaryActions={[{ label: "New folder", icon: <Icon name="folder-add" />, onClick: createFolder }]}
                    primaryAction={{ label: "Upload", icon: <Icon name="cloud-upload" />, onClick: () => uploadInputRef.current?.click() }}
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
                <div ref={cardRef} className={styles.cardFrame} data-layout={fillsWindow ? "fill" : "flow"} style={{ blockSize: cardHeight }}>
                    <Panel
                        className={styles.card}
                        padding="none"
                        slotProps={{ body: { className: styles.cardBody } }}
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
                                    className={isPhone ? styles.phoneSearchRow : undefined}
                                    slotProps={
                                        isPhone
                                            ? { search: { className: styles.phoneSearch }, actions: { className: styles.phoneActions } }
                                            : undefined
                                    }
                                    searchValue={location.search}
                                    onSearchChange={(search) =>
                                        go({
                                            search,
                                            flat: search.trim() === "" ? location.flat : false,
                                            smartFilter: search.trim() === "" ? location.smartFilter : null,
                                        })
                                    }
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
                                            {isPhone ? (
                                                <span className={styles.filterButton}>
                                                    <IconButton
                                                        variant="outlined"
                                                        color="secondary"
                                                        onClick={() => setFilterOpen(true)}
                                                        aria-label={`Filter and sort${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
                                                    >
                                                        <Icon name="filter" />
                                                    </IconButton>
                                                    {activeFilterCount > 0 && (
                                                        <span className={styles.filterCount} aria-hidden>
                                                            {activeFilterCount}
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <Menu
                                                    open={sortOpen}
                                                    onOpenChange={setSortOpen}
                                                    placement="bottom-end"
                                                    trigger={
                                                        <Button
                                                            variant="outlined"
                                                            color="secondary"
                                                            startIcon={<Icon name="sort" />}
                                                            endIcon={<Icon name="chevron-down" />}
                                                            aria-label={`Sort by ${sortLabels[location.sort.key]}, ${location.sort.direction}`}
                                                        >
                                                            {sortLabels[location.sort.key]}
                                                        </Button>
                                                    }
                                                >
                                                    <MenuGroup label="Sort by">
                                                        <MenuRadioGroup
                                                            value={location.sort.key}
                                                            onChange={(key) =>
                                                                setLocation((current) => ({
                                                                    ...current,
                                                                    sort: { ...current.sort, key: key as LibrarySortKey },
                                                                }))
                                                            }
                                                        >
                                                            {(Object.keys(sortLabels) as LibrarySortKey[]).map((key) => (
                                                                <MenuRadioItem key={key} value={key} label={sortLabels[key]} />
                                                            ))}
                                                        </MenuRadioGroup>
                                                    </MenuGroup>
                                                    <MenuSeparator />
                                                    <MenuGroup label="Order">
                                                        <MenuRadioGroup
                                                            value={location.sort.direction}
                                                            onChange={(direction) =>
                                                                setLocation((current) => ({
                                                                    ...current,
                                                                    sort: {
                                                                        ...current.sort,
                                                                        direction: direction as LibraryLocation["sort"]["direction"],
                                                                    },
                                                                }))
                                                            }
                                                        >
                                                            <MenuRadioItem value="ascending" label="Ascending" icon={<Icon name="arrow-up" />} />
                                                            <MenuRadioItem value="descending" label="Descending" icon={<Icon name="arrow-down" />} />
                                                        </MenuRadioGroup>
                                                    </MenuGroup>
                                                </Menu>
                                            )}
                                        </>
                                    }
                                />
                                {isPhone ? (
                                    activeFilterCount > 0 && (
                                        <div className={styles.chips} role="group" aria-label="Active filters">
                                            {location.kind != null && (
                                                <FilterChip
                                                    selected
                                                    onClick={() => go({ kind: null })}
                                                    endAdornment={<Icon name="close" size="small" />}
                                                >
                                                    {kindFilters.find((filter) => filter.value === location.kind)?.label}
                                                </FilterChip>
                                            )}
                                            {location.flat && (
                                                <FilterChip
                                                    selected
                                                    onClick={() => go({ flat: false })}
                                                    endAdornment={<Icon name="close" size="small" />}
                                                >
                                                    Include subfolders
                                                </FilterChip>
                                            )}
                                            {location.smartFilter != null && (
                                                <FilterChip
                                                    selected
                                                    onClick={() => toggleSmartFilter(location.smartFilter ?? "unused")}
                                                    endAdornment={<Icon name="close" size="small" />}
                                                >
                                                    {location.smartFilter === "unused" ? "Unused" : "Archived"}
                                                </FilterChip>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div className={styles.chips} role="group" aria-label="Filters">
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
                                    </div>
                                )}
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
                                data-tile-size={isPhone ? (location.tileSize > 168 ? "large" : "small") : undefined}
                                data-selecting={selectedIds.length > 0 ? "" : undefined}
                                style={{ "--tile-size": `${location.tileSize}px` } as CSSProperties}
                                onKeyDown={selection.onKeyDown}
                            >
                                {scenario === "loading" || scenario === "error" ? (
                                    <ScenarioContent scenario={scenario} />
                                ) : pageItems.length === 0 ? (
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
                                        <span>They go into {quoteFolderNames(folders, [uploadFolderId])}</span>
                                    </div>
                                )}
                            </div>
                            {isPhone ? (
                                // Only paging: per page and the tile size are in the filter drawer. With one page there's nothing to page, and
                                // with a selection the bulk action bar takes the bottom edge
                                content.items.length > location.pageSize &&
                                selectedIds.length === 0 && (
                                    <div className={styles.footer}>
                                        <IconButton
                                            variant="text"
                                            color="secondary"
                                            aria-label="Previous page"
                                            disabled={currentPage === 1}
                                            onClick={() => setLocation((current) => ({ ...current, page: currentPage - 1 }))}
                                        >
                                            <Icon name="chevron-left" />
                                        </IconButton>
                                        <span className={styles.pageRange} aria-live="polite">
                                            {(currentPage - 1) * location.pageSize + 1}–
                                            {Math.min(currentPage * location.pageSize, content.items.length)} of {content.items.length}
                                        </span>
                                        <IconButton
                                            variant="text"
                                            color="secondary"
                                            aria-label="Next page"
                                            disabled={currentPage * location.pageSize >= content.items.length}
                                            onClick={() => setLocation((current) => ({ ...current, page: currentPage + 1 }))}
                                        >
                                            <Icon name="chevron-right" />
                                        </IconButton>
                                    </div>
                                )
                            ) : (
                                <div className={styles.footer}>
                                    {content.items.length > 0 ? (
                                        <Pagination
                                            page={currentPage}
                                            pageSize={location.pageSize}
                                            total={content.items.length}
                                            pageSizeOptions={pageSizes}
                                            onPageChange={(page) => {
                                                setLocation((current) => ({ ...current, page }));
                                                setSelectedIds([]);
                                            }}
                                            onPageSizeChange={(pageSize) => go({ pageSize })}
                                        />
                                    ) : (
                                        <span className={styles.muted}>0 items</span>
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
                            )}
                            {selectedIds.length > 0 && (
                                <BulkActionBar
                                    className={styles.bulkActionBar}
                                    count={selectedIds.length}
                                    onClear={selection.clear}
                                    actions={[
                                        {
                                            label: "Move",
                                            icon: <Icon name="move" />,
                                            open: bulkMoveOpen,
                                            onOpenChange: setBulkMoveOpen,
                                            menu: (
                                                <MoveToFolderMenu
                                                    folders={folders}
                                                    isDisabled={(folderId) => !actions.canMove(selectedItems, folderId)}
                                                    onMove={(folderId, folderName) => handlers.menuActions.move(selectedItems, folderId, folderName)}
                                                />
                                            ),
                                        },
                                        { label: "Download", icon: <Icon name="download" />, onClick: () => actions.download(selectedItems) },
                                        location.smartFilter === "archived"
                                            ? {
                                                  label: "Restore",
                                                  icon: <Icon name="restore" />,
                                                  onClick: () => handlers.menuActions.setArchived(selectedItems, false),
                                              }
                                            : {
                                                  label: "Archive",
                                                  icon: <Icon name="archive" />,
                                                  onClick: () => handlers.menuActions.setArchived(selectedItems, true),
                                              },
                                        {
                                            label: "Delete",
                                            icon: <Icon name="trash" />,
                                            color: "error",
                                            onClick: () => handlers.menuActions.remove(selectedItems),
                                        },
                                    ]}
                                />
                            )}
                        </LibraryItemContext.Provider>
                    </Panel>
                </div>
            </div>
            <LibraryFilterDrawer
                open={filterOpen}
                onOpenChange={setFilterOpen}
                location={location}
                onChange={go}
                onSmartFilterChange={toggleSmartFilter}
                canIncludeSubfolders={mode !== "search" && mode !== "smartFilter"}
                onReset={() =>
                    go({
                        kind: null,
                        flat: false,
                        smartFilter: null,
                        folderId: location.smartFilter != null ? location.folderBeforeSmartFilter : location.folderId,
                    })
                }
            />
            {uploads.length > 0 && (
                <div className={styles.uploadTray} role="status" aria-label="Uploads">
                    <strong>
                        Uploading to{" "}
                        {quoteFolderNames(
                            folders,
                            uploads.map((item) => item.folderId),
                        )}
                    </strong>
                    {uploads.map((item) => (
                        <ProgressBar key={item.id} value={item.progress} label={item.name} size="small" />
                    ))}
                </div>
            )}
        </PageTypeShell>
    );
}
