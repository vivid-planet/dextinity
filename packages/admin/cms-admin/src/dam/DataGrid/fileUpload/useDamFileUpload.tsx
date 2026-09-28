import { useApolloClient } from "@apollo/client";
import { Alert, useSnackbarApi } from "@dextinity/admin";
import { Snackbar } from "@mui/material";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import type { Accept, FileRejection } from "react-dropzone";
import { FormattedMessage } from "react-intl";

import { NetworkError, UnknownError } from "../../../common/errors/errorMessages";
import { useDextinityConfig } from "../../../config/DextinityConfigContext";
import { replaceByFilenameAndFolder, upload } from "../../../form/file/upload";
import type { GQLLicenseInput } from "../../../graphql.generated";
import { useDamBasePath, useDamConfig, useVideoPerformanceWarning } from "../../config/damConfig";
import { useDamAcceptedMimeTypes } from "../../config/useDamAcceptedMimeTypes";
import { useDamScope } from "../../config/useDamScope";
import { clearDamItemCache } from "../../helpers/clearDamItemCache";
import {
    type DuplicateAction,
    type FilenameData,
    useManualDuplicatedFilenamesHandler,
} from "../duplicatedFilenames/ManualDuplicatedFilenamesHandler";
import { convertMimetypesToDropzoneAccept } from "./fileUpload.utils";
import { type NewlyUploadedItem, useFileUploadContext } from "./FileUploadContext";
import { FileUploadErrorDialog } from "./FileUploadErrorDialog";
import {
    FileExtensionTypeMismatchError,
    FilenameTooLongError,
    FileSizeError,
    MaxResolutionError,
    MissingFileExtensionError,
    SvgContainsJavaScriptError,
    UnsupportedTypeError,
} from "./fileUploadErrorMessages";
import { ProgressDialog } from "./ProgressDialog";
import { createDamFolderForFolderUpload, damFolderByNameAndParentId } from "./useDamFileUpload.gql";
import type {
    GQLDamFolderByNameAndParentIdQuery,
    GQLDamFolderByNameAndParentIdQueryVariables,
    GQLDamFolderForFolderUploadMutation,
    GQLDamFolderForFolderUploadMutationVariables,
} from "./useDamFileUpload.gql.generated";

export interface FileWithDamUploadMetadata extends File {
    path?: string;
    license?: GQLLicenseInput;
    title?: string;
    altText?: string;
    importSource?: ImportSource;
}

export interface FileWithFolderPath extends FileWithDamUploadMetadata {
    folderPath?: string;
}

interface UploadDamFileOptions {
    acceptedMimetypes?: string[];
}

interface Files {
    acceptedFiles: FileWithDamUploadMetadata[];
    fileRejections: FileRejection[];
}

type ImportSource = { importSourceType: never; importSourceId: never } | { importSourceType: string; importSourceId: string };

interface UploadFilesOptions {
    folderId?: string;
    /**
     * @deprecated Set `importSource` directly on the file
     */
    importSource?: ImportSource;
}

export interface FileUploadApi {
    uploadFiles: (
        { acceptedFiles, fileRejections }: Files,
        { folderId, importSource }: UploadFilesOptions,
    ) => Promise<{ hasError: boolean; rejectedFiles: RejectedFile[]; uploadedItems: NewlyUploadedItem[] }>;
    validationErrors?: FileUploadValidationError[];
    maxFileSizeInBytes: number;
    dialogs: ReactNode;
    dropzoneConfig: {
        accept: Accept;
        multiple: boolean;
        maxSize: number;
    };
    newlyUploadedItems: NewlyUploadedItem[];
}

export interface FileUploadValidationError {
    file: Pick<FileWithFolderPath, "name" | "path">;
    message: ReactNode;
}

interface RejectedFile {
    file: File;
}

