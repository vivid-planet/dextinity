import { useApolloClient, useQuery } from "@apollo/client";
import { useStoredState } from "@dextinity/admin";
import { AssetBrowser, type AssetBrowserView, Button, Dialog, EmptyState, Icon, Spinner } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { useIntl } from "react-intl";
import { useDebounce } from "use-debounce";

import { DamScopeProvider } from "../../../dam/config/DamScopeProvider";
import { useDamAcceptedMimeTypes } from "../../../dam/config/useDamAcceptedMimeTypes";
import { useDamScope } from "../../../dam/config/useDamScope";
import { ManualDuplicatedFilenamesHandlerContextProvider } from "../../../dam/DataGrid/duplicatedFilenames/ManualDuplicatedFilenamesHandler";
import { FileUploadContextProvider } from "../../../dam/DataGrid/fileUpload/FileUploadContext";
import { useDamFileUpload } from "../../../dam/DataGrid/fileUpload/useDamFileUpload";
import { createAssetBrowserLabels, formatLimitedResultCount } from "../../../dam/finder/createAssetBrowserLabels";
import { damFinderRootFolderId, toAssetBrowserAsset, toAssetBrowserFolder } from "../../../dam/finder/damFinderItems";
import { LoadMoreSearchResultsButton } from "../../../dam/finder/LoadMoreSearchResultsButton";
import { useDamFinderFiles } from "../../../dam/finder/useDamFinderFiles";
import { useLoadMoreSearchResults } from "../../../dam/finder/useLoadMoreSearchResults";
import { damFilePickerFoldersQuery, damFilePickerInitialFileFolderQuery, damFilePickerSearchQuery } from "./DamFilePickerDialog.gql";
import type {
    GQLDamFilePickerFoldersQuery,
    GQLDamFilePickerFoldersQueryVariables,
    GQLDamFilePickerInitialFileFolderQuery,
    GQLDamFilePickerInitialFileFolderQueryVariables,
    GQLDamFilePickerSearchQuery,
    GQLDamFilePickerSearchQueryVariables,
} from "./DamFilePickerDialog.gql.generated";

const searchPageSize = 100;
// Nested folder names need more room than the theme's default width of the folder tree
const defaultSidebarWidth = 280;

export interface DamFilePickerDialogProps {
    open: boolean;
    onClose: () => void;
    /** Called with the ids of the chosen files: one, or with `multiple` any number, in the order they were selected. */
    onChoose: (fileIds: string[]) => void | Promise<void>;
    /** Lets several files be chosen, also from different folders. */
    multiple?: boolean;
    /** The files selected when the dialog opens, e.g. the field's current value. */
    initialFileIds?: string[];
    /**
     * The folder shown when the dialog opens, `null` for the root, e.g. the folder of the field's current file. Without it, the dialog
     * opens the folder of the first of `initialFileIds`, or else the folder shown last.
     */
    initialFolderId?: string | null;
    /** Offers only files of these MIME types, and only accepts them for upload. */
    allowedMimetypes?: string[];
    /** The title; by default "Select file" or "Select files". */
    title?: string;
}

/**
 * A dialog to choose files from the assets, built with `@dextinity/ui`: the folder tree and the folder's files as in the asset finder,
 * and an upload into the open folder. The last folder is remembered per scope.
 */
export function DamFilePickerDialog(props: DamFilePickerDialogProps) {
    return (
        <DamScopeProvider>
            <FileUploadContextProvider>
                <ManualDuplicatedFilenamesHandlerContextProvider>
                    <DamFilePickerDialogContent {...props} />
                </ManualDuplicatedFilenamesHandlerContextProvider>
            </FileUploadContextProvider>
        </DamScopeProvider>
    );
}

