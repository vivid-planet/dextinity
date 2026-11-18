import { SortDirection } from "@dextinity/cms-api";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

export enum ManufacturerSortField {
    name = "name",
    addressAsEmbeddable_street = "addressAsEmbeddable_street",
    addressAsEmbeddable_streetNumber = "addressAsEmbeddable_streetNumber",
    addressAsEmbeddable_zip = "addressAsEmbeddable_zip",
    addressAsEmbeddable_country = "addressAsEmbeddable_country",
    addressAsEmbeddable_alternativeAddress_street = "addressAsEmbeddable_alternativeAddress_street",
    addressAsEmbeddable_alternativeAddress_streetNumber = "addressAsEmbeddable_alternativeAddress_streetNumber",
    addressAsEmbeddable_alternativeAddress_zip = "addressAsEmbeddable_alternativeAddress_zip",
    addressAsEmbeddable_alternativeAddress_country = "addressAsEmbeddable_alternativeAddress_country",
    productType = "productType",
    updatedAt = "updatedAt",
    id = "id",
}
registerEnumType(ManufacturerSortField, {
    name: "ManufacturerSortField",
});
@InputType()
export class ManufacturerSort {
    @Field(() => ManufacturerSortField)
    @IsEnum(ManufacturerSortField)
    field: ManufacturerSortField;
    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
