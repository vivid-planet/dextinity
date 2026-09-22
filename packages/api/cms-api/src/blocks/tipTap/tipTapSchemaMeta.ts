import type { Schema } from "@tiptap/pm/model";

import type { TipTapTextBlockType } from "./createTipTapRichTextBlock";

export interface TipTapSchemaAttributeMeta {
    default?: unknown;
}

export interface TipTapSchemaNodeMeta {
    content?: string;
    group?: string;
    inline?: boolean;
    atom?: boolean;
    attrs?: Record<string, TipTapSchemaAttributeMeta>;
}

export interface TipTapSchemaMarkMeta {
    attrs?: Record<string, TipTapSchemaAttributeMeta>;
    excludes?: string;
}

interface TipTapStyleMeta {
    name: string;
    appliesTo?: TipTapTextBlockType[];
}

/**
 * Serializable description of the content a TipTap rich text block accepts: the ProseMirror schema's
 * nodes and marks plus the rules the block validates on top of the schema.
 */
export interface TipTapRichTextBlockSchemaMeta {
    topNode: string;
    nodes: Record<string, TipTapSchemaNodeMeta>;
    marks: Record<string, TipTapSchemaMarkMeta>;
    /**
     * Allowed values of the `heading` node's `level` attribute. Empty when headings are disabled.
     */
    headingLevels: number[];
    /**
     * Allowed values of the `textBlockStyle` attribute of `paragraph` and `heading` nodes.
     */
    textBlockStyles: TipTapStyleMeta[];
    /**
     * Allowed values of the `inlineStyle` mark's `type` attribute.
     */
    inlineStyles: TipTapStyleMeta[];
    /**
     * Allowed values of the `placeholder` node's `name` attribute.
     */
    placeholders: string[];
    /**
     * Whether a child block is embedded as a `cmsBlock` or `cmsInlineBlock` node, keyed by the value
     * of the node's `blockType` attribute.
     */
    childBlocks: Record<string, { display: "block" | "inline" }>;
    maxTextBlocks?: number;
    listLevelMax?: number;
}

function extractAttrs(attrs: Record<string, { default?: unknown }> | undefined): Record<string, TipTapSchemaAttributeMeta> | undefined {
    if (!attrs) {
        return undefined;
    }
    return Object.fromEntries(Object.entries(attrs).map(([name, attr]) => [name, attr.default === undefined ? {} : { default: attr.default }]));
}

export function buildTipTapSchemaMeta({
    schema,
    headingLevels,
    textBlockStyles,
    inlineStyles,
    placeholders,
    childBlocks,
    maxTextBlocks,
    listLevelMax,
}: {
    schema: Schema;
    headingLevels: number[];
    textBlockStyles: TipTapStyleMeta[];
    inlineStyles: TipTapStyleMeta[];
    placeholders: string[];
    childBlocks: Record<string, { display: "block" | "inline" }>;
    maxTextBlocks?: number;
    listLevelMax?: number;
}): TipTapRichTextBlockSchemaMeta {
    const nodes: Record<string, TipTapSchemaNodeMeta> = {};
    schema.spec.nodes.forEach((name, spec) => {
        nodes[name] = {
            content: spec.content,
            group: spec.group,
            inline: spec.inline,
            atom: spec.atom,
            attrs: extractAttrs(spec.attrs),
        };
    });

    const marks: Record<string, TipTapSchemaMarkMeta> = {};
    schema.spec.marks.forEach((name, spec) => {
        marks[name] = {
            attrs: extractAttrs(spec.attrs),
            excludes: spec.excludes,
        };
    });

    return {
        topNode: schema.topNodeType.name,
        nodes,
        marks,
        headingLevels,
        textBlockStyles: textBlockStyles.map(({ name, appliesTo }) => ({ name, appliesTo })),
        inlineStyles: inlineStyles.map(({ name, appliesTo }) => ({ name, appliesTo })),
        placeholders,
        childBlocks: Object.fromEntries(Object.entries(childBlocks).map(([key, { display }]) => [key, { display }])),
        maxTextBlocks,
        listLevelMax,
    };
}
