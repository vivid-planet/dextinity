import type { HTMLAttributes, ReactNode } from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * HTML element a text block is stored and rendered as: `p` for a paragraph, `h1`-`h6` for a heading
 * of that level.
 */
export type TipTapTextBlockTag = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Props an `element` must spread onto the element it renders.
 */
export interface TipTapTextBlockElementProps extends HTMLAttributes<HTMLElement> {
    "data-text-block-style"?: string;
}

/**
 * Renders a text block in the editor. Receives the `tag` of the text block it is applied to, so one
 * function can be shared by several text blocks: `(props, Tag) => <Tag {...props} />`.
 */
export type TipTapTextBlockElement = (props: TipTapTextBlockElementProps, tag: TipTapTextBlockTag) => ReactNode;

export interface TipTapTextBlockStyle {
    /**
     * Identifies the style. Stored in the content's `textBlockStyle` attribute.
     */
    name: string;
    /**
     * Label shown in the toolbar's styling select.
     */
    label: ReactNode;
    element: TipTapTextBlockElement;
}

interface TipTapTextBlockBase {
    /**
     * Identifies the text block. Stored in the content's `textBlock` attribute, so content can tell
     * two text blocks sharing a tag apart (e.g. a lead paragraph next to a regular one).
     */
    name: string;
    /**
     * Label shown in the toolbar's text block type select.
     */
    label: ReactNode;
    /**
     * HTML element the text block is stored and rendered as. Several text blocks may share a tag,
     * for instance a lead paragraph next to a regular one.
     */
    tag: TipTapTextBlockTag;
}

/**
 * A text block either offers `styles` to choose from, or - needing no choice - renders through an
 * `element` of its own. Leaving out both renders the plain tag.
 */
export type TipTapTextBlock = TipTapTextBlockBase &
    ({ styles?: TipTapTextBlockStyle[]; element?: never } | { element: TipTapTextBlockElement; styles?: never });

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

export const allHeadingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

function assertUniqueStyleNames(owner: string, styles: TipTapTextBlockStyle[] = []) {
    const duplicate = styles.find((style, index) => styles.findIndex((candidate) => candidate.name === style.name) !== index);
    if (duplicate) {
        throw new Error(`"${owner}" offers the text block style "${duplicate.name}" twice`);
    }
}

/**
 * Applies the defaults to the configured text blocks and validates them against each other.
 */
export function resolveTextBlocks(textBlocks: TipTapTextBlock[]): TipTapResolvedTextBlock[] {
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
 * The styles of all text blocks and lists, each once. A style's name identifies it throughout the
 * editor, so text blocks offering the same style must share one definition.
 */
export function collectTextBlockStyles({
    textBlocks,
    orderedList,
    unorderedList,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    orderedList: TipTapListOptions | false;
    unorderedList: TipTapListOptions | false;
}): TipTapTextBlockStyle[] {
    const stylesByName = new Map<string, TipTapTextBlockStyle>();
    for (const styled of [...textBlocks, orderedList, unorderedList]) {
        for (const style of (styled && styled.styles) || []) {
            if ((stylesByName.get(style.name) ?? style) !== style) {
                throw new Error(`The text block style "${style.name}" is defined more than once, share one definition instead`);
            }
            stylesByName.set(style.name, style);
        }
    }
    return [...stylesByName.values()];
}

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

/**
 * The text block a node belongs to: the one it names, or - for a name that is no longer configured -
 * none, so the caller can fall back to the default text block.
 */
export function findTextBlock({
    name,
    textBlocks,
}: {
    name?: string | null;
    textBlocks: TipTapResolvedTextBlock[];
}): TipTapResolvedTextBlock | undefined {
    return textBlocks.find((textBlock) => textBlock.name === name);
}

/**
 * The text block an element parsed from HTML becomes: the one it names, or - for HTML from outside
 * the editor, e.g. pasted or returned by the content translation - the first one with its tag.
 */
export function parseTextBlock({
    name,
    tag,
    textBlocks,
}: {
    name?: string | null;
    tag: TipTapTextBlockTag;
    textBlocks: TipTapResolvedTextBlock[];
}): TipTapResolvedTextBlock | undefined {
    return findTextBlock({ name, textBlocks }) ?? textBlocks.find((textBlock) => textBlock.tag === tag);
}

/**
 * One text block per tag, keeping the first of several sharing one - for the shortcuts and input
 * rules, which address a text block by its tag and can't tell two of them apart.
 */
export function findTextBlockPerTag(textBlocks: TipTapResolvedTextBlock[]): TipTapResolvedTextBlock[] {
    return textBlocks.filter((textBlock, index) => textBlocks.findIndex((candidate) => candidate.tag === textBlock.tag) === index);
}

/**
 * Whether a list item can hold the text block. Its content starts with a paragraph, and a heading is
 * the same node type as one, so the schema can't refuse it - the editor has to.
 */
export const isTextBlockAllowedInListItem = (textBlock: TipTapResolvedTextBlock): boolean => textBlock.tag === "p";

export const hasParagraphTextBlock = (textBlocks: TipTapResolvedTextBlock[]): boolean => textBlocks.some((textBlock) => textBlock.tag === "p");
