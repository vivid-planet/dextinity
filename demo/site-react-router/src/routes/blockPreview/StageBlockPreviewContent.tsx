"use client";

import { useIFrameBridge } from "@dextinity/site-react-router";
import { StageBlock } from "@src/documents/pages/blocks/StageBlock";
import { withBlockPreview } from "@src/util/blockPreview";

export const StageBlockPreviewContent = withBlockPreview(() => {
    const { block: stage } = useIFrameBridge();
    return stage ? <StageBlock data={stage} /> : null;
});
