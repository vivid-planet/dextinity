import { useApolloClient } from "@apollo/client";
import { Button, downloadFile, useStackApi } from "@dextinity/admin";
import { Archive, Delete, Download, Restore, ZipFile } from "@dextinity/admin-icons";
import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";

import { ConfirmDeleteDialog } from "../FileActions/ConfirmDeleteDialog";
import { clearDamItemCache } from "../helpers/clearDamItemCache";
import type { DamFileDetails } from "./EditFile";
import { archiveDamFileMutation, deleteDamFileMutation, restoreDamFileMutation } from "./FilePreview.gql";
import type {
    GQLArchiveFileMutation,
    GQLArchiveFileMutationVariables,
    GQLDeleteDamFileMutation,
    GQLDeleteDamFileMutationVariables,
    GQLRestoreFileMutation,
    GQLRestoreFileMutationVariables,
} from "./FilePreview.gql.generated";
import { AudioPreview } from "./previews/AudioPreview";
import { DefaultFilePreview } from "./previews/DefaultFilePreview";
import { ImagePreview } from "./previews/ImagePreview";
import { PdfPreview } from "./previews/PdfPreview";
import { VideoPreview } from "./previews/VideoPreview";
import { ReplaceFileButton } from "./ReplaceFileButton";

const ActionsContainer = styled("div")`
    background-color: ${({ theme }) => theme.palette.grey["A400"]};
    display: flex;
    justify-content: center;
`;

const FileWrapper = styled(Paper)`
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const FilePreviewWrapper = styled("div")`
    width: 100%;
`;

const ZipFileIcon = styled(ZipFile)`
    color: ${({ theme }) => theme.palette.primary.main};
    width: 54px;
    height: 72px;
`;

interface FilePreviewProps {
    file: DamFileDetails;
}

export const FilePreview = ({ file }: FilePreviewProps) => {
    const client = useApolloClient();
    const stackApi = useStackApi();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

    let preview: ReactNode;

    if (file.mimetype.startsWith("image/") && file.image !== undefined) {
        preview = <ImagePreview file={file} />;
    } else if (file.mimetype.startsWith("audio/")) {
        preview = <AudioPreview file={file} />;
    } else if (file.mimetype.startsWith("video/")) {
        preview = <VideoPreview file={file} />;
    } else if (file.mimetype === "application/pdf") {
        preview = <PdfPreview file={file} />;
    } else if (["application/x-zip-compressed", "application/zip"].includes(file.mimetype)) {
        preview = <DefaultFilePreview customIcon={<ZipFileIcon />} />;
    } else {
        preview = <DefaultFilePreview />;
    }

    return (
        <FilePreviewWrapper>
            <ActionsContainer>
                <Button
                    variant="textLight"
                    startIcon={<Download />}
                    onClick={() => {
                        downloadFile(file.fileUrl, file.name);
                    }}
                >
                    <FormattedMessage id="dextinity.dam.file.downloadFile" defaultMessage="Download File" />
                </Button>
                <ReplaceFileButton file={file} />
                <Button
                    variant="textLight"
                    startIcon={file.archived ? <Restore /> : <Archive />}
                    onClick={() => {
                        if (file.archived) {
                            client.mutate<GQLRestoreFileMutation, GQLRestoreFileMutationVariables>({
                                mutation: restoreDamFileMutation,
                                variables: { id: file.id },
                            });
                        } else {
                            client.mutate<GQLArchiveFileMutation, GQLArchiveFileMutationVariables>({
                                mutation: archiveDamFileMutation,
                                variables: { id: file.id },
                            });
                        }
                    }}
                >
                    {file.archived ? (
                        <FormattedMessage id="dextinity.dam.file.restore" defaultMessage="Restore" />
                    ) : (
                        <FormattedMessage id="dextinity.dam.file.archive" defaultMessage="Archive" />
                    )}
                </Button>
                <Button
                    variant="textLight"
                    startIcon={<Delete />}
                    onClick={() => {
                        setDeleteDialogOpen(true);
                    }}
                >
                    <FormattedMessage id="dextinity.dam.file.delete" defaultMessage="Delete" />
                </Button>
            </ActionsContainer>
            <FileWrapper>{preview}</FileWrapper>
            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onCloseDialog={async (confirmed) => {
                    if (confirmed) {
                        await client.mutate<GQLDeleteDamFileMutation, GQLDeleteDamFileMutationVariables>({
                            mutation: deleteDamFileMutation,
                            variables: { id: file.id },
                            refetchQueries: ["DamItemsList"],
                            update: (cache) => {
                                clearDamItemCache(cache);
                            },
                        });

                        stackApi?.goBack();
                    }

                    setDeleteDialogOpen(false);
                }}
                itemType="file"
                name={file.name}
            />
        </FilePreviewWrapper>
    );
};