function DamFilePickerDialogContent({
    open,
    onClose,
    onChoose,
    multiple,
    initialFileIds,
    initialFolderId,
    allowedMimetypes,
    title,
}: DamFilePickerDialogProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const scope = useDamScope();
    const { allAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const scopeKey = Object.values(scope).join("-");

    const [view, setView] = useStoredState<AssetBrowserView>("damFilePickerView", "icons");
    const [sidebarWidth, setSidebarWidth] = useStoredState<number | null>("damFilePickerSidebarWidth", null);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search.trim(), 300);
    const isClosingSearchRef = useRef(false);
    const [storedFolderId, setStoredFolderId] = useStoredState<string>(`damFilePickerFolder-${scopeKey}`, damFinderRootFolderId);
    const [selectedFileIds, setSelectedFileIds] = useState<string[]>(initialFileIds ?? []);
    const [isChoosing, setIsChoosing] = useState(false);

    const openCountRef = useRef(0);
    const openFolderOfFile = async (fileId: string, openCount: number) => {
        try {
            const { data } = await client.query<GQLDamFilePickerInitialFileFolderQuery, GQLDamFilePickerInitialFileFolderQueryVariables>({
                query: damFilePickerInitialFileFolderQuery,
                variables: { id: fileId },
            });
            if (openCountRef.current === openCount) {
                setStoredFolderId(data.damFile.folder?.id ?? damFinderRootFolderId);
            }
        } catch {
            // The folder shown last stays open when the file's folder can't be looked up
        }
    };
    useEffect(() => {
        if (!open) {
            return;
        }
        openCountRef.current += 1;
        const openCount = openCountRef.current;
        setSelectedFileIds(initialFileIds ?? []);
        setSearch("");

        if (initialFolderId !== undefined) {
            setStoredFolderId(initialFolderId ?? damFinderRootFolderId);
        } else if (initialFileIds != null && initialFileIds.length > 0) {
            openFolderOfFile(initialFileIds[0], openCount);
        }
        // Only reset the selection and the folder when the dialog opens, not when the caller passes a new array for the same files
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const foldersQuery = useQuery<GQLDamFilePickerFoldersQuery, GQLDamFilePickerFoldersQueryVariables>(damFilePickerFoldersQuery, {
        variables: { scope },
        skip: !open,
    });
    const damFolders = useMemo(() => foldersQuery.data?.damFoldersFlat ?? [], [foldersQuery.data]);
    const damFolderById = useMemo(() => new Map(damFolders.map((folder) => [folder.id, folder])), [damFolders]);
    const folderId = storedFolderId === damFinderRootFolderId || damFolderById.has(storedFolderId) ? storedFolderId : damFinderRootFolderId;

    const pathFolderIdsKey = useMemo(() => {
        const ids = [folderId];
        let parentId = damFolderById.get(folderId)?.parent?.id;
        while (parentId != null) {
            ids.unshift(parentId);
            parentId = damFolderById.get(parentId)?.parent?.id;
        }
        return [damFinderRootFolderId, ...ids.filter((id) => id !== damFinderRootFolderId)].join("/");
    }, [folderId, damFolderById]);
    const pathFolderIds = useMemo(() => (open ? pathFolderIdsKey.split("/") : []), [open, pathFolderIdsKey]);
    const { filesByFolderId, loadingFolderIds, error: filesError, reload } = useDamFinderFiles(pathFolderIds);

    const searchQuery = useQuery<GQLDamFilePickerSearchQuery, GQLDamFilePickerSearchQueryVariables>(damFilePickerSearchQuery, {
        variables: { scope, searchText: debouncedSearch, mimetypes: allowedMimetypes, limit: searchPageSize },
        skip: !open || debouncedSearch === "",
        fetchPolicy: "network-only",
    });
    const searchPaging = useLoadMoreSearchResults(searchQuery, searchPageSize);
    const isSearching = search.trim() !== "";
    const isSearchLoading = isSearching && (debouncedSearch !== search.trim() || searchQuery.loading);
    const searchResults = useMemo(
        () =>
            isSearching && debouncedSearch !== ""
                ? (searchQuery.data?.damFilesList.nodes ?? []).map((file) =>
                      toAssetBrowserAsset(intl, file, file.folder?.id ?? damFinderRootFolderId),
                  )
                : [],
        [isSearching, debouncedSearch, searchQuery.data, intl],
    );

    const isAllowed = (mimetype: string) => allowedMimetypes == null || allowedMimetypes.includes(mimetype);
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
    const allowedMimetypesKey = allowedMimetypes?.join(",");
    const assets = useMemo(
        () =>
            Object.entries(filesByFolderId).flatMap(([id, files]) =>
                files
                    .filter((file) => allowedMimetypesKey == null || allowedMimetypesKey.split(",").includes(file.mimetype))
                    .map((file) => toAssetBrowserAsset(intl, file, id)),
            ),
        [filesByFolderId, intl, allowedMimetypesKey],
    );
    const visibleAssetIds = useMemo(
        () => new Set((isSearching ? searchResults : assets.filter((asset) => asset.folderId === folderId)).map((asset) => asset.id)),
        [isSearching, searchResults, assets, folderId],
    );
    const knownAssetIds = useMemo(() => new Set([...assets, ...searchResults].map((asset) => asset.id)), [assets, searchResults]);

    useEffect(() => {
        isClosingSearchRef.current = false;
    }, [search]);
    const changeSearch = (nextSearch: string) => {
        isClosingSearchRef.current = isSearching && nextSearch.trim() === "";
        setSearch(nextSearch);
    };

    const changeSelection = (ids: string[]) => {
        const fileIds = ids.filter((id) => knownAssetIds.has(id));
        // Opening a folder from the search results selects only what leads to the result; the files chosen in the search stay selected
        if (isClosingSearchRef.current) {
            isClosingSearchRef.current = false;
            if (fileIds.length > 0) {
                setSelectedFileIds(multiple ? [...selectedFileIds.filter((id) => !fileIds.includes(id)), ...fileIds] : [fileIds[0]]);
            }
            return;
        }
        if (!multiple) {
            const addedFileId = fileIds.find((id) => !selectedFileIds.includes(id)) ?? fileIds[fileIds.length - 1];
            setSelectedFileIds(addedFileId != null ? [addedFileId] : []);
            return;
        }
        const keptFromOtherFolders = selectedFileIds.filter((id) => !visibleAssetIds.has(id));
        const keptInFolder = selectedFileIds.filter((id) => fileIds.includes(id));
        const added = fileIds.filter((id) => !selectedFileIds.includes(id));
        setSelectedFileIds([...keptFromOtherFolders, ...keptInFolder, ...added]);
    };

    const choose = async (fileIds: string[]) => {
        setIsChoosing(true);
        try {
            await onChoose(fileIds);
        } finally {
            setIsChoosing(false);
        }
    };

    const acceptedMimetypes = allowedMimetypes != null ? allAcceptedMimeTypes.filter(isAllowed) : allAcceptedMimeTypes;
    const { uploadFiles, dialogs: uploadDialogs, dropzoneConfig } = useDamFileUpload({ acceptedMimetypes });
    const [isUploading, setIsUploading] = useState(false);
    const [scrollToItemId, setScrollToItemId] = useState<string>();
    const upload = async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        setIsUploading(true);
        try {
            const { uploadedItems } = await uploadFiles(
                { acceptedFiles, fileRejections },
                { folderId: folderId === damFinderRootFolderId ? undefined : folderId },
            );
            await Promise.all([reload([folderId]), foldersQuery.refetch()]);
            const uploadedFileIds = uploadedItems.filter((item) => item.type === "file").map((item) => item.id);
            if (uploadedFileIds.length > 0) {
                setSearch("");
                setSelectedFileIds((ids) =>
                    multiple ? [...ids.filter((id) => !uploadedFileIds.includes(id)), ...uploadedFileIds] : [uploadedFileIds[0]],
                );
                setScrollToItemId(uploadedFileIds[0]);
            }
        } finally {
            setIsUploading(false);
        }
    };
    const { getInputProps, open: openFileChooser } = useDropzone({
        ...dropzoneConfig,
        multiple: Boolean(multiple),
        noClick: true,
        noDrag: true,
        onDrop: (acceptedFiles, fileRejections) => upload(acceptedFiles, fileRejections),
    });

    const isCurrentFolderLoading = loadingFolderIds.includes(folderId) || foldersQuery.loading;
    const error = foldersQuery.error ?? filesError;
    const searchError = isSearching ? searchQuery.error : undefined;
    const assetBrowserLabels = createAssetBrowserLabels(intl);

    const renderContent = (): ReactNode => {
        if (error) {
            return (
                <EmptyState
                    icon={<Icon name="warning" />}
                    title={intl.formatMessage({ id: "dextinity.form.file.picker.error", defaultMessage: "The assets couldn't be loaded" })}
                    description={error.message}
                />
            );
        }
        if (searchError) {
            return (
                <EmptyState
                    icon={<Icon name="warning" />}
                    title={intl.formatMessage({ id: "dextinity.form.file.picker.searchError", defaultMessage: "The search failed" })}
                    description={searchError.message}
                    actions={
                        <Button variant="outlined" color="secondary" onClick={() => setSearch("")}>
                            {assetBrowserLabels.clearSearch}
                        </Button>
                    }
                />
            );
        }
        return (
            <AssetBrowser
                mode="pick"
                folders={folders}
                assets={assets}
                folderId={folderId}
                onFolderChange={setStoredFolderId}
                view={view}
                onViewChange={setView}
                scrollToItemId={scrollToItemId}
                search={search}
                onSearchChange={changeSearch}
                searchResults={searchResults}
                searchLoading={isSearchLoading}
                sidebarWidth={typeof sidebarWidth === "number" ? sidebarWidth : defaultSidebarWidth}
                onSidebarWidthChange={(width) => setSidebarWidth(width ?? null)}
                selectedIds={selectedFileIds}
                onSelectionChange={changeSelection}
                onOpen={(asset) => {
                    if (!multiple) {
                        choose([asset.id]);
                    }
                }}
                toolbar={
                    <>
                        {((!isSearching && isCurrentFolderLoading) || isUploading) && (
                            <Spinner size="small" aria-label={intl.formatMessage({ id: "dextinity.damFinder.loading", defaultMessage: "Loading" })} />
                        )}
                        {isSearching && !isSearchLoading && searchPaging.hasMore && (
                            <LoadMoreSearchResultsButton onClick={searchPaging.loadMore} loading={searchPaging.isLoadingMore} />
                        )}
                        <input {...getInputProps()} />
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<Icon name="upload" />}
                            onClick={openFileChooser}
                            disabled={isUploading}
                        >
                            {intl.formatMessage({ id: "dextinity.damFinder.upload", defaultMessage: "Upload" })}
                        </Button>
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
        );
    };

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        onClose();
                    }
                }}
                dismissible={!isChoosing}
                size="large"
                title={
                    title ??
                    (multiple
                        ? intl.formatMessage({ id: "dextinity.form.file.selectFiles", defaultMessage: "Select files from DAM" })
                        : intl.formatMessage({ id: "dextinity.form.file.selectFile", defaultMessage: "Select file from DAM" }))
                }
                labels={{ close: intl.formatMessage({ id: "dextinity.generic.close", defaultMessage: "Close" }) }}
                footer={
                    <>
                        <Button variant="text" color="secondary" onClick={onClose} disabled={isChoosing}>
                            {intl.formatMessage({ id: "dextinity.generic.cancel", defaultMessage: "Cancel" })}
                        </Button>
                        <Button disabled={selectedFileIds.length === 0 || isChoosing} onClick={() => choose(selectedFileIds)}>
                            {multiple
                                ? intl.formatMessage(
                                      {
                                          id: "dextinity.form.file.applyFileSelection",
                                          defaultMessage: "Select {count, plural, one {# file} other {# files}}",
                                      },
                                      { count: selectedFileIds.length },
                                  )
                                : intl.formatMessage({ id: "dextinity.form.file.picker.select", defaultMessage: "Select" })}
                        </Button>
                    </>
                }
            >
                <Content>{renderContent()}</Content>
            </Dialog>
            {uploadDialogs}
        </>
    );
}

const Content = styled("div")`
    block-size: min(62vh, 620px);

    > .dextinityAssetBrowser {
        --dextinity-asset-browser-height: 100%;
    }
`;
