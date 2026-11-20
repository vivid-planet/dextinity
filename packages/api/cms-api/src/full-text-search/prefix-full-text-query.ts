import { raw } from "@mikro-orm/postgresql";

// MikroORM's $fulltext operator uses plainto_tsquery, which only matches whole words.
// plainto_tsquery sanitizes the search. Appending :* to its output makes the last word match as a prefix.
// nullif turns a search without words into NULL, which matches nothing instead of failing on "to_tsquery(':*')".
export function prefixFullTextCondition(search: string) {
    return {
        [raw((alias) => `${alias}."fullText" @@ to_tsquery('simple', nullif(plainto_tsquery('simple', ?)::text, '') || ':*')`, [search])]: true,
    };
}
