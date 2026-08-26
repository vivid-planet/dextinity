import { Node } from "@tiptap/core";

/**
 * The document node with a configurable ProseMirror content expression.
 *
 * Restricting the content is what makes a node non-deletable: ProseMirror rejects every transaction
 * that would leave the document without it. `createTipTapTableBlock` uses this to pin exactly one
 * table into the document.
 */
export const createTipTapDocument = (content: string) =>
    Node.create({
        name: "doc",
        topNode: true,
        content,
    });
