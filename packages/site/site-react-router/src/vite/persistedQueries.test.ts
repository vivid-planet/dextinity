// @vitest-environment node
import { describe, expect, it } from "vitest";

import { transformPersistedQueries } from "./persistedQueries";

describe("transformPersistedQueries", () => {
    it("replaces queries with their hash and keeps the fragment variables", () => {
        const persistedQueries = {};
        const source = "const query = gql`query News { news { ...NewsItem } } ${newsItemFragment}`;";

        const transformedSource = transformPersistedQueries(source, persistedQueries);

        const [[hash, query]] = Object.entries(persistedQueries);
        expect(query).toBe("query News { news { ...NewsItem } } ${newsItemFragment}");
        expect(transformedSource).toBe(`const query = { hash: "${hash}", fragmentVariables: \`\${newsItemFragment}\` };`);
    });

    it("replaces fragments and removes their previous versions", () => {
        const persistedQueries: Record<string, string> = { old: "fragment NewsItem on News { id }" };

        const transformedSource = transformPersistedQueries("gql`fragment NewsItem on News { id title }`", persistedQueries);

        expect(transformedSource).toBe("{ fragment: true, fragmentVariables: `` }");
        expect(Object.values(persistedQueries)).toEqual(["fragment NewsItem on News { id title }"]);
    });

    it("leaves sources without documents untouched", () => {
        expect(transformPersistedQueries("const a = 1;", {})).toBeUndefined();
    });
});
