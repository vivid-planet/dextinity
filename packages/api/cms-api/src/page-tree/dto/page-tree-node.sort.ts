import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

import { SortDirection } from "../../common/sorting/sort-direction.enum.js";

export enum PageTreeNodeSortField {
    updatedAt = "updatedAt",
    pos = "pos",
}
registerEnumType(PageTreeNodeSortField, {
    name: "PageTreeNodeSortField",
});

@InputType()
export class PageTreeNodeSort {
    @Field(() => PageTreeNodeSortField)
    @IsEnum(PageTreeNodeSortField)
    field: PageTreeNodeSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
