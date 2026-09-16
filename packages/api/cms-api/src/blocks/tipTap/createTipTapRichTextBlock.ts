import { type Extensions, getSchema, type JSONContent } from "@tiptap/core";
import type { Level as HeadingLevel } from "@tiptap/extension-heading";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Node as ProseMirrorNode, type Schema } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import { plainToInstance } from "class-transformer";
import { registerDecorator, validate, type ValidationOptions } from "class-validator";

import {
    Block,
    BlockData,
    BlockDataFactory,
    BlockDataInterface,
    BlockInputFactory,
    BlockInputInterface,
    ChildBlockInfo,
    registerBlock,
} from "../block";
import { AnnotationBlockMeta, BlockField } from "../decorators/field";
import { BlockFactoryNameOrOptions } from "../factories/types";
import { strictBlockDataFactoryDecorator } from "../helpers/strictBlockDataFactoryDecorator";
import { strictBlockInputFactoryDecorator } from "../helpers/strictBlockInputFactoryDecorator";
import { createAppliedMigrationsBlockDataFactoryDecorator } from "../migrations/createAppliedMigrationsBlockDataFactoryDecorator";
import { BlockDataMigrationVersion } from "../migrations/decorators/BlockDataMigrationVersion";
import type { SearchText, WeightedSearchText } from "../search/get-search-text";
import { CmsBlock, CmsInlineBlock } from "./extensions/CmsBlock";
import { CmsLink } from "./extensions/CmsLink";
import { InlineStyleMark } from "./extensions/InlineStyleMark";
import { NonBreakingSpace } from "./extensions/NonBreakingSpace";
import { Placeholder } from "./extensions/Placeholder";
import { SoftHyphen } from "./extensions/SoftHyphen";
import { TextBlockHeading } from "./extensions/TextBlockHeading";
import { TextBlockParagraph } from "./extensions/TextBlockParagraph";
import { buildApplyTextBlocksMigration } from "./migrations/buildApplyTextBlocksMigration";
import { buildDraftJsToTipTapMigration } from "./migrations/buildDraftJsToTipTapMigration";
import type { TextBlockMapping } from "./migrations/convertDraftJsToTipTap";
import { containsInvalidTextBlock, getListNestingDepth } from "./tipTapValidation";

export type { JSONContent as TipTapRichTextBlockContent } from "@tiptap/core";

/**
 * The block's options with the defaults applied and `textBlocks` validated.
 */
export interface TipTapResolvedOptions {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    sub: boolean;
    sup: boolean;
    textBlocks: TipTapTextBlock[];
    /**
     * Names of `textBlockStyles` entries selectable for a list item, independent of `textBlocks`
     * since a list isn't a text block type of its own (it's toggled via a toolbar button, not the
     * type dropdown).
     */
    listStyles: string[];
    orderedList: boolean;
    unorderedList: boolean;
    nonBreakingSpace: boolean;
    softHyphen: boolean;
    link: boolean;
}

export interface TipTapRichTextBlockDataInterface extends BlockDataInterface {
    tipTapContent: JSONContent;
}

export interface TipTapRichTextBlockInputInterface extends BlockInputInterface<TipTapRichTextBlockDataInterface, { tipTapContent: JSONContent }> {
    tipTapContent: JSONContent;
}

// A text block's underlying TipTap node type/heading level. Lists are excluded: `textBlocks` entries
// only ever produce a `paragraph` or `heading` node, never a list.
export type TipTapTextBlockTag = "paragraph" | "heading-1" | "heading-2" | "heading-3" | "heading-4" | "heading-5" | "heading-6";

// The broader set of block-level types inline styles can be limited to, including lists (a mark can
// sit inside a list item's paragraph).
type TipTapTextBlockType = TipTapTextBlockTag | "ordered-list" | "unordered-list";

export interface TipTapTextBlock {
    /**
     * Identifies this entry. Stored as the node's `textBlockName` attribute, so content can tell two
     * entries sharing the same `tag` apart (e.g. a "Display" heading-1 variant next to a plain
     * "Heading 1"). Must be unique across `textBlocks`.
     */
    name: string;
    /**
     * The underlying TipTap node type and, for a heading, its level. Multiple entries may share a tag.
     */
    tag: TipTapTextBlockTag;
    /**
     * Names of `textBlockStyles` entries selectable for this text block. Omit, or pass an empty array,
     * for a text block that never shows a style choice.
     */
    styles?: string[];
    /**
     * Style applied automatically to a newly created or converted text block of this entry. Must be
     * one of `styles`, otherwise an error is thrown.
     */
    defaultStyle?: string;
}

