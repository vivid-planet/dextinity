import { registerEnumType } from "@nestjs/graphql";

export enum DamFileAiContentType {
    Generated = "Generated",
    Modified = "Modified",
}
registerEnumType(DamFileAiContentType, {
    name: "DamFileAiContentType",
});
