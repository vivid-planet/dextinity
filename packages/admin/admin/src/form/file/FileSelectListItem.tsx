import { Delete, Download, Error, File as FileIcon, FileNotMenu, ThreeDotSaving } from "@dextinity/admin-icons";
import {
    Chip,
    type ComponentsOverrides,
    css,
    IconButton as MuiIconButton,
    Skeleton as MuiSkeleton,
    type Theme,
    Typography,
    useThemeProps,
} from "@mui/material";
import { type ReactNode, useRef } from "react";

import { Tooltip } from "../../common/Tooltip";
import { createComponentSlot } from "../../helpers/createComponentSlot";
import { PrettyBytes } from "../../helpers/PrettyBytes";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { useElementIsOverflowing } from "../../hooks/useElementIsOverflowing";
import type { ErrorFileSelectItem, FileSelectItem } from "./fileSelectItemTypes";

type OwnerState = {
    hasFilePreview: boolean;
    hasErrorWithDetails: boolean;
    hasErrorWithoutDetails: boolean;
    disabled: boolean;
};

export type FileSelectListItemClassKey =
    | "root"
    | "hasFilePreview"
    | "hasErrorWithDetails"
    | "hasErrorWithoutDetails"
    | "disabled"
    | "skeleton"
    | "preview"
    | "previewImage"
    | "content"
    | "fileListItemInfos"
    | "fileName"
    | "fileSize"
    | "errorIconContainer"
    | "errorDetails"
    | "errorDetailsText"
    | "iconButton";

export type FileSelectListItemProps = ThemedComponentBaseProps<{
    root: "div";
    skeleton: typeof MuiSkeleton;
    content: "div";
    fileListItemInfos: "div";
    fileName: typeof Typography;
    fileSize: typeof Chip;
    errorIconContainer: "div";
    errorDetails: "div";
    errorDetailsText: typeof Typography;
    iconButton: typeof MuiIconButton;
}> & {
    file: FileSelectItem;
    disabled?: boolean;
    onClickDownload?: () => void;
    downloadUrl?: string;
    onClickDelete?: () => void;
    filePreview?: string | boolean;
    iconMapping?: {
        download?: ReactNode;
        loading?: ReactNode;
        delete?: ReactNode;
        error?: ReactNode;
        filePreviewGenericFile?: ReactNode;
        filePreviewLoading?: ReactNode;
        filePreviewError?: ReactNode;
    };
};

export const FileSelectListItem = (inProps: FileSelectListItemProps) => {
    const {
        file,
        disabled,
        onClickDownload,
        downloadUrl,
        onClickDelete,
        iconMapping = {},
        filePreview,
        slotProps,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminFileSelectListItem",
    });
    const fileNameRef = useRef<HTMLDivElement>(null);
    const fileNameIsOverflowing = useElementIsOverflowing(fileNameRef);

    const {
        download: downloadIcon = <Download />,
        delete: deleteIcon = <Delete />,
        loading: loadingIcon = <ThreeDotSaving />,
        error: errorIcon = <Error fontSize="inherit" />,
        filePreviewGenericFile: filePreviewGenericFileIcon = <FileIcon fontSize="inherit" color="inherit" />,
        filePreviewLoading: filePreviewLoadingIcon = <ThreeDotSaving fontSize="inherit" color="inherit" />,
        filePreviewError: filePreviewErrorIcon = <FileNotMenu fontSize="inherit" color="inherit" />,
    } = iconMapping;

    const getFilePreviewContent = () => {
        if ("loading" in file) {
            return filePreviewLoadingIcon;
        }

        if ("error" in file) {
            return filePreviewErrorIcon;
        }

        if (typeof filePreview === "string") {
            return <PreviewImage src={filePreview} />;
        }

        return filePreviewGenericFileIcon;
    };

    const ownerState: OwnerState = {
        hasFilePreview: Boolean(filePreview),
        hasErrorWithDetails: "error" in file && typeof file.error !== "boolean",
        hasErrorWithoutDetails: "error" in file && typeof file.error === "boolean",
        disabled: Boolean(disabled),
    };

    if ("loading" in file && !file.name) {
        return <Skeleton ownerState={ownerState} variant="rounded" animation="wave" {...slotProps?.skeleton} />;
    }

    return (
        <Root ownerState={ownerState} {...slotProps?.root} {...restProps}>
            {Boolean(filePreview) && <Preview ownerState={ownerState}>{getFilePreviewContent()}</Preview>}
            <Content ownerState={ownerState} {...slotProps?.content}>
                <Tooltip title={fileNameIsOverflowing ? file.name : undefined}>
                    <FileName ref={fileNameRef} variant="caption" ownerState={ownerState} {...slotProps?.fileName}>
                        {file.name}
                    </FileName>
                </Tooltip>
                <FileListItemInfos ownerState={ownerState} {...slotProps?.fileListItemInfos}>
                    {"loading" in file ? (
                        loadingIcon
                    ) : (
                        <>
                            {"size" in file && typeof file.size !== "undefined" && (
                                <FileSize label={<PrettyBytes value={file.size} />} size="small" disabled={disabled} {...slotProps?.fileSize} />
                            )}
                            {ownerState.hasErrorWithoutDetails && (
                                <ErrorIconContainer {...slotProps?.errorIconContainer}>{errorIcon}</ErrorIconContainer>
                            )}
                            {(Boolean(onClickDownload) || !!downloadUrl) && (
                                <IconButton
                                    ownerState={ownerState}
                                    disabled={disabled}
                                    {...(downloadUrl ? { href: downloadUrl, download: true } : { onClick: onClickDownload })}
                                    {...slotProps?.iconButton}
                                >
                                    {downloadIcon}
                                </IconButton>
                            )}
                            {Boolean(onClickDelete) && (
                                <IconButton ownerState={ownerState} onClick={onClickDelete} disabled={disabled} {...slotProps?.iconButton}>
                                    {deleteIcon}
                                </IconButton>
                            )}
                        </>
                    )}
                </FileListItemInfos>
            </Content>
            {ownerState.hasErrorWithDetails && "error" in file && (
                <ErrorDetails {...slotProps?.errorDetails}>
                    {errorIcon}
                    <ErrorDetailsText variant="caption" {...slotProps?.errorDetailsText}>
                        {/* TODO create type guard to avoid as cast */}
                        {(file as ErrorFileSelectItem).error}
                    </ErrorDetailsText>
                </ErrorDetails>
            )}
        </Root>
    );
};

