import type { Editor } from "@tiptap/react";

import { findTextBlock, hasStyle, type TipTapResolvedStyledNode, type TipTapResolvedTextBlock, type TipTapTextBlockTag } from "./textBlocks";

/**
 * The tag of the text block at the cursor.
 */
function getActiveTextBlockTag(editor: Editor): TipTapTextBlockTag {
    for (let level = 1; level <= 6; level++) {
        if (editor.isActive("heading", { level })) {
            return `h${level}` as TipTapTextBlockTag;
        }
    }
    return "p";
}

/**
 * The text block at the cursor.
 */
export function getActiveTextBlock(editor: Editor, textBlocks: TipTapResolvedTextBlock[]): TipTapResolvedTextBlock | undefined {
    const attributes = editor.isActive("heading") ? editor.getAttributes("heading") : editor.getAttributes("paragraph");
    return findTextBlock({ name: attributes.textBlock as string | null, tag: getActiveTextBlockTag(editor), textBlocks });
}

/**
 * The text block style applied at the cursor, or `null` for a text block without a style.
 */
export function getActiveTextBlockStyle(editor: Editor): string | null {
    const attributes = editor.isActive("heading") ? editor.getAttributes("heading") : editor.getAttributes("paragraph");
    return (attributes.textBlockStyle as string | null) ?? null;
}

/**
 * Keeps the applied style if the text block (or list) offers it, and falls back to its default
 * style otherwise.
 */
const resolveStyle = (styledNode: TipTapResolvedStyledNode, activeStyle: string | null): string | null =>
    activeStyle !== null && hasStyle(styledNode, activeStyle) ? activeStyle : styledNode.defaultStyle;

/**
 * Switches the text block at the cursor.
 */
export function setTextBlock(editor: Editor, textBlock: TipTapResolvedTextBlock, activeStyle: string | null): boolean {
    const attributes = { textBlock: textBlock.name, textBlockStyle: resolveStyle(textBlock, activeStyle) };

    if (textBlock.level === undefined) {
        return editor.chain().focus().setParagraph().updateAttributes("paragraph", attributes).run();
    }
    return editor.chain().focus().setHeading({ level: textBlock.level }).updateAttributes("heading", attributes).run();
}

/**
 * Toggles a list and applies the style of whatever now holds the cursor's paragraph: the list's
 * styles replace the text block's while the paragraph sits in a list, and the other way round when
 * the list is toggled off.
 */
export function toggleList(
    editor: Editor,
    { list, textBlock, activeStyle }: { list: TipTapResolvedStyledNode; textBlock?: TipTapResolvedStyledNode; activeStyle: string | null },
): void {
    const wasActive = editor.isActive(list.tag === "ol" ? "orderedList" : "bulletList");
    const chain = editor.chain().focus();
    (list.tag === "ol" ? chain.toggleOrderedList() : chain.toggleBulletList()).run();

    const styledNode = wasActive ? textBlock : list;
    if (styledNode) {
        editor
            .chain()
            .updateAttributes("paragraph", { textBlockStyle: resolveStyle(styledNode, activeStyle) })
            .run();
    }
}
