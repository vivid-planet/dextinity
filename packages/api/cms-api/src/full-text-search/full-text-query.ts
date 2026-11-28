import { raw } from "@mikro-orm/postgresql";

// plainto_tsquery sanitizes the search. Appending :* to its output makes the last word match as a prefix.
// The text is cast instead of passed to to_tsquery, which would split lexemes such as "foo-bar" a second time.
// nullif turns a search without words into NULL, which matches nothing instead of failing on "':*'::tsquery".
export const ALL_TERMS_TSQUERY_SQL = `(nullif(plainto_tsquery('simple', ?)::text, '') || ':*')::tsquery`;

// plainto_tsquery quotes every lexeme, so " & " only occurs as an operator and can safely be replaced by " | ".
export const ANY_TERM_TSQUERY_SQL = `(replace(nullif(plainto_tsquery('simple', ?)::text, ''), ' & ', ' | ') || ':*')::tsquery`;

export function prefixFullTextCondition(search: string) {
    return {
        [raw((alias) => `${alias}."fullText" @@ ${ALL_TERMS_TSQUERY_SQL}`, [search])]: true,
    };
}

/**
 * Ranks how well the title matches: 3 = exact title, 2 = all terms, 1 = some terms, 0 = content match only.
 * Each `?` is bound to the search.
 */
export function titleScoreSql(nameColumn: string): { sql: string; bindingCount: number } {
    return {
        sql: `CASE WHEN lower(${nameColumn}) = lower(btrim(?)) THEN 3
            WHEN to_tsvector('simple', ${nameColumn}) @@ ${ALL_TERMS_TSQUERY_SQL} THEN 2
            WHEN to_tsvector('simple', ${nameColumn}) @@ ${ANY_TERM_TSQUERY_SQL} THEN 1
            ELSE 0 END`,
        bindingCount: 3,
    };
}

// Weights are D, C, B, A. Normalization 1 divides by 1 + log(document length), so long pages don't win by repetition.
export function rankSql(fullTextColumn: string): string {
    return `ts_rank('{0.1,0.2,0.4,1.0}', ${fullTextColumn}, ${ALL_TERMS_TSQUERY_SQL}, 1)`;
}
