import { Global, Module } from "@nestjs/common";

import { BlockMigrateService } from "./block-migrate.service.js";
import { BlocksMetaService } from "./blocks-meta.service.js";
import { BlocksTransformerService } from "./blocks-transformer.service.js";
import { CreateBlockIndexViewsCommand } from "./create-block-index-views.command.js";
import { MigrateBlocksCommand } from "./migrate-blocks.command.js";
import { RefreshBlockIndexViewsCommand } from "./refresh-block-index-views.command.js";

@Global()
@Module({
    providers: [
        BlocksTransformerService,
        BlocksMetaService,
        BlockMigrateService,
        MigrateBlocksCommand,
        CreateBlockIndexViewsCommand,
        RefreshBlockIndexViewsCommand,
    ],
    exports: [BlocksTransformerService],
})
export class BlocksModule {}
