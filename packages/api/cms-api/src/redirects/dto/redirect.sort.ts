import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

import { SortDirection } from "../../common/sorting/sort-direction.enum.js";

enum RedirectSortField {
    source = "source",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
}
registerEnumType(RedirectSortField, {
    name: "RedirectSortField",
});

@InputType()
export class RedirectSort {
    @Field(() => RedirectSortField)
    @IsEnum(RedirectSortField)
    field: RedirectSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