export interface TipTapTextBlockStyle {
    name: string;
}

interface TipTapInlineStyle {
    name: string;
    /**
     * Limits the inline style to the provided text block types.
     * If none is specified, the inline style is allowed for all text block types.
     */
    appliesTo?: TipTapTextBlockType[];
}

// TipTap's own priority for the paragraph extension, which makes the paragraph the schema's first
// block node and therefore ProseMirror's default block type.
const paragraphPriority = 1000;

const defaultTextBlocks: TipTapTextBlock[] = [
    { name: "paragraph", tag: "paragraph" },
    { name: "heading-1", tag: "heading-1" },
    { name: "heading-2", tag: "heading-2" },
    { name: "heading-3", tag: "heading-3" },
    { name: "heading-4", tag: "heading-4" },
    { name: "heading-5", tag: "heading-5" },
    { name: "heading-6", tag: "heading-6" },
];

function getHeadingLevels(textBlocks: TipTapTextBlock[]): HeadingLevel[] {
    const levels = new Set<HeadingLevel>();
    for (const block of textBlocks) {
        if (block.tag !== "paragraph") {
            levels.add(Number(block.tag.slice("heading-".length)) as HeadingLevel);
        }
    }
    return [...levels].sort((a, b) => a - b);
}

function validateTextBlocks(textBlocks: TipTapTextBlock[], textBlockStyles: TipTapTextBlockStyle[], listStyles: string[]): void {
    if (textBlocks.length === 0) {
        throw new Error("textBlocks must not be empty");
    }

    const blockNames = new Set<string>();
    for (const block of textBlocks) {
        if (blockNames.has(block.name)) {
            throw new Error(`textBlocks has a duplicate name "${block.name}"`);
        }
        blockNames.add(block.name);
    }

    const styleNames = new Set<string>();
    for (const style of textBlockStyles) {
        if (styleNames.has(style.name)) {
            throw new Error(`textBlockStyles has a duplicate name "${style.name}"`);
        }
        styleNames.add(style.name);
    }

    for (const block of textBlocks) {
        for (const styleName of block.styles ?? []) {
            if (!styleNames.has(styleName)) {
                throw new Error(`textBlocks entry "${block.name}" references unknown text block style "${styleName}"`);
            }
        }
        if (block.defaultStyle !== undefined && !(block.styles ?? []).includes(block.defaultStyle)) {
            throw new Error(`textBlocks entry "${block.name}" has defaultStyle "${block.defaultStyle}", which is not part of its styles`);
        }
    }

    for (const styleName of listStyles) {
        if (!styleNames.has(styleName)) {
            throw new Error(`listStyles references unknown text block style "${styleName}"`);
        }
    }
}

interface TipTapPlaceholder {
    name: string;
}

