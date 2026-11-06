interface ImageBlockProps {
    urlTemplate?: string;
    damFile?: { fileUrl?: string };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function getProductImageUrl(imageBlockData: unknown, apiUrl: string, { width, height }: { width: number; height: number }) {
    if (!isRecord(imageBlockData) || !isRecord(imageBlockData.block) || !isRecord(imageBlockData.block.props)) {
        return undefined;
    }
    const props = imageBlockData.block.props as ImageBlockProps;
    if (props.urlTemplate != null) {
        return `${apiUrl}${props.urlTemplate.replace("$resizeWidth", String(width)).replace("$resizeHeight", String(height))}`;
    }
    return props.damFile?.fileUrl;
}
