import type { AnyEntity } from "@mikro-orm/postgresql";
import type { Type } from "@nestjs/common";

export const ACTION_LOGS_METADATA_KEY = "actionLogs";

export type ActionLogMetadata = true;

const actionLogEntities: Array<Type<AnyEntity>> = [];

export function ActionLogs(): ClassDecorator {
    return (entity) => {
        Reflect.defineMetadata(ACTION_LOGS_METADATA_KEY, true, entity.prototype);
        actionLogEntities.push(entity as unknown as Type<AnyEntity>);
    };
}

/**
 * Entities decorated with `@ActionLogs()`, in decoration order. The decorators run while the
 * entity modules are imported, so the list is complete by the time the GraphQL schema is built.
 */
export function getActionLogEntities(): ReadonlyArray<Type<AnyEntity>> {
    return actionLogEntities;
}
