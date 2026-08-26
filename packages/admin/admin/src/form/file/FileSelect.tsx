import { Error as ErrorIcon } from "@dextinity/admin-icons";
import { type ComponentsOverrides, Typography } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";
import type { Accept, DropzoneOptions } from "react-dropzone";
import { FormattedMessage, useIntl } from "react-intl";

import { Alert } from "../../alert/Alert";
import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { FileDropzone } from "./FileDropzone";
import type { ErrorFileSelectItem, FileSelectItem, ValidFileSelectItem } from "./fileSelectItemTypes";
import { FileSelectListItem } from "./FileSelectListItem";

export type FileSelectClassKey =
    | "root"
    | "listLayout"
    | "gridLayout"
    | "maxFilesReachedInfo"
    | "dropzone"
    | "fileList"
    | "fileListItem"
    | "error"
    | "errorMessage";

type Layout = "list" | "grid";

type ThemeProps = ThemedComponentBaseProps<{
    root: "div";
    maxFilesReachedInfo: typeof Alert;
    dropzone: typeof FileDropzone;
    fileList: "div";
    fileListItem: typeof FileSelectListItem;
    error: "div";
    errorMessage: typeof Typography;
}>;

type OwnerState = {
    layout: Layout;
};

export type FileSelectProps<AdditionalValidFileValues = Record<string, unknown>> = {
    files: FileSelectItem<AdditionalValidFileValues>[];
    onDrop?: DropzoneOptions["onDrop"];
    onRemove?: (file: ValidFileSelectItem<AdditionalValidFileValues> | ErrorFileSelectItem) => void;
    onDownload?: (file: ValidFileSelectItem<AdditionalValidFileValues>) => void;
    getDownloadUrl?: (file: ValidFileSelectItem<AdditionalValidFileValues>) => string | undefined;
    disabled?: boolean;
    readOnly?: boolean;
    accept?: Accept;
    maxFileSize?: number;
    maxFiles?: number;
    multiple?: boolean;
    error?: ReactNode;
    layout?: Layout;
    iconMapping?: {
        error?: ReactNode;
    };
} & ThemeProps;

