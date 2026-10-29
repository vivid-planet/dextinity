import type { EntityName, EventArgs, EventSubscriber } from "@mikro-orm/core";
import { type EntityClass, EntityManager, MikroORM } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { ModuleRef, Reflector } from "@nestjs/core";

import type { BlockWarning, BlockWarningsServiceInterface } from "../blocks/block.js";
import { ROOT_BLOCK_KEYS_METADATA_KEY, ROOT_BLOCK_METADATA_KEY } from "../blocks/decorators/root-block.js";
import { ROOT_BLOCK_ENTITY_METADATA_KEY } from "../blocks/decorators/root-block-entity.js";
import { FlatBlocks } from "../blocks/flat-blocks/flat-blocks.js";
import { isInjectableService } from "../common/helper/is-injectable-service.helper.js";
import { SCOPED_ENTITY_METADATA_KEY, type ScopedEntityMeta } from "../user-permissions/decorators/scoped-entity.decorator.js";
import { getScopesForScopedEntity } from "../user-permissions/get-scopes-for-scoped-entity.js";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface.js";
import { CREATE_WARNINGS_METADATA_KEY, type CreateWarningsMeta } from "./decorators/create-warnings.decorator.js";
import type { WarningData } from "./dto/warning-data.js";
import { Warning } from "./entities/warning.entity.js";
import { WarningService } from "./warning.service.js";

@Injectable()
export class WarningEventSubscriber implements EventSubscriber {
    constructor(
        readonly entityManager: EntityManager,
        private readonly orm: MikroORM,
        private readonly warningService: WarningService,
        private reflector: Reflector,
        private readonly moduleRef: ModuleRef,
    ) {
        entityManager.getEventManager().registerSubscriber(this);
    }

    getSubscribedEntities(): EntityName<unknown>[] {
        const subscribedEntities: EntityName<unknown>[] = [];

        const entities = this.orm.config.get("entities") as EntityClass<unknown>[];
        for (const entity of entities) {
            const rootBlockEntityOptions = Reflect.getMetadata(ROOT_BLOCK_ENTITY_METADATA_KEY, entity);
            const createWarnings = this.reflector.getAllAndOverride<CreateWarningsMeta>(CREATE_WARNINGS_METADATA_KEY, [entity]);

            if (rootBlockEntityOptions || createWarnings) {
                subscribedEntities.push(entity);
            }
        }

        return subscribedEntities;
    }

    async afterUpdate(args: EventArgs<unknown>): Promise<void> {
        return this.handleUpdateAndCreate(args);
    }

    async afterCreate(args: EventArgs<unknown>): Promise<void> {
        return this.handleUpdateAndCreate(args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async handleUpdateAndCreate(args: EventArgs<any>): Promise<void> {
        const entity = args.meta.class;
        const definedProperties = args.meta.definedProperties;

        if (entity) {
            const keys = Reflect.getMetadata(ROOT_BLOCK_KEYS_METADATA_KEY, entity.prototype) || [];
            let scope: ContentScope | undefined = "scope" in definedProperties ? definedProperties.scope : undefined;

            if (!scope) {
                const scoped = this.reflector.getAllAndOverride<ScopedEntityMeta>(SCOPED_ENTITY_METADATA_KEY, [entity]);

                if (scoped) {
                    const scopedEntityScope = await getScopesForScopedEntity({
                        scoped,
                        entity,
                        row: args.entity,
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

            for (const key of keys) {
                const block = Reflect.getMetadata(ROOT_BLOCK_METADATA_KEY, entity.prototype, key);

                const blockData = args.entity[key];
                if (blockData) {
                    const flatBlocks = new FlatBlocks(blockData, {
                        name: block.name,
                        visible: true,
                        rootPath: "root",
                    });

                    const startDate = new Date();
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

                        const sourceInfo = {
                            rootEntityName: entity.name,
                            rootColumnName: key,
                            targetId: args.entity.id,
                            rootPrimaryKey: args.meta.primaryKeys[0],
                            jsonPath: node.pathToString(),
                        };

                        await this.warningService.saveWarnings({
                            warnings,
                            sourceInfo,
                            scope,
                        });
                    }

                    // Delete all outdated warnings for this entity and rootPrimaryKey
                    await this.entityManager.nativeDelete(Warning, {
                        updatedAt: { $lt: startDate },
                        sourceInfo: {
                            rootEntityName: entity.name,
                            rootColumnName: key,
                            targetId: args.entity.id,
                            rootPrimaryKey: args.meta.primaryKeys[0],
                        },
                    });
                }
            }

            const createWarnings = this.reflector.getAllAndOverride<CreateWarningsMeta>(CREATE_WARNINGS_METADATA_KEY, [entity]);
            if (createWarnings && args.entity.id) {
                const row = await this.entityManager.findOneOrFail<{ id: string; scope: ContentScope }>(entity, args.entity.id);

                let warnings: WarningData[] = [];
                if (isInjectableService(createWarnings)) {
                    const service = this.moduleRef.get(createWarnings, { strict: false });
                    warnings = await service.createWarnings(row);
                } else {
                    warnings = await createWarnings(row);
                }
                const startDate = new Date();
                const sourceInfo = {
                    rootEntityName: entity.name,
                    rootPrimaryKey: args.meta.primaryKeys[0],
                    targetId: row.id,
                };
                await this.warningService.saveWarnings({
                    warnings,
                    sourceInfo,
                    scope: row.scope,
                });
                await this.entityManager.nativeDelete(Warning, { updatedAt: { $lt: startDate }, sourceInfo });
            }
        }
    }
}
