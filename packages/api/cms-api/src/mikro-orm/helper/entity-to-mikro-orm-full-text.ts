import type { WeightedFullTextValue } from "@mikro-orm/postgresql";

import type { BlockDataInterface } from "../../blocks/block";
import { blockToMikroOrmFullText } from "../../blocks/search/get-search-text";

export function entityToMikroOrmFullText(fields: WeightedFullTextValue, ...blocks: BlockDataInterface[]): string | WeightedFullTextValue {
    const result: WeightedFullTextValue = { ...fields };
    for (const block of blocks) {
        const blockFullText = blockToMikroOrmFullText(block);
        if (typeof blockFullText !== "string") {
            for (const [key, value] of Object.entries(blockFullText)) {
                const weight = key as keyof WeightedFullTextValue;
                result[weight] = [result[weight], value].filter(Boolean).join(" ");
            }
        }
    }
    if (Object.keys(result).length === 0) {
        return " ";
    }
    return result;
}
