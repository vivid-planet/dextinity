import { useMutation, useQuery } from "@apollo/client";
import { downloadFile, LocalErrorScopeApolloContext, useStoredState } from "@dextinity/admin";
import {
    AssetBrowser,
    type AssetBrowserView,
    Button,
    ConfirmDialog,
    FinderLayout,
    Icon,
    MenuItem,
    PageHeader,
    QuickLook,
    type QuickLookItem,
    Spinner,
    ToastViewport,
    useToasts,
} from "@dextinity/ui";
import { type MouseEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { useIntl } from "react-intl";
import { useHistory, useLocation, useRouteMatch } from "react-router";
import { useDebounce } from "use-debounce";

import { useDextinityConfig } from "../../config/DextinityConfigContext";
import { useContentScope } from "../../contentScope/Provider";
import { useContentScopeConfig } from "../../contentScope/useContentScopeConfig";
import { useDamBasePath, useDamConfig } from "../config/damConfig";
import { DamScopeProvider } from "../config/DamScopeProvider";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import { useDamScope } from "../config/useDamScope";
import { CurrentDamFolderProvider } from "../CurrentDamFolderProvider";
import { ManualDuplicatedFilenamesHandlerContextProvider } from "../DataGrid/duplicatedFilenames/ManualDuplicatedFilenamesHandler";
import { FileUploadContextProvider, useFileUploadContext } from "../DataGrid/fileUpload/FileUploadContext";
import { useDamFileUpload } from "../DataGrid/fileUpload/useDamFileUpload";
import { createAssetBrowserLabels, formatLimitedResultCount } from "./createAssetBrowserLabels";
import { DamFinderFileDetails, DamFinderFolderDetails, DamFinderSelectionDetails } from "./DamFinderDetails";
import type { DamFinderUnsavedChanges } from "./DamFinderFormState";
import { damFinderRootFolderId, getDamFinderLicenseStatus, getFileExtension, toAssetBrowserAsset, toAssetBrowserFolder } from "./damFinderItems";
import type { GQLDamFinderFileFragment } from "./damFinderItems.fragment.generated";
import { DamFinderMoveDialog } from "./DamFinderMoveDialog";
import { DamFinderNewFolderDialog } from "./DamFinderNewFolderDialog";
import {
    archiveDamFinderFilesMutation,
    createDamFinderFolderMutation,
    damFinderFileUsagesQuery,
    damFinderFoldersQuery,
    damFinderSearchQuery,
    deleteDamFinderFileMutation,
    deleteDamFinderFolderMutation,
    moveDamFinderFilesMutation,
    moveDamFinderFoldersMutation,
    restoreDamFinderFilesMutation,
} from "./DamFinderPage.gql";
import type {
    GQLArchiveDamFinderFilesMutation,
    GQLArchiveDamFinderFilesMutationVariables,
    GQLCreateDamFinderFolderMutation,
    GQLCreateDamFinderFolderMutationVariables,
    GQLDamFinderFileUsagesQuery,
    GQLDamFinderFileUsagesQueryVariables,
    GQLDamFinderFoldersQuery,
    GQLDamFinderFoldersQueryVariables,
    GQLDamFinderSearchQuery,
    GQLDamFinderSearchQueryVariables,
    GQLDeleteDamFinderFileMutation,
    GQLDeleteDamFinderFileMutationVariables,
    GQLDeleteDamFinderFolderMutation,
    GQLDeleteDamFinderFolderMutationVariables,
    GQLMoveDamFinderFilesMutation,
    GQLMoveDamFinderFilesMutationVariables,
    GQLMoveDamFinderFoldersMutation,
    GQLMoveDamFinderFoldersMutationVariables,
    GQLRestoreDamFinderFilesMutation,
    GQLRestoreDamFinderFilesMutationVariables,
} from "./DamFinderPage.gql.generated";
import { DetailsColumn, FinderBody, FinderDropzone } from "./DamFinderPage.sc";
import { DamFinderQuickLookPreview } from "./DamFinderQuickLookPreview";
import { DamFinderFilterMenu, type DamFinderLicenseFilter, DamFinderSelectionMenu } from "./DamFinderToolbarMenus";
import { LoadMoreSearchResultsButton } from "./LoadMoreSearchResultsButton";
import { useDamFinderFiles } from "./useDamFinderFiles";
import { useDamFinderWindowHeight } from "./useDamFinderWindowHeight";
import { useLoadMoreSearchResults } from "./useLoadMoreSearchResults";

const folderParam = "folder";
const searchPageSize = 100;

export interface DamFinderPageProps {
    /** The title of the page header. */
    title?: string;
    /** The label above the title. */
    eyebrow?: ReactNode;
    /** The URL of a file's full settings, e.g. in the `DamPage`. Without it, the details panel links nowhere. */
    editFileUrl?: (fileId: string) => string;
    /** The URL of the DAM settings, e.g. in the `DamPage`. They are only linked with `enableLicenseFeature` in the DAM config. */
    settingsUrl?: string;
    /**
     * Further actions in the page header, e.g. an import from an image service. They can upload with `useDamFileUpload` into the
     * folder of `useCurrentDamFolder`; the finder shows and selects what they uploaded. Defaults to `additionalToolbarItems` of the DAM
     * config.
     */
    additionalToolbarItems?: ReactNode;
}

/**
 * The assets as a finder built with `@dextinity/ui`: the folder tree, the folder's files as icons, a list, columns, or a gallery, a
 * search over all folders, a quick look on Space, and the details of the selection. Files and folders are uploaded by dropping them
 * onto the finder or with "Upload", and moved, downloaded, archived, restored, or deleted with the actions of the selection.
 */
export function DamFinderPage(props: DamFinderPageProps) {
    const { match } = useContentScope();
    const routeMatch = useRouteMatch();
    useContentScopeConfig({ redirectPathAfterChange: routeMatch.url.replace(match.url, "") });

    return (
        <DamScopeProvider>
            <FileUploadContextProvider>
                <ManualDuplicatedFilenamesHandlerContextProvider>
                    <DamFinderView {...props} />
                </ManualDuplicatedFilenamesHandlerContextProvider>
            </FileUploadContextProvider>
        </DamScopeProvider>
    );
}

function byName(first: { name: string }, second: { name: string }) {
    return first.name.localeCompare(second.name);
}

function isModifiedClick(event: MouseEvent<HTMLElement>) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function DamFinderView({ title, eyebrow, editFileUrl, settingsUrl, additionalToolbarItems }: DamFinderPageProps) {
    const intl = useIntl();
    const history = useHistory();
    const location = useLocation();
    const scope = useDamScope();
    const damConfig = useDamConfig();
    const { apiUrl } = useDextinityConfig();
    const damBasePath = useDamBasePath();
    const { allAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const { newlyUploadedItems } = useFileUploadContext();

    const [showArchived, setShowArchived] = useStoredState<boolean>("damFinderShowArchived", false);
    const [licenseFilter, setLicenseFilter] = useState<DamFinderLicenseFilter>("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search.trim(), 300);
    const [pendingMoveIds, setPendingMoveIds] = useState<string[]>();

    const [view, setView] = useStoredState<AssetBrowserView>("damFinderView", "icons");
    const [sidebarWidth, setSidebarWidth] = useStoredState<number | null>("damFinderSidebarWidth", null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [quickLookIndex, setQuickLookIndex] = useState<number>();
    const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>();
    const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
    const [detailsUnsavedChanges, setDetailsUnsavedChanges] = useState<DamFinderUnsavedChanges>();
    const [pendingSelectedIds, setPendingSelectedIds] = useState<string[]>();
    const [scrollToItemId, setScrollToItemId] = useState<string>();
    const layoutRef = useRef<HTMLDivElement>(null);
    const windowContentRef = useRef<HTMLDivElement>(null);
    const layoutStyle = useDamFinderWindowHeight({ layoutRef, windowContentRef });

    const foldersQuery = useQuery<GQLDamFinderFoldersQuery, GQLDamFinderFoldersQueryVariables>(damFinderFoldersQuery, { variables: { scope } });
    const [createFolder] = useMutation<GQLCreateDamFinderFolderMutation, GQLCreateDamFinderFolderMutationVariables>(createDamFinderFolderMutation);
    const [moveFiles] = useMutation<GQLMoveDamFinderFilesMutation, GQLMoveDamFinderFilesMutationVariables>(moveDamFinderFilesMutation);
    const [moveFolders] = useMutation<GQLMoveDamFinderFoldersMutation, GQLMoveDamFinderFoldersMutationVariables>(moveDamFinderFoldersMutation);
    const [deleteFile] = useMutation<GQLDeleteDamFinderFileMutation, GQLDeleteDamFinderFileMutationVariables>(deleteDamFinderFileMutation);
    const [deleteFolder] = useMutation<GQLDeleteDamFinderFolderMutation, GQLDeleteDamFinderFolderMutationVariables>(deleteDamFinderFolderMutation);
    const [archiveFiles] = useMutation<GQLArchiveDamFinderFilesMutation, GQLArchiveDamFinderFilesMutationVariables>(archiveDamFinderFilesMutation);
    const [restoreFiles] = useMutation<GQLRestoreDamFinderFilesMutation, GQLRestoreDamFinderFilesMutationVariables>(restoreDamFinderFilesMutation);

    const damFolders = useMemo(() => foldersQuery.data?.damFoldersFlat ?? [], [foldersQuery.data]);
    const damFolderById = useMemo(() => new Map(damFolders.map((folder) => [folder.id, folder])), [damFolders]);

    const folderIdParam = new URLSearchParams(location.search).get(folderParam);
    const folderId = folderIdParam != null && damFolderById.has(folderIdParam) ? folderIdParam : damFinderRootFolderId;

    const pathFolderIdsKey = useMemo(() => {
        const ids = [folderId];
        let parentId = damFolderById.get(folderId)?.parent?.id;
        while (parentId != null) {
            ids.unshift(parentId);
            parentId = damFolderById.get(parentId)?.parent?.id;
        }
        return [damFinderRootFolderId, ...ids.filter((id) => id !== damFinderRootFolderId)].join("/");
    }, [folderId, damFolderById]);
    const pathFolderIds = useMemo(() => pathFolderIdsKey.split("/"), [pathFolderIdsKey]);

    const { filesByFolderId, loadingFolderIds, error: filesError, reload } = useDamFinderFiles(pathFolderIds, { includeArchived: showArchived });

    const searchQuery = useQuery<GQLDamFinderSearchQuery, GQLDamFinderSearchQueryVariables>(damFinderSearchQuery, {
        variables: { scope, searchText: debouncedSearch, includeArchived: showArchived, limit: searchPageSize },
        skip: debouncedSearch === "",
        fetchPolicy: "network-only",
    });
    const searchPaging = useLoadMoreSearchResults(searchQuery, searchPageSize);
    const isSearching = search.trim() !== "";
    const isSearchLoading = isSearching && (debouncedSearch !== search.trim() || searchQuery.loading);
    const searchFiles = useMemo(
        () => (isSearching && debouncedSearch !== "" ? (searchQuery.data?.damFilesList.nodes ?? []) : []),
        [isSearching, debouncedSearch, searchQuery.data],
    );

    const isLicenseFilterEnabled = damConfig.enableLicenseFeature === true;
    const matchesLicenseFilter = useCallback(
        (file: GQLDamFinderFileFragment) => !isLicenseFilterEnabled || licenseFilter === "all" || getDamFinderLicenseStatus(file) === licenseFilter,
        [isLicenseFilterEnabled, licenseFilter],
    );

    const folders = useMemo(
        () => [
            {
                id: damFinderRootFolderId,
                name: intl.formatMessage({ id: "dextinity.damFinder.rootFolder", defaultMessage: "All assets" }),
                parentId: null,
            },
            ...damFolders.map((folder) => toAssetBrowserFolder(intl, folder)),
        ],
        [damFolders, intl],
    );
    const assets = useMemo(
        () =>
            Object.entries(filesByFolderId).flatMap(([id, files]) =>
                files.filter(matchesLicenseFilter).map((file) => toAssetBrowserAsset(intl, file, id)),
            ),
        [filesByFolderId, intl, matchesLicenseFilter],
    );
    const searchResults = useMemo(
        () => searchFiles.filter(matchesLicenseFilter).map((file) => toAssetBrowserAsset(intl, file, file.folder?.id ?? damFinderRootFolderId)),
        [searchFiles, intl, matchesLicenseFilter],
    );
    const currentFiles = useMemo(
        () =>
            isSearching ? searchFiles.filter(matchesLicenseFilter) : [...(filesByFolderId[folderId] ?? [])].filter(matchesLicenseFilter).sort(byName),
        [isSearching, searchFiles, filesByFolderId, folderId, matchesLicenseFilter],
    );
    const fileById = useMemo(
        () =>
            new Map<string, GQLDamFinderFileFragment>([
                ...Object.values(filesByFolderId).flatMap((files) => files.map((file) => [file.id, file] as const)),
                ...searchFiles.map((file) => [file.id, file] as const),
            ]),
        [filesByFolderId, searchFiles],
    );
    const searchFileFolderIds = useMemo(() => new Map(searchFiles.map((file) => [file.id, file.folder?.id ?? damFinderRootFolderId])), [searchFiles]);

    const selectedFile = selectedIds.length === 1 ? fileById.get(selectedIds[0]) : undefined;
    const selectedFolder = selectedIds.length === 1 ? damFolderById.get(selectedIds[0]) : undefined;

    const assetBrowserLabels = createAssetBrowserLabels(intl);
    const undoLabel = intl.formatMessage({ id: "dextinity.damFinder.undo", defaultMessage: "Undo" });
    const showError = useCallback((message: string) => addToast({ message, tone: "error" }), [addToast]);

    const changeFolder = (id: string) => {
        const searchParams = new URLSearchParams(location.search);
        if (id === damFinderRootFolderId) {
            searchParams.delete(folderParam);
        } else {
            searchParams.set(folderParam, id);
        }
        history.push({ ...location, search: searchParams.toString() });
    };

    const refresh = async (folderIds: string[]) => {
        await Promise.all([reload(folderIds), foldersQuery.refetch()]);
    };

    const {
        uploadFiles,
        dialogs: uploadDialogs,
        dropzoneConfig,
        maxFileSizeInBytes,
    } = useDamFileUpload({
        acceptedMimetypes: allAcceptedMimeTypes,
    });
    const upload = async (acceptedFiles: File[], fileRejections: FileRejection[] = []) => {
        await uploadFiles({ acceptedFiles, fileRejections }, { folderId: folderId === damFinderRootFolderId ? undefined : folderId });
    };
    const { getInputProps, open: openFileChooser } = useDropzone({
        ...dropzoneConfig,
        noClick: true,
        noDrag: true,
        onDrop: (acceptedFiles, fileRejections) => upload(acceptedFiles, fileRejections),
    });
    const { getInputProps: getFolderInputProps, open: openFolderChooser } = useDropzone({
        ...dropzoneConfig,
        noClick: true,
        noDrag: true,
        onDrop: (acceptedFiles, fileRejections) => upload(acceptedFiles, fileRejections),
    });

    // Uploads, also those of `additionalToolbarItems`, report the uploaded items through the upload context
    const handledUploadedItemIds = useRef(new Set<string>());
    useEffect(() => {
        const uploadedItems = newlyUploadedItems.filter((item) => !handledUploadedItemIds.current.has(item.id));
        if (uploadedItems.length === 0) {
            return;
        }
        for (const item of uploadedItems) {
            handledUploadedItemIds.current.add(item.id);
        }
        const parentFolderIds = uploadedItems.map((item) => item.parentId ?? damFinderRootFolderId);
        Promise.all([reload([folderId, ...parentFolderIds]), foldersQuery.refetch()]).then(() => {
            const idsInCurrentFolder = uploadedItems.filter((item) => (item.parentId ?? damFinderRootFolderId) === folderId).map((item) => item.id);
            if (idsInCurrentFolder.length > 0) {
                setSelectedIds(idsInCurrentFolder);
                setScrollToItemId(idsInCurrentFolder[0]);
            }
        });
        // Reacts only to new uploads; the folder and the loaders are read at that moment
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newlyUploadedItems]);
    const handleDroppedFiles = (files: File[]) => {
        const isAccepted = (file: File) => allAcceptedMimeTypes.includes(file.type) && file.size <= maxFileSizeInBytes;
        // The upload's error dialog reads only the file's name, type, and size of a rejection
        const toRejection = (file: File) => ({ file: file as FileRejection["file"], errors: [] });
        upload(files.filter(isAccepted), files.filter((file) => !isAccepted(file)).map(toRejection));
    };

    const moveItems = async ({ fileIds, folderIds, targetFolderId }: { fileIds: string[]; folderIds: string[]; targetFolderId: string }) => {
        const targetId = targetFolderId === damFinderRootFolderId ? null : targetFolderId;
        if (fileIds.length > 0) {
            await moveFiles({ variables: { fileIds, targetFolderId: targetId } });
        }
        if (folderIds.length > 0) {
            await moveFolders({ variables: { folderIds, targetFolderId: targetId, scope } });
        }
    };

    const getSourceFolderId = (id: string) =>
        damFolderById.get(id)?.parent?.id ??
        searchFileFolderIds.get(id) ??
        Object.entries(filesByFolderId).find(([, files]) => files.some((file) => file.id === id))?.[0] ??
        damFinderRootFolderId;

    const undoMove = async (ids: string[], sourceFolderIds: Map<string, string>, targetFolderId: string) => {
        const idsBySourceFolderId = new Map<string, string[]>();
        for (const id of ids) {
            const sourceFolderId = sourceFolderIds.get(id) ?? damFinderRootFolderId;
            idsBySourceFolderId.set(sourceFolderId, [...(idsBySourceFolderId.get(sourceFolderId) ?? []), id]);
        }
        try {
            for (const [sourceFolderId, sourceIds] of idsBySourceFolderId) {
                await moveItems({
                    fileIds: sourceIds.filter((id) => !damFolderById.has(id)),
                    folderIds: sourceIds.filter((id) => damFolderById.has(id)),
                    targetFolderId: sourceFolderId,
                });
            }
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.moveUndone", defaultMessage: "Moved {count, plural, one {# item} other {# items}} back" },
                    { count: ids.length },
                ),
                tone: "success",
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.damFinder.moveUndoFailed", defaultMessage: "The items couldn't be moved back" }));
        }
        await refresh([folderId, targetFolderId, ...idsBySourceFolderId.keys()]);
    };

    const handleMove = async (ids: string[], targetFolderId: string) => {
        const fileIds = ids.filter((id) => fileById.has(id));
        const folderIds = ids.filter((id) => damFolderById.has(id));
        const movedIds = [...fileIds, ...folderIds];
        const sourceFolderIds = new Map(movedIds.map((id) => [id, getSourceFolderId(id)]));
        try {
            await moveItems({ fileIds, folderIds, targetFolderId });
            setSelectedIds([]);
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.moved", defaultMessage: "Moved {count, plural, one {# item} other {# items}}" },
                    { count: movedIds.length },
                ),
                tone: "success",
                action: { label: undoLabel, onClick: () => undoMove(movedIds, sourceFolderIds, targetFolderId) },
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.damFinder.moveFailed", defaultMessage: "The items couldn't be moved" }));
        }
        await Promise.all([refresh([folderId, targetFolderId, ...sourceFolderIds.values()]), isSearching ? searchQuery.refetch() : undefined]);
    };

    const moveToChosenFolder = (targetFolderId: string) => {
        const ids = pendingMoveIds ?? [];
        setPendingMoveIds(undefined);
        handleMove(ids, targetFolderId);
    };

    const pendingDeleteFileIds = pendingDeleteIds?.filter((id) => fileById.has(id)) ?? [];
    const pendingDeleteFolderIds = pendingDeleteIds?.filter((id) => damFolderById.has(id)) ?? [];

    const pendingDeleteUsagesQuery = useQuery<GQLDamFinderFileUsagesQuery, GQLDamFinderFileUsagesQueryVariables>(damFinderFileUsagesQuery, {
        variables: { scope, ids: pendingDeleteFileIds },
        skip: pendingDeleteFileIds.length === 0,
        fetchPolicy: "network-only",
    });
    const pendingDeleteUsedFiles = (pendingDeleteUsagesQuery.data?.damFilesList.nodes ?? []).filter((file) => file.dependents.totalCount > 0);
    const pendingDeleteUsageCount = pendingDeleteUsedFiles.reduce((sum, file) => sum + file.dependents.totalCount, 0);

    const handleDelete = async () => {
        if (pendingDeleteIds == null) {
            return;
        }
        setPendingDeleteIds(undefined);
        const results = await Promise.allSettled([
            ...pendingDeleteFileIds.map((id) => deleteFile({ variables: { id } })),
            ...pendingDeleteFolderIds.map((id) => deleteFolder({ variables: { id } })),
        ]);
        const failedCount = results.filter((result) => result.status === "rejected").length;
        setSelectedIds([]);
        if (failedCount > 0) {
            showError(
                intl.formatMessage(
                    {
                        id: "dextinity.damFinder.deleteFailed",
                        defaultMessage: "{count, plural, one {# item} other {# items}} couldn't be deleted",
                    },
                    { count: failedCount },
                ),
            );
        } else {
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.deleted", defaultMessage: "Deleted {count, plural, one {# item} other {# items}}" },
                    { count: results.length },
                ),
                tone: "success",
            });
        }
        await Promise.all([refresh([folderId]), isSearching ? searchQuery.refetch() : undefined]);
    };

    const affectedFolderIds = (fileIds: string[]) => [folderId, ...fileIds.map(getSourceFolderId)];

    const restore = async (fileIds: string[]) => {
        try {
            await restoreFiles({ variables: { ids: fileIds } });
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.restored", defaultMessage: "Restored {count, plural, one {# file} other {# files}}" },
                    { count: fileIds.length },
                ),
                tone: "success",
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.damFinder.restoreFailed", defaultMessage: "The files couldn't be restored" }));
        }
        await Promise.all([refresh(affectedFolderIds(fileIds)), isSearching ? searchQuery.refetch() : undefined]);
    };

    const archive = async (archivedFileIds: string[]) => {
        try {
            await archiveFiles({ variables: { ids: archivedFileIds } });
            if (!showArchived) {
                setSelectedIds([]);
            }
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.archived", defaultMessage: "Archived {count, plural, one {# file} other {# files}}" },
                    { count: archivedFileIds.length },
                ),
                tone: "success",
                action: { label: undoLabel, onClick: () => restore(archivedFileIds) },
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.damFinder.archiveFailed", defaultMessage: "The files couldn't be archived" }));
        }
        await Promise.all([refresh(affectedFolderIds(archivedFileIds)), isSearching ? searchQuery.refetch() : undefined]);
    };

    const handleArchiveInsteadOfDelete = () => {
        const archivedFileIds = pendingDeleteFileIds;
        setPendingDeleteIds(undefined);
        archive(archivedFileIds);
    };

    const selectedFileIds = selectedIds.filter((id) => fileById.has(id));
    const selectedFolderIds = selectedIds.filter((id) => damFolderById.has(id));
    const selectedArchivedFileIds = selectedFileIds.filter((id) => fileById.get(id)?.archived);

    const downloadSelection = () => {
        if (selectedFileIds.length === 0 && selectedFolderIds.length === 1) {
            window.open(`${apiUrl}/${damBasePath}/folders/${selectedFolderIds[0]}/zip`, "_blank", "noopener");
            return;
        }
        for (const id of selectedFileIds) {
            const file = fileById.get(id);
            if (file != null) {
                downloadFile(file.fileUrl, file.name);
            }
        }
        if (selectedFolderIds.length > 0) {
            addToast({
                message: intl.formatMessage({
                    id: "dextinity.damFinder.download.foldersSkipped",
                    defaultMessage: "Only the files are downloaded. Download a folder on its own to get it as a ZIP.",
                }),
                tone: "info",
            });
        }
    };

    const handleCreateFolder = async (name: string) => {
        try {
            const { data } = await createFolder({
                variables: {
                    input: { name, parentId: folderId === damFinderRootFolderId ? undefined : folderId },
                    scope,
                },
                context: LocalErrorScopeApolloContext,
            });
            setIsNewFolderDialogOpen(false);
            await foldersQuery.refetch();
            if (data != null) {
                setSelectedIds([data.createDamFolder.id]);
            }
            return undefined;
        } catch {
            const message = intl.formatMessage({ id: "dextinity.damFinder.createFolderFailed", defaultMessage: "The folder couldn't be created" });
            showError(message);
            return message;
        }
    };

    const changeSelection = (ids: string[]) => {
        const keepsDetailsItem = ids.length === 1 && selectedIds.length === 1 && ids[0] === selectedIds[0];
        if (detailsUnsavedChanges != null && !keepsDetailsItem) {
            setPendingSelectedIds(ids);
        } else {
            setSelectedIds(ids);
        }
    };
    const discardAndApplyPendingSelection = () => {
        detailsUnsavedChanges?.discard();
        if (pendingSelectedIds != null) {
            setSelectedIds(pendingSelectedIds);
        }
        setPendingSelectedIds(undefined);
    };
    const saveAndApplyPendingSelection = async () => {
        const nextSelectedIds = pendingSelectedIds;
        setPendingSelectedIds(undefined);
        const isSaved = (await detailsUnsavedChanges?.save()) ?? true;
        if (isSaved && nextSelectedIds != null) {
            setSelectedIds(nextSelectedIds);
        }
    };

    const openQuickLook = (fileId: string) => {
        const index = currentFiles.findIndex((file) => file.id === fileId);
        if (index !== -1) {
            setQuickLookIndex(index);
        }
    };
    const quickLookItems = currentFiles.map((file): QuickLookItem => ({
        src: file.fileUrl,
        title: file.name,
        alt: file.altText ?? undefined,
        description: [
            getFileExtension(file.name),
            file.image != null ? `${file.image.width} × ${file.image.height}` : undefined,
            file.title ?? undefined,
        ]
            .filter((part) => part != null)
            .join(" · "),
    }));
    const contextMenuItems = (ids: string[]) => {
        const fileEditUrl = ids.length === 1 && fileById.has(ids[0]) ? editFileUrl?.(ids[0]) : undefined;
        if (fileEditUrl == null) {
            return null;
        }
        return (
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.damFinder.contextMenu.edit", defaultMessage: "Edit" })}
                icon={<Icon name="edit" />}
                onClick={() => history.push(fileEditUrl)}
            />
        );
    };

    const quickLookFile = quickLookIndex != null ? currentFiles[quickLookIndex] : undefined;
    const quickLookEditUrl = quickLookFile != null ? editFileUrl?.(quickLookFile.id) : undefined;
    const renderQuickLookPreview = (item: QuickLookItem) => {
        const file = quickLookFile;
        if (file == null) {
            return <img src={item.src} alt={item.alt ?? item.title} />;
        }
        return <DamFinderQuickLookPreview key={file.id} file={file} />;
    };

    if (foldersQuery.error != null) {
        throw foldersQuery.error;
    }
    if (filesError != null) {
        throw filesError;
    }

    const isCurrentFolderLoading = loadingFolderIds.includes(folderId) || foldersQuery.loading;
    const shownAdditionalToolbarItems = additionalToolbarItems ?? damConfig.additionalToolbarItems;
    const isSettingsLinkShown = settingsUrl != null && damConfig.enableLicenseFeature === true;

    const renderDetails = () => {
        if (selectedFile != null) {
            return (
                <DamFinderFileDetails
                    key={selectedFile.id}
                    file={selectedFile}
                    editUrl={editFileUrl?.(selectedFile.id)}
                    onQuickLook={() => openQuickLook(selectedFile.id)}
                    onChange={() => reload([folderId])}
                    onError={showError}
                    onUnsavedChangesChange={setDetailsUnsavedChanges}
                />
            );
        }
        if (selectedFolder != null) {
            return (
                <DamFinderFolderDetails
                    key={selectedFolder.id}
                    folder={selectedFolder}
                    onOpen={() => changeFolder(selectedFolder.id)}
                    onChange={() => foldersQuery.refetch()}
                    onError={showError}
                    onUnsavedChangesChange={setDetailsUnsavedChanges}
                />
            );
        }
        return <DamFinderSelectionDetails count={selectedIds.length} />;
    };

    return (
        <CurrentDamFolderProvider folderId={folderId === damFinderRootFolderId ? undefined : folderId}>
            <FinderLayout
                ref={layoutRef}
                style={layoutStyle}
                header={
                    <PageHeader
                        eyebrow={eyebrow}
                        title={title ?? intl.formatMessage({ id: "dextinity.damFinder.title", defaultMessage: "Assets" })}
                        subtitle={
                            foldersQuery.data != null
                                ? intl.formatMessage(
                                      {
                                          id: "dextinity.damFinder.subtitle",
                                          defaultMessage:
                                              "{files, plural, one {# file} other {# files}} in {folders, plural, one {# folder} other {# folders}}",
                                      },
                                      {
                                          files: damFolders.reduce(
                                              (sum, folder) => sum + folder.numberOfFiles,
                                              filesByFolderId[damFinderRootFolderId]?.length ?? 0,
                                          ),
                                          folders: damFolders.length,
                                      },
                                  )
                                : undefined
                        }
                        actions={
                            <>
                                {shownAdditionalToolbarItems}
                                {isSettingsLinkShown && (
                                    <Button
                                        variant="text"
                                        color="secondary"
                                        startIcon={<Icon name="gear" />}
                                        href={settingsUrl}
                                        onClick={(event: MouseEvent<HTMLElement>) => {
                                            if (!isModifiedClick(event)) {
                                                event.preventDefault();
                                                history.push(settingsUrl);
                                            }
                                        }}
                                    >
                                        {intl.formatMessage({ id: "dextinity.damFinder.settings", defaultMessage: "Settings" })}
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<Icon name="folder-add" />}
                                    onClick={() => setIsNewFolderDialogOpen(true)}
                                >
                                    {intl.formatMessage({ id: "dextinity.damFinder.newFolder", defaultMessage: "New folder" })}
                                </Button>
                                <Button variant="outlined" color="secondary" startIcon={<Icon name="folder-import" />} onClick={openFolderChooser}>
                                    {intl.formatMessage({ id: "dextinity.damFinder.uploadFolder", defaultMessage: "Upload folder" })}
                                </Button>
                                <Button startIcon={<Icon name="cloud-upload" />} onClick={openFileChooser}>
                                    {intl.formatMessage({ id: "dextinity.damFinder.upload", defaultMessage: "Upload" })}
                                </Button>
                                <input {...getInputProps()} />
                                <input {...getFolderInputProps()} webkitdirectory="webkitdirectory" directory="directory" />
                            </>
                        }
                    />
                }
            >
                <FinderDropzone
                    ref={windowContentRef}
                    overlay
                    onFiles={handleDroppedFiles}
                    labels={{
                        title: intl.formatMessage({ id: "dextinity.damFinder.dropzone.title", defaultMessage: "Drag files here" }),
                        or: intl.formatMessage({ id: "dextinity.damFinder.dropzone.or", defaultMessage: "or" }),
                        browse: intl.formatMessage({ id: "dextinity.damFinder.dropzone.browse", defaultMessage: "choose files" }),
                        drop: intl.formatMessage(
                            { id: "dextinity.damFinder.dropzone.drop", defaultMessage: "Drop files to upload them to “{folder}”" },
                            { folder: folders.find((folder) => folder.id === folderId)?.name },
                        ),
                    }}
                >
                    <FinderBody>
                        <AssetBrowser
                            folders={folders}
                            assets={assets}
                            folderId={folderId}
                            onFolderChange={changeFolder}
                            view={view}
                            onViewChange={setView}
                            sidebarWidth={typeof sidebarWidth === "number" ? sidebarWidth : undefined}
                            onSidebarWidthChange={(width) => setSidebarWidth(width ?? null)}
                            selectedIds={selectedIds}
                            onSelectionChange={changeSelection}
                            onOpen={(asset) => openQuickLook(asset.id)}
                            onQuickLook={(asset) => openQuickLook(asset.id)}
                            onMove={handleMove}
                            onDelete={setPendingDeleteIds}
                            contextMenuItems={contextMenuItems}
                            scrollToItemId={scrollToItemId}
                            search={search}
                            onSearchChange={setSearch}
                            searchResults={searchResults}
                            searchLoading={isSearchLoading}
                            toolbar={
                                <>
                                    {!isSearching && isCurrentFolderLoading && (
                                        <Spinner
                                            size="small"
                                            aria-label={intl.formatMessage({ id: "dextinity.damFinder.loading", defaultMessage: "Loading" })}
                                        />
                                    )}
                                    {isSearching && !isSearchLoading && searchPaging.hasMore && (
                                        <LoadMoreSearchResultsButton onClick={searchPaging.loadMore} loading={searchPaging.isLoadingMore} />
                                    )}
                                    <DamFinderFilterMenu
                                        showArchived={showArchived}
                                        onShowArchivedChange={setShowArchived}
                                        licenseFilter={isLicenseFilterEnabled ? licenseFilter : undefined}
                                        onLicenseFilterChange={setLicenseFilter}
                                    />
                                    <DamFinderSelectionMenu
                                        fileCount={selectedFileIds.length}
                                        folderCount={selectedFolderIds.length}
                                        archivedFileCount={selectedArchivedFileIds.length}
                                        onMove={() => setPendingMoveIds([...selectedFileIds, ...selectedFolderIds])}
                                        onDownload={downloadSelection}
                                        onArchive={() => archive(selectedFileIds.filter((id) => !fileById.get(id)?.archived))}
                                        onRestore={() => restore(selectedArchivedFileIds)}
                                        onDelete={() => setPendingDeleteIds([...selectedFileIds, ...selectedFolderIds])}
                                    />
                                </>
                            }
                            labels={{
                                ...assetBrowserLabels,
                                resultCount: (count) =>
                                    searchPaging.hasMore
                                        ? formatLimitedResultCount(intl, searchPaging.loadedCount, searchPaging.totalCount)
                                        : (assetBrowserLabels.resultCount?.(count) ?? ""),
                            }}
                        />
                        <DetailsColumn>{renderDetails()}</DetailsColumn>
                    </FinderBody>
                </FinderDropzone>
            </FinderLayout>
            <QuickLook
                open={quickLookIndex != null}
                onOpenChange={(open) => {
                    if (!open) {
                        setQuickLookIndex(undefined);
                    }
                }}
                items={quickLookItems}
                index={quickLookIndex ?? 0}
                onIndexChange={(index) => {
                    setQuickLookIndex(index);
                    changeSelection([currentFiles[index].id]);
                }}
                renderPreview={renderQuickLookPreview}
                actions={
                    quickLookEditUrl != null && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<Icon name="edit" />}
                            href={quickLookEditUrl}
                            onClick={(event: MouseEvent<HTMLElement>) => {
                                const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
                                if (!isModifiedClick) {
                                    event.preventDefault();
                                    setQuickLookIndex(undefined);
                                    history.push(quickLookEditUrl);
                                }
                            }}
                        >
                            {intl.formatMessage({ id: "dextinity.damFinder.details.edit", defaultMessage: "All settings" })}
                        </Button>
                    )
                }
                labels={{
                    close: intl.formatMessage({ id: "dextinity.damFinder.quickLook.close", defaultMessage: "Close" }),
                    previous: intl.formatMessage({ id: "dextinity.damFinder.quickLook.previous", defaultMessage: "Previous" }),
                    next: intl.formatMessage({ id: "dextinity.damFinder.quickLook.next", defaultMessage: "Next" }),
                    browse: intl.formatMessage({ id: "dextinity.damFinder.quickLook.browse", defaultMessage: "Browse" }),
                    closeKey: intl.formatMessage({ id: "dextinity.damFinder.quickLook.closeKey", defaultMessage: "Space" }),
                    position: (index, count) =>
                        intl.formatMessage(
                            { id: "dextinity.damFinder.quickLook.position", defaultMessage: "{index} / {count}" },
                            { index: index + 1, count },
                        ),
                }}
            />
            <ConfirmDialog
                open={pendingDeleteIds != null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingDeleteIds(undefined);
                    }
                }}
                tone="danger"
                title={intl.formatMessage(
                    { id: "dextinity.damFinder.delete.title", defaultMessage: "Delete {count, plural, one {# item} other {# items}}?" },
                    { count: pendingDeleteIds?.length ?? 0 },
                )}
                description={[
                    pendingDeleteUsedFiles.length > 0
                        ? intl.formatMessage(
                              {
                                  id: "dextinity.damFinder.delete.inUse",
                                  defaultMessage:
                                      "{files, plural, one {# file is} other {# files are}} still used {usages, plural, one {# time} other {# times}}, e.g. on pages. These places lose the file.",
                              },
                              { files: pendingDeleteUsedFiles.length, usages: pendingDeleteUsageCount },
                          )
                        : undefined,
                    intl.formatMessage({
                        id: "dextinity.damFinder.delete.description",
                        defaultMessage:
                            "Deleted files and folders, including everything inside them, can't be restored. Archived files stay available with the filter “Show archived files”.",
                    }),
                ]
                    .filter((part) => part != null)
                    .join(" ")}
                confirmLabel={intl.formatMessage({ id: "dextinity.damFinder.delete.confirm", defaultMessage: "Delete" })}
                confirmIcon={<Icon name="trash" />}
                onConfirm={handleDelete}
                secondaryLabel={
                    pendingDeleteFolderIds.length === 0
                        ? intl.formatMessage({ id: "dextinity.damFinder.delete.archive", defaultMessage: "Archive instead" })
                        : undefined
                }
                onSecondary={pendingDeleteFolderIds.length === 0 ? handleArchiveInsteadOfDelete : undefined}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.damFinder.delete.cancel", defaultMessage: "Cancel" }) }}
            />
            <DamFinderMoveDialog
                open={pendingMoveIds != null}
                onClose={() => setPendingMoveIds(undefined)}
                folders={folders}
                count={pendingMoveIds?.length ?? 0}
                movedFolderIds={pendingMoveIds?.filter((id) => damFolderById.has(id)) ?? []}
                sourceFolderId={isSearching ? undefined : folderId}
                onMove={moveToChosenFolder}
            />
            <DamFinderNewFolderDialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen} onCreate={handleCreateFolder} />
            <ConfirmDialog
                open={pendingSelectedIds != null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingSelectedIds(undefined);
                    }
                }}
                title={intl.formatMessage({ id: "dextinity.damFinder.unsavedChanges.title", defaultMessage: "Unsaved changes" })}
                description={intl.formatMessage({
                    id: "dextinity.damFinder.unsavedChanges.description",
                    defaultMessage: "Save them before you select something else?",
                })}
                secondaryLabel={intl.formatMessage({ id: "dextinity.damFinder.unsavedChanges.discard", defaultMessage: "Discard" })}
                onSecondary={discardAndApplyPendingSelection}
                confirmLabel={intl.formatMessage({ id: "dextinity.damFinder.unsavedChanges.save", defaultMessage: "Save and continue" })}
                onConfirm={saveAndApplyPendingSelection}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.damFinder.unsavedChanges.cancel", defaultMessage: "Cancel" }) }}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.damFinder.notifications", defaultMessage: "Notifications" }) }}
            />
            {uploadDialogs}
        </CurrentDamFolderProvider>
    );
}
