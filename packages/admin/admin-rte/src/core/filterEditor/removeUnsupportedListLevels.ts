import { EditorState } from "draft-js";

import type { FilterEditorStateBeforeUpdateFn } from "../Rte";

const removeUnsupportedListLevels: FilterEditorStateBeforeUpdateFn = (newState, { listLevelMax }) => {
    const content = newState.getCurrentContent();
    const blockMap = content.getBlockMap();

    return EditorState.set(newState, {
        currentContent: content.merge({
            blockMap: blockMap.map((block) => block?.merge({ depth: Math.min(block.getDepth(), listLevelMax) })),
        }),
    });
};

export default removeUnsupportedListLevels;