const addFolderPathToFiles = async (acceptedFiles: FileWithDamUploadMetadata[]): Promise<FileWithFolderPath[]> => {
    const newFiles = [];

    for (const file of acceptedFiles) {
        let harmonizedPath: string | undefined;
        // when a file is uploaded, the file path is prefixed with "./"
        // when a folder is uploaded via drag and drop, the file paths are prefixed with "/"
        // when a folder is uploaded via input field, the file paths don't have any prefix
        if (file.path?.startsWith("./") || file.path?.startsWith("/")) {
            // if the path has a "./" or "/" prefix, this prefix is removed => path is harmonized
            harmonizedPath = file.path?.split("/").splice(1).join("/");
        } else {
            harmonizedPath = file.path;
        }

        // Create a new file because of a strange bug in Firefox that when uploading a folder via drag and drop
        // changes the mimetype of all uploaded files to "application/octet-stream". This behavior only happens in Firefox
        // (not in Chrome or Safari) and I couldn't find the reason for it.
        // When looking at the formData in the web dev tools, the mimetype is still correct. It is only changed to a
        // wrong type in the actual request.
        // The bug could be avoided by creating a new file. Maybe an issue with Dropzone?
        const buffer = await file.arrayBuffer();
        const newFile: FileWithFolderPath = new File([buffer], file.name, { lastModified: file.lastModified, type: file.type });
        newFile.path = file.path;
        newFile.license = file.license;
        newFile.title = file.title;
        newFile.altText = file.altText;
        newFile.importSource = file.importSource;

        const folderPath = harmonizedPath?.split("/").slice(0, -1).join("/");
        newFile.folderPath = folderPath && folderPath?.length > 0 ? folderPath : undefined;

        newFiles.push(newFile);
    }

    return newFiles;
};

