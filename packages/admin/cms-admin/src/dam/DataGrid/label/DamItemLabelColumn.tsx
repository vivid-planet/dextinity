import { type IFilterApi, StackLink } from "@dextinity/admin";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type ReactNode, useEffect, useRef } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";

import type { TextMatch } from "../../../common/MarkedMatches";
import { useDamConfig } from "../../config/damConfig";
import type { DamFilter } from "../../DamTable";
import { isFile } from "../../helpers/isFile";
import { isFolder } from "../../helpers/isFolder";
import type { FileUploadApi } from "../fileUpload/useDamFileUpload";
import type { GQLDamFileTableFragment, GQLDamFolderTableFragment } from "../FolderDataGrid";
import type { DamItemMatches } from "../useDamSearchHighlighting";
import DamItemLabel from "./DamItemLabel";

interface DamLabelWrapperProps {
    isHovered?: boolean;
}

const DamItemLabelWrapper = styled(Box, { shouldForwardProp: (prop) => prop !== "isHovered" })<DamLabelWrapperProps>`
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;

    border: ${({ theme, isHovered }) => (isHovered ? `solid 1px ${theme.palette.primary.main}` : "none")};
    background-color: ${({ isHovered }) => (isHovered ? "rgba(41, 182, 246, 0.1)" : "transparent")};
`;

const StyledStackLink = styled(StackLink)`
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: ${({ theme }) => theme.palette.grey[900]};
`;

export interface RenderDamLabelOptions {
    matches?: TextMatch[];
    filterApi: IFilterApi<DamFilter>;
    showLicenseWarnings?: boolean;
}

interface DamItemLabelColumnProps {
    item: GQLDamFileTableFragment | GQLDamFolderTableFragment;
    renderDamLabel?: (row: GQLDamFileTableFragment | GQLDamFolderTableFragment, options: RenderDamLabelOptions) => ReactNode;
    matches: DamItemMatches;
    isSearching: boolean;
    filterApi: IFilterApi<DamFilter>;
    fileUploadApi: FileUploadApi;
    footerApi: {
        show: ({ folderName }: { folderName?: string }) => void;
        hide: () => void;
    };
    hoverApi: {
        showHoverStyles: (id?: string) => void;
        hideHoverStyles: () => void;
        isHovered: boolean;
    };
    scrollIntoView?: boolean;
}

export const DamItemLabelColumn = ({
    item,
    renderDamLabel,
    matches,
    isSearching,
    filterApi,
    fileUploadApi,
    footerApi,
    hoverApi,
    scrollIntoView = false,
}: DamItemLabelColumnProps) => {
    const damConfig = useDamConfig();
    const columnRef = useRef<HTMLDivElement>(undefined);

    useEffect(() => {
        if (scrollIntoView) {
            setTimeout(() => {
                columnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 500);
        }
    }, [columnRef, scrollIntoView]);

    // handles upload of native file or folder (e.g. file from desktop) to subfolder
    // If the native file is dropped on a folder row in the table, it is uploaded
    // to said folder
    const { getRootProps: getFolderRootProps } = useDropzone({
        ...fileUploadApi.dropzoneConfig,
        noClick: true,
        noDragEventsBubbling: true,
        onDragOver: () => {
            hoverApi.showHoverStyles(item.id);
            footerApi.show({ folderName: item.name });
        },
        onDragLeave: () => {
            hoverApi.hideHoverStyles();
            footerApi.hide();
        },
        onDrop: async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            hoverApi.hideHoverStyles();
            footerApi.hide();

            await fileUploadApi.uploadFiles({ acceptedFiles, fileRejections }, { folderId: item.id });
        },
    });

    return (
        <DamItemLabelWrapper ref={columnRef} isHovered={hoverApi.isHovered} {...(isFolder(item) && getFolderRootProps())}>
            {renderDamLabel ? (
                renderDamLabel(item, { matches: matches.get(item.id), filterApi, showLicenseWarnings: damConfig.enableLicenseFeature })
            ) : (
                <StyledStackLink
                    pageName={isFile(item) ? "edit" : "folder"}
                    payload={item.id}
                    onClick={() => {
                        if (isFolder(item)) {
                            filterApi.formApi.change("searchText", undefined);
                        }
                    }}
                >
                    <DamItemLabel
                        asset={item}
                        showPath={isSearching}
                        matches={matches.get(item.id)}
                        showLicenseWarnings={damConfig.enableLicenseFeature}
                    />
                </StyledStackLink>
            )}
        </DamItemLabelWrapper>
    );
};