export const FileSelect = <AdditionalValidFileValues = Record<string, unknown>,>(inProps: FileSelectProps<AdditionalValidFileValues>) => {
    const {
        slotProps,
        readOnly,
        disabled,
        accept,
        maxFileSize,
        maxFiles: passedMaxFiles,
        multiple: passedMultiple,
        iconMapping = {},
        onDrop,
        onRemove,
        onDownload,
        getDownloadUrl,
        files,
        error,
        layout = "list",
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminFileSelect",
    });

    const { error: errorIcon = <ErrorIcon color="error" /> } = iconMapping;
    const intl = useIntl();

    const multiple = passedMultiple || (typeof passedMaxFiles !== "undefined" && passedMaxFiles > 1);
    const maxFiles = typeof passedMaxFiles === "undefined" ? (multiple ? undefined : 1) : passedMaxFiles;

    const numberOfValidFiles = files?.filter((file) => !("error" in file)).length ?? 0;
    const maxAmountOfFilesSelected = typeof maxFiles !== "undefined" && multiple && numberOfValidFiles >= maxFiles;
    const maxNumberOfFilesToBeAdded = maxFiles ? maxFiles - numberOfValidFiles : undefined;
    const showFileList = files.length > 0 || readOnly;

    const ownerState: OwnerState = {
        layout,
    };

    return (
        <Root ownerState={ownerState} {...slotProps?.root} {...restProps}>
            {!readOnly && (
                <>
                    {maxAmountOfFilesSelected ? (
                        <MaxFilesReachedInfo
                            title={<FormattedMessage id="dextinity.fileSelect.maximumReached" defaultMessage="Maximum reached" />}
                            severity="info"
                            {...slotProps?.maxFilesReachedInfo}
                        >
                            <FormattedMessage
                                id="dextinity.fileSelect.maximumFilesAmount"
                                defaultMessage="The maximum number of uploads has been reached. Please delete files from the list before uploading new files."
                            />
                        </MaxFilesReachedInfo>
                    ) : (
                        <Dropzone
                            disabled={disabled}
                            hasError={Boolean(error)}
                            onDrop={onDrop}
                            accept={accept}
                            multiple={multiple}
                            maxSize={maxFileSize === null ? undefined : maxFileSize}
                            maxFiles={maxNumberOfFilesToBeAdded}
                            {...slotProps?.dropzone}
                        />
                    )}
                </>
            )}
            {showFileList && (
                <FileList ownerState={ownerState} {...slotProps?.fileList}>
                    {files.length > 0 ? (
                        <>
                            {files.map((file, index) => {
                                const isValidFile = !("error" in file) && !("loading" in file);
                                let filePreview: string | boolean;

                                if (layout === "grid") {
                                    if (isValidFile && file.previewUrl) {
                                        filePreview = file.previewUrl;
                                    } else {
                                        filePreview = true;
                                    }
                                } else {
                                    filePreview = false;
                                }

                                return (
                                    <FileListItem
                                        key={index}
                                        file={file}
                                        onClickDownload={
                                            isValidFile && onDownload
                                                ? () => {
                                                      onDownload(file);
                                                  }
                                                : undefined
                                        }
                                        downloadUrl={isValidFile && getDownloadUrl ? getDownloadUrl(file) : undefined}
                                        onClickDelete={readOnly || !onRemove || "loading" in file ? undefined : () => onRemove(file)}
                                        filePreview={filePreview}
                                        {...slotProps?.fileListItem}
                                    />
                                );
                            })}
                        </>
                    ) : (
                        <FileListItem
                            file={{
                                name: intl.formatMessage({
                                    id: "dextinity.fileSelect.noAttachments",
                                    defaultMessage: "There are no attachments",
                                }),
                            }}
                            {...slotProps?.fileListItem}
                        />
                    )}
                </FileList>
            )}
            {Boolean(error) && (
                <Error {...slotProps?.error}>
                    {errorIcon}
                    <ErrorMessage variant="caption" color="error" {...slotProps?.errorMessage}>
                        {error}
                    </ErrorMessage>
                </Error>
            )}
        </Root>
    );
};

const Root = createComponentSlot("div")<FileSelectClassKey, OwnerState>({
    componentName: "FileSelect",
    slotName: "root",
    classesResolver: ({ layout }) => [layout === "list" && "listLayout", layout === "grid" && "gridLayout"],
})(css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
`);

const Dropzone = createComponentSlot(FileDropzone)<FileSelectClassKey>({
    componentName: "FileSelect",
    slotName: "dropzone",
})();

const FileList = createComponentSlot("div")<FileSelectClassKey, OwnerState>({
    componentName: "FileSelect",
    slotName: "fileList",
})(
    ({ theme, ownerState }) => css`
        width: 100%;

        ${ownerState.layout === "grid" &&
        css`
            display: grid;
            gap: ${theme.spacing(2)};
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));

            ${theme.breakpoints.up("md")} {
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

                .DextinityAdminFormFieldContainer-horizontal & {
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                }
            }
        `}
    `,
);

const FileListItem = createComponentSlot(FileSelectListItem)<FileSelectClassKey>({
    componentName: "FileSelect",
    slotName: "fileListItem",
})();

const MaxFilesReachedInfo = createComponentSlot(Alert)<FileSelectClassKey>({
    componentName: "FileSelect",
    slotName: "maxFilesReachedInfo",
})(css`
    width: 100%;
    box-sizing: border-box;
`);

const Error = createComponentSlot("div")<FileSelectClassKey>({
    componentName: "FileSelect",
    slotName: "error",
})(
    ({ theme }) => css`
        display: flex;
        align-items: center;
        color: ${theme.palette.error.main};
        gap: 5px;
    `,
);

const ErrorMessage = createComponentSlot(Typography)<FileSelectClassKey>({
    componentName: "FileSelect",
    slotName: "errorMessage",
})();

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminFileSelect: FileSelectClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminFileSelect: FileSelectProps;
    }

    interface Components {
        DextinityAdminFileSelect?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminFileSelect"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminFileSelect"];
        };
    }
}
