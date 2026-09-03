import { type Extensions, generateHTML, generateJSON } from "@tiptap/core";
import type { JSONContent } from "@tiptap/react";

import { mapCmsBlockNodesData, mapLinkMarksData } from "./createTipTapRichTextBlock";

interface ExternalizedBlockData {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}

// Unlike mapLinkMarksData (used elsewhere to skip marks that have no link data at all), this
// externalizes every link mark's data unconditionally, including falsy values (null, false, 0, "").
// setCmsLink's data is typed as `any`, so a falsy value isn't ruled out even though the only current
// caller (TipTapLinkDialog) always passes a populated object.
function externalizeLinkMarksForHtml(content: JSONContent, externalized: ExternalizedBlockData[]): JSONContent {
    if (!content || typeof content !== "object") {
        return content;
    }
    const result = { ...content };

    if (Array.isArray(result.marks)) {
        result.marks = result.marks.map((mark) => {
            if (mark.type === "link") {
                const id = `placeholder-${externalized.length}`;
                externalized.push({ id, data: mark.attrs?.data });
                return { ...mark, attrs: { ...mark.attrs, data: id } };
            }
            return mark;
        });
    }

    if (Array.isArray(result.content)) {
        result.content = result.content.map((child) => externalizeLinkMarksForHtml(child, externalized));
    }

    return result;
}

// Link marks and child block nodes can carry arbitrary non-string `data` (link targets, block state).
// HTML serialization only round-trips string attribute values, so this data is swapped for a
// placeholder id before serializing and restored by id afterward. It never enters the translated HTML.
function externalizeBlockDataForHtml(content: JSONContent): { content: JSONContent; externalized: ExternalizedBlockData[] } {
    const externalized: ExternalizedBlockData[] = [];

    let result = externalizeLinkMarksForHtml(content, externalized);

    result = mapCmsBlockNodesData(result, (blockType, data) => {
        const id = `placeholder-${externalized.length}`;
        externalized.push({ id, data });
        return id;
    });

    return { content: result, externalized };
}

function restoreBlockDataFromHtml(content: JSONContent, externalized: ExternalizedBlockData[]): JSONContent {
    const dataById = new Map(externalized.map((item) => [item.id, item.data]));

    let result = mapLinkMarksData(content, (id) => (typeof id === "string" && dataById.has(id) ? dataById.get(id) : id));
    result = mapCmsBlockNodesData(result, (blockType, id) => (typeof id === "string" && dataById.has(id) ? dataById.get(id) : id));

    return result;
}

// Translates a field's content as a single HTML document (like the Draft.js rich text block does),
// instead of translating each text node in isolation. This keeps sentence context across marks (bold,
// links, ...) intact and results in one translation request per field instead of one per text node.
export async function translateTipTapContentAsync(
    content: JSONContent,
    translate: (text: string) => Promise<string>,
    extensions: Extensions,
): Promise<JSONContent> {
    const { content: sanitizedContent, externalized } = externalizeBlockDataForHtml(content);
    const html = generateHTML(sanitizedContent, extensions);
    const translatedHtml = await translate(html);

    // `translate` is typed as an unconstrained string transformer, so nothing guarantees the
    // implementation leaves markup and attribute values alone (a naive one could, e.g., uppercase
    // the whole HTML string). Verify the placeholder ids survived verbatim before trusting the
    // result — restoring link/child-block data by a mangled id would otherwise silently corrupt it.
    const corruptedId = externalized.find((item) => !translatedHtml.includes(item.id));
    if (corruptedId) {
        throw new Error(
            "Translation result is missing an expected placeholder id. The translate function must preserve HTML markup and attribute values unchanged, translating only text content.",
        );
    }

    const translatedContent = generateJSON(translatedHtml, extensions) as JSONContent;
    return restoreBlockDataFromHtml(translatedContent, externalized);
}
