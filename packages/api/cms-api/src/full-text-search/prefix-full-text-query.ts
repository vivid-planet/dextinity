import { raw } from "@mikro-orm/postgresql";

// MikroORM's $fulltext operator uses plainto_tsquery, which only matches whole words.
// plainto_tsquery sanitizes the search. Appending :* to its output makes the last word match as a prefix.
// The text is cast instead of passed to to_tsquery, which would split lexemes such as "foo-bar" a second time.
// nullif turns a search without words into NULL, which matches nothing instead of failing on "':*'::tsquery".
export function prefixFullTextCondition(search: string) {
    return {
        [raw((alias) => `${alias}."fullText" @@ (nullif(plainto_tsquery('simple', ?)::text, '') || ':*')::tsquery`, [search])]: true,
    };
}
