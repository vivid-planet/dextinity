import { Extension } from "@tiptap/core";
import type { JSONContent } from "@tiptap/react";

function getListDepthAtSelection(editor: {
    state: { selection: { $from: { depth: number; node: (depth: number) => { type: { name: string } } } } };
}): number {
    const { $from } = editor.state.selection;
    let listDepth = 0;
    for (let d = 0; d <= $from.depth; d++) {
        const node = $from.node(d);
        if (node.type.name === "bulletList" || node.type.name === "orderedList") {
            listDepth++;
        }
    }
    return listDepth;
}

export function getListNestingDepthFromJson(content: JSONContent, currentDepth = 0): number {
    if (!content || typeof content !== "object") {
        return 0;
    }

    const isListNode = content.type === "bulletList" || content.type === "orderedList";
    const depth = isListNode ? currentDepth + 1 : currentDepth;

    if (!Array.isArray(content.content)) {
        return depth;
    }

    let maxDepth = depth;
    for (const child of content.content) {
        const childDepth = getListNestingDepthFromJson(child, depth);
        if (childDepth > maxDepth) {
            maxDepth = childDepth;
        }
    }
    return maxDepth;
}

export function trimListNesting(content: JSONContent, maxLevel: number, currentDepth = 0): JSONContent {
    if (!content || typeof content !== "object") {
        return content;
    }

    const isListNode = content.type === "bulletList" || content.type === "orderedList";
    const depth = isListNode ? currentDepth + 1 : currentDepth;

    if (isListNode && depth > maxLevel) {
        // Remove this list node entirely - extract text content from listItems as flat content
        return { type: "textBlock" };
    }

    if (!Array.isArray(content.content)) {
        return content;
    }

    const newContent = content.content
        .map((child) => trimListNesting(child, maxLevel, depth))
        .filter((child) => {
            // When a list is removed (replaced with an empty text block), keep it only if it has content
            if (isListNode && child.type === "textBlock" && child.content === undefined) {
                return false;
            }
            return true;
        });

    return { ...content, content: newContent };
}

export const createListLevelMaxExtension = (listLevelMax: number) =>
    Extension.create({
        name: "listLevelMax",
        addKeyboardShortcuts() {
            return {
                Tab: ({ editor }) => {
                    // Only intercept Tab in list context
                    const { $from } = editor.state.selection;
                    let inList = false;
                    for (let d = 0; d <= $from.depth; d++) {
                        const node = $from.node(d);
                        if (node.type.name === "bulletList" || node.type.name === "orderedList") {
                            inList = true;
                            break;
                        }
                    }
                    if (!inList) {
                        return false;
                    }

                    const currentDepth = getListDepthAtSelection(editor);
                    if (currentDepth >= listLevelMax) {
                        return true; // prevent further indentation
                    }
                    return false;
                },
            };
        },
    });
