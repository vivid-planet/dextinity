import { SortDirection } from "@dextinity/cms-api";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

export enum ProductTagSortField {
    title = "title",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    id = "id",
}
registerEnumType(ProductTagSortField, {
    name: "ProductTagSortField",
});
@InputType()
export class ProductTagSort {
    @Field(() => ProductTagSortField)
    @IsEnum(ProductTagSortField)
    field: ProductTagSortField;
    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
