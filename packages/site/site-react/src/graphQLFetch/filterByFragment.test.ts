import { describe, expect, it } from "vitest";

import { filterByFragment } from "./filterByFragment";

const pageLinkFragment = `
    fragment PageLink on PageTreeNode {
        path
    }
`;

const breadcrumbsFragment = `
    fragment Breadcrumbs on PageTreeNode {
        name
        parentNodes {
            name
            ...PageLink
        }
        scope {
            language
        }
    }
    ${pageLinkFragment}
`;

describe("filterByFragment", () => {
    it("removes fields not selected by the fragment, including nested fragments and lists", () => {
        const pageTreeNode = {
            id: "1",
            name: "Media",
            scope: { domain: "main", language: "en" },
            parentNodes: [{ id: "2", name: "Blocks", path: "/blocks" }],
            document: { __typename: "Page", content: { blocks: [] } },
        };

        expect(filterByFragment(breadcrumbsFragment, pageTreeNode)).toEqual({
            name: "Media",
            scope: { language: "en" },
            parentNodes: [{ name: "Blocks", path: "/blocks" }],
        });
    });

    it("keeps JSON scalars like block data whole", () => {
        const fragment = `
            fragment PageContent on Page {
                content
            }
        `;
        const content = { blocks: [{ key: "a", props: { text: "Hello" } }] };

        expect(filterByFragment(fragment, { content, seo: {} })).toEqual({ content });
    });

    it("merges fields from inline fragments and aliases", () => {
        const fragment = `
            fragment Link on PageTreeNode {
                title: name
                document {
                    ... on Page {
                        stage
                    }
                    ... on Link {
                        content
                    }
                }
            }
        `;

        expect(filterByFragment(fragment, { title: "Home", document: { stage: { blocks: [] }, seo: {} } })).toEqual({
            title: "Home",
            document: { stage: { blocks: [] } },
        });
    });

    it("keeps null and lists of null", () => {
        expect(filterByFragment(breadcrumbsFragment, null)).toBeNull();
        expect(filterByFragment(breadcrumbsFragment, { name: null, parentNodes: [null], scope: null })).toEqual({
            name: null,
            parentNodes: [null],
            scope: null,
        });
    });
});
