import { registerEnumType } from "@nestjs/graphql";

export enum MailerLogStatus {
    error = "error",
    sent = "sent",
}
registerEnumType(MailerLogStatus, {
    name: "MailerLogStatus",
});
