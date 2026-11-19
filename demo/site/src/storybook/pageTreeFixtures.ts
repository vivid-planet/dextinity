import type { GQLPageLinkFragment } from "@src/layout/header/PageLink.fragment.generated";

import { createExternalLink } from "./blockFixtures";

type PageTreeNode = GQLPageLinkFragment & { id: string; name: string };
export type PageTreeNodeWithChildren = PageTreeNode & { childNodes: PageTreeNode[] };

function createPageNode(name: string, path: string): PageTreeNode {
    return { id: path, name, path, documentType: "Page", scope: { language: "en" }, document: { __typename: "Page" } };
}

function createLinkNode(name: string, targetUrl: string): PageTreeNode {
    return {
        id: targetUrl,
        name,
        path: `/${name.toLowerCase()}`,
        documentType: "Link",
        scope: { language: "en" },
        document: { __typename: "Link", content: createExternalLink(targetUrl) },
    };
}

export const navigationNodes: PageTreeNodeWithChildren[] = [
    { ...createPageNode("Home", "/"), childNodes: [] },
    {
        ...createPageNode("Products", "/products"),
        childNodes: [createPageNode("Product A", "/products/product-a"), createPageNode("Product B", "/products/product-b")],
    },
    {
        ...createPageNode("About us", "/about-us"),
        childNodes: [createPageNode("Team", "/about-us/team"), createPageNode("Careers", "/about-us/careers")],
    },
    { ...createLinkNode("Blog", "https://www.dextinity.com"), childNodes: [] },
];
