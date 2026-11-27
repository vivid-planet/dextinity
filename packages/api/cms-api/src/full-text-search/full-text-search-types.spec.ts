import { EntityManager } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import { DiscoverService } from "../dependencies/discover.service.js";
import { EntityInfo } from "../entity-info/entity-info.decorator.js";
import { PageTreeFullTextService } from "../page-tree/fullText/page-tree-full-text.service.js";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator.js";
import type { Permission } from "../user-permissions/user-permissions.types.js";
import { FullTextSearchService } from "./full-text-search.service.js";

// Application permissions are registered by the project, not by cms-api
const appPermission = (permission: string) => permission as Permission;

@EntityInfo({ name: "title", fullText: "fullText" })
@RequiredPermission([appPermission("products"), appPermission("manageProducts")])
class Product {}

@EntityInfo({ name: "title", fullText: "fullText" })
@RequiredPermission(appPermission("news"))
class News {}

@EntityInfo({ name: "title" })
@RequiredPermission(appPermission("news"))
class NewsComment {}

class Footer {}

@EntityInfo({ sql: "SELECT 1" })
class PageTreeNode {}

function createService({ pageTreeFullText = true }: { pageTreeFullText?: boolean } = {}) {
    const entities = [Product, News, NewsComment, Footer, PageTreeNode];
    const discoverService = {
        discoverTargetEntities: () => entities.map((entity) => ({ entity, entityName: entity.name, metadata: { tableName: entity.name } })),
    } as unknown as DiscoverService;
    const pageTreeFullTextService = pageTreeFullText
        ? ({ getDocumentTypes: () => ["Page", "Link", "PredefinedPage"] } as unknown as PageTreeFullTextService)
        : undefined;

    return new FullTextSearchService(discoverService, {} as EntityManager, pageTreeFullTextService);
}

const allPermissions = ["pageTree", "news", "products"];

describe("FullTextSearchService.getFullTextSearchTypes", () => {
    it("returns the page tree document types first, then the entities with full text sorted by type", () => {
        expect(createService().getFullTextSearchTypes(allPermissions)).toEqual([
            { type: "Page", entityName: "PageTreeNode" },
            { type: "Link", entityName: "PageTreeNode" },
            { type: "PredefinedPage", entityName: "PageTreeNode" },
            { type: "News", entityName: "News" },
            { type: "Product", entityName: "Product" },
        ]);
    });

    it("omits the page tree document types when page tree full text is disabled", () => {
        expect(
            createService({ pageTreeFullText: false })
                .getFullTextSearchTypes(allPermissions)
                .map(({ type }) => type),
        ).toEqual(["News", "Product"]);
    });

    it("returns only the types one of the permissions is required for", () => {
        expect(
            createService()
                .getFullTextSearchTypes(["manageProducts", "fullTextSearch"])
                .map(({ type }) => type),
        ).toEqual(["Product"]);
    });
});
