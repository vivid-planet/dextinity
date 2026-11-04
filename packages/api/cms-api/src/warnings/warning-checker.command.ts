import { CreateRequestContext, EntityClass, MikroORM } from "@mikro-orm/core";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { ModuleRef, Reflector } from "@nestjs/core";
import { Command, CommandRunner } from "nest-commander";

import { Block, BlockData, BlockWarning, BlockWarningsServiceInterface } from "../blocks/block";
import { FlatBlocks } from "../blocks/flat-blocks/flat-blocks";
import { isInjectableService } from "../common/helper/is-injectable-service.helper";
import { DiscoverService } from "../dependencies/discover.service";
import { SCOPED_ENTITY_METADATA_KEY, ScopedEntityMeta } from "../user-permissions/decorators/scoped-entity.decorator";
import { getScopesForScopedEntity } from "../user-permissions/get-scopes-for-scoped-entity";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { CREATE_WARNINGS_METADATA_KEY, CreateWarningsFunction, CreateWarningsMeta } from "./decorators/create-warnings.decorator";
import { Warning } from "./entities/warning.entity";
import { WarningService } from "./warning.service";

interface RootBlockEntityData {
    primaryKey: string;
    tableName: string;
    className: string;
    hasScope: boolean;
    rootBlockData: Array<{ block: Block; column: string }>;
}

interface RootBlockData {
    id: string;
    [key: string]: BlockData | string;
}

@Injectable()
@Command({
    name: "check-warnings",
    description: "Checks for warnings",
})
export class WarningCheckerCommand extends CommandRunner {
    constructor(
        private readonly orm: MikroORM,
        private readonly discoverService: DiscoverService,
        private readonly entityManager: EntityManager,
        private readonly warningService: WarningService,
        private reflector: Reflector,
        private readonly moduleRef: ModuleRef,
    ) {
        super();
    }

