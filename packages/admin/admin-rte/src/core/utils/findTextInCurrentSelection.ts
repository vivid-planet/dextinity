import type { EditorState } from "draft-js";

import selectionIsInOneBlock from "./selectionIsInOneBlock";

// returns the text of the current selection
export default function findTextInCurrentSelection(editorState: EditorState): string {
    if (!selectionIsInOneBlock(editorState)) {
        return "";
    }

    const selectionState = editorState.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const currentContent = editorState.getCurrentContent();
    const currentContentBlock = currentContent.getBlockForKey(anchorKey);
    const start = selectionState.getStartOffset();
    const end = selectionState.getEndOffset();
    const selectedText = currentContentBlock.getText().slice(start, end);
    return selectedText;
}
