import { describe, expect, it } from "vitest";

import { ALL_TERMS_TSQUERY_SQL, ANY_TERM_TSQUERY_SQL, rankSql, titleScoreSql } from "./full-text-query";

function countPlaceholders(sql: string): number {
    return sql.split("?").length - 1;
}

describe("titleScoreSql", () => {
    it("returns the number of search bindings it uses", () => {
        const { sql, bindingCount } = titleScoreSql(`e."name"`);

        expect(countPlaceholders(sql)).toBe(bindingCount);
        expect(bindingCount).toBe(3);
    });

    it("ranks an exact title above all terms above some terms", () => {
        const { sql } = titleScoreSql(`e."name"`);

        expect(sql.indexOf(`lower(e."name") = lower(btrim(?))`)).toBeLessThan(sql.indexOf(ALL_TERMS_TSQUERY_SQL));
        expect(sql.indexOf(ALL_TERMS_TSQUERY_SQL)).toBeLessThan(sql.indexOf(ANY_TERM_TSQUERY_SQL));
    });
});

describe("rankSql", () => {
    it("ranks the given column with one search binding", () => {
        const sql = rankSql(`f."fullText"`);

        expect(sql).toContain(`ts_rank('{0.1,0.2,0.4,1.0}', f."fullText", ${ALL_TERMS_TSQUERY_SQL}, 1)`);
        expect(countPlaceholders(sql)).toBe(1);
    });
});
