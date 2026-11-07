import { downloadFile } from "@dextinity/admin";
import { Button, Icon } from "@dextinity/ui";
import type { ReactNode } from "react";
import { useIntl } from "react-intl";

import { useVideoPerformanceWarning } from "../config/damConfig";
import { VideoPerformanceWarningAlert } from "../VideoPerformanceWarningAlert";
import type { DamFileDetails } from "./EditFile";
import { FileInfos } from "./FileInfos";
import { PreviewBody, PreviewPanel, PreviewStage } from "./FilePreview.sc";
import { AudioPreview } from "./previews/AudioPreview";
import { DefaultFilePreview } from "./previews/DefaultFilePreview";
import { ImagePreview } from "./previews/ImagePreview";
import { PdfPreview } from "./previews/PdfPreview";
import { VideoPreview } from "./previews/VideoPreview";
import { ReplaceFileButton } from "./ReplaceFileButton";

interface FilePreviewProps {
    file: DamFileDetails;
    onNotify: (notification: { tone: "error" | "info"; message: string }) => void;
}

/**
 * The preview pane of `EditFile`: the file itself, where the crop area and focus point of an image are set, its facts, and the actions
 * that work on its content.
 */
export function FilePreview({ file, onNotify }: FilePreviewProps) {
    const intl = useIntl();
    const { isVideoTooLarge } = useVideoPerformanceWarning();

    let preview: ReactNode;
    if (file.mimetype.startsWith("image/") && file.image != null) {
        preview = <ImagePreview file={file} />;
    } else if (file.mimetype === "image/svg+xml") {
        preview = <img src={file.fileUrl} alt={file.altText ?? ""} />;
    } else if (file.mimetype.startsWith("audio/")) {
        preview = <AudioPreview file={file} />;
    } else if (file.mimetype.startsWith("video/")) {
        preview = <VideoPreview file={file} />;
    } else if (file.mimetype === "application/pdf") {
        preview = <PdfPreview file={file} />;
    } else {
        preview = <DefaultFilePreview file={file} />;
    }

    return (
        <PreviewPanel
            title={intl.formatMessage({ id: "dextinity.dam.file.preview", defaultMessage: "Preview" })}
            actions={
                <>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<Icon name="download" />}
                        onClick={() => downloadFile(file.fileUrl, file.name)}
                    >
                        {intl.formatMessage({ id: "dextinity.dam.file.downloadFile", defaultMessage: "Download File" })}
                    </Button>
                    <ReplaceFileButton file={file} onNotify={onNotify} />
                </>
            }
        >
            <PreviewBody>
                {isVideoTooLarge(file) && <VideoPerformanceWarningAlert />}
                <PreviewStage data-type={file.mimetype === "application/pdf" ? "pdf" : undefined}>{preview}</PreviewStage>
                <FileInfos file={file} />
            </PreviewBody>
        </PreviewPanel>
    );
}