    @CreateRequestContext()
    async run(): Promise<void> {
        const startDate = new Date();

        for (const data of this.groupRootBlockDataByEntity()) {
            const { tableName, className, rootBlockData, hasScope } = data;

            const queryBuilderLimit = 100;
            const baseQueryBuilder = this.entityManager.createQueryBuilder(className);

            const selectFields = [`${data.primaryKey} as id`, ...rootBlockData.map(({ column }) => column)];
            if (hasScope) {
                selectFields.push("scope");
            }

            baseQueryBuilder.select(selectFields).from(tableName).limit(queryBuilderLimit);
            let rootBlocks: RootBlockData[] = [];
            let offset = 0;

            do {
                const queryBuilder = baseQueryBuilder.clone();
                queryBuilder.offset(offset);
                rootBlocks = (await queryBuilder.getResult()) as RootBlockData[];

                for (const { column, block } of rootBlockData) {
                    for (const rootBlock of rootBlocks) {
                        let scope: ContentScope | undefined = hasScope ? rootBlock["scope"] : undefined;
                        const blockData = rootBlock[column] as BlockData;

                        if (!scope) {
                            const entity = this.orm.getMetadata().get(className).class;
                            const scoped = this.reflector.getAllAndOverride<ScopedEntityMeta>(SCOPED_ENTITY_METADATA_KEY, [entity]);

                            if (scoped) {
                                const scopedEntityScope = await getScopesForScopedEntity({
                                    scoped,
                                    entity,
                                    row: rootBlock,
                                    entityManager: this.entityManager,
                                    moduleRef: this.moduleRef,
                                });

                                if (Array.isArray(scopedEntityScope)) {
                                    throw new Error("Multiple scopes are not supported for warnings");
                                } else {
                                    scope = scopedEntityScope;
                                }
                            }
                        }

                        if (blockData) {
                            const flatBlocks = new FlatBlocks(blockData, {
                                name: block.name,
                                visible: true,
                                rootPath: "root",
                            });
                            for (const node of flatBlocks.depthFirst()) {
                                const warningsOrWarningsService = await node.block.warnings();
                                let warnings: BlockWarning[] = [];

                                if (isInjectableService(warningsOrWarningsService)) {
                                    const warningsService = warningsOrWarningsService;
                                    const service: BlockWarningsServiceInterface = await this.moduleRef.get(warningsService, { strict: false });

                                    warnings = await service.warnings(node.block);
                                } else {
                                    warnings = warningsOrWarningsService;
                                }

                                await this.warningService.saveWarnings({
                                    warnings,
                                    scope,
                                    sourceInfo: {
                                        rootEntityName: tableName,
                                        rootColumnName: column,
                                        rootPrimaryKey: data.primaryKey,
                                        targetId: rootBlock.id,
                                        jsonPath: node.pathToString(),
                                    },
                                });
                            }
                        }
                    }
                }

                await this.entityManager.flush();
                this.entityManager.clear();

                offset += queryBuilderLimit;
            } while (rootBlocks.length > 0);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entities = this.orm.config.get("entities") as EntityClass<any>[];
        const metadataStorage = this.orm.em.getMetadata();

        for (const entity of entities) {
            const entityMetadata = metadataStorage.get(entity.name);
            const createWarnings = this.reflector.getAllAndOverride<CreateWarningsMeta>(CREATE_WARNINGS_METADATA_KEY, [entity]);
            if (createWarnings) {
                const repository = this.entityManager.getRepository(entity);

                if (isInjectableService(createWarnings)) {
                    const service = this.moduleRef.get(createWarnings, { strict: false });

                    if (service.bulkCreateWarnings) {
                        const warningGenerator = service.bulkCreateWarnings();
                        for await (const { warnings, targetId, scope } of warningGenerator) {
                            await this.warningService.saveWarnings({
                                warnings,
                                sourceInfo: {
                                    rootEntityName: entity.name,
                                    rootPrimaryKey: entityMetadata.primaryKeys[0],
                                    targetId,
                                },
                                scope,
                            });
                        }
                    } else {
                        await this.processEntityWarningsIndividually({
                            repository,
                            createWarnings: (entity) => service.createWarnings(entity),
                            rootEntityName: entity.name,
                            rootPrimaryKey: entityMetadata.primaryKeys[0],
                        });
                    }
                } else {
                    await this.processEntityWarningsIndividually({
                        repository,
                        createWarnings,
                        rootEntityName: entity.name,
                        rootPrimaryKey: entityMetadata.primaryKeys[0],
                    });
                }
            }
        }

        // remove all warnings that are not present anymore
        await this.entityManager.nativeDelete(Warning, { updatedAt: { $lt: startDate } });
    }

    private async processEntityWarningsIndividually({
        repository,
        createWarnings,
        rootEntityName,
        rootPrimaryKey,
    }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        repository: EntityRepository<any>;
        createWarnings: CreateWarningsFunction;
        rootEntityName: string;
        rootPrimaryKey: string;
    }) {
        let rows = [];
        const limit = 50;
        let offset = 0;
        do {
            rows = await repository.find({}, { limit, offset });
            offset += limit;

            for (const row of rows) {
                await this.warningService.saveWarnings({
                    warnings: await createWarnings(row),
                    sourceInfo: {
                        rootEntityName,
                        rootPrimaryKey,
                        targetId: row[rootPrimaryKey],
                    },
                    scope: row.scope,
                });
            }
        } while (rows.length > 0);
    }

    // Group root block data by tableName and className to reduce database calls.
    // This allows the query builder to efficiently load all root blocks of an entity in one database call
    private groupRootBlockDataByEntity() {
        const rootBlockEntityData = new Map<string, RootBlockEntityData>();

        for (const {
            metadata: { tableName, className, primaryKeys, definedProperties },
            block,
            column,
        } of this.discoverService.discoverRootBlocks()) {
            const key = `${tableName}:${className}`;

            if (!rootBlockEntityData.has(key)) {
                rootBlockEntityData.set(key, {
                    tableName,
                    className,
                    hasScope: "scope" in definedProperties,
                    rootBlockData: [],
                    primaryKey: primaryKeys[0],
                });
            }

            const discoveredData = rootBlockEntityData.get(key);
            if (discoveredData) {
                discoveredData.rootBlockData.push({ block, column });
            }
        }

        return rootBlockEntityData.values();
    }
}
