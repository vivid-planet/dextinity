import { EditorState, SelectionState } from "draft-js";

import type { FilterEditorStateBeforeUpdateFn } from "../Rte";

// when a maxBlocks-limit is set, all blocks exceeding this limit are removed completely (with the content)
//
const removeBlocksExceedingBlockLimit: FilterEditorStateBeforeUpdateFn = (newState, { maxBlocks }) => {
    if (maxBlocks) {
        const content = newState.getCurrentContent();
        const blockMap = content.getBlockMap();
        if (blockMap.count() > maxBlocks) {
            const limitedBlocks: any = blockMap.take(maxBlocks);

            const lastKey = limitedBlocks.last().getKey();

            return EditorState.set(newState, {
                currentContent: content.merge({
                    blockMap: limitedBlocks,
                }),
                selection: SelectionState.createEmpty(lastKey),
            });
        }
    }

    return newState;
};

export default removeBlocksExceedingBlockLimit;
