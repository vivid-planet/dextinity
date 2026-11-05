"use client";

import { useIFrameBridge } from "@dextinity/site-react-router";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { withBlockPreview } from "@src/util/blockPreview";

export const MainMenuBlockPreviewContent = withBlockPreview(() => {
    const { block } = useIFrameBridge();
    return block ? <RichTextBlock data={block} /> : null;
});
