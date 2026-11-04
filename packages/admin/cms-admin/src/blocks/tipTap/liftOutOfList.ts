import type { Editor } from "@tiptap/react";

/**
 * Takes the selection out of the list it sits in, one level at a time until it is out of the
 * outermost one. Switching to a heading does this, because a list item holds paragraphs.
 */
export function liftOutOfList(editor: Editor): void {
    while (editor.isActive("listItem")) {
        if (!editor.chain().focus().liftListItem("listItem").run()) {
            return;
        }
    }
}
