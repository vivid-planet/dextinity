"use client";

import { usePreview } from "@dextinity/site-nextjs";
import type { PropsWithChildren } from "react";

export function VisibleInBlockPreviewOnly({ children }: PropsWithChildren) {
    const { previewType } = usePreview();

    if (previewType !== "BlockPreview") {
        return null;
    }

    return <>{children}</>;
}
