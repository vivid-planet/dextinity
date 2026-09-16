import type { HTMLAttributes, ReactNode } from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

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
    | {
          styles: TipTapTextBlockStyle[];
          /**
           * Name of the style applied to a newly created or converted text block. Must be one of
           * `styles`, otherwise an error is thrown. With it the styling select loses its "Default"
           * entry, so the editor always picks one of the styles.
           */
          defaultStyle?: string;
          element?: never;
      }
    | { element: TipTapTextBlockElement; styles?: never; defaultStyle?: never }
    | { styles?: never; element?: never; defaultStyle?: never };

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

export interface TipTapResolvedStyledNode {
    name: string;
    styles: TipTapTextBlockStyle[];
    defaultStyle: string | null;
    element?: TipTapTextBlockElement;
}

export interface TipTapResolvedTextBlock extends TipTapTextBlockBase, TipTapResolvedStyledNode {
    /**
     * Heading level of the text block's tag, `undefined` for a paragraph.
     */
    level?: HeadingLevel;
}

export type TipTapListOptions = TipTapStyling;

export interface TipTapResolvedList extends TipTapResolvedStyledNode {
    tag: TipTapListTag;
}

export const orderedListName = "ordered-list";
export const unorderedListName = "unordered-list";

const headingLevelByTag: Record<string, HeadingLevel> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

const textBlockTags: TipTapTextBlockTag[] = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

export const allHeadingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

/**
 * Checks that the styled node offers no style twice, since a style's name identifies it in the
 * content.
 */
function resolveStyles({ name, styles = [], defaultStyle }: { name: string; styles?: TipTapTextBlockStyle[]; defaultStyle?: string }): {
    styles: TipTapTextBlockStyle[];
    defaultStyle: string | null;
} {
    const styleNames = styles.map((style) => style.name);
    const duplicate = styleNames.find((styleName, index) => styleNames.indexOf(styleName) !== index);
    if (duplicate !== undefined) {
        throw new Error(`"${name}" offers the text block style "${duplicate}" twice`);
    }

    if (defaultStyle !== undefined && !styleNames.includes(defaultStyle)) {
        throw new Error(`"${name}" has the defaultStyle "${defaultStyle}", which is not one of its styles`);
    }

    return { styles, defaultStyle: defaultStyle ?? null };
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

    return textBlocks.map((textBlock) => ({ ...textBlock, level: headingLevelByTag[textBlock.tag], ...resolveStyles(textBlock) }));
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
    return { name, tag, ...listOptions, ...resolveStyles({ name, ...listOptions }) };
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
}): TipTapResolvedStyledNode[] => [...textBlocks, ...(orderedList ? [orderedList] : []), ...(unorderedList ? [unorderedList] : [])];

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

/**
 * Whether the styled node offers the style.
 */
export const hasStyle = (styledNode: TipTapResolvedStyledNode, style: string): boolean => styledNode.styles.some(({ name }) => name === style);

export const hasParagraphTextBlock = (textBlocks: TipTapResolvedTextBlock[]): boolean => textBlocks.some((textBlock) => textBlock.tag === "p");
