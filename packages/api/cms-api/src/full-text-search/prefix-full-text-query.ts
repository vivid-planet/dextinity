import { raw } from "@mikro-orm/postgresql";

export function searchToPrefixTsQuery(search: string): string | undefined {
    const words = search.toLowerCase().match(/[\p{L}\p{N}]+/gu);
    if (!words) {
        return undefined;
    }
    return words.map((word) => `${word}:*`).join(" & ");
}

// MikroORM's $fulltext operator uses plainto_tsquery, which only matches whole words.
export function prefixFullTextCondition(tsQuery: string) {
    return {
        [raw((alias) => `${alias}."fullText" @@ to_tsquery('simple', ?)`, [tsQuery])]: true,
    };
}
