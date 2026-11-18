import { describe, expect, it } from "vitest";

import type { DocumentInterface, InfoTagProps } from "./types";

type PageInput = { content: { blocks: string[] } };
type PageOutput = { content: { blocks: string[] }; seo: { title: string } };
type LinkInput = { target: string };
type LinkOutput = { target: string; openInNewWindow: boolean };
type PageTreeNodeAdditionalFields = { userGroup: string };

const documentBase = {
    displayName: "Document",
    menuIcon: () => null,
    dependencies: () => [],
};

const Page: DocumentInterface<PageInput, PageOutput, PageTreeNodeAdditionalFields> = {
    ...documentBase,
    inputToOutput: (input) => ({ content: input.content, seo: { title: "" } }),
    anchors: (input) => input.content.blocks,
    replaceDependenciesInOutput: (output) => output,
    InfoTag: ({ page }) => page.userGroup,
};

const Link: DocumentInterface<LinkInput, LinkOutput> = {
    ...documentBase,
    inputToOutput: (input) => ({ target: input.target, openInNewWindow: false }),
    anchors: () => [],
    replaceDependenciesInOutput: (output) => output,
    InfoTag: ({ page }: InfoTagProps<PageTreeNodeAdditionalFields>) => page.userGroup,
};

describe("DocumentInterface", () => {
    it("should allow combining document types with different inputs, outputs and page tree node additional fields in one record", () => {
        const documentTypes: Record<string, DocumentInterface> = { Page, Link };

        expect(Object.keys(documentTypes)).toEqual(["Page", "Link"]);
    });
});
