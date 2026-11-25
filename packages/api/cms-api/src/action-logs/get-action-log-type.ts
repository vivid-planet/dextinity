import { ChangeSetType } from "@mikro-orm/postgresql";

import { ActionLogType } from "./dto/action-log-type.enum.js";

export function getActionLogType(changeSetType: ChangeSetType): ActionLogType {
    switch (changeSetType) {
        case ChangeSetType.CREATE:
            return ActionLogType.created;
        case ChangeSetType.DELETE:
        case ChangeSetType.DELETE_EARLY:
            return ActionLogType.deleted;
        default:
            return ActionLogType.updated;
    }
}
