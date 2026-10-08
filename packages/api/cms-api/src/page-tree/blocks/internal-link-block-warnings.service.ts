import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { BlockWarning, BlockWarningsServiceInterface } from "../../blocks/block";
import { resolvePageTreeNodeEntity } from "../entities/resolve-page-tree-node-entity";
import type { InternalLinkBlockData } from "./internal-link.block";

@Injectable()
export class InternalLinkBlockWarningsService implements BlockWarningsServiceInterface<InternalLinkBlockData> {
    constructor(private readonly entityManager: EntityManager) {}

    async warnings(block: InternalLinkBlockData): Promise<BlockWarning[]> {
        const warnings: BlockWarning[] = [];

        if (block.targetPageId) {
            const linkedPageTreeNode = await this.entityManager.findOne(resolvePageTreeNodeEntity(), { id: block.targetPageId });
            if (!linkedPageTreeNode) {
                warnings.push({
                    message: "invalidTarget",
                    severity: "high",
                });
            }
        } else {
            warnings.push({
                message: "missingTarget",
                severity: "high",
            });
        }

        return warnings;
    }
}
