import { type DraftBlockType, EditorState } from "draft-js";

import type { FilterEditorStateFn } from "../../types";

type BlockTypeList = DraftBlockType[];

interface IOptions {
    skipNonEmptyBlocks?: boolean;
}
// inspired by https://github.com/thibaudcolas/draftjs-filters/blob/master/src/lib/filters/blocks.js#L127
const changeBlockType: (blockTypeList: BlockTypeList, blockType: DraftBlockType, options?: IOptions) => FilterEditorStateFn =
    (blockTypeList, blockType = "unstyled", options = {}) =>
    (nextState) => {
        const content = nextState.getCurrentContent();
        const blockMap = content.getBlockMap();
        const changedBlocks: any = blockMap
            .filter((block) => {
                if (!block) {
                    return false;
                }
                // check if type of the block is in our blockTypeList
                if (blockTypeList.includes(block.getType())) {
                    // only empty blocks are included when this options is set
                    if (options.skipNonEmptyBlocks) {
                        return block.getLength() ? false : true;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            })
            .map((block) => {
                return block!.merge({
                    type: blockType,
                    depth: 0,
                });
            });

        return EditorState.set(nextState, {
            currentContent: content.merge({
                blockMap: blockMap.merge(changedBlocks),
            }),
        });
    };

export default changeBlockType;
