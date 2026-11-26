import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

import { BlockWarning, BlockWarningsServiceInterface } from "../../blocks/block";
import { PageTreeNodeBase } from "../entities/page-tree-node-base.entity";
import type { InternalLinkBlockData } from "./internal-link.block";

@Injectable()
export class InternalLinkBlockWarningsService implements BlockWarningsServiceInterface<InternalLinkBlockData> {
    constructor(@InjectRepository("PageTreeNode") private readonly pageTreeRepository: EntityRepository<PageTreeNodeBase>) {}

    async warnings(block: InternalLinkBlockData): Promise<BlockWarning[]> {
        if (!block.targetPageId) {
            return [];
        }

        const linkedPageTreeNode = await this.pageTreeRepository.findOne({ id: block.targetPageId });

        if (!linkedPageTreeNode) {
            return [{ message: "invalidTarget", severity: "high" }];
        }

        return [];
    }
}
