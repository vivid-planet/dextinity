import { SortDirection } from "@dextinity/cms-api";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

enum TargetGroupSortField {
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    title = "title",
}
registerEnumType(TargetGroupSortField, {
    name: "TargetGroupSortField",
});

@InputType()
export class TargetGroupSort {
    @Field(() => TargetGroupSortField)
    @IsEnum(TargetGroupSortField)
    field: TargetGroupSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
