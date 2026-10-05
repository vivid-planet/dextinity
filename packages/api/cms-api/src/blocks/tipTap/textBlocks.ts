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

// The API doesn't render, so a text block that needs no style choice - which carries its own
// `element` in the Admin - is configured here by leaving `styles` out.
export type TipTapTextBlock = TipTapTextBlockBase & { styles?: TipTapTextBlockStyle[] };

export interface TipTapResolvedTextBlock extends TipTapTextBlockBase {
    /**
     * Heading level of the text block's tag, `undefined` for a paragraph.
     */
    level?: HeadingLevel;
    styles: TipTapTextBlockStyle[];
}

export interface TipTapResolvedList {
    name: string;
    styles: TipTapTextBlockStyle[];
}

export type TipTapListOptions = { styles: TipTapTextBlockStyle[] };

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
function resolveStyles<Style extends TipTapTextBlockStyle>({ name, styles = [] }: { name: string; styles?: Style[] }): Style[] {
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
export function resolveTextBlocks<T extends TipTapTextBlockBase & { styles?: TipTapTextBlockStyle[] }>(
    textBlocks: T[],
): Array<T & { level?: HeadingLevel; styles: NonNullable<T["styles"]> }> {
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
        styles: resolveStyles(textBlock) as NonNullable<T["styles"]>,
    }));
}

/**
 * Applies the defaults to a list's options and validates its styles. Returns `false` for a disabled
 * list.
 */
export function resolveList<Style extends TipTapTextBlockStyle>({
    list,
    name,
}: {
    list: boolean | { styles: Style[] } | undefined;
    name: string;
}): { name: string; styles: Style[] } | false {
    if (!list) {
        return false;
    }
    return { name, styles: resolveStyles({ name, styles: list === true ? undefined : list.styles }) };
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
 * Whether anything offers a style at all, which decides whether the text block node carries a
 * `textBlockStyle` attribute.
 */
export const hasTextBlockStyles = (styledNodes: Array<{ styles: TipTapTextBlockStyle[] }>): boolean =>
    styledNodes.some((styledNode) => styledNode.styles.length > 0);

export const hasParagraphTextBlock = (textBlocks: TipTapResolvedTextBlock[]): boolean => textBlocks.some((textBlock) => textBlock.tag === "p");
