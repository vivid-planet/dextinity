import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { promises as fs } from "fs";

import { DiscoverService } from "../dependencies/discover.service.js";
import { getBlocksMeta } from "./blocks-meta.js";

@Injectable()
export class BlocksMetaService implements OnModuleInit {
    private readonly logger = new Logger(BlocksMetaService.name);

    constructor(private readonly discoverService: DiscoverService) {}

    async onModuleInit(): Promise<void> {
        const rootBlocks = this.discoverService.discoverRootBlocks().map(({ block }) => block);
        // Generated also when block-meta.json can't be written (e.g., in production) to fail on duplicate block names
        const metaJson = getBlocksMeta(rootBlocks);

        let canWrite: boolean;

        try {
            await fs.access("block-meta.json", fs.constants.W_OK);
            canWrite = true;
        } catch {
            this.logger.warn("Cannot write block-meta.json file");
            canWrite = false;
        }

        if (canWrite) {
            await fs.writeFile("block-meta.json", JSON.stringify(metaJson, null, 4));
        }
    }
}
