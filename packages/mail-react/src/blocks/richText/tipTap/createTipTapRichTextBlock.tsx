import type { ReactNode } from "react";

import { HtmlBlockText, MjmlBlockText } from "../BlockText.js";
import { mergeLinkTypes } from "../linkTypes.js";
import type { CreateTipTapRichTextBlockOptions, TipTapRichTextBlockProps } from "./common.js";
import { renderTipTapRichTextContent } from "./renderTipTapRichTextContent.js";

/**
 * Creates a pair of rich-text block components that render CMS TipTapRichText
 * block data as themed text.
 *
 * Call the factory once per configuration — at the top level of a file, not
 * inside a component — and reuse the returned components. Call it again for
 * differently-configured rich-text blocks (e.g. a generic and a headline-only
 * one).
 *
 * `MjmlTipTapRichTextBlock` renders each text block as `MjmlText` and must be
 * placed within an `MjmlColumn`. `HtmlTipTapRichTextBlock` renders each text
 * block as `HtmlText` for raw-HTML contexts (e.g. inside `MjmlRaw`); inside
 * `MjmlRaw` in an `MjmlColumn`, place `HtmlTipTapRichTextBlock` in a `<tr>` and
 * `<td>` of its own.
 *
 * ```ts
 * export const { MjmlTipTapRichTextBlock, HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
 *     blockTypes: {
 *         "heading-1": { variant: "heading1" },
 *     },
 *     textBlockStyles: {
 *         intro: { variant: "intro" },
 *     },
 * });
 * ```
 *
 * @experimental
 */
export function createTipTapRichTextBlock<TLinkTypes extends Record<string, unknown> = Record<string, unknown>>(
    options: CreateTipTapRichTextBlockOptions<TLinkTypes> = {},
): {
    // The description below is duplicated in MjmlTipTapRichTextBlock.stories.tsx because Storybook cannot read TSDoc from factory return type properties. Update both when the description changes.
    /** Renders CMS TipTapRichText block data as one `MjmlText` per text block. Must be placed within an `MjmlColumn`. */
    MjmlTipTapRichTextBlock: (props: TipTapRichTextBlockProps) => ReactNode;
    // The description below is duplicated in HtmlTipTapRichTextBlock.stories.tsx because Storybook cannot read TSDoc from factory return type properties. Update both when the description changes.
    /** Renders CMS TipTapRichText block data as one `HtmlText` div per text block, for raw-HTML contexts such as `MjmlRaw`. Inside `MjmlRaw` in an `MjmlColumn`, place `HtmlTipTapRichTextBlock` in a `<tr>` and `<td>` of its own. */
    HtmlTipTapRichTextBlock: (props: TipTapRichTextBlockProps) => ReactNode;
} {
    const blockTypes = options.blockTypes ?? {};
    const textBlockStyles = options.textBlockStyles ?? {};
    const linkTypes = mergeLinkTypes<TLinkTypes>(options.linkTypes);
    const marks = options.marks ?? {};
    const inlineStyles = options.inlineStyles ?? {};

    function MjmlTipTapRichTextBlock({ data }: TipTapRichTextBlockProps): ReactNode {
        return renderTipTapRichTextContent({
            tipTapContent: data.tipTapContent,
            blockTypes,
            textBlockStyles,
            linkTypes,
            marks,
            inlineStyles,
            blockTextComponent: MjmlBlockText,
        });
    }

    function HtmlTipTapRichTextBlock({ data }: TipTapRichTextBlockProps): ReactNode {
        return renderTipTapRichTextContent({
            tipTapContent: data.tipTapContent,
            blockTypes,
            textBlockStyles,
            linkTypes,
            marks,
            inlineStyles,
            blockTextComponent: HtmlBlockText,
        });
    }

    return { MjmlTipTapRichTextBlock, HtmlTipTapRichTextBlock };
}
