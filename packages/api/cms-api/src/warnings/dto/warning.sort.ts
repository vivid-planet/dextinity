import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

import { SortDirection } from "../../common/sorting/sort-direction.enum";

enum WarningSortField {
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    message = "message",
    type = "type",
    name = "name",
    severity = "severity",
    status = "status",
}
registerEnumType(WarningSortField, {
    name: "WarningSortField",
});

@InputType()
export class WarningSort {
    @Field(() => WarningSortField)
    @IsEnum(WarningSortField)
    field: WarningSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
