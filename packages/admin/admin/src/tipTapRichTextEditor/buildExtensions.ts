import { Extension, type Extensions } from "@tiptap/core";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { skipTrailingNodeMeta } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";

import { createDefaultTextBlockStyle } from "./extensions/DefaultTextBlockStyle";
import { InlineStyleMark } from "./extensions/InlineStyleMark";
import { Link } from "./extensions/Link";
import { NonBreakingSpace } from "./extensions/NonBreakingSpace";
import { Placeholder } from "./extensions/Placeholder";
import { SoftHyphen } from "./extensions/SoftHyphen";
import { createTextBlock } from "./extensions/TextBlock";
import { createTextBlockList } from "./extensions/TextBlockList";
import { TextBlockListItem } from "./extensions/TextBlockListItem";
import { createListLevelMaxExtension } from "./listLevelMaxHelpers";
import { resolveTipTapOptions, type TipTapResolvedOptions, type TipTapRichTextEditorOptions } from "./options";
import { getStyledNodes, hasParagraphTextBlock, hasTextBlockStyles } from "./textBlocks";

const createMaxTextBlocksExtension = (maxTextBlocks: number) =>
    Extension.create({
        name: "maxTextBlocks",
        dispatchTransaction({ transaction, next }) {
            if (transaction.doc.childCount >= maxTextBlocks) {
                transaction.setMeta(skipTrailingNodeMeta, true);
            }
            next(transaction);
        },
        addKeyboardShortcuts() {
            return {
                Enter: ({ editor }) => {
                    if (editor.state.doc.childCount >= maxTextBlocks) {
                        // Only block Enter when it would create a new text block (not inside a list, etc.)
                        const { $from } = editor.state.selection;
                        const isAtEndOfBlock = $from.parentOffset === $from.parent.content.size;
                        const parentDepth = $from.depth;
                        // If at end of a top-level text block (depth 1) or would split a top-level text block
                        if (parentDepth === 1 && isAtEndOfBlock) {
                            return true; // prevent
                        }
                    }
                    return false;
                },
            };
        },
    });

export function buildTipTapExtensions(resolvedOptions: TipTapResolvedOptions): Extensions {
    const styledNodes = getStyledNodes(resolvedOptions);
    const hasStyles = hasTextBlockStyles(styledNodes);
    // A text block with an `element` needs the node view to preview it, even without any styles.
    const styled = hasStyles || styledNodes.some((styledNode) => styledNode.element !== undefined);
    const hasParagraph = hasParagraphTextBlock(resolvedOptions.textBlocks);
    const { maxTextBlocks, listLevelMax } = resolvedOptions;

    return [
        StarterKit.configure({
            bold: resolvedOptions.bold ? {} : false,
            italic: resolvedOptions.italic ? {} : false,
            underline: resolvedOptions.underline ? {} : false,
            strike: resolvedOptions.strike ? {} : false,
            // Every paragraph and heading is one textBlock node, added below.
            heading: false,
            paragraph: false,
            orderedList: resolvedOptions.orderedList ? {} : false,
            bulletList: resolvedOptions.unorderedList ? {} : false,
            // A list item's content starts with a paragraph, so lists cannot exist without one.
            // TextBlockListItem replaces it, holding text blocks instead of paragraphs.
            listItem: false,
            listKeymap: hasParagraph ? undefined : false,
            blockquote: false,
            code: false,
            codeBlock: false,
            horizontalRule: false,
            link: false,
            // Enter at the end of a text block creates the next one, and Enter in an empty last list item
            // leaves the list, so only a trailing atom node (e.g. a custom node) needs TrailingNode's empty
            // text block. After a list, it couldn't be deleted: TrailingNode adds it again right away.
            trailingNode: { notAfter: ["textBlock", "orderedList", "bulletList"] },
        }),
        createTextBlock({ ...resolvedOptions, hasTextBlockStyles: hasStyles, styled }),
        ...(hasParagraph ? [TextBlockListItem] : []),
        ...(hasStyles ? [createDefaultTextBlockStyle(resolvedOptions)] : []),
        // Only worth replacing the list shortcuts where a list has styles of its own to apply.
        ...([resolvedOptions.orderedList, resolvedOptions.unorderedList].some((list) => list && list.styles.length > 0)
            ? [createTextBlockList(resolvedOptions)]
            : []),
        ...(resolvedOptions.inlineStyles.length > 0 ? [InlineStyleMark] : []),
        ...(resolvedOptions.sup ? [Superscript] : []),
        ...(resolvedOptions.sub ? [Subscript] : []),
        ...(resolvedOptions.nonBreakingSpace ? [NonBreakingSpace] : []),
        ...(resolvedOptions.softHyphen ? [SoftHyphen] : []),
        ...(resolvedOptions.placeholders.length > 0 ? [Placeholder] : []),
        ...(resolvedOptions.link ? [Link] : []),
        ...resolvedOptions.extensions,
        ...(maxTextBlocks !== undefined ? [createMaxTextBlocksExtension(maxTextBlocks)] : []),
        ...(listLevelMax !== undefined ? [createListLevelMaxExtension(listLevelMax)] : []),
    ];
}

/**
 * The TipTap extensions the editor uses for the options, e.g. to convert its content with TipTap's
 * `generateHTML`.
 */
export function getTipTapRichTextExtensions(options: TipTapRichTextEditorOptions = {}): Extensions {
    return buildTipTapExtensions(resolveTipTapOptions(options));
}
