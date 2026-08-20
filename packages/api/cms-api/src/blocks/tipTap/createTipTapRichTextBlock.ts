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
import { TextBlockStyleHeading } from "./extensions/TextBlockStyleHeading";
import { TextBlockStyleParagraph } from "./extensions/TextBlockStyleParagraph";
import { buildDraftJsToTipTapMigration } from "./migrations/buildDraftJsToTipTapMigration";
import type { TextBlockStyleMapping } from "./migrations/convertDraftJsToTipTap";
import { containsInvalidHeadingLevel, getListNestingDepth } from "./tipTapValidation";

export type TipTapSupports =
    | "bold"
    | "italic"
    | "underline"
    | "strike"
    | "sub"
    | "sup"
    | "heading"
    | "ordered-list"
    | "unordered-list"
    | "non-breaking-space"
    | "soft-hyphen"
    | "link";

export type { JSONContent as TipTapRichTextBlockContent } from "@tiptap/core";

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

const defaultSupports: TipTapSupports[] = [
    "bold",
    "italic",
    "strike",
    "sub",
    "sup",
    "heading",
    "ordered-list",
    "unordered-list",
    "non-breaking-space",
    "soft-hyphen",
];

interface TipTapPlaceholder {
    name: string;
}

export interface CreateTipTapRichTextBlockOptions {
    supports?: TipTapSupports[];
    textBlockStyles?: TipTapTextBlockStyle[];
    inlineStyles?: TipTapInlineStyle[];
    placeholders?: TipTapPlaceholder[];
    indexSearchText?: boolean;
    link?: Block;
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
     * Limits the selectable heading levels (1-6). Defaults to all levels ([1, 2, 3, 4, 5, 6]).
     * Must be a non-empty array of unique integers between 1 and 6, otherwise an error is thrown.
     * Content with a heading level outside this set will be rejected during validation.
     */
    headingLevels?: number[];
    /**
     * Enables best-effort migration of DraftJS-based RichTextBlock data
     * (`{ draftContent: { blocks, entityMap } }`) into TipTap data.
     *
     * The migration uses the `supports`, `textBlockStyles`, `link`, `maxTextBlocks`, and
     * `listLevelMax` options to build the target schema, validates the converted document, and
     * falls back to a stripped-down plain-text-paragraph document if validation fails.
     *
     * Pass an object with `textBlockStyleMap` to map DraftJS block types (e.g. `paragraph-small`
     * from a DraftJS `blocktypeMap`) to TipTap `textBlockStyle` attribute values. Use the
     * `{ textBlockType, textBlockStyle }` form to also set the text block type, for instance to
     * convert a DraftJS block type that was rendered as `<h2>` into a TipTap heading with level 2.
     *
     * Pass an object with `inlineStyleMap` to map DraftJS custom inline style names (e.g.
     * `highlight` from a DraftJS `customInlineStyles`) to TipTap `inlineStyle` mark type values.
     */
    migrateFromDraftJs?: boolean | { textBlockStyleMap?: Record<string, string | TextBlockStyleMapping>; inlineStyleMap?: Record<string, string> };
}

