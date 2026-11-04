"use client";

import { usePreview } from "@dextinity/site-react-router";

export function PreviewInfo({ visibility }: { visibility: string }) {
    const { previewType } = usePreview();
    return (
        <p>
            Preview type: {previewType}, visibility: {visibility}
        </p>
    );
}
