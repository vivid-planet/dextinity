import { SortDirection } from "@dextinity/cms-api";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

export enum ProductCategoryTypeSortField {
    title = "title",
    id = "id",
}
registerEnumType(ProductCategoryTypeSortField, {
    name: "ProductCategoryTypeSortField",
});
@InputType()
export class ProductCategoryTypeSort {
    @Field(() => ProductCategoryTypeSortField)
    @IsEnum(ProductCategoryTypeSortField)
    field: ProductCategoryTypeSortField;
    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
