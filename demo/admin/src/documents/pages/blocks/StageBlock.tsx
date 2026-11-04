import { createListBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { BasicStageBlock } from "./BasicStageBlock";

/* If you need multiple stage blocks, you should use createBlocksBlock instead of createListBlock */
export const StageBlock = createListBlock({
    name: "Stage",
    displayName: <FormattedMessage id="stageListBlock.displayName" defaultMessage="Stage List" />,
    block: BasicStageBlock,
    maxVisibleBlocks: 1,
    itemName: <FormattedMessage id="stageListBlock.itemName" defaultMessage="item" />,
    itemsName: <FormattedMessage id="stageListBlock.itemsName" defaultMessage="items" />,
});
