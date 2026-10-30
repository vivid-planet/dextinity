import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

import { SortDirection } from "../../common/sorting/sort-direction.enum";

enum ActionLogSortField {
    version = "version",
    createdAt = "createdAt",
    entityName = "entityName",
}
registerEnumType(ActionLogSortField, {
    name: "ActionLogSortField",
});

@InputType()
export class ActionLogSort {
    @Field(() => ActionLogSortField)
    @IsEnum(ActionLogSortField)
    field: ActionLogSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
