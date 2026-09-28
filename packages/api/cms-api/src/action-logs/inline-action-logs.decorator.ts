export const INLINE_ACTION_LOGS_METADATA_KEY = "inlineActionLogs";

export type InlineActionLogsMetadata = string[];

/**
 * Marks a one-to-many or many-to-many relation as inline, meaning changes to its items are logged as part of the
 * owning entity's action log instead of producing separate action log entries.
 *
 * Use this for relations that are edited through the owning entity's form (e.g. assigned colors or tags). It is often
 * combined with `orphanRemoval: true`, but that is not required.
 */
export function InlineActionLogs(): PropertyDecorator {
    return (target, propertyKey) => {
        const existingRelations: InlineActionLogsMetadata = Reflect.getOwnMetadata(INLINE_ACTION_LOGS_METADATA_KEY, target) ?? [];
        Reflect.defineMetadata(INLINE_ACTION_LOGS_METADATA_KEY, [...existingRelations, propertyKey.toString()], target);
    };
}
