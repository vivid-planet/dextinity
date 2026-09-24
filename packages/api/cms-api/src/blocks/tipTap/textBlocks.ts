type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * HTML element a text block is stored and rendered as: `p` for a paragraph, `h1`-`h6` for a heading
 * of that level.
 */
export type TipTapTextBlockTag = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface TipTapTextBlockStyle {
    /**
     * Identifies the style. Stored in the content's `textBlockStyle` attribute.
     */
    name: string;
}

interface TipTapTextBlockBase {
    /**
     * Identifies the text block. Stored in the content's `textBlock` attribute, so content can tell
     * two text blocks sharing a tag apart (e.g. a lead paragraph next to a regular one).
     */
    name: string;
    /**
     * HTML element the text block is stored and rendered as. Several text blocks may share a tag.
     */
    tag: TipTapTextBlockTag;
}

/**
 * A text block either offers `styles` to choose from, or - needing no choice - renders through an
 * `element` of its own. The API doesn't render, so `element` only mirrors the Admin configuration.
 */
export type TipTapTextBlock = TipTapTextBlockBase & ({ styles?: TipTapTextBlockStyle[]; element?: never } | { element: true; styles?: never });

export type TipTapResolvedTextBlock = TipTapTextBlock & {
    /**
     * Heading level of the text block's tag, `undefined` for a paragraph.
     */
    level?: HeadingLevel;
};

export interface TipTapListOptions {
    /**
     * Styles offered for a list item's content.
     */
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

function assertUniqueStyleNames(owner: string, styles: TipTapTextBlockStyle[] = []) {
    const duplicate = styles.find((style, index) => styles.findIndex((candidate) => candidate.name === style.name) !== index);
    if (duplicate) {
        throw new Error(`"${owner}" offers the text block style "${duplicate.name}" twice`);
    }
}

/**
 * Applies the defaults to the configured text blocks and validates them against each other.
 */
export function resolveTextBlocks<T extends TipTapTextBlock>(textBlocks: T[]): Array<T & { level?: HeadingLevel }> {
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

        assertUniqueStyleNames(textBlock.name, textBlock.styles);
    }

    return textBlocks.map((textBlock) => ({ ...textBlock, level: headingLevelByTag[textBlock.tag] }));
}

/**
 * Applies the defaults to a list's options: `false` for a disabled list, no styles for a list enabled
 * with `true`.
 */
export function resolveList(name: string, list: boolean | TipTapListOptions): TipTapListOptions | false {
    if (list === true) {
        return { styles: [] };
    }
    if (list) {
        assertUniqueStyleNames(name, list.styles);
    }
    return list;
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