export interface CreateTipTapRichTextBlockOptions {
    /**
     * Enables bold text. Defaults to `true`.
     */
    bold?: boolean;
    /**
     * Enables italic text. Defaults to `true`.
     */
    italic?: boolean;
    /**
     * Enables underlined text. Defaults to `false`.
     */
    underline?: boolean;
    /**
     * Enables struck-through text. Defaults to `true`.
     */
    strike?: boolean;
    /**
     * Enables subscript text. Defaults to `true`.
     */
    sub?: boolean;
    /**
     * Enables superscript text. Defaults to `true`.
     */
    sup?: boolean;
    /**
     * Configures the selectable text blocks (paragraph and heading levels), in this order — the order
     * also drives the type dropdown on the admin side. Defaults to a plain paragraph plus headings
     * 1-6. Requires at least one entry, otherwise an error is thrown.
     *
     * Content of any tag not covered by an entry is rejected during validation. Pass `false` for
     * `paragraph`-tag entries to require every configured text block, i.e. build a heading-only block
     * (e.g. a headline): disables lists too, since a list item's content starts with a paragraph.
     */
    textBlocks?: TipTapTextBlock[];
    /**
     * Names of `textBlockStyles` entries selectable for a list item. A list isn't covered by
     * `textBlocks`, since it's toggled via a toolbar button rather than chosen from the type dropdown.
     */
    listStyles?: string[];
    /**
     * Enables ordered lists. Defaults to `true` if a `textBlocks` entry with tag `"paragraph"` exists,
     * `false` otherwise. Throws if enabled without one.
     */
    orderedList?: boolean;
    /**
     * Enables unordered lists. Defaults to `true` if a `textBlocks` entry with tag `"paragraph"`
     * exists, `false` otherwise. Throws if enabled without one.
     */
    unorderedList?: boolean;
    /**
     * Enables non-breaking spaces. Defaults to `true`.
     */
    nonBreakingSpace?: boolean;
    /**
     * Enables soft hyphens. Defaults to `true`.
     */
    softHyphen?: boolean;
    /**
     * Enables links by passing the link block that is used for them. Disabled by default.
     */
    link?: Block;
    textBlockStyles?: TipTapTextBlockStyle[];
    inlineStyles?: TipTapInlineStyle[];
    placeholders?: TipTapPlaceholder[];
    indexSearchText?: boolean;
    /**
     * Child blocks that can be inserted into the editor (e.g. via the toolbar's "+" menu), keyed by
     * a stable key. The key (not the block's name) is stored in the content, so blocks can be
     * renamed or swapped without invalidating existing content.
     * Each block is stored as an atomic node with its data kept in the node's `data` attribute:
     * `cmsBlock` for block-level display, `cmsInlineBlock` for inline display.
     *
     * Pass `{ block, display }` for each child block, where `display` is `"block"` (standalone
     * block element) or `"inline"` (inline within the surrounding text).
     */
    childBlocks?: Record<string, { block: Block; display: "block" | "inline" }>;
    /**
     * Limits the maximum number of top-level text blocks (paragraphs, headings, lists)
     * that can be stored. Content exceeding this limit will be rejected during validation.
     */
    maxTextBlocks?: number;
    /**
     * Limits the maximum nesting depth of list items.
     * A value of 1 means only a flat list (no nesting), 2 allows one level of sub-lists, etc.
     * Content exceeding this limit will be rejected during validation.
     */
    listLevelMax?: number;
    /**
     * Enables best-effort migration of DraftJS-based RichTextBlock data
     * (`{ draftContent: { blocks, entityMap } }`) into TipTap data.
     *
     * The migration uses the enabled features and the `textBlocks`, `maxTextBlocks` and
     * `listLevelMax` options to build the target schema, validates the converted document, and
     * falls back to a stripped-down plain-text-paragraph document if validation fails.
     *
     * Pass an object with `textBlockMap` to map DraftJS block types (e.g. `paragraph-small` from a
     * DraftJS `blocktypeMap`) to a `textBlocks` entry and/or a `textBlockStyle`.
     *
     * Pass an object with `inlineStyleMap` to map DraftJS custom inline style names (e.g.
     * `highlight` from a DraftJS `customInlineStyles`) to TipTap `inlineStyle` mark type values.
     */
    migrateFromDraftJs?: boolean | { textBlockMap?: Record<string, string | TextBlockMapping>; inlineStyleMap?: Record<string, string> };
}

export function resolveTipTapOptions({
    bold = true,
    italic = true,
    underline = false,
    strike = true,
    sub = true,
    sup = true,
    textBlocks = defaultTextBlocks,
    listStyles = [],
    orderedList,
    unorderedList,
    nonBreakingSpace = true,
    softHyphen = true,
    link,
}: CreateTipTapRichTextBlockOptions = {}): TipTapResolvedOptions {
    if (textBlocks.length === 0) {
        throw new Error("textBlocks must not be empty");
    }

    const hasParagraph = textBlocks.some((block) => block.tag === "paragraph");
    if ((orderedList || unorderedList) && !hasParagraph) {
        throw new Error(`Lists require a textBlocks entry with tag "paragraph", because a list item's content starts with a paragraph`);
    }

    return {
        bold,
        italic,
        underline,
        strike,
        sub,
        sup,
        textBlocks,
        listStyles,
        // Lists are enabled by default, but cannot exist without a paragraph to build their items from.
        orderedList: orderedList ?? hasParagraph,
        unorderedList: unorderedList ?? hasParagraph,
        nonBreakingSpace,
        softHyphen,
        link: !!link,
    };
}

