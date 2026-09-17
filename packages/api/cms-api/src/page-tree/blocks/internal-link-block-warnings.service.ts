import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { BlockWarning, BlockWarningsServiceInterface } from "../../blocks/block";
import { PageTreeNodeBase } from "../entities/page-tree-node-base.entity";
import { resolvePageTreeNodeEntity } from "../entities/resolve-page-tree-node-entity";
import type { InternalLinkBlockData } from "./internal-link.block";

@Injectable()
export class InternalLinkBlockWarningsService implements BlockWarningsServiceInterface<InternalLinkBlockData> {
    constructor(private readonly entityManager: EntityManager) {}

    // The concrete page tree node entity is provided by the application, so it cannot be injected via
    // `@InjectRepository()`, which resolves its injection token while this class is being defined.
    private get pageTreeRepository(): EntityRepository<PageTreeNodeBase> {
        return this.entityManager.getRepository(resolvePageTreeNodeEntity()) as EntityRepository<PageTreeNodeBase>;
    }

    async warnings(block: InternalLinkBlockData): Promise<BlockWarning[]> {
        const warnings: BlockWarning[] = [];

        if (block.targetPageId) {
            const linkedPageTreeNode = await this.pageTreeRepository.findOne({ id: block.targetPageId });
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
