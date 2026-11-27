import type { EntityManager, EntityMetadata, WeightedFullTextValue } from "@mikro-orm/postgresql";

import type { BlockDataInterface } from "../blocks/block.js";
import { RootBlockType } from "../blocks/root-block-type.js";
import { getSearchTextFromBlock } from "../blocks/search/get-search-text.js";
import { stripControlCharacters } from "./full-text-highlights.js";

const maxSourceTextLength = 20_000;

/**
 * Returns the text of all root blocks of a page tree document, in the order of the properties.
 */
export function documentSourceText(document: object, metadata: EntityMetadata): string {
    const texts = metadata.props
        .filter((prop) => prop.customType instanceof RootBlockType)
        .flatMap((prop) => {
            const block = (document as Record<string, unknown>)[prop.name] as BlockDataInterface | null | undefined;
            return block ? getSearchTextFromBlock(block).map(({ text }) => text) : [];
        });
    return cleanSourceText(texts);
}

/**
 * Recomputes the indexed text of an entity with the onUpdate/onCreate callback of its full-text property.
 * Leaves out the weighted texts that the result shows already, such as the name.
 */
export async function entitySourceText({
    entity,
    metadata,
    fullTextPropertyName,
    textsShownInResult,
    entityManager,
}: {
    entity: object;
    metadata: EntityMetadata;
    fullTextPropertyName: string;
    textsShownInResult: Array<string | undefined>;
    entityManager: EntityManager;
}): Promise<string> {
    const prop = metadata.properties[fullTextPropertyName as keyof typeof metadata.properties];
    const callback = prop?.onUpdate ?? prop?.onCreate;
    if (!callback) {
        return "";
    }

    const value: unknown = await callback(entity, entityManager);
    if (typeof value === "string") {
        return cleanSourceText([value]);
    }
    if (!value || typeof value !== "object") {
        return "";
    }

    const weightedValue = value as WeightedFullTextValue;
    const texts = (["A", "B", "C", "D"] as const).map((weight) => weightedValue[weight]).filter((text): text is string => typeof text === "string");
    const trimmedTextsShownInResult = new Set(textsShownInResult.map((text) => text?.trim()));
    return cleanSourceText(texts.filter((text) => !trimmedTextsShownInResult.has(text.trim())));
}

function cleanSourceText(texts: string[]): string {
    const text = stripControlCharacters(
        texts
            .map((text) => text.trim())
            .filter(Boolean)
            .join(" "),
    );
    if (text.length <= maxSourceTextLength) {
        return text;
    }
    // A high surrogate without its low surrogate can't be encoded as UTF-8
    const isHighSurrogate = /[\uD800-\uDBFF]/.test(text[maxSourceTextLength - 1]);
    return text.slice(0, isHighSurrogate ? maxSourceTextLength - 1 : maxSourceTextLength);
}
