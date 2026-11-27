import { HttpResponse } from "msw";

import { graphqlApi } from "./graphqlApi";

type Highlight = { start: number; end: number };

function highlightedText({
    text,
    highlights = [],
    truncatedStart = false,
    truncatedEnd = false,
}: {
    text: string;
    highlights?: Highlight[];
    truncatedStart?: boolean;
    truncatedEnd?: boolean;
}) {
    return {
        __typename: "FullTextSearchHighlightedText",
        text,
        truncatedStart,
        truncatedEnd,
        highlights: highlights.map((highlight) => ({ __typename: "FullTextSearchHighlight", ...highlight })),
    };
}

const results = [
    {
        id: "1",
        entityName: "News",
        type: "News",
        name: "About the abbey",
        secondaryInformation: "Published on 2026-03-01",
        titleMatch: true,
        title: highlightedText({
            text: "About the abbey",
            highlights: [
                { start: 0, end: 5 },
                { start: 10, end: 15 },
            ],
        }),
        snippet: null,
    },
    {
        id: "2",
        entityName: "PageTreeNode",
        type: "Link",
        name: "Absolute beginners",
        secondaryInformation: "/absolute-beginners",
        titleMatch: true,
        title: highlightedText({ text: "Absolute beginners", highlights: [{ start: 0, end: 8 }] }),
        snippet: null,
    },
    {
        id: "3",
        entityName: "PageTreeNode",
        type: "Page",
        name: "Home",
        secondaryInformation: "/home",
        titleMatch: false,
        title: highlightedText({ text: "Home" }),
        snippet: highlightedText({
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
        secondaryInformation: "/contact",
        titleMatch: false,
        title: highlightedText({ text: "Contact" }),
        snippet: highlightedText({ text: "Write us, we're able to help.", highlights: [{ start: 16, end: 20 }] }),
    },
    {
        id: "1",
        entityName: "Product",
        type: "Product",
        name: "Cap",
        secondaryInformation: null,
        titleMatch: false,
        title: highlightedText({ text: "Cap" }),
        snippet: highlightedText({ text: "An absorbent cotton cap.", highlights: [{ start: 3, end: 12 }] }),
    },
];

const searchTypes = [
    { type: "Link", entityName: "PageTreeNode" },
    { type: "News", entityName: "News" },
    { type: "Page", entityName: "PageTreeNode" },
    { type: "PredefinedPage", entityName: "PageTreeNode" },
    { type: "Product", entityName: "Product" },
];

export const fullTextSearchTypesHandler = graphqlApi.query("FullTextSearchTypes", () =>
    HttpResponse.json({
        data: { fullTextSearchTypes: searchTypes.map((searchType) => ({ __typename: "FullTextSearchType", ...searchType })) },
    }),
);

function matchingResults(search: string) {
    if (search.startsWith("nothing")) {
        return [];
    }

    if (search.startsWith("abb")) {
        return results.filter((result) => result.type === "News");
    }

    return results;
}

export const fullTextSearchHandler = graphqlApi.query("FullTextSearchDialog", ({ variables }) => {
    const { search, types, limit } = variables as { search: string; types?: string[]; limit: number };

    if (search.startsWith("error")) {
        return HttpResponse.json({ errors: [{ message: "Search failed" }] });
    }

    const matches = matchingResults(search);
    const typeCounts = Array.from(new Set(matches.map((result) => result.type))).map((type) => {
        const resultsOfType = matches.filter((result) => result.type === type);
        return { __typename: "FullTextSearchTypeCount", type, entityName: resultsOfType[0].entityName, count: resultsOfType.length };
    });
    const filteredMatches = types && types.length > 0 ? matches.filter((result) => types.includes(result.type)) : matches;

    return HttpResponse.json({
        data: {
            fullTextSearch: {
                __typename: "FullTextSearchResults",
                totalCount: filteredMatches.length,
                types: typeCounts,
                nodes: filteredMatches.slice(0, limit).map((result) => ({ __typename: "FullTextSearchResult", ...result })),
            },
        },
    });
});
