import {
    type AnyEntity,
    ChangeSet,
    ChangeSetType,
    type EntityClass,
    EntityManager,
    type EntityProperty,
    type EventSubscriber,
    type FlushEventArgs,
    PostgreSqlDriver,
    raw,
    Reference,
    ReferenceKind,
    wrap,
} from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";

import { UserPermissionsStorageService } from "../user-permissions/user-permissions-storage.service.js";
import { ACTION_LOGS_METADATA_KEY, type ActionLogMetadata } from "./action-logs.decorator.js";
import { ActionLogsService } from "./action-logs.service.js";
import { ActionLog } from "./entities/action-log.entity.js";

// The snapshot holds the primary key of a referenced entity instead of the entity itself, so that a change of the
// reference is visible without copying the referenced entity. Collections are left out.
function getReferencedPrimaryKeys(entity: AnyEntity, relations: EntityProperty[]): Record<string, unknown> {
    const referencedPrimaryKeys: Record<string, unknown> = {};
    for (const relation of relations) {
        if (relation.kind === ReferenceKind.MANY_TO_ONE || (relation.kind === ReferenceKind.ONE_TO_ONE && relation.owner)) {
            const referencedEntity = Reference.unwrapReference(entity[relation.name]);
            referencedPrimaryKeys[relation.name] = referencedEntity ? wrap(referencedEntity, true).getPrimaryKey() : null;
        }
    }
    return referencedPrimaryKeys;
}

@Injectable()
export class ActionLogsSubscriber implements EventSubscriber {
    private readonly logger = new Logger(ActionLogsSubscriber.name);

    constructor(
        private readonly entityManager: EntityManager<PostgreSqlDriver>,
        private readonly service: ActionLogsService,
        private readonly userPermissionsStorageService: UserPermissionsStorageService,
    ) {
        entityManager.getEventManager().registerSubscriber(this);
    }

    async onFlush(args: FlushEventArgs): Promise<void> {
        const changeSets = args.uow.getChangeSets();
        for (const changeSet of changeSets.filter((changeSet) =>
            Reflect.hasOwnMetadata(ACTION_LOGS_METADATA_KEY, changeSet.entity.constructor.prototype),
        )) {
            const actionLog = await this.createLog(changeSet);
            if (!actionLog) {
                continue;
            }
            args.uow.computeChangeSet(actionLog, ChangeSetType.CREATE);
            args.uow.recomputeSingleChangeSet(actionLog);
        }
    }

    async createLog(changeSet: ChangeSet<AnyEntity>): Promise<ActionLog | null> {
        const entityName = changeSet.entity.constructor.name;
        const entityMetadata = this.entityManager.getMetadata(changeSet.entity.constructor as EntityClass<AnyEntity>);
        if (!entityMetadata) {
            return null;
        }

        const actionLogsMetadata: ActionLogMetadata | undefined = Reflect.getMetadata(
            ACTION_LOGS_METADATA_KEY,
            changeSet.entity.constructor.prototype,
        );
        if (!actionLogsMetadata) {
            return null;
        }

        if (entityMetadata.primaryKeys.length != 1) {
            this.logger.error(`Entity '${entityMetadata.className}' doesn't have a single primary key`);
            return null;
        }
        const user = this.userPermissionsStorageService.get("user");
        const entityId = changeSet.entity[entityMetadata.primaryKeys[0]];
        const scope = await this.service.getScopeFromEntity(changeSet.entity);

        let snapshot: AnyEntity | undefined = undefined;
        if (changeSet.type !== ChangeSetType.DELETE) {
            const ignoreFields = entityMetadata.relations.map((entityProperty) => entityProperty.name);
            snapshot = {
                ...wrap(changeSet.entity, true).toObject(ignoreFields),
                ...getReferencedPrimaryKeys(changeSet.entity, entityMetadata.relations),
            };
        }

        return this.entityManager.create(
            ActionLog,
            {
                userId: typeof user === "string" ? user : user.id,
                entityName,
                entityId,
                snapshot,
                version: raw(
                    `(${this.entityManager
                        .createQueryBuilder(ActionLog)
                        .select(raw('COALESCE(MAX("version"), 0) + 1'))
                        .where({
                            entityName,
                            entityId,
                        })
                        .getFormattedQuery()})`,
                ),
                scope,
            },
            { persist: false },
        );
    }
}
