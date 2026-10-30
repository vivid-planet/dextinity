"use client";
import { useIFrameBridge } from "@dextinity/site-react";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { withBlockPreview } from "@src/util/blockPreview";

export const MainMenuBlockPreviewPage = withBlockPreview(() => {
    const { block } = useIFrameBridge();
    return block ? <RichTextBlock data={block} /> : null;
});
