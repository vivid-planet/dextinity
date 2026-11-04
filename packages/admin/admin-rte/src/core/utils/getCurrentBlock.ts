import type { EditorState } from "draft-js";

export default function getCurrentBlock(editorState: EditorState) {
    const selection = editorState.getSelection();
    if (!selection) {
        return null;
    }
    return editorState.getCurrentContent().getBlockForKey(selection.getStartKey());
}
