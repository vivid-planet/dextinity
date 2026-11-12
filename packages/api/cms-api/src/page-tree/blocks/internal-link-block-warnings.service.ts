import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import type { BlockWarning, BlockWarningsServiceInterface } from "../../blocks/block.js";
import { resolvePageTreeNodeEntity } from "../entities/resolve-page-tree-node-entity.js";
import type { InternalLinkBlockData } from "./internal-link.block.js";

@Injectable()
export class InternalLinkBlockWarningsService implements BlockWarningsServiceInterface<InternalLinkBlockData> {
    constructor(private readonly entityManager: EntityManager) {}

    async warnings(block: InternalLinkBlockData): Promise<BlockWarning[]> {
        if (!block.targetPageId) {
            return [];
        }

        const linkedPageTreeNode = await this.entityManager.findOne(resolvePageTreeNodeEntity(), { id: block.targetPageId });

        if (!linkedPageTreeNode) {
            return [{ message: "invalidTarget", severity: "high" }];
        }

        return [];
    }
}
