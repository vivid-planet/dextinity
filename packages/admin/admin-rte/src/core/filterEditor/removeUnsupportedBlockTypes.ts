import type { DraftBlockType } from "draft-js";

import type { FilterEditorStateBeforeUpdateFn, SupportedThings } from "../Rte";
import changeBlockType from "./utils/changeBlockType";

const removeUnsupportedBlockTypes: FilterEditorStateBeforeUpdateFn = (newState, { supports, standardBlockType }) => {
    // unstyle all core-blocks which are not supported
    const blackListBlocks: DraftBlockType[] = ["paragraph", "code-block", "atomic"]; // these are not supported at all by our rte

    const supportsToBlockMap: Partial<Record<SupportedThings, DraftBlockType>> = {
        "header-one": "header-one",
        "header-two": "header-two",
        "header-three": "header-three",
        "header-four": "header-four",
        "header-five": "header-five",
        "header-six": "header-six",
        blockquote: "blockquote",
        "ordered-list": "ordered-list-item",
        "unordered-list": "unordered-list-item",
    };
    const supportsToTest = Object.keys(supportsToBlockMap) as SupportedThings[];
    supportsToTest.forEach((support) => {
        if (!supports.includes(support) && supportsToBlockMap[support]) {
            const blockType = supportsToBlockMap[support];
            if (blockType) {
                blackListBlocks.push(blockType);
            }
        }
    });

    // also remove unstyled block-type and set it to the standard-block-type if standardBlockType is not "unstyled"
    if (standardBlockType !== "unstyled") {
        blackListBlocks.push("unstyled");
    }
    return changeBlockType(blackListBlocks, standardBlockType)(newState);
};

export default removeUnsupportedBlockTypes;