export const useDamFileUpload = (options: UploadDamFileOptions): FileUploadApi => {
    const { apiUrl } = useDextinityConfig();
    const damConfig = useDamConfig();
    const damBasePath = useDamBasePath();
    const client = useApolloClient();
    const manualDuplicatedFilenamesHandler = useManualDuplicatedFilenamesHandler();
    const scope = useDamScope();
    const snackbarApi = useSnackbarApi();
    const { isVideoTooLarge } = useVideoPerformanceWarning();

    const { allAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const accept: Accept = useMemo(() => {
        return convertMimetypesToDropzoneAccept(options.acceptedMimetypes ?? allAcceptedMimeTypes);
    }, [allAcceptedMimeTypes, options.acceptedMimetypes]);

    const { newlyUploadedItems, addNewlyUploadedItems } = useFileUploadContext();

    const [progressDialogOpen, setProgressDialogOpen] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<FileUploadValidationError[] | undefined>();
    const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
    const [totalSizes, setTotalSizes] = useState<{ [key: string]: number }>({});
    const [uploadedSizes, setUploadedSizes] = useState<{ [key: string]: number }>({});

    const totalSize = Object.values(totalSizes).length > 0 ? Object.values(totalSizes).reduce((prev, curr) => prev + curr, 0) : undefined;
    const uploadedSize = Object.values(uploadedSizes).length > 0 ? Object.values(uploadedSizes).reduce((prev, curr) => prev + curr, 0) : undefined;

    const maxFileSizeInMegabytes = damConfig.uploadsMaxFileSize;
    const maxFileSizeInBytes = maxFileSizeInMegabytes * 1024 * 1024;

    const addValidationError = (file: FileWithFolderPath, newError: ReactNode) => {
        setValidationErrors((prevErrors) => {
            const existingErrors = prevErrors ?? [];
            return [...existingErrors, { file, message: newError }];
        });
    };

    const updateLoadedSize = (path: string, value: number) => {
        setUploadedSizes((prev) => ({ ...prev, [path]: value }));
    };

    const generateValidationErrorsForRejectedFiles = useCallback(
        (fileRejections: FileRejection[]) => {
            for (const fileRejection of fileRejections) {
                if (fileRejection.file.size > maxFileSizeInBytes) {
                    addValidationError(fileRejection.file, <FileSizeError maxFileSizeInBytes={maxFileSizeInBytes} />);
                }

                if (!accept[fileRejection.file.type]) {
                    const extension = `.${fileRejection.file.name.split(".").pop()}`;
                    addValidationError(fileRejection.file, <UnsupportedTypeError extension={extension} />);
                }
            }
        },
        [accept, maxFileSizeInBytes],
    );

    const lookupDamFolder = useCallback(
        async (folderName: string, parentId?: string) => {
            const { data } = await client.query<GQLDamFolderByNameAndParentIdQuery, GQLDamFolderByNameAndParentIdQueryVariables>({
                query: damFolderByNameAndParentId,
                variables: {
                    name: folderName,
                    parentId: parentId,
                    scope,
                },
                fetchPolicy: "network-only",
            });

            return data.damFolder?.id;
        },
        [client, scope],
    );

    const createDamFolder = useCallback(
        async (folderName: string, parentId?: string) => {
            const { data } = await client.mutate<GQLDamFolderForFolderUploadMutation, GQLDamFolderForFolderUploadMutationVariables>({
                mutation: createDamFolderForFolderUpload,
                variables: {
                    name: folderName,
                    parentId: parentId,
                    scope,
                },
            });

            if (!data) {
                throw new Error("Could not create Folder");
            }

            return data.createDamFolder.id;
        },
        [client, scope],
    );

    const createInitialFolderIdMap = useCallback(
        async (files: FileWithFolderPath[], currFolderId?: string) => {
            const folderIdMap = new Map<string, string>();
            const lookupCache = new Map<string, string | undefined>();

            for (const file of files) {
                let noLookup = false;
                if (file.folderPath === undefined) {
                    return folderIdMap;
                }

                const pathArr = file.folderPath.split("/");

                for (let i = 1; i <= pathArr.length; i++) {
                    const path = pathArr.slice(0, i);

                    const completePath = path.join("/");
                    const folderName = path[path.length - 1];
                    const parentPath = path.slice(0, -1).join("/");

                    if (folderIdMap.has(completePath)) {
                        continue;
                    }

                    const parentId = folderIdMap.has(parentPath) ? folderIdMap.get(parentPath) : currFolderId;

                    if (!noLookup) {
                        let id: string | undefined;
                        if (lookupCache.has(`${folderName}:${parentId}`)) {
                            id = lookupCache.get(`${folderName}:${parentId}`);
                        } else {
                            id = await lookupDamFolder(folderName, parentId);
                            lookupCache.set(`${folderName}:${parentId}`, id);
                        }

                        if (id === undefined) {
                            // paths are looked up hierarchically starting with the first folder e.g.
                            //   1. lookup: media_folder
                            //   2. lookup: media_folder/inner_folder
                            // if media_folder doesn't exist, there is no point in looking up inner_folder
                            // because it cannot exist without its parent => noLookup
                            noLookup = true;
                        } else {
                            folderIdMap.set(completePath, id);
                        }
                    }
                }
            }

            return folderIdMap;
        },
        [lookupDamFolder],
    );

    const createFoldersIfNecessary = useCallback(
        async (externalFolderIdMap: Map<string, string>, file: FileWithFolderPath, currFolderId?: string) => {
            const newlyCreatedFolderIds: Array<{ id: string; parentId?: string }> = [];
            const folderIdMap = new Map(externalFolderIdMap);

            if (file.folderPath === undefined) {
                return { folderIdMap, newlyCreatedFolderIds };
            }
            const pathArr = file.folderPath.split("/");

            for (let i = 1; i <= pathArr.length; i++) {
                const path = pathArr.slice(0, i);

                const completePath = path.join("/");
                const folderName = path[path.length - 1];
                const parentPath = path.slice(0, -1).join("/");

                if (folderIdMap.has(completePath)) {
                    continue;
                }

                const parentId = folderIdMap.has(parentPath) ? folderIdMap.get(parentPath) : currFolderId;

                const id = await createDamFolder(folderName, parentId);
                newlyCreatedFolderIds.push({ id, parentId });
                folderIdMap.set(completePath, id);
            }

            return { folderIdMap, newlyCreatedFolderIds };
        },
        [createDamFolder],
    );

    const mapFilenameDataToFiles = (
        filenameDataList: FilenameData[],
        files: FileWithFolderPath[],
        currentFolderId: string | undefined,
        folderIdMap: Map<string, string>,
    ) => {
        const filesToUpload = filenameDataList.map((data) => {
            return files.find((file) => {
                const fileFolderId = file.folderPath && folderIdMap.has(file.folderPath) ? folderIdMap.get(file.folderPath) : currentFolderId;

                return file.name === data.name && fileFolderId === data.folderId;
            }) as FileWithFolderPath;
        });

        return filesToUpload;
    };

    const handleDuplicatedFilenames = useCallback(
        async (
            filesWithFolderPaths: FileWithFolderPath[],
            currentFolderId: string | undefined,
            folderIdMap: Map<string, string>,
        ): Promise<{ filesToUpload: FileWithFolderPath[]; duplicateAction: DuplicateAction }> => {
            if (manualDuplicatedFilenamesHandler === undefined) {
                return { filesToUpload: filesWithFolderPaths, duplicateAction: "skip" };
            }

            const filesInNewDir: FileWithFolderPath[] = [];
            const filesInExistingDir: FileWithFolderPath[] = [];

            for (const file of filesWithFolderPaths) {
                if (file.folderPath === undefined || folderIdMap.has(file.folderPath)) {
                    filesInExistingDir.push(file);
                } else {
                    // filter out files in newly uploaded folders, because the duplicated filename
                    // check isn't possible for new folders since they don't have an id.
                    // It's also not necessary because in a local filesystem there
                    // typically can't be duplicate filenames. If there's still a conflict,
                    // it's resolved automatically in the API by adding a sequential number.
                    filesInNewDir.push(file);
                }
            }

            const userSelection = await manualDuplicatedFilenamesHandler?.letUserHandleDuplicates(
                filesInExistingDir.map((file) => ({
                    name: file.name,
                    folderId: file.folderPath && folderIdMap.has(file.folderPath) ? folderIdMap.get(file.folderPath) : currentFolderId,
                })),
            );

            const filesToUpload = mapFilenameDataToFiles(userSelection.filenames, filesWithFolderPaths, currentFolderId, folderIdMap);

            filesToUpload.push(...filesInNewDir);
            return { filesToUpload, duplicateAction: userSelection.duplicateAction };
        },
        [manualDuplicatedFilenamesHandler],
    );

    const uploadFiles = async (
        { acceptedFiles, fileRejections }: Files,
        { folderId, importSource }: UploadFilesOptions,
    ): Promise<{ hasError: boolean; rejectedFiles: RejectedFile[]; uploadedItems: NewlyUploadedItem[] }> => {
        setProgressDialogOpen(true);
        setValidationErrors(undefined);

        const uploadedFolders: Array<NewlyUploadedItem & { type: "folder" }> = [];
        const uploadedFiles: Array<NewlyUploadedItem & { type: "file" }> = [];
        const rejectedFiles: Array<RejectedFile> = [];

        let errorOccurred = false;
        if (fileRejections.length > 0) {
            errorOccurred = true;
            generateValidationErrorsForRejectedFiles(fileRejections);
            rejectedFiles.push(...fileRejections.map(({ errors, ...rejection }) => rejection));
        }

        if (acceptedFiles.length > 0) {
            const filesWithFolderPaths = await addFolderPathToFiles(acceptedFiles);
            let folderIdMap = await createInitialFolderIdMap(filesWithFolderPaths, folderId);

            const fileSizes: { [key: string]: number } = {};
            for (const file of filesWithFolderPaths) {
                fileSizes[file.path ?? ""] = file.size;
            }
            setTotalSizes(fileSizes);

            const { filesToUpload, duplicateAction } = await handleDuplicatedFilenames(filesWithFolderPaths, folderId, folderIdMap);

            for (const file of filesToUpload) {
                const { folderIdMap: newFolderIdMap, newlyCreatedFolderIds } = await createFoldersIfNecessary(folderIdMap, file, folderId);
                folderIdMap = newFolderIdMap;
                uploadedFolders.push(
                    ...newlyCreatedFolderIds.map((folder): NewlyUploadedItem & { type: "folder" } => ({
                        id: folder.id,
                        parentId: folder.parentId,
                        type: "folder",
                    })),
                );

                const targetFolderId = file.folderPath && folderIdMap.has(file.folderPath) ? folderIdMap.get(file.folderPath) : folderId;

                try {
                    const uploadConfig = {
                        file,
                        folderId: targetFolderId,
                        scope,
                        importSourceId: importSource?.importSourceId,
                        importSourceType: importSource?.importSourceType,
                    };

                    const onUploadProgress = (progressEvent: ProgressEvent) => {
                        updateLoadedSize(file.path ?? "", progressEvent.loaded);
                    };

                    const uploadParams = {
                        apiUrl,
                        data: uploadConfig,
                        options: { onUploadProgress },
                        damBasePath,
                    };

                    const uploadResult =
                        duplicateAction === "replace"
                            ? await replaceByFilenameAndFolder<{ id: string }>(uploadParams)
                            : await upload<{ id: string }>(uploadParams);

                    const response = await uploadResult;

                    uploadedFiles.push({ id: response.data.id, parentId: targetFolderId, type: "file", file });
                } catch (err) {
                    errorOccurred = true;

                    if (hasObjectErrorData(err) && err.response?.data.error === "DextinityImageResolutionException") {
                        addValidationError(file, <MaxResolutionError maxResolution={damConfig.maxSrcResolution} />);
                    } else if (hasObjectErrorData(err) && err.response?.data.error === "DextinityValidationException") {
                        const message = err.response.data.message;
                        const extension = `.${file.name.split(".").pop()}`;
                        if (message.includes("Unsupported mime type")) {
                            addValidationError(file, <UnsupportedTypeError extension={extension} />);
                        } else if (message.includes("Missing file extension")) {
                            addValidationError(file, <MissingFileExtensionError />);
                        } else if (message.includes("File type and extension mismatch")) {
                            addValidationError(file, <FileExtensionTypeMismatchError extension={extension} mimetype={file.type} />);
                        } else if (message.includes("Filename is too long")) {
                            addValidationError(file, <FilenameTooLongError />);
                        } else {
                            addValidationError(file, <UnknownError />);
                        }
                    } else if (hasStringErrorData(err) && err.response.data.includes("SVG contains forbidden content")) {
                        addValidationError(file, <SvgContainsJavaScriptError />);
                    } else if (hasRequestData(err)) {
                        addValidationError(file, <NetworkError />);
                    } else {
                        addValidationError(file, <UnknownError />);
                    }
                    rejectedFiles.push({ file });
                }
            }

            await client.reFetchObservableQueries();
            clearDamItemCache(client.cache);
        }

        setProgressDialogOpen(false);
        if (errorOccurred) {
            setErrorDialogOpen(true);
        }
        setTotalSizes({});
        setUploadedSizes({});

        addNewlyUploadedItems([...uploadedFolders, ...uploadedFiles]);

        const tooLargeVideoCount = uploadedFiles.filter(
            ({ file }) => file !== undefined && isVideoTooLarge({ mimetype: file.type, size: file.size }),
        ).length;

        if (tooLargeVideoCount > 0) {
            snackbarApi.showSnackbar(
                <Snackbar autoHideDuration={5000}>
                    <Alert severity="warning">
                        <FormattedMessage
                            id="dextinity.dam.videoPerformanceWarning.snackbar"
                            defaultMessage="{count, plural, one {A very large video was uploaded} other {# very large videos were uploaded}}. Videos are delivered without optimization, which can lead to poor loading performance."
                            values={{ count: tooLargeVideoCount }}
                        />
                    </Alert>
                </Snackbar>,
            );
        }

        return { hasError: errorOccurred, rejectedFiles: rejectedFiles, uploadedItems: [...uploadedFolders, ...uploadedFiles] };
    };

    return {
        uploadFiles,
        validationErrors,
        maxFileSizeInBytes,
        dialogs: (
            <>
                <FileUploadErrorDialog
                    open={errorDialogOpen}
                    validationErrors={validationErrors}
                    onClose={() => {
                        setValidationErrors(undefined);
                        setErrorDialogOpen(false);
                    }}
                />
                <ProgressDialog open={progressDialogOpen} totalSize={totalSize} loadedSize={uploadedSize} />
            </>
        ),
        dropzoneConfig: {
            accept: accept,
            multiple: true,
            maxSize: maxFileSizeInBytes,
        },
        newlyUploadedItems,
    };
};

function hasRequestData(err: unknown): err is { request: unknown; response?: undefined } {
    return (
        typeof err === "object" &&
        err !== null &&
        "request" in err &&
        (err as { request?: unknown }).request !== undefined &&
        (!("response" in err) || (err as { response?: unknown }).response === undefined)
    );
}

function hasObjectErrorData(err: unknown): err is { response: { data: { error: string; message: string; statusCode: number } } } {
    if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: unknown }).response;
        if (typeof response === "object" && response !== null && "data" in response) {
            const data = (response as { data?: unknown }).data;
            if (typeof data === "object" && data !== null && "error" in data && typeof (data as { error?: unknown }).error === "string") {
                return true;
            }
        }
    }
    return false;
}

function hasStringErrorData(err: unknown): err is { response: { data: string } } {
    if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: unknown }).response;
        if (typeof response === "object" && response !== null && "data" in response && typeof (response as { data?: unknown }).data === "string") {
            return true;
        }
    }
    return false;
}
