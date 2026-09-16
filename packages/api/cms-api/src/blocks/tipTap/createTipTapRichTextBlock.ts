import { type Extensions, getSchema, type JSONContent } from "@tiptap/core";
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
import type { MigrateVendorOptions } from "../migrations/types";
import type { SearchText, WeightedSearchText } from "../search/get-search-text";
import { CmsBlock, CmsInlineBlock } from "./extensions/CmsBlock";
import { CmsLink } from "./extensions/CmsLink";
import { InlineStyleMark } from "./extensions/InlineStyleMark";
import { NonBreakingSpace } from "./extensions/NonBreakingSpace";
import { Placeholder } from "./extensions/Placeholder";
import { SoftHyphen } from "./extensions/SoftHyphen";
import { createTextBlockHeading } from "./extensions/TextBlockHeading";
import { createTextBlockParagraph } from "./extensions/TextBlockParagraph";
import { buildDraftJsToTipTapMigration } from "./migrations/buildDraftJsToTipTapMigration";
import type { TextBlockMapping } from "./migrations/convertDraftJsToTipTap";
import {
    defaultTextBlocks,
    findDefaultTextBlock,
    getHeadingLevels,
    hasParagraphTextBlock,
    resolveTextBlocks,
    type TipTapResolvedTextBlock,
    type TipTapTextBlock,
} from "./textBlocks";
import { containsInvalidTextBlock, getListNestingDepth } from "./tipTapValidation";

export type { TipTapTextBlock, TipTapTextBlockTag } from "./textBlocks";
export type { JSONContent as TipTapRichTextBlockContent } from "@tiptap/core";

/**
 * The block's options with the defaults applied and the text blocks validated.
 */
