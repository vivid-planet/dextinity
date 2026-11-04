import { isDeepStrictEqual } from "node:util";

import { Connection, EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { DiscoverService } from "../dependencies/discover.service";
import { transformToBlockSave } from "./block";
import { transformToBlockSaveIndex } from "./transformToBlockSaveIndex/transformToBlockSaveIndex";

@Injectable()
export class BlockMigrateService {
    private connection: Connection;

    constructor(
        entityManager: EntityManager,
        private readonly discoverEntitiesService: DiscoverService,
    ) {
        this.connection = entityManager.getConnection();
    }
    async migrateBlocks(): Promise<void> {
        const statistics = {
            rootBlocks: 0,
            blocks: 0,
            rootBlocksDataUpdated: 0,
            rootBlocksIndexUpdated: 0,
        };
        for (const discoveredEntity of this.discoverEntitiesService.discoverRootBlocks()) {
            const { metadata, block, column } = discoveredEntity;

            if (metadata.primaryKeys.length != 1) {
                console.error(`table '${metadata.tableName}' doesn't have a single primary key`);
                continue;
            }

            const primary = metadata.primaryKeys[0];

            //we are not using MikroORM to access rows for performance reasons
            const pageSize = 1000;
            let skip = 0;
            do {
                const rows = await this.connection.execute(
                    `SELECT "${primary}", "${column}" FROM "${metadata.tableName}" ORDER BY "${primary}" LIMIT ${pageSize} OFFSET ${skip}`,
                );
                if (rows.length === 0) {
                    break;
                }

                for (const row of rows) {
                    if (!row[column]) {
                        continue;
                    }
                    statistics.rootBlocks++;
                    let blockData;
                    if (row[column].data && row[column].index) {
                        blockData = block.blockDataFactory(row[column].data);
                    } else {
                        // legacy data (from pre-index era): do a live migration
                        blockData = block.blockDataFactory(row[column]);
                    }
                    if (!blockData) {
                        console.error(blockData, row[column]);
                    }
                    const blockDataJson = transformToBlockSave(blockData);
                    const blockIndex = transformToBlockSaveIndex(block, blockData);
                    statistics.blocks += blockIndex.length;

                    let needsUpdate = false;
                    if (!isDeepStrictEqual(blockDataJson, row[column].data)) {
                        statistics.rootBlocksDataUpdated++;
                        needsUpdate = true;
                    } else if (!isDeepStrictEqual(blockIndex, row[column].index)) {
                        statistics.rootBlocksIndexUpdated++;
                        needsUpdate = true;
                    }
                    if (needsUpdate) {
                        const sql = `UPDATE "${metadata.tableName}" SET "${column}" = ? WHERE "${primary}" = ?`;
                        await this.connection.execute(sql, [
                            JSON.stringify({
                                data: blockDataJson,
                                index: blockIndex,
                            }),
                            row[primary],
                        ]);
                    }
                }
                skip += pageSize;
                // eslint-disable-next-line no-constant-condition
            } while (true);
        }
        console.log(statistics);
    }
}
