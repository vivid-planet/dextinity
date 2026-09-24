import { resolveStyles, type TipTapTextBlockStyle } from "./textStyles";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * HTML element a text block is stored and rendered as: `p` for a paragraph, `h1`-`h6` for a heading
 * of that level.
 */
export type TipTapTextBlockTag = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface TipTapTextBlock {
    /**
     * Identifies the text block. Stored in the content's `textBlock` attribute, so content can tell
     * two text blocks sharing a tag apart (e.g. a lead paragraph next to a regular one).
     */
    name: string;
    /**
     * HTML element the text block is stored and rendered as. Several text blocks may share a tag.
     */
    tag: TipTapTextBlockTag;
    /**
     * Styles offered for the text block, stored in the node's `textStyle` attribute. A style the
     * text block isn't configured for is rejected during validation.
     */
    styles?: TipTapTextBlockStyle[];
}

export interface TipTapResolvedTextBlock extends TipTapTextBlock {
    /**
     * Heading level of the text block's tag, `undefined` for a paragraph.
     */
    level?: HeadingLevel;
    styles: TipTapTextBlockStyle[];
}

const headingLevelByTag: Record<string, HeadingLevel> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

const textBlockTags: TipTapTextBlockTag[] = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

export const defaultTextBlocks: TipTapTextBlock[] = [
    { name: "paragraph", tag: "p" },
    { name: "heading-1", tag: "h1" },
    { name: "heading-2", tag: "h2" },
    { name: "heading-3", tag: "h3" },
    { name: "heading-4", tag: "h4" },
    { name: "heading-5", tag: "h5" },
    { name: "heading-6", tag: "h6" },
];

/**
 * Applies the defaults to the configured text blocks and validates them against each other.
 */
export function resolveTextBlocks<T extends TipTapTextBlock>(textBlocks: T[]): Array<T & { level?: HeadingLevel; styles: TipTapTextBlockStyle[] }> {
    if (textBlocks.length === 0) {
        throw new Error("textBlocks must not be empty, otherwise no text block type is left");
    }

    const names = new Set<string>();
    for (const textBlock of textBlocks) {
        if (names.has(textBlock.name)) {
            throw new Error(`Duplicate text block name "${textBlock.name}"`);
        }
        names.add(textBlock.name);

        if (!textBlockTags.includes(textBlock.tag)) {
            throw new Error(`Text block "${textBlock.name}" has an unsupported tag "${textBlock.tag}", must be one of ${textBlockTags.join(", ")}`);
        }
    }

    return textBlocks.map((textBlock) => ({
        ...textBlock,
        level: headingLevelByTag[textBlock.tag],
        styles: resolveStyles(textBlock.styles, `text block "${textBlock.name}"`),
    }));
}

/**
 * The text block new content starts with: the configured `defaultTextBlock`, or the first one.
 */
export function findDefaultTextBlock<T extends TipTapResolvedTextBlock>({
    textBlocks,
    defaultTextBlock,
}: {
    textBlocks: T[];
    defaultTextBlock?: string;
}): T {
    if (defaultTextBlock === undefined) {
        return textBlocks[0];
    }

    const found = textBlocks.find((textBlock) => textBlock.name === defaultTextBlock);
    if (!found) {
        throw new Error(`defaultTextBlock "${defaultTextBlock}" is not one of the configured text blocks`);
    }
    return found;
}

/**
 * The text block with the tag a DraftJS block type implies, so a converted heading keeps its level.
 */
export function findTextBlockForTag<T extends TipTapResolvedTextBlock>({
    tag,
    textBlocks,
}: {
    tag: TipTapTextBlockTag;
    textBlocks: T[];
}): T | undefined {
    return textBlocks.find((textBlock) => textBlock.tag === tag);
}

export const hasParagraphTextBlock = (textBlocks: TipTapResolvedTextBlock[]): boolean => textBlocks.some((textBlock) => textBlock.tag === "p");
