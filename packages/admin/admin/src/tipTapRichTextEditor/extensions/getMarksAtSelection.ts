import type { EditorState } from "@tiptap/pm/state";

export function getMarksAtSelection(state: EditorState) {
    return (state.storedMarks ?? state.selection.$from.marks()).map((mark) => mark.toJSON());
}
