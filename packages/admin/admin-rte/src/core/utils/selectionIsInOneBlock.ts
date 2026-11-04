import type { EditorState } from "draft-js";

export default function selectionIsInOneBlock(editorState: EditorState): boolean {
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();

    return startKey === endKey;
}
