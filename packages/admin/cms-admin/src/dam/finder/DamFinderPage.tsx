import { useMutation, useQuery } from "@apollo/client";
import { useStoredState } from "@dextinity/admin";
import {
    AssetBrowser,
    type AssetBrowserLabels,
    type AssetBrowserView,
    AssetThumbnail,
    Button,
    ConfirmDialog,
    Dialog,
    FinderLayout,
    Icon,
    Input,
    PageHeader,
    QuickLook,
    type QuickLookItem,
    Spinner,
    ToastViewport,
    useToasts,
} from "@dextinity/ui";
import { type FormEvent, type ReactNode, useCallback, useMemo, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { type IntlShape, useIntl } from "react-intl";
import { useHistory, useLocation, useRouteMatch } from "react-router";

import { useContentScope } from "../../contentScope/Provider";
import { useContentScopeConfig } from "../../contentScope/useContentScopeConfig";
import { DamScopeProvider } from "../config/DamScopeProvider";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import { useDamScope } from "../config/useDamScope";
import { ManualDuplicatedFilenamesHandlerContextProvider } from "../DataGrid/duplicatedFilenames/ManualDuplicatedFilenamesHandler";
import { FileUploadContextProvider } from "../DataGrid/fileUpload/FileUploadContext";
import { useDamFileUpload } from "../DataGrid/fileUpload/useDamFileUpload";
import { moveDamFilesMutation, moveDamFoldersMutation } from "../DataGrid/FolderDataGrid";
import type {
    GQLMoveDamFilesMutation,
    GQLMoveDamFilesMutationVariables,
    GQLMoveDamFoldersMutation,
    GQLMoveDamFoldersMutationVariables,
} from "../DataGrid/FolderDataGrid.gql.generated";
import { DamFinderFileDetails, DamFinderFolderDetails, DamFinderSelectionDetails } from "./DamFinderDetails";
import { damFinderRootFolderId, getDamFinderAssetType, getFileExtension, toAssetBrowserAsset, toAssetBrowserFolder } from "./damFinderItems";
import {
    archiveDamFinderFilesMutation,
    createDamFinderFolderMutation,
    damFinderFoldersQuery,
    deleteDamFinderFileMutation,
    deleteDamFinderFolderMutation,
} from "./DamFinderPage.gql";
import type {
    GQLArchiveDamFinderFilesMutation,
    GQLArchiveDamFinderFilesMutationVariables,
    GQLCreateDamFinderFolderMutation,
    GQLCreateDamFinderFolderMutationVariables,
    GQLDamFinderFoldersQuery,
    GQLDamFinderFoldersQueryVariables,
    GQLDeleteDamFinderFileMutation,
    GQLDeleteDamFinderFileMutationVariables,
    GQLDeleteDamFinderFolderMutation,
    GQLDeleteDamFinderFolderMutationVariables,
} from "./DamFinderPage.gql.generated";
import { DetailsColumn, FinderBody, FinderDropzone } from "./DamFinderPage.sc";
import { useDamFinderFiles } from "./useDamFinderFiles";

const folderParam = "folder";

export interface DamFinderPageProps {
    /** The title of the page header. */
    title?: string;
    /** The label above the title. */
    eyebrow?: ReactNode;
    /** The URL of a file's full settings, e.g. in the `DamPage`. Without it, the details panel links nowhere. */
    editFileUrl?: (fileId: string) => string;
}

/**
 * The assets as a finder built with `@dextinity/ui`: the folder tree, the folder's files as icons, a list, columns, or a gallery, a
 * quick look on Space, and the details of the selection. Files are uploaded by dropping them onto the finder or with "Upload".
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

function createAssetBrowserLabels(intl: IntlShape): Partial<AssetBrowserLabels> {
    return {
        folders: intl.formatMessage({ id: "dextinity.damFinder.folders", defaultMessage: "Folders" }),
        items: intl.formatMessage({ id: "dextinity.damFinder.items", defaultMessage: "Files and folders" }),
        view: intl.formatMessage({ id: "dextinity.damFinder.view", defaultMessage: "View" }),
        icons: intl.formatMessage({ id: "dextinity.damFinder.view.icons", defaultMessage: "Icons" }),
        list: intl.formatMessage({ id: "dextinity.damFinder.view.list", defaultMessage: "List" }),
        columns: intl.formatMessage({ id: "dextinity.damFinder.view.columns", defaultMessage: "Columns" }),
        gallery: intl.formatMessage({ id: "dextinity.damFinder.view.gallery", defaultMessage: "Gallery" }),
        up: intl.formatMessage({ id: "dextinity.damFinder.up", defaultMessage: "Enclosing folder" }),
        name: intl.formatMessage({ id: "dextinity.damFinder.column.name", defaultMessage: "Name" }),
        details: intl.formatMessage({ id: "dextinity.damFinder.column.details", defaultMessage: "Details" }),
        modified: intl.formatMessage({ id: "dextinity.damFinder.column.modified", defaultMessage: "Modified" }),
        empty: intl.formatMessage({ id: "dextinity.damFinder.empty", defaultMessage: "This folder is empty" }),
        itemCount: (count) =>
            intl.formatMessage({ id: "dextinity.damFinder.itemCount", defaultMessage: "{count, plural, one {# item} other {# items}}" }, { count }),
        selectedCount: (selected, total) =>
            intl.formatMessage({ id: "dextinity.damFinder.selectedCount", defaultMessage: "{selected} of {total} selected" }, { selected, total }),
    };
}

function byName(first: { name: string }, second: { name: string }) {
    return first.name.localeCompare(second.name);
}

function DamFinderView({ title, eyebrow, editFileUrl }: DamFinderPageProps) {
    const intl = useIntl();
    const history = useHistory();
    const location = useLocation();
    const scope = useDamScope();
    const { allAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();

    const [view, setView] = useStoredState<AssetBrowserView>("damFinderView", "icons");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [quickLookIndex, setQuickLookIndex] = useState<number>();
    const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>();
    const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    const foldersQuery = useQuery<GQLDamFinderFoldersQuery, GQLDamFinderFoldersQueryVariables>(damFinderFoldersQuery, { variables: { scope } });
    const [createFolder, { loading: isCreatingFolder }] = useMutation<GQLCreateDamFinderFolderMutation, GQLCreateDamFinderFolderMutationVariables>(
        createDamFinderFolderMutation,
    );
    const [moveFiles] = useMutation<GQLMoveDamFilesMutation, GQLMoveDamFilesMutationVariables>(moveDamFilesMutation);
    const [moveFolders] = useMutation<GQLMoveDamFoldersMutation, GQLMoveDamFoldersMutationVariables>(moveDamFoldersMutation);
    const [deleteFile] = useMutation<GQLDeleteDamFinderFileMutation, GQLDeleteDamFinderFileMutationVariables>(deleteDamFinderFileMutation);
    const [deleteFolder] = useMutation<GQLDeleteDamFinderFolderMutation, GQLDeleteDamFinderFolderMutationVariables>(deleteDamFinderFolderMutation);
    const [archiveFiles] = useMutation<GQLArchiveDamFinderFilesMutation, GQLArchiveDamFinderFilesMutationVariables>(archiveDamFinderFilesMutation);

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

    const { filesByFolderId, loadingFolderIds, error: filesError, reload } = useDamFinderFiles(pathFolderIds);

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
        () => Object.entries(filesByFolderId).flatMap(([id, files]) => files.map((file) => toAssetBrowserAsset(intl, file, id))),
        [filesByFolderId, intl],
    );
    const currentFiles = useMemo(() => [...(filesByFolderId[folderId] ?? [])].sort(byName), [filesByFolderId, folderId]);
    const fileById = useMemo(
        () => new Map(Object.values(filesByFolderId).flatMap((files) => files.map((file) => [file.id, file]))),
        [filesByFolderId],
    );

    const selectedFile = selectedIds.length === 1 ? fileById.get(selectedIds[0]) : undefined;
    const selectedFolder = selectedIds.length === 1 ? damFolderById.get(selectedIds[0]) : undefined;

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
        await refresh([folderId]);
    };
    const { getInputProps, open: openFileChooser } = useDropzone({
        ...dropzoneConfig,
        noClick: true,
        noDrag: true,
        onDrop: (acceptedFiles, fileRejections) => upload(acceptedFiles, fileRejections),
    });
    const handleDroppedFiles = (files: File[]) => {
        const isAccepted = (file: File) => allAcceptedMimeTypes.includes(file.type) && file.size <= maxFileSizeInBytes;
        // The upload's error dialog reads only the file's name, type, and size of a rejection
        const toRejection = (file: File) => ({ file: file as FileRejection["file"], errors: [] });
        upload(files.filter(isAccepted), files.filter((file) => !isAccepted(file)).map(toRejection));
    };

    const handleMove = async (ids: string[], targetFolderId: string) => {
        const fileIds = ids.filter((id) => fileById.has(id));
        const folderIds = ids.filter((id) => damFolderById.has(id));
        const targetId = targetFolderId === damFinderRootFolderId ? null : targetFolderId;
        try {
            if (fileIds.length > 0) {
                await moveFiles({ variables: { fileIds, targetFolderId: targetId } });
            }
            if (folderIds.length > 0) {
                await moveFolders({ variables: { folderIds, targetFolderId: targetId, scope } });
            }
            setSelectedIds([]);
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.moved", defaultMessage: "Moved {count, plural, one {# item} other {# items}}" },
                    { count: ids.length },
                ),
                tone: "success",
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.damFinder.moveFailed", defaultMessage: "The items couldn't be moved" }));
        }
        await refresh([folderId, targetFolderId]);
    };

    const pendingDeleteFileIds = pendingDeleteIds?.filter((id) => fileById.has(id)) ?? [];
    const pendingDeleteFolderIds = pendingDeleteIds?.filter((id) => damFolderById.has(id)) ?? [];

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
        await refresh([folderId]);
    };

    const handleArchive = async () => {
        setPendingDeleteIds(undefined);
        try {
            await archiveFiles({ variables: { ids: pendingDeleteFileIds } });
            setSelectedIds([]);
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.archived", defaultMessage: "Archived {count, plural, one {# file} other {# files}}" },
                    { count: pendingDeleteFileIds.length },
                ),
                tone: "success",
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.damFinder.archiveFailed", defaultMessage: "The files couldn't be archived" }));
        }
        await refresh([folderId]);
    };

    const handleCreateFolder = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const { data } = await createFolder({
                variables: {
                    input: { name: newFolderName.trim(), parentId: folderId === damFinderRootFolderId ? undefined : folderId },
                    scope,
                },
            });
            setIsNewFolderDialogOpen(false);
            setNewFolderName("");
            await foldersQuery.refetch();
            if (data != null) {
                setSelectedIds([data.createDamFolder.id]);
            }
        } catch {
            showError(intl.formatMessage({ id: "dextinity.damFinder.createFolderFailed", defaultMessage: "The folder couldn't be created" }));
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
    const renderQuickLookPreview = (item: QuickLookItem) => {
        const file = quickLookIndex != null ? currentFiles[quickLookIndex] : undefined;
        const type = file != null ? getDamFinderAssetType(file.mimetype) : "image";
        if (file == null || type === "image") {
            return <img src={item.src} alt={item.alt ?? item.title} />;
        }
        return <AssetThumbnail type={type} fileType={type === "document" ? getFileExtension(file.name) : undefined} />;
    };

    if (foldersQuery.error != null) {
        throw foldersQuery.error;
    }
    if (filesError != null) {
        throw filesError;
    }

    const isCurrentFolderLoading = loadingFolderIds.includes(folderId) || foldersQuery.loading;

    const renderDetails = () => {
        if (selectedFile != null) {
            return (
                <DamFinderFileDetails
                    key={`${selectedFile.id}-${selectedFile.name}-${selectedFile.title}-${selectedFile.altText}`}
                    file={selectedFile}
                    editUrl={editFileUrl?.(selectedFile.id)}
                    onQuickLook={() => openQuickLook(selectedFile.id)}
                    onChange={() => reload([folderId])}
                    onError={showError}
                />
            );
        }
        if (selectedFolder != null) {
            return (
                <DamFinderFolderDetails
                    key={`${selectedFolder.id}-${selectedFolder.name}`}
                    folder={selectedFolder}
                    onOpen={() => changeFolder(selectedFolder.id)}
                    onChange={() => foldersQuery.refetch()}
                    onError={showError}
                />
            );
        }
        return <DamFinderSelectionDetails count={selectedIds.length} />;
    };

    return (
        <>
            <FinderLayout
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
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<Icon name="folder" />}
                                    onClick={() => setIsNewFolderDialogOpen(true)}
                                >
                                    {intl.formatMessage({ id: "dextinity.damFinder.newFolder", defaultMessage: "New folder" })}
                                </Button>
                                <Button startIcon={<Icon name="upload" />} onClick={openFileChooser}>
                                    {intl.formatMessage({ id: "dextinity.damFinder.upload", defaultMessage: "Upload" })}
                                </Button>
                                <input {...getInputProps()} />
                            </>
                        }
                    />
                }
            >
                <FinderDropzone
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
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            onOpen={(asset) => openQuickLook(asset.id)}
                            onQuickLook={(asset) => openQuickLook(asset.id)}
                            onMove={handleMove}
                            onDelete={setPendingDeleteIds}
                            toolbar={isCurrentFolderLoading ? <Spinner size="small" /> : undefined}
                            labels={createAssetBrowserLabels(intl)}
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
                    setSelectedIds([currentFiles[index].id]);
                }}
                renderPreview={renderQuickLookPreview}
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
                description={intl.formatMessage({
                    id: "dextinity.damFinder.delete.description",
                    defaultMessage:
                        "Deleted files and folders, including everything inside them, can't be restored. Archived files stay available in the asset manager.",
                })}
                confirmLabel={intl.formatMessage({ id: "dextinity.damFinder.delete.confirm", defaultMessage: "Delete" })}
                confirmIcon={<Icon name="trash" />}
                onConfirm={handleDelete}
                secondaryLabel={
                    pendingDeleteFolderIds.length === 0
                        ? intl.formatMessage({ id: "dextinity.damFinder.delete.archive", defaultMessage: "Archive instead" })
                        : undefined
                }
                onSecondary={pendingDeleteFolderIds.length === 0 ? handleArchive : undefined}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.damFinder.delete.cancel", defaultMessage: "Cancel" }) }}
            />
            <Dialog
                open={isNewFolderDialogOpen}
                onOpenChange={setIsNewFolderDialogOpen}
                title={intl.formatMessage({ id: "dextinity.damFinder.newFolder.title", defaultMessage: "New folder" })}
                size="small"
                footer={
                    <>
                        <Button variant="outlined" color="secondary" onClick={() => setIsNewFolderDialogOpen(false)}>
                            {intl.formatMessage({ id: "dextinity.damFinder.newFolder.cancel", defaultMessage: "Cancel" })}
                        </Button>
                        <Button type="submit" form="dam-finder-new-folder" disabled={newFolderName.trim() === ""} loading={isCreatingFolder}>
                            {intl.formatMessage({ id: "dextinity.damFinder.newFolder.create", defaultMessage: "Create" })}
                        </Button>
                    </>
                }
                labels={{ close: intl.formatMessage({ id: "dextinity.damFinder.newFolder.close", defaultMessage: "Close" }) }}
            >
                <form id="dam-finder-new-folder" onSubmit={handleCreateFolder}>
                    <Input
                        name="name"
                        label={intl.formatMessage({ id: "dextinity.damFinder.newFolder.name", defaultMessage: "Name" })}
                        required
                        value={newFolderName}
                        onChange={(event) => setNewFolderName(event.target.value)}
                    />
                </form>
            </Dialog>
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.damFinder.notifications", defaultMessage: "Notifications" }) }}
            />
            {uploadDialogs}
        </>
    );
}
