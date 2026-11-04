import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

import { SortDirection } from "../../common/sorting/sort-direction.enum";

enum DependencySortField {
    name = "name",
    secondaryInformation = "secondaryInformation",
    graphqlObjectType = "graphqlObjectType",
    visible = "visible",
}
registerEnumType(DependencySortField, {
    name: "DependencySortField",
});

@InputType()
export class DependencySort {
    @Field(() => DependencySortField)
    @IsEnum(DependencySortField)
    field: DependencySortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