/**
 * Sets the default heading level and, for a heading-only schema (no `paragraph`-tag entry), makes
 * the heading the schema's default block type (the position paragraphs would otherwise take, by
 * priority).
 */
function buildHeadingExtension({
    levels,
    defaultLevel,
    hasParagraph,
}: {
    levels: HeadingLevel[];
    defaultLevel: HeadingLevel;
    hasParagraph: boolean;
}) {
    return TextBlockHeading.extend({
        ...(hasParagraph ? {} : { priority: paragraphPriority }),
        addAttributes() {
            return {
                ...this.parent?.(),
                // `rendered: false` keeps TipTap from adding a `level` HTML attribute, the level is the tag name.
                level: { default: defaultLevel, rendered: false },
            };
        },
    }).configure({ levels });
}

function buildExtensions({
    resolvedOptions,
    inlineStyles,
    placeholders,
    hasBlockChildBlocks,
    hasInlineChildBlocks,
}: {
    resolvedOptions: TipTapResolvedOptions;
    inlineStyles: TipTapInlineStyle[];
    placeholders: TipTapPlaceholder[];
    hasBlockChildBlocks: boolean;
    hasInlineChildBlocks: boolean;
}): Extensions {
    const { textBlocks } = resolvedOptions;
    const hasParagraph = textBlocks.some((block) => block.tag === "paragraph");
    const headingLevels = getHeadingLevels(textBlocks);
    const hasHeadings = headingLevels.length > 0;
    const defaultHeadingLevel = hasParagraph
        ? headingLevels[0]
        : ((textBlocks[0].tag === "paragraph" ? headingLevels[0] : Number(textBlocks[0].tag.slice("heading-".length))) as HeadingLevel);
    const hasInlineStyles = inlineStyles.length > 0;
    const hasPlaceholders = placeholders.length > 0;
    return [
        StarterKit.configure({
            bold: resolvedOptions.bold ? {} : false,
            italic: resolvedOptions.italic ? {} : false,
            underline: resolvedOptions.underline ? {} : false,
            strike: resolvedOptions.strike ? {} : false,
            // The heading extension is added separately below to set the default heading level.
            heading: false,
            // The paragraph extension is added separately below, it always needs `textBlockName`.
            paragraph: false,
            orderedList: resolvedOptions.orderedList ? {} : false,
            bulletList: resolvedOptions.unorderedList ? {} : false,
            // A list item's content starts with a paragraph, so lists cannot exist without one.
            listItem: hasParagraph ? undefined : false,
            listKeymap: hasParagraph ? undefined : false,
            blockquote: false,
            code: false,
            codeBlock: false,
            link: false,
        }),
        ...(hasParagraph ? [TextBlockParagraph] : []),
        ...(hasHeadings ? [buildHeadingExtension({ levels: headingLevels, defaultLevel: defaultHeadingLevel, hasParagraph })] : []),
        ...(hasInlineStyles ? [InlineStyleMark] : []),
        ...(resolvedOptions.sup ? [Superscript] : []),
        ...(resolvedOptions.sub ? [Subscript] : []),
        ...(resolvedOptions.nonBreakingSpace ? [NonBreakingSpace] : []),
        ...(resolvedOptions.softHyphen ? [SoftHyphen] : []),
        ...(hasPlaceholders ? [Placeholder] : []),
        ...(resolvedOptions.link ? [CmsLink] : []),
        ...(hasBlockChildBlocks ? [CmsBlock] : []),
        ...(hasInlineChildBlocks ? [CmsInlineBlock] : []),
    ];
}

