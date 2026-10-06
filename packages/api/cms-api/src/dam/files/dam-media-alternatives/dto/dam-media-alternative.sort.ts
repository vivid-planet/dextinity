import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

import { SortDirection } from "../../../../common/sorting/sort-direction.enum.js";

enum DamMediaAlternativeSortField {
    id = "id",
    language = "language",
    type = "type",
    for = "for",
    alternative = "alternative",
}
registerEnumType(DamMediaAlternativeSortField, {
    name: "DamMediaAlternativeSortField",
});

@InputType()
export class DamMediaAlternativeSort {
    @Field(() => DamMediaAlternativeSortField)
    @IsEnum(DamMediaAlternativeSortField)
    field: DamMediaAlternativeSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
