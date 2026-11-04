import { RequestContext } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { Optional } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { PageTreeFullTextService } from "../page-tree/fullText/page-tree-full-text.service";
import { BlockMigrateService } from "./block-migrate.service";

@Command({
    name: "migrateBlocks",
    description: "Should be done after every deployment",
})
export class MigrateBlocksCommand extends CommandRunner {
    constructor(
        private readonly blockMigrateService: BlockMigrateService,
        private readonly entityManager: EntityManager,
        @Optional() private readonly pageTreeFullTextService?: PageTreeFullTextService,
    ) {
        super();
    }

    async run(): Promise<void> {
        await RequestContext.create(this.entityManager.fork(), async () => {
            await this.blockMigrateService.migrateBlocks();
            await this.pageTreeFullTextService?.migrateDocuments();
        });
    }
}
