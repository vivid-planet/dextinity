import type { EntityManager } from "@mikro-orm/postgresql";
import { describe, expect, it, vi } from "vitest";

import type { PageTreeNodeBase } from "../entities/page-tree-node-base.entity.js";
import { InternalLinkBlock } from "./internal-link.block.js";
import { InternalLinkBlockWarningsService } from "./internal-link-block-warnings.service.js";

vi.mock("../entities/resolve-page-tree-node-entity.js", () => ({ resolvePageTreeNodeEntity: () => class PageTreeNode {} }));

function createService(pageTreeNode: PageTreeNodeBase | null) {
    const entityManager = { findOne: vi.fn().mockResolvedValue(pageTreeNode) } as unknown as EntityManager;
    return new InternalLinkBlockWarningsService(entityManager);
}

describe("InternalLinkBlockWarningsService", () => {
    it("should not warn about a link without a target page", async () => {
        const service = createService(null);
        const block = InternalLinkBlock.blockInputFactory({}).transformToBlockData();

        expect(await service.warnings(block)).toEqual([]);
    });

    it("should not warn about a link to an existing page", async () => {
        const service = createService({ id: "b1b1b1b1-0000-4000-8000-000000000001" } as PageTreeNodeBase);
        const block = InternalLinkBlock.blockInputFactory({ targetPageId: "b1b1b1b1-0000-4000-8000-000000000001" }).transformToBlockData();

        expect(await service.warnings(block)).toEqual([]);
    });

    it("should warn about a link to a missing page", async () => {
        const service = createService(null);
        const block = InternalLinkBlock.blockInputFactory({ targetPageId: "b1b1b1b1-0000-4000-8000-000000000001" }).transformToBlockData();

        expect(await service.warnings(block)).toEqual([{ message: "invalidTarget", severity: "high" }]);
    });
});