function buildExtensions(
    supports: TipTapSupports[],
    textBlockStyles: TipTapTextBlockStyle[],
    inlineStyles: TipTapInlineStyle[],
    placeholders: TipTapPlaceholder[],
    hasLink: boolean,
    hasBlockChildBlocks: boolean,
    hasInlineChildBlocks: boolean,
    headingLevels?: number[],
): Extensions {
    const hasTextBlockStyles = textBlockStyles.length > 0;
    const hasInlineStyles = inlineStyles.length > 0;
    const hasPlaceholders = placeholders.length > 0;
    return [
        StarterKit.configure({
            bold: supports.includes("bold") ? {} : false,
            italic: supports.includes("italic") ? {} : false,
            underline: supports.includes("underline") ? {} : false,
            strike: supports.includes("strike") ? {} : false,
            heading: supports.includes("heading")
                ? hasTextBlockStyles
                    ? false
                    : headingLevels
                      ? { levels: headingLevels as HeadingLevel[] }
                      : {}
                : false,
            paragraph: hasTextBlockStyles ? false : undefined,
            orderedList: supports.includes("ordered-list") ? {} : false,
            bulletList: supports.includes("unordered-list") ? {} : false,
            blockquote: false,
            code: false,
            codeBlock: false,
            link: false,
        }),
        ...(hasTextBlockStyles ? [TextBlockStyleParagraph] : []),
        ...(hasTextBlockStyles && supports.includes("heading")
            ? [TextBlockStyleHeading.configure(headingLevels ? { levels: headingLevels as HeadingLevel[] } : {})]
            : []),
        ...(hasInlineStyles ? [InlineStyleMark] : []),
        ...(supports.includes("sup") ? [Superscript] : []),
        ...(supports.includes("sub") ? [Subscript] : []),
        ...(supports.includes("non-breaking-space") ? [NonBreakingSpace] : []),
        ...(supports.includes("soft-hyphen") ? [SoftHyphen] : []),
        ...(hasPlaceholders ? [Placeholder] : []),
        ...(hasLink ? [CmsLink] : []),
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
        headingLevels,
    }: {
        inlineStyles: TipTapInlineStyle[];
        linkBlock?: Block;
        childBlocks?: Record<string, Block>;
        maxTextBlocks?: number;
        allowedPlaceholderNames?: string[];
        listLevelMax?: number;
        headingLevels?: number[];
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

                        // Enforce headingLevels restriction
                        if (headingLevels !== undefined && containsInvalidHeadingLevel(value as JSONContent, headingLevels)) {
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
    {
        supports = defaultSupports,
        textBlockStyles = [],
        inlineStyles = [],
        placeholders = [],
        indexSearchText = true,
        link: LinkBlock,
        childBlocks: childBlocksConfig = {},
        maxTextBlocks,
        listLevelMax,
        headingLevels,
        migrateFromDraftJs = false,
    }: CreateTipTapRichTextBlockOptions = {},
    nameOrOptions: BlockFactoryNameOrOptions = "TipTapRichText",
): Block<TipTapRichTextBlockDataInterface, TipTapRichTextBlockInputInterface> {
    const blockName = typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name;
    const baseMigrate = typeof nameOrOptions !== "string" && nameOrOptions.migrate ? nameOrOptions.migrate : { migrations: [], version: 0 };

    if (
        headingLevels &&
        (headingLevels.length === 0 ||
            new Set(headingLevels).size !== headingLevels.length ||
            headingLevels.some((level) => !Number.isInteger(level) || level < 1 || level > 6))
    ) {
        throw new Error("headingLevels must be a non-empty array of unique integers between 1 and 6");
    }

    const hasLink = !!LinkBlock;
    const childBlocks: Record<string, Block> = Object.fromEntries(Object.entries(childBlocksConfig).map(([key, { block }]) => [key, block]));
    const childBlockConfigs = Object.values(childBlocksConfig);
    const hasChildBlocks = childBlockConfigs.length > 0;
    const hasBlockChildBlocks = childBlockConfigs.some(({ display }) => display === "block");
    const hasInlineChildBlocks = childBlockConfigs.some(({ display }) => display === "inline");
    const extensions = buildExtensions(
        supports,
        textBlockStyles,
        inlineStyles,
        placeholders,
        hasLink,
        hasBlockChildBlocks,
        hasInlineChildBlocks,
        headingLevels,
    );
    const schema = getSchema(extensions);

    const draftJsTextBlockStyleMap = typeof migrateFromDraftJs === "object" ? migrateFromDraftJs.textBlockStyleMap : undefined;
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
    const migrate = migrateFromDraftJs
        ? {
              version: baseMigrate.version == 0 ? 1 : baseMigrate.version,
              migrations: [
                  buildDraftJsToTipTapMigration({
                      schema,
                      supports,
                      link: LinkBlock,
                      maxTextBlocks,
                      listLevelMax,
                      headingLevels,
                      textBlockStyleMap: draftJsTextBlockStyleMap,
                      inlineStyleMap: draftJsInlineStyleMap,
                  }),
                  ...baseMigrate.migrations,
              ],
          }
        : baseMigrate;

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
            inlineStyles,
            linkBlock: LinkBlock,
            childBlocks: hasChildBlocks ? childBlocks : undefined,
            maxTextBlocks,
            allowedPlaceholderNames,
            listLevelMax,
            headingLevels,
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
