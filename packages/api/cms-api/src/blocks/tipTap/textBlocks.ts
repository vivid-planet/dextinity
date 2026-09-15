import type { Level as HeadingLevel } from "@tiptap/extension-heading";

export type TipTapTextBlockTag = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TipTapListTag = "ol" | "ul";

/**
 * Tag a text block style is applied to: the tag of a text block, or the tag of the list its
 * content sits in.
 */
export type TipTapStyledTag = TipTapTextBlockTag | TipTapListTag;

/**
 * Text block styles that can be applied to a text block or to the content of a list.
 */
export interface TipTapStyleOptions {
    /**
     * Names of the `textBlockStyles` that can be applied, in the order they are offered.
     * Defaults to none.
     */
    styles?: string[];
    /**
     * Style applied to newly created text blocks of this type. Must be one of `styles`.
     * Defaults to no style.
     */
    defaultStyle?: string;
}

export interface TipTapTextBlock extends TipTapStyleOptions {
    /**
     * Identifies the text block. Stored in the content's `textBlock` attribute and referenced by an
     * inline style's `appliesTo`.
     */
    name: string;
    /**
     * HTML element the text block is stored and rendered as: `p` for a paragraph, `h1`-`h6` for a
     * heading of that level. Several text blocks may share a tag, for instance a lead paragraph
     * next to a regular one.
     */
    tag: TipTapTextBlockTag;
}

/**
 * A text block or list with its defaults applied, the styles it allows and the tag its style is
 * rendered with.
 */
export interface TipTapResolvedStyledNode {
    name: string;
    tag: TipTapStyledTag;
    styles: string[];
    defaultStyle: string | null;
}

export interface TipTapResolvedTextBlock extends TipTapResolvedStyledNode {
    tag: TipTapTextBlockTag;
    /**
     * Heading level of the text block's tag, `undefined` for a paragraph.
     */
    level?: HeadingLevel;
}

export interface TipTapResolvedList extends TipTapResolvedStyledNode {
    tag: TipTapListTag;
}

export const orderedListName = "ordered-list";
export const unorderedListName = "unordered-list";

const headingLevelByTag: Record<string, HeadingLevel> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

const tipTapTextBlockTags: TipTapTextBlockTag[] = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

const getHeadingLevelFromTag = (tag: TipTapTextBlockTag): HeadingLevel | undefined => headingLevelByTag[tag];

function resolveStyles({ name, styles = [], defaultStyle, styleNames }: TipTapStyleOptions & { name: string; styleNames: string[] }) {
    for (const style of styles) {
        if (!styleNames.includes(style)) {
            throw new Error(`"${name}" references the unknown text block style "${style}"`);
        }
    }

    if (defaultStyle !== undefined && !styles.includes(defaultStyle)) {
        throw new Error(`"${name}" has the defaultStyle "${defaultStyle}", which is not one of its styles`);
    }

    return { styles, defaultStyle: defaultStyle ?? null };
}

/**
 * Applies the defaults to the configured text blocks and validates them against each other and the
 * configured text block styles.
 */
export function resolveTextBlocks({ textBlocks, styleNames }: { textBlocks: TipTapTextBlock[]; styleNames: string[] }): TipTapResolvedTextBlock[] {
    if (textBlocks.length === 0) {
        throw new Error("textBlocks must not be empty, otherwise no text block type is left");
    }

    const names = new Set<string>();
    for (const textBlock of textBlocks) {
        if (names.has(textBlock.name)) {
            throw new Error(`Duplicate text block name "${textBlock.name}"`);
        }
        names.add(textBlock.name);

        if (!tipTapTextBlockTags.includes(textBlock.tag)) {
            throw new Error(`Text block "${textBlock.name}" has an unsupported tag "${textBlock.tag}", must be one of p, h1-h6`);
        }
    }

    return textBlocks.map((textBlock) => ({
        ...textBlock,
        ...resolveStyles({ ...textBlock, styleNames }),
        level: getHeadingLevelFromTag(textBlock.tag),
    }));
}

/**
 * Applies the defaults to a list's options and validates its styles against the configured text
 * block styles. Returns `false` for a disabled list.
 */
export function resolveList({
    list,
    name,
    tag,
    styleNames,
}: {
    list: boolean | TipTapStyleOptions | undefined;
    name: string;
    tag: TipTapListTag;
    styleNames: string[];
}): TipTapResolvedList | false {
    if (!list) {
        return false;
    }
    const listOptions = list === true ? {} : list;
    return { name, tag, ...resolveStyles({ ...listOptions, name, styleNames }) };
}

/**
 * The text block a paragraph/heading node belongs to: the one matching the node's stored
 * `textBlock` name, or - for content written before the name was stored, or by a text block that
 * has since been removed - the first one with a matching tag.
 */
export function findTextBlock<T extends TipTapResolvedTextBlock>({
    name,
    tag,
    textBlocks,
}: {
    name?: string | null;
    tag: TipTapTextBlockTag;
    textBlocks: T[];
}): T | undefined {
    const byName = name ? textBlocks.find((textBlock) => textBlock.name === name && textBlock.tag === tag) : undefined;
    return byName ?? textBlocks.find((textBlock) => textBlock.tag === tag);
}

export const getParagraphTextBlocks = <T extends TipTapResolvedTextBlock>(textBlocks: T[]): T[] =>
    textBlocks.filter((textBlock) => textBlock.tag === "p");

const getHeadingTextBlocks = <T extends TipTapResolvedTextBlock>(textBlocks: T[]): T[] =>
    textBlocks.filter((textBlock) => textBlock.level !== undefined);

/**
 * The heading levels the text blocks use, in configuration order and without duplicates.
 */
export const getHeadingLevels = (textBlocks: TipTapResolvedTextBlock[]): HeadingLevel[] => [
    ...new Set(getHeadingTextBlocks(textBlocks).map((textBlock) => textBlock.level as HeadingLevel)),
];

/**
 * The text block new content starts with: the configured `defaultTextBlock`, or the first one.
 */
export function findDefaultTextBlock({
    textBlocks,
    defaultTextBlock,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    defaultTextBlock?: string;
}): TipTapResolvedTextBlock {
    if (defaultTextBlock === undefined) {
        return textBlocks[0];
    }

    const found = textBlocks.find((textBlock) => textBlock.name === defaultTextBlock);
    if (!found) {
        throw new Error(`defaultTextBlock "${defaultTextBlock}" is not one of the configured text blocks`);
    }
    return found;
}