const getCommonItemSpacingStyles = (ownerState: OwnerState) => css`
    ${
        !ownerState.hasFilePreview &&
        css`
            &:not(:last-child) {
                margin-bottom: 2px;
            }
        `
    }
`;

const Root = createComponentSlot("div")<FileSelectListItemClassKey, OwnerState>({
    componentName: "FileSelectListItem",
    slotName: "root",
    classesResolver: ({ hasFilePreview, hasErrorWithDetails, hasErrorWithoutDetails, disabled }) => [
        hasFilePreview && "hasFilePreview",
        hasErrorWithDetails && "hasErrorWithDetails",
        hasErrorWithoutDetails && "hasErrorWithoutDetails",
        disabled && "disabled",
    ],
})(
    ({ theme, ownerState }) => css`
        ${getCommonItemSpacingStyles(ownerState)};
        padding-right: ${theme.spacing(2)};
        padding-left: ${theme.spacing(2)};
        border-radius: 4px;
        background-color: ${theme.palette.grey[50]};
        transition: background-color 200ms;
        width: 100%;
        border: 1px solid ${theme.palette.grey[100]};
        box-sizing: border-box;

        &:hover {
            background-color: ${theme.palette.grey[100]};

            .DextinityAdminFileSelectListItem-fileSize {
                background-color: ${theme.palette.grey[200]};
            }

            .DextinityAdminFileSelectListItem-iconButton {
                color: ${theme.palette.grey[900]};
            }
        }

        ${
            (ownerState.hasErrorWithDetails || ownerState.hasErrorWithoutDetails) &&
            css`
                outline: 1px dashed ${theme.palette.error.main};
                outline-offset: -1px;
            `
        }

        ${
            ownerState.disabled &&
            css`
                pointer-events: none;
            `
        }
    `,
);
const Skeleton = createComponentSlot(MuiSkeleton)<FileSelectListItemClassKey, OwnerState>({
    componentName: "FileSelectListItem",
    slotName: "skeleton",
})(
    ({ theme, ownerState }) => css`
        width: 100%;
        height: 36px;
        outline: 1px solid ${theme.palette.grey[100]};
        outline-offset: -1px;
        border-radius: 4px;
        box-sizing: border-box;
        ${getCommonItemSpacingStyles(ownerState)};

        ${
            ownerState.hasFilePreview &&
            css`
                aspect-ratio: 1;
                height: auto;
                padding-bottom: 34px;
                box-sizing: content-box;
            `
        }
    `,
);

const Preview = createComponentSlot("div")<FileSelectListItemClassKey, OwnerState>({
    componentName: "FileSelectListItem",
    slotName: "preview",
})(
    ({ theme, ownerState }) => css`
        aspect-ratio: 1;
        margin-top: 7px;
        margin-bottom: 4px;
        background-color: ${theme.palette.grey[200]};
        border-radius: 2px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        color: white;

        ${
            ownerState.hasErrorWithDetails &&
            css`
                margin-bottom: 0;
            `
        }
    `,
);