export interface TipTapResolvedOptions {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    sub: boolean;
    sup: boolean;
    textBlocks: TipTapResolvedTextBlock[];
    /**
     * The text block used for content that doesn't name one, and - for a schema without a paragraph
     * text block - the schema's default block type.
     */
    defaultTextBlock: TipTapResolvedTextBlock;
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

type TipTapTextBlockType =
    | "paragraph"
    | "heading-1"
    | "heading-2"
    | "heading-3"
    | "heading-4"
    | "heading-5"
    | "heading-6"
    | "ordered-list"
    | "unordered-list";

interface TipTapTextBlockStyle {
    name: string;
    /**
     * Limits the text block style to the provided text block types.
     * If none is specified, the text block style is allowed for all text block types.
     */
    appliesTo?: TipTapTextBlockType[];
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
     * The text block types the content may consist of. Defaults to a paragraph plus a heading for
     * every level.
     *
     * Content using a tag no text block is configured for, or naming a text block that isn't
     * configured for the tag it is stored as, is rejected during validation. Leave the `p` text
     * block out for a heading-only block (e.g. a headline); that also disables lists, because a
     * list item's content starts with a paragraph.
     *
     * Must match the Admin's `textBlocks`, otherwise the API rejects content the editor produces.
     */
    textBlocks?: TipTapTextBlock[];
    /**
     * Name of the text block used for content that doesn't name one. Defaults to the first text
     * block. Must be one of `textBlocks`, otherwise an error is thrown.
     */
    defaultTextBlock?: string;
    /**
     * Enables ordered lists. Defaults to `true`.
     */
    orderedList?: boolean;
    /**
     * Enables unordered lists. Defaults to `true`.
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
     * The migration uses the enabled features and the `textBlockStyles`, `maxTextBlocks` and
     * `listLevelMax` options to build the target schema, validates the converted document, and
     * falls back to a stripped-down plain-text-paragraph document if validation fails.
     *
     * Pass an object with `textBlockMap` to map DraftJS block types (e.g. `paragraph-small` from a
     * DraftJS `blocktypeMap`) to TipTap `textBlockStyle` attribute values. Use the
     * `{ textBlock, textBlockStyle }` form to also set the text block, for instance to convert a
     * DraftJS block type that was rendered as `<h2>` into a TipTap heading with level 2.
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
    defaultTextBlock,
    orderedList,
    unorderedList,
    nonBreakingSpace = true,
    softHyphen = true,
    link,
}: CreateTipTapRichTextBlockOptions = {}): TipTapResolvedOptions {
    const resolvedTextBlocks = resolveTextBlocks(textBlocks);
    const hasParagraph = hasParagraphTextBlock(resolvedTextBlocks);

    if (!hasParagraph && (orderedList || unorderedList)) {
        throw new Error("Lists require a text block with the tag p, because a list item's content starts with a paragraph");
    }

    return {
        bold,
        italic,
        underline,
        strike,
        sub,
        sup,
        textBlocks: resolvedTextBlocks,
        defaultTextBlock: findDefaultTextBlock({ textBlocks: resolvedTextBlocks, defaultTextBlock }),
        // Lists are enabled by default, but cannot exist without a paragraph to build their items from.
        orderedList: orderedList ?? hasParagraph,
        unorderedList: unorderedList ?? hasParagraph,
        nonBreakingSpace,
        softHyphen,
        link: !!link,
    };
}

function buildExtensions({
    resolvedOptions,
    textBlockStyles,
    inlineStyles,
    placeholders,
    hasBlockChildBlocks,
    hasInlineChildBlocks,
}: {
    resolvedOptions: TipTapResolvedOptions;
    textBlockStyles: TipTapTextBlockStyle[];
    inlineStyles: TipTapInlineStyle[];
    placeholders: TipTapPlaceholder[];
    hasBlockChildBlocks: boolean;
    hasInlineChildBlocks: boolean;
}): Extensions {
    const hasTextBlockStyles = textBlockStyles.length > 0;
    const hasInlineStyles = inlineStyles.length > 0;
    const hasPlaceholders = placeholders.length > 0;
    const hasParagraph = hasParagraphTextBlock(resolvedOptions.textBlocks);
    const headingLevels = getHeadingLevels(resolvedOptions.textBlocks);
    return [
        StarterKit.configure({
            bold: resolvedOptions.bold ? {} : false,
            italic: resolvedOptions.italic ? {} : false,
            underline: resolvedOptions.underline ? {} : false,
            strike: resolvedOptions.strike ? {} : false,
            // Paragraph and heading are added separately below to carry the text block attributes.
            heading: false,
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
        ...(hasParagraph ? [createTextBlockParagraph({ hasTextBlockStyles })] : []),
        ...(headingLevels.length > 0
            ? [
                  createTextBlockHeading({ defaultLevel: resolvedOptions.defaultTextBlock.level ?? headingLevels[0], hasTextBlockStyles })
                      // For a heading-only block, the heading takes the position paragraphs would otherwise
                      // hold by priority, making it the schema's default block type.
                      .extend(hasParagraph ? {} : { priority: paragraphPriority })
                      .configure({ levels: headingLevels }),
              ]
            : []),
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
        inlineStyles,
        linkBlock,
        childBlocks,
        maxTextBlocks,
        allowedPlaceholderNames,
        listLevelMax,
        textBlocks,
    }: {
        inlineStyles: TipTapInlineStyle[];
        linkBlock?: Block;
        childBlocks?: Record<string, Block>;
        maxTextBlocks?: number;
        allowedPlaceholderNames?: string[];
        listLevelMax?: number;
        textBlocks: TipTapResolvedTextBlock[];
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

                        // Enforce the configured text blocks
                        if (containsInvalidTextBlock(value as JSONContent, textBlocks)) {
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
    const migrate = typeof nameOrOptions !== "string" ? nameOrOptions.migrate : undefined;

    const resolvedOptions = resolveTipTapOptions(options);
    const childBlocks: Record<string, Block> = Object.fromEntries(Object.entries(childBlocksConfig).map(([key, { block }]) => [key, block]));
    const childBlockConfigs = Object.values(childBlocksConfig);
    const hasChildBlocks = childBlockConfigs.length > 0;
    const hasBlockChildBlocks = childBlockConfigs.some(({ display }) => display === "block");
    const hasInlineChildBlocks = childBlockConfigs.some(({ display }) => display === "inline");
    const extensions = buildExtensions({
        resolvedOptions,
        textBlockStyles,
        inlineStyles,
        placeholders,
        hasBlockChildBlocks,
        hasInlineChildBlocks,
    });
    const schema = getSchema(extensions);

    const draftJsTextBlockMap = typeof migrateFromDraftJs === "object" ? migrateFromDraftJs.textBlockMap : undefined;
    const draftJsInlineStyleMap = typeof migrateFromDraftJs === "object" ? migrateFromDraftJs.inlineStyleMap : undefined;

    const migrateVendor: MigrateVendorOptions | undefined = migrateFromDraftJs
        ? {
              version: 1,
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
              ],
              // The DraftJS migration was version 1 of the block before it moved into the vendor chain
              legacyVersions: 1,
          }
        : undefined;

    @BlockDataMigrationVersion(migrate?.version, migrateVendor?.version)
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
            inlineStyles,
            linkBlock: LinkBlock,
            childBlocks: hasChildBlocks ? childBlocks : undefined,
            maxTextBlocks,
            allowedPlaceholderNames,
            listLevelMax,
            textBlocks: resolvedOptions.textBlocks,
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
    if (migrate || migrateVendor) {
        const blockDataFactoryDecorator1 = createAppliedMigrationsBlockDataFactoryDecorator({ migrate, migrateVendor, blockName });
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
