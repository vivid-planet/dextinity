type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * HTML element a text block is stored and rendered as: `p` for a paragraph, `h1`-`h6` for a heading
 * of that level.
 */
export type TipTapTextBlockTag = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TipTapListTag = "ol" | "ul";

export interface TipTapTextBlockStyle {
    /**
     * Identifies the style. Stored in the content's `textBlockStyle` attribute.
     */
    name: string;
}

/**
 * How a text block (or a list) is rendered: either through the `styles` it lets the editor choose
 * from, or - for one that needs no style choice - through a single `element` of its own. The two
 * exclude each other, and leaving both out renders the plain tag.
 */
export type TipTapStyling<Style extends TipTapTextBlockStyle, Element> =
    | {
          styles: Style[];
          /**
           * Style applied to a newly created or converted text block. Must be one of `styles`,
           * otherwise an error is thrown. Without it the text block starts out without a style.
           */
          defaultStyle?: string;
          element?: never;
      }
    | { element: Element; styles?: never; defaultStyle?: never }
    | { styles?: never; element?: never; defaultStyle?: never };

export interface TipTapTextBlockBase {
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

// The API doesn't render, so its `element` carries no information - it only records that the text
// block has one instead of a style choice, to keep both configurations the same shape.
export type TipTapTextBlock = TipTapTextBlockBase & TipTapStyling<TipTapTextBlockStyle, true>;

export interface TipTapResolvedStyledNode {
    name: string;
    styles: TipTapTextBlockStyle[];
    defaultStyle: string | null;
}

export interface TipTapResolvedTextBlock extends TipTapTextBlockBase, TipTapResolvedStyledNode {
    /**
     * Heading level of the text block's tag, `undefined` for a paragraph.
     */
    level?: HeadingLevel;
}

export interface TipTapResolvedList extends TipTapResolvedStyledNode {
    tag: TipTapListTag;
}

export type TipTapListOptions = { styles: TipTapTextBlockStyle[]; defaultStyle?: string };

export const orderedListName = "ordered-list";
export const unorderedListName = "unordered-list";

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
 * Checks that the styled node offers no style twice, since a style's name identifies it in the
 * content.
 */
function resolveStyles<Style extends TipTapTextBlockStyle>({
    name,
    styles = [],
    defaultStyle,
}: {
    name: string;
    styles?: Style[];
    defaultStyle?: string;
}): { styles: Style[]; defaultStyle: string | null } {
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
export function resolveTextBlocks<T extends TipTapTextBlockBase & { styles?: TipTapTextBlockStyle[]; defaultStyle?: string }>(
    textBlocks: T[],
): Array<T & { level?: HeadingLevel; styles: NonNullable<T["styles"]>; defaultStyle: string | null }> {
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
        ...(resolveStyles(textBlock) as { styles: NonNullable<T["styles"]>; defaultStyle: string | null }),
    }));
}

/**
 * Applies the defaults to a list's options and validates its styles. Returns `false` for a disabled
 * list.
 */
export function resolveList<Style extends TipTapTextBlockStyle>({
    list,
    name,
    tag,
}: {
    list: boolean | { styles: Style[]; defaultStyle?: string } | undefined;
    name: string;
    tag: TipTapListTag;
}): { name: string; tag: TipTapListTag; styles: Style[]; defaultStyle: string | null } | false {
    if (!list) {
        return false;
    }
    const listOptions = list === true ? {} : list;
    return { name, tag, ...resolveStyles({ name, ...listOptions }) };
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

/**
 * The text blocks and lists that carry styles, so a style can be looked up across all of them.
 */
export function getStyledNodes<TextBlock extends { styles: unknown[] }, List extends { styles: unknown[] }>({
    textBlocks,
    orderedList,
    unorderedList,
}: {
    textBlocks: TextBlock[];
    orderedList: false | List;
    unorderedList: false | List;
}): Array<TextBlock | List> {
    return [...textBlocks, ...(orderedList ? [orderedList] : []), ...(unorderedList ? [unorderedList] : [])];
}

/**
 * The styles of all text blocks and lists, deduplicated by name. A name identifies a style, so a
 * style shared by several text blocks is represented by the first definition of that name.
 */
export function collectTextBlockStyles<Style extends TipTapTextBlockStyle>(styledNodes: Array<{ styles: Style[] }>): Style[] {
    const styles = new Map<string, Style>();
    for (const styledNode of styledNodes) {
        for (const style of styledNode.styles) {
            if (!styles.has(style.name)) {
                styles.set(style.name, style);
            }
        }
    }
    return [...styles.values()];
}

export const hasParagraphTextBlock = (textBlocks: TipTapResolvedTextBlock[]): boolean => textBlocks.some((textBlock) => textBlock.tag === "p");
