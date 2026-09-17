import type { Level as HeadingLevel } from "@tiptap/extension-heading";
import type { ReactNode } from "react";

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
     * Label shown in the toolbar's text block type select.
     */
    label: ReactNode;
    /**
     * HTML element the text block is stored and rendered as. Several text blocks may share a tag,
     * for instance a lead paragraph next to a regular one.
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

export const allHeadingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

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

    return textBlocks.map((textBlock) => ({ ...textBlock, level: headingLevelByTag[textBlock.tag] }));
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
 * The text block a paragraph/heading node belongs to: the one matching the node's stored `textBlock`
 * name, or - for content written before the name was stored, or by a text block that has since been
 * removed - the first one with a matching tag.
 */
export function findTextBlock({
    name,
    tag,
    textBlocks,
}: {
    name?: string | null;
    tag: TipTapTextBlockTag;
    textBlocks: TipTapResolvedTextBlock[];
}): TipTapResolvedTextBlock | undefined {
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
 * The tag a paragraph or heading node is stored as.
 */
export function getTextBlockTag(node: { type: { name: string }; attrs: { level?: number } }): TipTapTextBlockTag {
    return node.type.name === "heading" ? (`h${node.attrs.level}` as TipTapTextBlockTag) : "p";
}
