import { HttpResponse } from "msw";

import { graphqlApi } from "./graphqlApi";

type Highlight = { start: number; end: number };

function highlights(highlights: Highlight[]) {
    return highlights.map((highlight) => ({ __typename: "FullTextSearchHighlight", ...highlight }));
}

function snippet({
    text,
    highlights: snippetHighlights,
    truncatedStart = false,
    truncatedEnd = false,
}: {
    text: string;
    highlights: Highlight[];
    truncatedStart?: boolean;
    truncatedEnd?: boolean;
}) {
    return { __typename: "FullTextSearchSnippet", text, highlights: highlights(snippetHighlights), truncatedStart, truncatedEnd };
}

const results = [
    {
        id: "1",
        entityName: "News",
        type: "News",
        name: "About the abbey",
        titleHighlights: highlights([
            { start: 0, end: 5 },
            { start: 10, end: 15 },
        ]),
        secondaryInformation: "Published on 2026-03-01",
        snippet: null,
    },
    {
        id: "2",
        entityName: "PageTreeNode",
        type: "Link",
        name: "Absolute beginners",
        titleHighlights: highlights([{ start: 0, end: 8 }]),
        secondaryInformation: "/absolute-beginners",
        snippet: null,
    },
    {
        id: "3",
        entityName: "PageTreeNode",
        type: "Page",
        name: "Home",
        titleHighlights: [],
        secondaryInformation: "/home",
        snippet: snippet({
            text: "Our team builds products that are able to grow with your business and adapt to new requirements.",
            highlights: [{ start: 34, end: 38 }],
            truncatedStart: true,
            truncatedEnd: true,
        }),
    },
    {
        id: "4",
        entityName: "PageTreeNode",
        type: "Page",
        name: "Contact",
        titleHighlights: [],
        secondaryInformation: "/contact",
        snippet: snippet({ text: "Write us, we're able to help.", highlights: [{ start: 16, end: 20 }] }),
    },
    {
        id: "1",
        entityName: "Product",
        type: "Product",
        name: "Cap",
        titleHighlights: [],
        secondaryInformation: null,
        snippet: snippet({ text: "An absorbent cotton cap.", highlights: [{ start: 3, end: 13 }] }),
    },
];

function matchingResults(search: string) {
    if (search.startsWith("nothing")) {
        return [];
    }

    if (search.startsWith("abb")) {
        return results.filter((result) => result.type === "News");
    }

    return results;
}

export const fullTextSearchHandler = graphqlApi.query("SearchHeaderItem", ({ variables }) => {
    const { search } = variables as { search: string };

    if (search.startsWith("error")) {
        return HttpResponse.json({ errors: [{ message: "Search failed" }] });
    }

    const matches = matchingResults(search);
    const typeCounts = Array.from(new Set(matches.map((result) => result.type))).map((type) => ({
        __typename: "FullTextSearchTypeCount",
        type,
        count: matches.filter((result) => result.type === type).length,
    }));

    return HttpResponse.json({
        data: {
            myFullTextSearch: {
                __typename: "FullTextSearchResults",
                types: typeCounts,
                nodes: matches.map((result) => ({ __typename: "FullTextSearchResult", ...result })),
            },
        },
    });
});
