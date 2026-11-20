import type { EntityManager, EntityMetadata, WeightedFullTextValue } from "@mikro-orm/postgresql";

import type { BlockDataInterface } from "../blocks/block";
import { RootBlockType } from "../blocks/root-block-type";
import { getSearchTextFromBlock } from "../blocks/search/get-search-text";

const maxParagraphLength = 10_000;
const maxParagraphCount = 200;
// Includes the highlight markers \u0002 and \u0003, so content can't fake a highlight.
// eslint-disable-next-line no-control-regex
const controlCharactersRegex = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function stripControlCharacters(text: string): string {
    return text.replace(controlCharactersRegex, " ");
}

/**
 * Recomputes the texts that were indexed for an entity, as paragraphs: the texts of its root blocks in document order,
 * followed by the texts of the onUpdate/onCreate callback of its full-text property that aren't root block texts.
 * Texts that equal the name or the secondary information are left out, because the result shows them already.
 */
export async function paragraphsForEntity({
    entity,
    metadata,
    fullTextPropertyName,
    name,
    secondaryInformation,
    entityManager,
}: {
    entity: object;
    metadata: EntityMetadata;
    fullTextPropertyName?: string;
    name: string;
    secondaryInformation?: string;
    entityManager: EntityManager;
}): Promise<string[]> {
    const rootBlockTexts = metadata.props
        .filter((prop) => prop.customType instanceof RootBlockType)
        .flatMap((prop) => {
            const block = (entity as Record<string, unknown>)[prop.name] as BlockDataInterface | null | undefined;
            return block ? getSearchTextFromBlock(block).map(({ text }) => cleanText(text)) : [];
        })
        .filter((text) => text.length > 0);

    const callbackTexts = fullTextPropertyName
        ? (await paragraphsFromFullTextCallback({ entity, metadata, fullTextPropertyName, entityManager })).map((text) =>
              withoutTrailingTexts(cleanText(text), rootBlockTexts),
          )
        : [];

    const textsShownInResult = new Set([name, secondaryInformation].map((text) => text?.trim()).filter(Boolean));
    return [...new Set([...rootBlockTexts, ...callbackTexts])]
        .filter((text) => text.length > 0 && !textsShownInResult.has(text))
        .slice(0, maxParagraphCount)
        .map((text) => text.slice(0, maxParagraphLength));
}

/**
 * `entityToMikroOrmFullText` appends the texts of the passed blocks to the weighted fields, so a callback text ends with
 * root block texts, which are paragraphs of their own already.
 */
function withoutTrailingTexts(paragraph: string, texts: string[]): string {
    let remaining = paragraph;
    const candidates = [...texts];
    const isTrailingText = (text: string) => remaining === text || remaining.endsWith(` ${text}`);
    // Searching from the end finds the next text right away when the blocks were passed in declaration order.
    let index = candidates.findLastIndex(isTrailingText);
    while (index !== -1) {
        remaining = remaining.slice(0, remaining.length - candidates[index].length).trimEnd();
        candidates.splice(index, 1);
        index = candidates.findLastIndex(isTrailingText);
    }
    return remaining;
}

async function paragraphsFromFullTextCallback({
    entity,
    metadata,
    fullTextPropertyName,
    entityManager,
}: {
    entity: object;
    metadata: EntityMetadata;
    fullTextPropertyName: string;
    entityManager: EntityManager;
}): Promise<string[]> {
    const prop = metadata.properties[fullTextPropertyName as keyof typeof metadata.properties];
    const callback = prop?.onUpdate ?? prop?.onCreate;
    if (!callback) {
        return [];
    }

    const value: unknown = await callback(entity, entityManager);
    if (typeof value === "string") {
        return [value];
    }
    if (!value || typeof value !== "object") {
        return [];
    }

    const weightedValue = value as WeightedFullTextValue;
    return (["D", "C", "B", "A"] as const).map((weight) => weightedValue[weight]).filter((text): text is string => typeof text === "string");
}

function cleanText(text: string): string {
    return stripControlCharacters(text).trim();
}
