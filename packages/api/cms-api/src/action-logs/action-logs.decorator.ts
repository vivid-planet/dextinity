export const ACTION_LOGS_METADATA_KEY = "actionLogs";

export type ActionLogMetadata = true;

export function ActionLogs(): ClassDecorator {
    return (entity) => {
        Reflect.defineMetadata(ACTION_LOGS_METADATA_KEY, true, entity.prototype);
    };
}
