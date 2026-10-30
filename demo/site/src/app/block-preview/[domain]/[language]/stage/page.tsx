"use client";

import { useIFrameBridge } from "@dextinity/site-nextjs";
import { StageBlock } from "@src/documents/pages/blocks/StageBlock";
import { withBlockPreview } from "@src/util/blockPreview";

export default withBlockPreview(() => {
    const { block: stage } = useIFrameBridge();
    return stage ? <StageBlock data={stage} /> : null;
});