// checks the raw JSON for mark types that don't exist in the schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function containsUnknownMarks(json: any, schema: Schema): boolean {
    if (typeof json !== "object" || json === null) {
        return false;
    }

    if (Array.isArray(json.marks)) {
        for (const mark of json.marks) {
            if (typeof mark?.type === "string" && !schema.marks[mark.type]) {
                return true;
            }
        }
    }
    if (Array.isArray(json.content)) {
        for (const child of json.content) {
            if (containsUnknownMarks(child, schema)) {
                return true;
            }
        }
    }
    return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLinkMarksData(content: JSONContent, fn: (data: any) => any): JSONContent {
    if (!content || typeof content !== "object") {
        return content;
    }
    const result = { ...content };

    if (Array.isArray(result.marks)) {
        result.marks = result.marks.map((mark) => {
            if (mark.type === "link" && mark.attrs?.data) {
                return { ...mark, attrs: { ...mark.attrs, data: fn(mark.attrs.data) } };
            }
            return mark;
        });
    }

    if (Array.isArray(result.content)) {
        result.content = result.content.map((child: JSONContent) => mapLinkMarksData(child, fn));
    }

    return result;
}

function collectLinkMarks(content: JSONContent, basePath: string[] = ["tipTapContent"]): Array<{ data: unknown; path: string[] }> {
    const results: Array<{ data: unknown; path: string[] }> = [];

    if (Array.isArray(content.marks)) {
        content.marks.forEach((mark, markIdx) => {
            if (mark.type === "link" && mark.attrs?.data) {
                results.push({
                    data: mark.attrs.data,
                    path: [...basePath, "marks", String(markIdx), "attrs", "data"],
                });
            }
        });
    }

    if (Array.isArray(content.content)) {
        content.content.forEach((child: JSONContent, childIdx: number) => {
            results.push(...collectLinkMarks(child, [...basePath, "content", String(childIdx)]));
        });
    }

    return results;
}

const isCmsBlockNode = (content: JSONContent): boolean => content.type === "cmsBlock" || content.type === "cmsInlineBlock";

