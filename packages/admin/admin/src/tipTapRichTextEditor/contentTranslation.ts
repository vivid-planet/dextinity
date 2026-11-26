import { type Extensions, generateHTML, generateJSON } from "@tiptap/core";
import type { JSONContent } from "@tiptap/react";

import { buildTipTapExtensions } from "./buildExtensions";
import { resolveTipTapOptions, type TipTapResolvedOptions, type TipTapRichTextEditorOptions } from "./options";

interface ExternalizedData {
    id: string;

    data: any;
}

const hasDataAttribute = (attrs: JSONContent["attrs"]): attrs is Record<string, unknown> => !!attrs && "data" in attrs;

type MapData = (data: any, owner: { kind: "mark" | "node"; type: string; node: JSONContent }) => Promise<any>;

async function mapDataAttributes(content: JSONContent, fn: MapData): Promise<JSONContent> {
    if (!content || typeof content !== "object") {
        return content;
    }
    const result = { ...content };

    if (Array.isArray(result.marks)) {
        result.marks = await Promise.all(
            result.marks.map(async (mark) =>
                // A link mark is externalized even without data, since an empty `data-cms-link` wouldn't parse back into a link.
                mark.type === "link" || hasDataAttribute(mark.attrs)
                    ? { ...mark, attrs: { ...mark.attrs, data: await fn(mark.attrs?.data, { kind: "mark", type: mark.type, node: result }) } }
                    : mark,
            ),
        );
    }

    if (result.type && hasDataAttribute(result.attrs)) {
        result.attrs = { ...result.attrs, data: await fn(result.attrs.data, { kind: "node", type: result.type, node: result }) };
    }

    if (Array.isArray(result.content)) {
        result.content = await Promise.all(result.content.map((child) => mapDataAttributes(child, fn)));
    }

    return result;
}

// Link marks and custom nodes can carry arbitrary non-string `data` (link targets, block state).
// HTML serialization only round-trips string attribute values, so this data is swapped for a
// placeholder id before serializing and restored by id afterward. It never enters the translated HTML.
// Every data value is externalized, including falsy ones (null, false, 0, ""), since setLinkData's
// data is typed as `any`.
async function externalizeDataForHtml(content: JSONContent): Promise<{ content: JSONContent; externalized: ExternalizedData[] }> {
    const externalized: ExternalizedData[] = [];

    const result = await mapDataAttributes(content, async (data) => {
        const id = `placeholder-${externalized.length}`;
        externalized.push({ id, data });
        return id;
    });

    return { content: result, externalized };
}

async function restoreDataFromHtml(content: JSONContent, externalized: ExternalizedData[]): Promise<JSONContent> {
    const dataById = new Map(externalized.map((item) => [item.id, item.data]));
    return mapDataAttributes(content, async (id) => (typeof id === "string" && dataById.has(id) ? dataById.get(id) : id));
}

// Translates the content as a single HTML document (like the Draft.js rich text editor does),
// instead of translating each text node in isolation. This keeps sentence context across marks (bold,
// links, ...) intact and results in one translation request per field instead of one per text node.
// Link and custom-node data is opaque to HTML translation (see externalizeDataForHtml), so once
// restored it's run through the link's and the custom nodes' own translation separately.
export async function translateTipTapContent(
    content: JSONContent,
    translate: (text: string) => Promise<string>,
    { resolvedOptions, extensions }: { resolvedOptions: TipTapResolvedOptions; extensions: Extensions },
): Promise<JSONContent> {
    const { content: sanitizedContent, externalized } = await externalizeDataForHtml(content);
    const html = generateHTML(sanitizedContent, extensions);
    const translatedHtml = await translate(html);

    // `translate` is typed as an unconstrained string transformer, so nothing guarantees the
    // implementation leaves markup and attribute values alone (a naive one could, e.g., uppercase
    // the whole HTML string). Verify the placeholder ids survived verbatim before trusting the
    // result — restoring link/custom-node data by a mangled id would otherwise silently corrupt it.
    const corruptedId = externalized.find((item) => !translatedHtml.includes(item.id));
    if (corruptedId) {
        throw new Error(
            "Translation result is missing an expected placeholder id. The translate function must preserve HTML markup and attribute values unchanged, translating only text content.",
        );
    }

    const translatedContent = generateJSON(translatedHtml, extensions) as JSONContent;
    const result = await restoreDataFromHtml(translatedContent, externalized);

    const { link, translateNodeData } = resolvedOptions;
    if (!link?.translateData && !translateNodeData) {
        return result;
    }

    return mapDataAttributes(result, async (data, { kind, type, node }) => {
        if (kind === "mark") {
            return type === "link" && data && link?.translateData ? link.translateData(data, translate) : data;
        }
        return translateNodeData ? translateNodeData(node, translate) : data;
    });
}

/**
 * Translates the content with the content translation's `translate` function, the same way the
 * editor's "Translate" button does.
 */
export async function translateTipTapRichTextContent(
    content: JSONContent,
    translate: (text: string) => Promise<string>,
    options: TipTapRichTextEditorOptions = {},
): Promise<JSONContent> {
    const resolvedOptions = resolveTipTapOptions(options);
    return translateTipTapContent(content, translate, { resolvedOptions, extensions: buildTipTapExtensions(resolvedOptions) });
}
