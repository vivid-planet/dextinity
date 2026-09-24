import { EntityClass, EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";

import { BlockWarning, BlockWarningsServiceInterface } from "../../blocks/block";
import { PageTreeNodeBase } from "../entities/page-tree-node-base.entity";
import { PAGE_TREE_NODE_ENTITY } from "../page-tree.constants";
import type { InternalLinkBlockData } from "./internal-link.block";

@Injectable()
export class InternalLinkBlockWarningsService implements BlockWarningsServiceInterface<InternalLinkBlockData> {
    constructor(
        private readonly entityManager: EntityManager,
        @Inject(PAGE_TREE_NODE_ENTITY) private readonly PageTreeNode: EntityClass<PageTreeNodeBase>,
    ) {}

    async warnings(block: InternalLinkBlockData): Promise<BlockWarning[]> {
        const warnings: BlockWarning[] = [];

        if (block.targetPageId) {
            const linkedPageTreeNode = await this.entityManager.findOne(this.PageTreeNode, { id: block.targetPageId });
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
