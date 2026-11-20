import { SortDirection } from "@dextinity/cms-api";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

export enum NewsSortField {
    slug = "slug",
    title = "title",
    status = "status",
    date = "date",
    category = "category",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    id = "id",
}
registerEnumType(NewsSortField, {
    name: "NewsSortField",
});
@InputType()
export class NewsSort {
    @Field(() => NewsSortField)
    @IsEnum(NewsSortField)
    field: NewsSortField;
    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
