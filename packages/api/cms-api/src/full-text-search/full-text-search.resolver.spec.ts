import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it } from "vitest";

import type { CurrentUser } from "../user-permissions/dto/current-user";
import { FullTextSearchResolver } from "./full-text-search.resolver";
import type { FullTextSearchService } from "./full-text-search.service";
import type { FullTextSearchQueryService } from "./full-text-search-query.service";
import type { FullTextSnippetService } from "./full-text-snippet.service";

describe("FullTextSearchResolver.fullTextSearchTypes", () => {
    it("returns only the types the user has a permission for", () => {
        const fullTextSearchService = createMock<FullTextSearchService>({
            getFullTextSearchTypes: () => [
                { type: "News", entityName: "News", requiredPermission: ["news"] },
                { type: "Page", entityName: "PageTreeNode", requiredPermission: ["pageTree"] },
            ],
        });
        const resolver = new FullTextSearchResolver(
            createMock<FullTextSearchQueryService>(),
            createMock<FullTextSnippetService>(),
            fullTextSearchService,
        );
        const user = {
            id: "1",
            name: "User",
            email: "user@example.com",
            permissions: [
                { permission: "fullTextSearch", contentScopes: [] },
                { permission: "pageTree", contentScopes: [{ domain: "main" }] },
            ],
        } satisfies CurrentUser;

        expect(resolver.fullTextSearchTypes(user)).toEqual([{ type: "Page", entityName: "PageTreeNode" }]);
    });
});
