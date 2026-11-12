"use client";
import { useIFrameBridge } from "@dextinity/site-nextjs";
import { TipTapRichTextBlock } from "@src/common/blocks/TipTapRichTextBlock";
import { withBlockPreview } from "@src/util/blockPreview";

export default withBlockPreview(() => {
    const { block } = useIFrameBridge();
    return block ? <TipTapRichTextBlock data={block} /> : null;
});
