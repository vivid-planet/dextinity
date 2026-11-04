import type { ComponentType, ReactNode } from "react";
import redraftImport from "redraft";

import { type BlockTextProps, HtmlBlockText, MjmlBlockText } from "../BlockText.js";
import type { RichTextBlockTypeProps, RichTextInlineRenderer, RichTextLinkHrefResolver } from "../common.js";
import { mergeLinkTypes } from "../linkTypes.js";
import type { CreateRichTextBlockOptions, RichTextBlockProps } from "./common.js";
import { createRichTextRenderers } from "./createRichTextRenderers.js";

// redraft is CommonJS-only: under native ESM the default import is the whole
// `module.exports` object, under bundlers it is the render function itself.
const redraft = typeof redraftImport === "function" ? redraftImport : redraftImport.default;

interface DraftBlock {
    key: string;
    text: string;
    depth?: number;
}

function isDraftBlock(block: unknown): block is DraftBlock {
    if (typeof block !== "object" || block === null || !("key" in block) || !("text" in block)) {
        return false;
    }

    const hasStringKey = typeof block.key === "string";
    const hasStringText = typeof block.text === "string";
    const hasOptionalNumberDepth = !("depth" in block) || typeof block.depth === "number";

    return hasStringKey && hasStringText && hasOptionalNumberDepth;
}

function isDraftContent(draftContent: unknown): draftContent is { blocks: DraftBlock[] } {
    if (typeof draftContent !== "object" || draftContent === null || !("blocks" in draftContent)) {
        return false;
    }

    const { blocks } = draftContent;

    return Array.isArray(blocks) && blocks.every(isDraftBlock);
}

/** `redraft` throws when the first block is nested, and reports a depth deeper than the level it nests at. */
function withoutSkippedDepthLevels(blocks: DraftBlock[]): DraftBlock[] {
    let deepestAllowedDepth = 0;

    return blocks.map((block) => {
        const depth = Math.min(block.depth ?? 0, deepestAllowedDepth);

        deepestAllowedDepth = depth + 1;

        return { ...block, depth };
    });
}

interface RenderRichTextContentOptions {
    draftContent: unknown;
    blockTypes: Record<string, RichTextBlockTypeProps>;
    linkTypes: Record<string, RichTextLinkHrefResolver>;
    inline: Record<string, RichTextInlineRenderer>;
    blockTextComponent: ComponentType<BlockTextProps>;
}

function renderRichTextContent({ draftContent, blockTypes, linkTypes, inline, blockTextComponent }: RenderRichTextContentOptions): ReactNode {
    if (!isDraftContent(draftContent)) {
        return null;
    }

    const blocksWithText = draftContent.blocks.filter((block) => block.text !== "");
    const lastBlockKey = blocksWithText[blocksWithText.length - 1]?.key;

    if (lastBlockKey === undefined) {
        return null;
    }

    const renderers = createRichTextRenderers({ blockTypes, linkTypes, inline, blockTextComponent, lastBlockKey });

    return redraft({ ...draftContent, blocks: withoutSkippedDepthLevels(blocksWithText) }, renderers);
}

/**
 * Creates a pair of rich-text block components that render CMS RichText block
 * data (draft-js raw content) as themed text.
 *
 * Call the factory once per configuration — at the top level of a file, not
 * inside a component — and reuse the returned components. Call it again for
 * differently-configured rich-text blocks (e.g. a generic and a headline-only
 * one).
 *
 * `MjmlRichTextBlock` renders each draft block as `MjmlText` and must be
 * placed within an `MjmlColumn`. `HtmlRichTextBlock` renders each draft block
 * as `HtmlText` for raw-HTML contexts (e.g. inside `MjmlRaw`); inside
 * `MjmlRaw` in an `MjmlColumn`, place `HtmlRichTextBlock` in a `<tr>` and
 * `<td>` of its own.
 *
 * ```ts
 * export const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock({
 *     blockTypes: {
 *         "header-one": { variant: "heading1" },
 *         "paragraph-standard": { variant: "body" },
 *     },
 * });
 * ```
 */
export function createRichTextBlock<TLinkTypes extends Record<string, unknown> = Record<string, unknown>>(
    options: CreateRichTextBlockOptions<TLinkTypes> = {},
): {
    // The description below is duplicated in MjmlRichTextBlock.stories.tsx because Storybook cannot read TSDoc from factory return type properties. Update both when the description changes.
    /** Renders CMS RichText block data (draft-js raw content) as one `MjmlText` per draft block. Must be placed within an `MjmlColumn`. */
    MjmlRichTextBlock: (props: RichTextBlockProps) => ReactNode;
    // The description below is duplicated in HtmlRichTextBlock.stories.tsx because Storybook cannot read TSDoc from factory return type properties. Update both when the description changes.
    /** Renders CMS RichText block data (draft-js raw content) as one `HtmlText` div per draft block, for raw-HTML contexts such as `MjmlRaw`. Inside `MjmlRaw` in an `MjmlColumn`, place `HtmlRichTextBlock` in a `<tr>` and `<td>` of its own. */
    HtmlRichTextBlock: (props: RichTextBlockProps) => ReactNode;
} {
    const blockTypes = options.blockTypes ?? {};
    const linkTypes = mergeLinkTypes<TLinkTypes>(options.linkTypes);
    const inline = options.inline ?? {};

    function MjmlRichTextBlock({ data }: RichTextBlockProps): ReactNode {
        return renderRichTextContent({ draftContent: data.draftContent, blockTypes, linkTypes, inline, blockTextComponent: MjmlBlockText });
    }

    function HtmlRichTextBlock({ data }: RichTextBlockProps): ReactNode {
        return renderRichTextContent({ draftContent: data.draftContent, blockTypes, linkTypes, inline, blockTextComponent: HtmlBlockText });
    }

    return { MjmlRichTextBlock, HtmlRichTextBlock };
}
