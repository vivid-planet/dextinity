import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { promises as fs } from "fs";

import { DiscoverService } from "../dependencies/discover.service";
import { getBlocksMeta } from "./blocks-meta";
import { getUsedBlocks } from "./used-blocks";

@Injectable()
export class BlocksMetaService implements OnModuleInit {
    private readonly logger = new Logger(BlocksMetaService.name);

    constructor(private readonly discoverService: DiscoverService) {}

    async onModuleInit(): Promise<void> {
        let canWrite: boolean;

        try {
            await fs.access("block-meta.json", fs.constants.W_OK);
            canWrite = true;
        } catch {
            this.logger.warn("Cannot write block-meta.json file");
            canWrite = false;
        }

        if (canWrite) {
            const rootBlocks = this.discoverService.discoverRootBlocks().map(({ block }) => block);
            const metaJson = getBlocksMeta(getUsedBlocks(rootBlocks));
            await fs.writeFile("block-meta.json", JSON.stringify(metaJson, null, 4));
        }
    }
}