function collectCmsBlockNodes(
    content: JSONContent,
    basePath: string[] = ["tipTapContent"],
): Array<{ blockType: string; data: unknown; path: string[] }> {
    const results: Array<{ blockType: string; data: unknown; path: string[] }> = [];

    if (isCmsBlockNode(content) && content.attrs?.blockType) {
        results.push({
            blockType: content.attrs.blockType as string,
            data: content.attrs.data,
            path: [...basePath, "attrs", "data"],
        });
    }

    if (Array.isArray(content.content)) {
        content.content.forEach((child: JSONContent, childIdx: number) => {
            results.push(...collectCmsBlockNodes(child, [...basePath, "content", String(childIdx)]));
        });
    }

    return results;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCmsBlockNodesData(content: JSONContent, fn: (blockType: string, data: any) => any): JSONContent {
    if (!content || typeof content !== "object") {
        return content;
    }
    const result = { ...content };

    if (isCmsBlockNode(result) && result.attrs?.blockType) {
        result.attrs = { ...result.attrs, data: fn(result.attrs.blockType, result.attrs.data) };
    }

    if (Array.isArray(result.content)) {
        result.content = result.content.map((child: JSONContent) => mapCmsBlockNodesData(child, fn));
    }

    return result;
}

function collectPlaceholderNames(content: JSONContent): string[] {
    const names: string[] = [];

    if (content.type === "placeholder" && content.attrs?.name) {
        names.push(content.attrs.name as string);
    }

    if (Array.isArray(content.content)) {
        for (const child of content.content) {
            names.push(...collectPlaceholderNames(child));
        }
    }

    return names;
}

function getTextBlockTypeFromNode(node: JSONContent): TipTapTextBlockType | undefined {
    if (node.type === "paragraph") {
        return "paragraph";
    }
    if (node.type === "heading" && node.attrs?.level) {
        return `heading-${node.attrs.level}` as TipTapTextBlockType;
    }
    return undefined;
}

function containsInvalidInlineStyleMarks(
    content: JSONContent,
    inlineStyles: TipTapInlineStyle[],
    parentTextBlockType?: TipTapTextBlockType,
): boolean {
    const currentTextBlockType = getTextBlockTypeFromNode(content) ?? parentTextBlockType;

    if (Array.isArray(content.content)) {
        for (const child of content.content) {
            // Check text nodes for inline style marks
            if (child.type === "text" && Array.isArray(child.marks)) {
                for (const mark of child.marks) {
                    if (mark.type === "inlineStyle" && mark.attrs?.type) {
                        const markAttrs = mark.attrs;
                        const styleConfig = inlineStyles.find((s) => s.name === markAttrs.type);
                        if (styleConfig?.appliesTo && currentTextBlockType && !styleConfig.appliesTo.includes(currentTextBlockType)) {
                            return true;
                        }
                    }
                }
            }
            if (containsInvalidInlineStyleMarks(child, inlineStyles, currentTextBlockType)) {
                return true;
            }
        }
    }

    return false;
}

function IsTipTapContent(
    schema: Schema,
    {
        textBlocks,
        listStyles,
        inlineStyles,
        linkBlock,
        childBlocks,
        maxTextBlocks,
        allowedPlaceholderNames,
        listLevelMax,
    }: {
        textBlocks: TipTapTextBlock[];
        listStyles: string[];
        inlineStyles: TipTapInlineStyle[];
        linkBlock?: Block;
        childBlocks?: Record<string, Block>;
        maxTextBlocks?: number;
        allowedPlaceholderNames?: string[];
        listLevelMax?: number;
    },
    validationOptions?: ValidationOptions,
) {
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isTipTapContent",
            target: object.constructor,
            propertyName,
            options: { message: "tipTapContent must be valid TipTap JSON content", ...validationOptions },
            validator: {
                async validate(value: unknown) {
                    if (typeof value !== "object" || value === null) {
                        return false;
                    }
                    try {
                        // Check for unknown marks before parsing (ProseMirror silently drops them)
                        if (containsUnknownMarks(value, schema)) {
                            return false;
                        }
                        const node = ProseMirrorNode.fromJSON(schema, value);
                        node.check();

                        // Validate inline style appliesTo constraints
                        if (containsInvalidInlineStyleMarks(value as JSONContent, inlineStyles)) {
                            return false;
                        }

                        // Enforce maxTextBlocks limit on top-level content nodes
                        if (maxTextBlocks !== undefined) {
                            const content = (value as JSONContent).content;
                            if (Array.isArray(content) && content.length > maxTextBlocks) {
                                return false;
                            }
                        }

                        // Enforce listLevelMax limit on list nesting depth
                        if (listLevelMax !== undefined) {
                            const depth = getListNestingDepth(value as JSONContent);
                            if (depth > listLevelMax) {
                                return false;
                            }
                        }

                        // Enforce that every paragraph/heading node names a valid, matching textBlocks entry
                        if (containsInvalidTextBlock(value as JSONContent, textBlocks, listStyles)) {
                            return false;
                        }

                        // Validate link mark data
                        if (linkBlock) {
                            const linkMarks = collectLinkMarks(value as JSONContent);
                            for (const { data } of linkMarks) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const validationErrors = await validate(linkBlock.blockInputFactory(data as any), {
                                    forbidNonWhitelisted: true,
                                    whitelist: true,
                                });
                                if (validationErrors.length > 0) {
                                    return false;
                                }
                            }
                        }

                        // Validate child block nodes
                        if (childBlocks) {
                            const blockNodes = collectCmsBlockNodes(value as JSONContent);
                            for (const { blockType, data } of blockNodes) {
                                const childBlock = childBlocks[blockType];
                                if (!childBlock) {
                                    return false;
                                }
                                const validationErrors = await validate(
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    childBlock.blockInputFactory(data as any),
                                    {
                                        forbidNonWhitelisted: true,
                                        whitelist: true,
                                    },
                                );
                                if (validationErrors.length > 0) {
                                    return false;
                                }
                            }
                        }

                        // Validate placeholder names
                        if (allowedPlaceholderNames) {
                            const usedNames = collectPlaceholderNames(value as JSONContent);
                            for (const name of usedNames) {
                                if (!allowedPlaceholderNames.includes(name)) {
                                    return false;
                                }
                            }
                        }

                        return true;
                    } catch {
                        return false;
                    }
                },
            },
        });
    };
}

interface TextEntry {
    text: string;
    headingLevel?: number;
}

function extractTextEntries(node: JSONContent, headingLevel?: number): TextEntry[] {
    const results: TextEntry[] = [];
    const currentHeadingLevel = node.type === "heading" ? (node.attrs?.level as number) : headingLevel;

    if (node.text) {
        results.push({ text: node.text, headingLevel: currentHeadingLevel });
    }
    if (node.content && Array.isArray(node.content)) {
        for (const child of node.content) {
            results.push(...extractTextEntries(child, currentHeadingLevel));
        }
    }

    return results;
}

