import { registerEnumType } from "@nestjs/graphql";

export enum ActionLogType {
    created = "created",
    updated = "updated",
    deleted = "deleted",
}

registerEnumType(ActionLogType, {
    name: "ActionLogType",
});
