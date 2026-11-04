import type { EditorState } from "draft-js";
import { handleDraftEditorPastedText } from "draftjs-conductor";

import defaultFilterEditorStateBeforeUpdate from "../filterEditor/default";
import { defaultOptions, type IOptions } from "../Rte";

function pasteAndFilterText(
    html: string | undefined,
    editorState: EditorState,
    options: Pick<IOptions, "supports" | "listLevelMax" | "maxBlocks" | "standardBlockType">,
): false | EditorState {
    const nextEditorState = handleDraftEditorPastedText(html, editorState);

    if (nextEditorState) {
        return defaultFilterEditorStateBeforeUpdate(nextEditorState, { ...defaultOptions, ...options });
    }

    return false;
}

export { pasteAndFilterText };
