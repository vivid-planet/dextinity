import { EntityManager } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import { DiscoverService } from "../dependencies/discover.service";
import { EntityInfo } from "../entity-info/entity-info.decorator";
import { PageTreeFullTextService } from "../page-tree/fullText/page-tree-full-text.service";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import type { Permission } from "../user-permissions/user-permissions.types";
import { filterAllowedFullTextSearchTypes } from "./filter-allowed-full-text-search-types";
import { FullTextSearchService } from "./full-text-search.service";

// Application permissions are registered by the project, not by cms-api
const appPermission = (permission: string) => permission as Permission;

@EntityInfo({ name: "title", fullText: "fullText" })
@RequiredPermission(appPermission("news"))
class News {}

@EntityInfo({ name: "title", fullText: "fullText" })
@RequiredPermission([appPermission("products"), appPermission("manageProducts")])
class Product {}

@EntityInfo({ name: "title" })
@RequiredPermission(appPermission("news"))
class NewsComment {}

class Footer {}

@EntityInfo({ sql: "SELECT 1" })
class PageTreeNode {}

function createService({ pageTreeFullText }: { pageTreeFullText: boolean }) {
    const entities = [News, Product, NewsComment, Footer, PageTreeNode];
    const discoverService = {
        discoverTargetEntities: () => entities.map((entity) => ({ entity, entityName: entity.name, metadata: { tableName: entity.name } })),
    } as unknown as DiscoverService;
    const pageTreeFullTextService = pageTreeFullText
        ? ({ getDocumentTypes: () => ["Page", "Link", "PredefinedPage"] } as unknown as PageTreeFullTextService)
        : undefined;

    return new FullTextSearchService(discoverService, {} as EntityManager, pageTreeFullTextService);
}

describe("FullTextSearchService.getFullTextSearchTypes", () => {
    it("returns the entities with full text and the page tree document types, sorted by type", () => {
        expect(createService({ pageTreeFullText: true }).getFullTextSearchTypes()).toEqual([
            { type: "Link", entityName: "PageTreeNode", requiredPermission: ["pageTree"] },
            { type: "News", entityName: "News", requiredPermission: ["news"] },
            { type: "Page", entityName: "PageTreeNode", requiredPermission: ["pageTree"] },
            { type: "PredefinedPage", entityName: "PageTreeNode", requiredPermission: ["pageTree"] },
            { type: "Product", entityName: "Product", requiredPermission: ["products", "manageProducts"] },
        ]);
    });

    it("omits the page tree document types when page tree full text is disabled", () => {
        expect(
            createService({ pageTreeFullText: false })
                .getFullTextSearchTypes()
                .map(({ type }) => type),
        ).toEqual(["News", "Product"]);
    });
});

describe("filterAllowedFullTextSearchTypes", () => {
    const types = createService({ pageTreeFullText: true }).getFullTextSearchTypes();

    it("keeps the types the user has one of the required permissions for", () => {
        const allowedTypes = filterAllowedFullTextSearchTypes(types, [{ permission: "pageTree" }, { permission: "manageProducts" }]);

        expect(allowedTypes.map(({ type }) => type)).toEqual(["Link", "Page", "PredefinedPage", "Product"]);
    });

    it("returns no types without a matching permission", () => {
        expect(filterAllowedFullTextSearchTypes(types, [{ permission: "fullTextSearch" }])).toEqual([]);
    });
});
