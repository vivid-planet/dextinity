import { EntityRepository } from "@mikro-orm/postgresql";
import { forwardRef, Inject, Injectable } from "@nestjs/common";

import { BlockWarning, BlockWarningsServiceInterface } from "../../blocks/block";
import { PageTreeNodeBase } from "../entities/page-tree-node-base.entity";
import { PAGE_TREE_REPOSITORY } from "../page-tree.constants";
import type { InternalLinkBlockData } from "./internal-link.block";

@Injectable()
export class InternalLinkBlockWarningsService implements BlockWarningsServiceInterface<InternalLinkBlockData> {
    constructor(@Inject(forwardRef(() => PAGE_TREE_REPOSITORY)) private readonly pageTreeRepository: EntityRepository<PageTreeNodeBase>) {}

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
