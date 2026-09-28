import {
    AnyEntity,
    ChangeSet,
    ChangeSetType,
    EntityManager,
    EventSubscriber,
    FlushEventArgs,
    PostgreSqlDriver,
    raw,
    Reference,
    ReferenceKind,
} from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { UserPermissionsStorageService } from "../user-permissions/user-permissions-storage.service";
import { ACTION_LOGS_METADATA_KEY, ActionLogMetadata } from "./action-logs.decorator";
import { ActionLogsService } from "./action-logs.service";
import { ActionLog } from "./entities/action-log.entity";
import { INLINE_ACTION_LOGS_METADATA_KEY, InlineActionLogsMetadata } from "./inline-action-logs.decorator";

@Injectable()
export class ActionLogsSubscriber implements EventSubscriber {
    constructor(
        private readonly entityManager: EntityManager<PostgreSqlDriver>,
        private readonly service: ActionLogsService,
        private readonly userPermissionsStorageService: UserPermissionsStorageService,
    ) {
        entityManager.getEventManager().registerSubscriber(this);
    }

    async onFlush(args: FlushEventArgs): Promise<void> {
        // Collect all entities that need an action log, deduplicated by entity instance. The value is the entity's own
        // change set if it has one (required to determine the action type), or undefined when the entity is only logged
        // because an inline relation changed.
        const entitiesToLog = new Map<AnyEntity, ChangeSet<AnyEntity> | undefined>();

        for (const changeSet of args.uow.getChangeSets()) {
            if (this.hasActionLogs(changeSet.entity)) {
                entitiesToLog.set(changeSet.entity, changeSet);
            }

            // Editing an item of an inline relation (without adding/removing it) produces a change set for the item but
            // not a collection update, so resolve the owning entity from the item's back-reference.
            const inlineRelationOwner = this.getInlineRelationOwner(changeSet.entity);
            if (inlineRelationOwner && !entitiesToLog.has(inlineRelationOwner)) {
                entitiesToLog.set(inlineRelationOwner, undefined);
            }
        }

        // Adding/removing items of an inline relation results in a collection update on the owning entity.
        for (const collection of args.uow.getCollectionUpdates()) {
            const owner = collection.owner;
            if (this.hasActionLogs(owner) && this.getInlineRelations(owner).includes(collection.property.name) && !entitiesToLog.has(owner)) {
                entitiesToLog.set(owner, undefined);
            }
        }

        for (const [entity, changeSet] of entitiesToLog) {
            const actionLog = await this.createLog(entity, changeSet);
            if (!actionLog) {
                continue;
            }
            args.uow.computeChangeSet(actionLog, ChangeSetType.CREATE);
            args.uow.recomputeSingleChangeSet(actionLog);
        }
    }

    async createLog(entity: AnyEntity, changeSet?: ChangeSet<AnyEntity>): Promise<ActionLog | null> {
        const entityName = entity.constructor.name;
        const entityMetadata = this.entityManager.getMetadata(entityName);
        if (!entityMetadata) {
            return null;
        }

        if (entityMetadata.primaryKeys.length != 1) {
            console.error(`entity '${entityMetadata.className}' doesn't have a single primary key`);
            return null;
        }
        const user = this.userPermissionsStorageService.get("user");
        const entityId = entity[entityMetadata.primaryKeys[0]];
        const scope = await this.service.getScopeFromEntity(entity);

        let snapshot: AnyEntity | undefined = undefined;
        if (changeSet?.type !== ChangeSetType.DELETE) {
            const inlineRelations = this.getInlineRelations(entity);
            const ignoreFields = entityMetadata.relations
                .map((entityProperty) => entityProperty.name)
                .filter((name) => !inlineRelations.includes(name));
            snapshot = entity.toObject(ignoreFields);
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

    private hasActionLogs(entity: AnyEntity): boolean {
        const actionLogsMetadata: ActionLogMetadata | undefined = Reflect.getOwnMetadata(ACTION_LOGS_METADATA_KEY, entity.constructor.prototype);
        return Boolean(actionLogsMetadata);
    }

    private getInlineRelations(entity: AnyEntity): InlineActionLogsMetadata {
        return Reflect.getMetadata(INLINE_ACTION_LOGS_METADATA_KEY, entity.constructor.prototype) ?? [];
    }

    /**
     * Returns the owning entity if the given entity is an item of an inline relation of an action-logged entity,
     * resolved via the item's to-one back-reference (e.g. `ProductColor.product`).
     */
    private getInlineRelationOwner(entity: AnyEntity): AnyEntity | undefined {
        const entityMetadata = this.entityManager.getMetadata(entity.constructor.name);
        if (!entityMetadata) {
            return undefined;
        }

        for (const relation of entityMetadata.relations) {
            if (relation.kind !== ReferenceKind.MANY_TO_ONE && relation.kind !== ReferenceKind.ONE_TO_ONE) {
                continue;
            }
            const reference = entity[relation.name];
            if (!reference) {
                continue;
            }
            const owner = Reference.unwrapReference(reference);
            if (!this.hasActionLogs(owner)) {
                continue;
            }
            const ownerMetadata = this.entityManager.getMetadata(owner.constructor.name);
            const inlineRelations = this.getInlineRelations(owner);
            const isInlineRelation = ownerMetadata?.relations.some(
                (ownerRelation) => inlineRelations.includes(ownerRelation.name) && ownerRelation.mappedBy === relation.name,
            );
            if (isInlineRelation) {
                return owner;
            }
        }
        return undefined;
    }
}
