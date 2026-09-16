import type { Level as HeadingLevel } from "@tiptap/extension-heading";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * HTML element a text block is stored and rendered as: `p` for a paragraph, `h1`-`h6` for a heading
 * of that level.
 */
export type TipTapTextBlockTag = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TipTapListTag = "ol" | "ul";

/**
 * Props a text block's (or style's) `element` must spread onto the element it renders.
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

/**
 * How a text block (or a list) is rendered: either through the `styles` it lets the editor choose
 * from, or - for one that needs no style choice - through a single `element` of its own. The two
 * exclude each other, and leaving both out renders the plain tag.
 */
export type TipTapStyling =
    | { styles: TipTapTextBlockStyle[]; element?: never }
    | { element: TipTapTextBlockElement; styles?: never }
    | { styles?: never; element?: never };

export interface TipTapTextBlockBase {
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

export type TipTapTextBlock = TipTapTextBlockBase & TipTapStyling;

export interface TipTapResolvedTextBlock extends TipTapTextBlockBase {
    /**
     * Heading level of the text block's tag, `undefined` for a paragraph.
     */
    level?: HeadingLevel;
    styles: TipTapTextBlockStyle[];
    element?: TipTapTextBlockElement;
}

export type TipTapListOptions = TipTapStyling;

export interface TipTapResolvedList {
    name: string;
    tag: TipTapListTag;
    styles: TipTapTextBlockStyle[];
    element?: TipTapTextBlockElement;
}

export const orderedListName = "ordered-list";
export const unorderedListName = "unordered-list";

const headingLevelByTag: Record<string, HeadingLevel> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

const textBlockTags: TipTapTextBlockTag[] = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

export const allHeadingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

/**
 * Applies the defaults to the configured text blocks and validates them against each other.
 */
/**
 * Checks that the styled node offers no style twice, since a style's name identifies it in the
 * content.
 */
function resolveStyles({ name, styles = [] }: { name: string; styles?: TipTapTextBlockStyle[] }): TipTapTextBlockStyle[] {
    const styleNames = styles.map((style) => style.name);
    const duplicate = styleNames.find((styleName, index) => styleNames.indexOf(styleName) !== index);
    if (duplicate !== undefined) {
        throw new Error(`"${name}" offers the text block style "${duplicate}" twice`);
    }
    return styles;
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
    }

    return textBlocks.map((textBlock) => ({ ...textBlock, level: headingLevelByTag[textBlock.tag], styles: resolveStyles(textBlock) }));
}

/**
 * Applies the defaults to a list's options and validates its styles. Returns `false` for a disabled
 * list.
 */
export function resolveList({
    list,
    name,
    tag,
}: {
    list: boolean | TipTapListOptions | undefined;
    name: string;
    tag: TipTapListTag;
}): TipTapResolvedList | false {
    if (!list) {
        return false;
    }
    const listOptions = list === true ? {} : list;
    return { name, tag, ...listOptions, styles: resolveStyles({ name, styles: listOptions.styles }) };
}

/**
 * The text blocks and lists that carry styles, so a style can be looked up across all of them.
 */
export const getStyledNodes = ({
    textBlocks,
    orderedList,
    unorderedList,
}: {
    textBlocks: TipTapResolvedTextBlock[];
    orderedList: false | TipTapResolvedList;
    unorderedList: false | TipTapResolvedList;
}): Array<TipTapResolvedTextBlock | TipTapResolvedList> => [
    ...textBlocks,
    ...(orderedList ? [orderedList] : []),
    ...(unorderedList ? [unorderedList] : []),
];

/**
 * The styles of all text blocks and lists, deduplicated by name. A name identifies a style, so a
 * style shared by several text blocks is rendered by the first definition of that name.
 */
export function collectTextBlockStyles(styledNodes: Array<{ styles: TipTapTextBlockStyle[] }>): TipTapTextBlockStyle[] {
    const styles = new Map<string, TipTapTextBlockStyle>();
    for (const styledNode of styledNodes) {
        for (const style of styledNode.styles) {
            if (!styles.has(style.name)) {
                styles.set(style.name, style);
            }
        }
    }
    return [...styles.values()];
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

export const hasParagraphTextBlock = (textBlocks: TipTapResolvedTextBlock[]): boolean => textBlocks.some((textBlock) => textBlock.tag === "p");
