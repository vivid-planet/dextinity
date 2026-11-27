import { HttpResponse } from "msw";

import { graphqlApi } from "./graphqlApi";

const results = [
    { id: "1", entityName: "News", type: "News", name: "About the abbey", secondaryInformation: "Published on 2026-03-01" },
    { id: "2", entityName: "PageTreeNode", type: "Link", name: "Absolute beginners", secondaryInformation: "/absolute-beginners" },
    { id: "3", entityName: "PageTreeNode", type: "Page", name: "Home", secondaryInformation: "/home" },
    { id: "4", entityName: "PageTreeNode", type: "Page", name: "Contact", secondaryInformation: "/contact" },
    { id: "1", entityName: "Product", type: "Product", name: "Cap", secondaryInformation: null },
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
