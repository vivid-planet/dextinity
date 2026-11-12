import { RequestContext } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { Optional } from "@nestjs/common";

import { ConsoleCommand } from "../console-commands/console-command.decorators.js";
import type { ConsoleCommandInterface } from "../console-commands/console-command.interface.js";
import { PageTreeFullTextService } from "../page-tree/fullText/page-tree-full-text.service.js";
import { BlockMigrateService } from "./block-migrate.service.js";

@ConsoleCommand({
    name: "migrateBlocks",
    description: "Should be done after every deployment",
})
export class MigrateBlocksCommand implements ConsoleCommandInterface {
    constructor(
        private readonly blockMigrateService: BlockMigrateService,
        private readonly entityManager: EntityManager,
        @Optional() private readonly pageTreeFullTextService?: PageTreeFullTextService,
    ) {}

    async run(): Promise<void> {
        await RequestContext.create(this.entityManager.fork(), async () => {
            await this.blockMigrateService.migrateBlocks();
            await this.pageTreeFullTextService?.migrateDocuments();
        });
    }
}
