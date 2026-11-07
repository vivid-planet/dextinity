import { ImageCrop } from "../../../common/image/ImageCrop";
import type { DamFileDetails } from "../EditFile";

interface ImagePreviewProps {
    file: DamFileDetails;
}

export function ImagePreview({ file }: ImagePreviewProps) {
    return <ImageCrop src={file.fileUrl} />;
}
