import type { ResolvedPos } from "@tiptap/pm/model";
import type { ReactNode } from "react";

import { resolveStyles, type TipTapTextBlockStyle, type TipTapTextElement } from "./textStyles";

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
     * Label shown in the toolbar's text block type select.
     */
    label: ReactNode;
    /**
     * HTML element the text block is stored and rendered as. Several text blocks may share a tag,
     * for instance a lead paragraph next to a regular one.
     */
    tag: TipTapTextBlockTag;
    /**
     * Styles offered for the text block in the toolbar's style select, stored in the node's
     * `textStyle` attribute.
     *
     * Must match the API's, otherwise the API rejects content the editor produces.
     */
    styles?: TipTapTextBlockStyle[];
    /**
     * Renders the text block in the editor while no style is applied. Defaults to its plain tag.
     */
    element?: TipTapTextElement;
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

    return textBlocks.map((textBlock) => ({
        ...textBlock,
        level: headingLevelByTag[textBlock.tag],
        styles: resolveStyles(textBlock.styles, `text block "${textBlock.name}"`),
    }));
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
 * Whether a position sits inside a list item, which decides both the text blocks allowed there and
 * where the style comes from.
 */
export function isInsideListItem($pos: ResolvedPos): boolean {
    for (let depth = $pos.depth; depth > 0; depth--) {
        if ($pos.node(depth).type.name === "listItem") {
            return true;
        }
    }
    return false;
}

export const hasParagraphTextBlock = (textBlocks: TipTapResolvedTextBlock[]): boolean => textBlocks.some((textBlock) => textBlock.tag === "p");