const PreviewImage = createComponentSlot("img")<FileSelectListItemClassKey>({
    componentName: "FileSelectListItem",
    slotName: "previewImage",
})(css`
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
`);

const Content = createComponentSlot("div")<FileSelectListItemClassKey, OwnerState>({
    componentName: "FileSelectListItem",
    slotName: "content",
})(
    ({ theme, ownerState }) => css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${theme.spacing(1)};

        ${
            ownerState.hasFilePreview &&
            !ownerState.hasErrorWithDetails &&
            css`
                margin-bottom: 7px;
            `
        }
    `,
);

const FileListItemInfos = createComponentSlot("div")<FileSelectListItemClassKey, OwnerState>({
    componentName: "FileSelectListItem",
    slotName: "fileListItemInfos",
})(
    ({ ownerState }) => css`
        display: flex;
        align-items: center;
        justify-content: end;
        margin-left: auto;

        ${
            ownerState.hasErrorWithDetails &&
            css`
                padding-top: 3.5px;
                margin-bottom: -3.5px;

                ${
                    ownerState.hasFilePreview &&
                    css`
                        padding-top: 0;
                        margin-bottom: 0;
                    `
                }
            `
        };
    `,
);

const FileName = createComponentSlot(Typography)<FileSelectListItemClassKey, OwnerState>({
    componentName: "FileSelectListItem",
    slotName: "fileName",
})(
    ({ ownerState, theme }) => css`
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        flex-grow: 1;
        line-height: 16px;
        padding-top: 9px;
        padding-bottom: 9px;

        ${
            ownerState.hasFilePreview &&
            css`
                padding-top: ${theme.spacing(2)};
                padding-bottom: ${theme.spacing(2)};
            `
        }

        ${
            ownerState.hasErrorWithoutDetails &&
            css`
                color: ${theme.palette.error.main};
            `
        }

        ${
            ownerState.hasErrorWithDetails &&
            css`
                padding-top: 7px;
                padding-bottom: 4px;

                ${
                    ownerState.hasFilePreview &&
                    css`
                        padding-top: 4px;
                    `
                }
            `
        }

        ${
            ownerState.disabled &&
            css`
                color: ${theme.palette.text.disabled};
            `
        }
    `,
);

const FileSize = createComponentSlot(Chip)<FileSelectListItemClassKey>({
    componentName: "FileSelectListItem",
    slotName: "fileSize",
})(
    ({ theme }) => css`
        transition: background-color 200ms;

        &:not(:last-child) {
            margin-right: ${theme.spacing(1)};
        }
    `,
);

const ErrorIconContainer = createComponentSlot("div")<FileSelectListItemClassKey>({
    componentName: "FileSelectListItem",
    slotName: "errorIconContainer",
})(
    ({ theme }) => css`
        padding: ${theme.spacing(1)};
        line-height: 0;
        font-size: 16px;
        color: ${theme.palette.error.main};

        &:last-child {
            padding-right: 0;
        }
    `,
);

const ErrorDetails = createComponentSlot("div")<FileSelectListItemClassKey>({
    componentName: "FileSelectListItem",
    slotName: "errorDetails",
})(
    ({ theme }) => css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing(1)};
        color: ${theme.palette.error.main};
        padding-bottom: 7px;
        font-size: 12px;
        line-height: 0;
    `,
);

const ErrorDetailsText = createComponentSlot(Typography)<FileSelectListItemClassKey>({
    componentName: "FileSelectListItem",
    slotName: "errorDetailsText",
})();

const IconButton = createComponentSlot(MuiIconButton)<FileSelectListItemClassKey, OwnerState>({
    componentName: "FileSelectListItem",
    slotName: "iconButton",
})(
    ({ theme, ownerState }) => css`
        padding: ${theme.spacing(1)};
        color: ${theme.palette.grey[300]};
        transition: background-color 200ms;

        &:hover {
            background-color: ${theme.palette.grey[200]};
        }

        &:last-child {
            margin-right: ${theme.spacing(-1)};
        }

        ${
            ownerState.hasFilePreview &&
            css`
                padding: 4px;

                &:last-child {
                    margin-right: -4px;
                }
            `
        }
    `,
);

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminFileSelectListItem: FileSelectListItemClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminFileSelectListItem: FileSelectListItemProps;
    }

    interface Components {
        DextinityAdminFileSelectListItem?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminFileSelectListItem"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminFileSelectListItem"];
        };
    }
}