/**
 * @experimental
 */
export function createTipTapRichTextBlock(
    options: CreateTipTapRichTextBlockOptions = {},
    nameOrOptions: BlockFactoryNameOrOptions = "TipTapRichText",
): Block<TipTapRichTextBlockDataInterface, TipTapRichTextBlockInputInterface> {
    const {
        textBlockStyles = [],
        inlineStyles = [],
        placeholders = [],
        indexSearchText = true,
        link: LinkBlock,
        childBlocks: childBlocksConfig = {},
        maxTextBlocks,
        listLevelMax,
        migrateFromDraftJs = false,
    } = options;
    const blockName = typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name;
    const baseMigrate = typeof nameOrOptions !== "string" && nameOrOptions.migrate ? nameOrOptions.migrate : { migrations: [], version: 0 };

    const resolvedOptions = resolveTipTapOptions(options);
    validateTextBlocks(resolvedOptions.textBlocks, textBlockStyles, resolvedOptions.listStyles);
    const childBlocks: Record<string, Block> = Object.fromEntries(Object.entries(childBlocksConfig).map(([key, { block }]) => [key, block]));
    const childBlockConfigs = Object.values(childBlocksConfig);
    const hasChildBlocks = childBlockConfigs.length > 0;
    const hasBlockChildBlocks = childBlockConfigs.some(({ display }) => display === "block");
    const hasInlineChildBlocks = childBlockConfigs.some(({ display }) => display === "inline");
    const extensions = buildExtensions({
        resolvedOptions,
        inlineStyles,
        placeholders,
        hasBlockChildBlocks,
        hasInlineChildBlocks,
    });
    const schema = getSchema(extensions);

    const draftJsTextBlockMap = typeof migrateFromDraftJs === "object" ? migrateFromDraftJs.textBlockMap : undefined;
    const draftJsInlineStyleMap = typeof migrateFromDraftJs === "object" ? migrateFromDraftJs.inlineStyleMap : undefined;

    if (migrateFromDraftJs && baseMigrate) {
        if (baseMigrate.version == 1) {
            throw new Error("version=1 is reserved for migrateFromDraftJs, start own migrations with 2");
        }
        for (const migration of baseMigrate.migrations) {
            const migrationObj = new migration();
            if (migrationObj.toVersion == 1) {
                throw new Error("toVersion=1 is reserved for migrateFromDraftJs, start own migrations with 2");
            }
        }
    }
    const migrateWithDraftJs = migrateFromDraftJs
        ? {
              version: baseMigrate.version == 0 ? 1 : baseMigrate.version,
              migrations: [
                  buildDraftJsToTipTapMigration({
                      schema,
                      resolvedOptions,
                      link: LinkBlock,
                      maxTextBlocks,
                      listLevelMax,
                      textBlockMap: draftJsTextBlockMap,
                      inlineStyleMap: draftJsInlineStyleMap,
                  }),
                  ...baseMigrate.migrations,
              ],
          }
        : baseMigrate;

    // Safety net, appended after every other migration: a migration that runs before this one (the DraftJS
    // conversion, or a block-specific migration such as one that changes a node's heading level) can resolve
    // `textBlocks` against a tag a node no longer has by the time all migrations have run.
    const migrate = {
        version: migrateWithDraftJs.version + 1,
        migrations: [
            ...migrateWithDraftJs.migrations,
            buildApplyTextBlocksMigration({
                toVersion: migrateWithDraftJs.version + 1,
                textBlocks: resolvedOptions.textBlocks,
                listStyles: resolvedOptions.listStyles,
            }),
        ],
    };

    @BlockDataMigrationVersion(migrate.version)
    class TipTapRichTextBlockData extends BlockData implements TipTapRichTextBlockDataInterface {
        @BlockField({ type: "tipTapRichTextBlock", childBlocks })
        tipTapContent: JSONContent;

        searchText(): SearchText[] {
            if (!indexSearchText) {
                return [];
            }

            const entries = extractTextEntries(this.tipTapContent);
            return entries.map(({ text, headingLevel }): SearchText => {
                if (headingLevel && headingLevel >= 1 && headingLevel <= 6) {
                    return { weight: `h${headingLevel}` as WeightedSearchText["weight"], text };
                }
                return text;
            });
        }

        childBlocksInfo(): ChildBlockInfo[] {
            const info: ChildBlockInfo[] = [];

            if (LinkBlock) {
                for (const { data, path } of collectLinkMarks(this.tipTapContent)) {
                    info.push({
                        visible: true,
                        relJsonPath: path,
                        block: data as BlockDataInterface,
                        name: LinkBlock.name,
                    });
                }
            }

            if (hasChildBlocks) {
                for (const { blockType, data, path } of collectCmsBlockNodes(this.tipTapContent)) {
                    const childBlock = childBlocks[blockType];
                    if (childBlock) {
                        info.push({
                            visible: true,
                            relJsonPath: path,
                            block: data as BlockDataInterface,
                            name: childBlock.name,
                        });
                    }
                }
            }

            return info;
        }
    }

    const allowedPlaceholderNames = placeholders.length > 0 ? placeholders.map((p) => p.name) : undefined;

    class TipTapRichTextBlockInput implements TipTapRichTextBlockInputInterface {
        @IsTipTapContent(schema, {
            textBlocks: resolvedOptions.textBlocks,
            listStyles: resolvedOptions.listStyles,
            inlineStyles,
            linkBlock: LinkBlock,
            childBlocks: hasChildBlocks ? childBlocks : undefined,
            maxTextBlocks,
            allowedPlaceholderNames,
            listLevelMax,
        })
        @BlockField({ type: "tipTapRichTextBlock", childBlocks })
        tipTapContent: JSONContent;

        transformToBlockData(): TipTapRichTextBlockData {
            let tipTapContent = this.tipTapContent;
            if (LinkBlock) {
                tipTapContent = mapLinkMarksData(tipTapContent, (data) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    LinkBlock.blockInputFactory(data as any).transformToBlockData(),
                );
            }
            if (hasChildBlocks) {
                tipTapContent = mapCmsBlockNodesData(tipTapContent, (blockType, data) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    childBlocks[blockType].blockInputFactory(data as any).transformToBlockData(),
                );
            }
            return plainToInstance(TipTapRichTextBlockData, { tipTapContent });
        }

        toPlain() {
            return { tipTapContent: this.tipTapContent };
        }
    }

    const blockDataFactory: BlockDataFactory<TipTapRichTextBlockData> = (o) => {
        let tipTapContent = o.tipTapContent;
        if (LinkBlock) {
            tipTapContent = mapLinkMarksData(tipTapContent, (data) => LinkBlock.blockDataFactory(data));
        }
        if (hasChildBlocks) {
            tipTapContent = mapCmsBlockNodesData(tipTapContent, (blockType, data) => childBlocks[blockType].blockDataFactory(data));
        }
        return plainToInstance(TipTapRichTextBlockData, { tipTapContent });
    };
    const blockInputFactory: BlockInputFactory<TipTapRichTextBlockInputInterface> = (o) => plainToInstance(TipTapRichTextBlockInput, o);

    // Decorate BlockDataFactory
    let decorateBlockDataFactory = blockDataFactory;
    if (migrate.migrations) {
        const blockDataFactoryDecorator1 = createAppliedMigrationsBlockDataFactoryDecorator(migrate.migrations, blockName);
        decorateBlockDataFactory = blockDataFactoryDecorator1(decorateBlockDataFactory);
    }
    decorateBlockDataFactory = strictBlockDataFactoryDecorator(decorateBlockDataFactory);

    // Decorate BlockInputFactory
    const decorateBlockInputFactory = strictBlockInputFactoryDecorator(blockInputFactory);

    const TipTapRichTextBlock: Block<TipTapRichTextBlockDataInterface, TipTapRichTextBlockInputInterface> = {
        name: blockName,
        blockDataFactory: decorateBlockDataFactory,
        blockInputFactory: decorateBlockInputFactory,
        blockMeta: new AnnotationBlockMeta(TipTapRichTextBlockData),
        blockInputMeta: new AnnotationBlockMeta(TipTapRichTextBlockInput),
    };

    registerBlock(TipTapRichTextBlock);

    return TipTapRichTextBlock;
}
