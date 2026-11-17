import { registerEnumType } from "@nestjs/graphql";

export enum SendingState {
    DRAFT = "DRAFT",
    SENT = "SENT",
    SCHEDULED = "SCHEDULED",
    FAILED = "FAILED",
}

registerEnumType(SendingState, {
    name: "SendingState",
});
