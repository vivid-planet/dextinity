import type { JSONContent } from "@tiptap/core";
import type { Level as HeadingLevel } from "@tiptap/extension-heading";

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
}

export interface TipTapResolvedTextBlock extends TipTapTextBlock {
    /**
     * Heading level of the text block's tag, `undefined` for a paragraph.
     */
    level?: HeadingLevel;
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
    }

    return textBlocks.map((textBlock) => ({ ...textBlock, level: headingLevelByTag[textBlock.tag] }));
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
 * The text block a paragraph/heading node belongs to: the one matching the node's stored `textBlock`
 * name, or - for content written before the name was stored, or by a text block that has since been
 * removed - the first one with a matching tag.
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

/**
 * The heading levels the text blocks use, in configuration order and without duplicates.
 */
export const getHeadingLevels = (textBlocks: TipTapResolvedTextBlock[]): HeadingLevel[] => [
    ...new Set(textBlocks.map((textBlock) => textBlock.level).filter((level): level is HeadingLevel => level !== undefined)),
];

export const hasParagraphTextBlock = (textBlocks: TipTapResolvedTextBlock[]): boolean => textBlocks.some((textBlock) => textBlock.tag === "p");

/**
 * The tag a paragraph/heading node is stored as, `undefined` for any other node.
 */
export function getTextBlockTag(node: JSONContent): TipTapTextBlockTag | undefined {
    if (node.type === "paragraph") {
        return "p";
    }
    if (node.type === "heading" && node.attrs?.level) {
        return `h${node.attrs.level}` as TipTapTextBlockTag;
    }
    return undefined;
}

/**
 * Names the text block of every paragraph/heading node that doesn't name one yet, and replaces a
 * name that doesn't belong to the node's tag - which is what a migration changing the tag leaves
 * behind.
 */
export function applyTextBlocks(content: JSONContent, textBlocks: TipTapResolvedTextBlock[]): JSONContent {
    let result = content;

    const tag = getTextBlockTag(content);
    if (tag !== undefined) {
        const textBlock = findTextBlock({ name: content.attrs?.textBlock, tag, textBlocks });
        if (textBlock && content.attrs?.textBlock !== textBlock.name) {
            result = { ...content, attrs: { ...content.attrs, textBlock: textBlock.name } };
        }
    }

    if (Array.isArray(result.content)) {
        result = { ...result, content: result.content.map((child) => applyTextBlocks(child, textBlocks)) };
    }

    return result;
}
