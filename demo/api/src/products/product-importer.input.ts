import { CsvColumn, CsvColumnType } from "@dextinity/cms-api";
import { Collection, Ref } from "@mikro-orm/core";
import { camelCase } from "change-case";
import { IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString } from "class-validator";

import { ProductDimensions, ProductDiscounts, ProductPriceRange, ProductStatus } from "./entities/product.entity";
import { ProductCategory } from "./entities/product-category.entity";
import { ProductColor } from "./entities/product-color.entity";
import { ProductType } from "./entities/product-type.enum";

const transformToProductType = (value: string) => {
    return ProductType[camelCase(value) as keyof typeof ProductType];
};

export class ProductImporterInput {
    @CsvColumn("title")
    @IsString()
    title: string;

    @CsvColumn("status")
    @IsEnum(ProductStatus)
    status: ProductStatus = ProductStatus.Unpublished;

    @CsvColumn("slug")
    @IsString()
    slug: string;

    @CsvColumn("long description")
    @IsString()
    description: string;

    @CsvColumn("type", {
        transform: transformToProductType,
    })
    @IsEnum(ProductType)
    type: ProductType;

    @CsvColumn("additionalTypes", {
        transform: (value: string) => (value ? value.split(",").map((type) => transformToProductType(type.trim())) : []),
    })
    @IsArray()
    @IsEnum(ProductType, { each: true })
    additionalTypes: ProductType[] = [];

    @CsvColumn("articleCategory")
    category?: Ref<ProductCategory> = undefined;

    @CsvColumn("price")
    @IsOptional()
    price?: number = undefined;

    @CsvColumn("priceRange")
    @IsOptional()
    priceRange?: ProductPriceRange = undefined;

    @CsvColumn("inStock", { type: CsvColumnType.Boolean, valueMapping: { true: true, false: false, "": false } })
    @IsBoolean()
    inStock: boolean = true;

    @CsvColumn("soldCount", { type: CsvColumnType.Integer })
    @IsOptional()
    @IsInt()
    soldCount?: number;

    @CsvColumn("availableSince", { type: CsvColumnType.DateTime, dateFormatString: "dd-MM-yyyy" })
    @IsOptional()
    @IsDate()
    availableSince?: string = undefined;

    @CsvColumn("lastCheckedAt", { type: CsvColumnType.DateTime, dateFormatString: "dd-MM-yyyy-HH:mm:ss" })
    @IsOptional()
    @IsDate()
    lastCheckedAt?: Date = undefined;

    @CsvColumn("image")
    image: string;

    @CsvColumn("discounts")
    @IsOptional()
    discounts?: ProductDiscounts[] = [];

    @CsvColumn("articleNumbers", { transform: (value: string) => (value ? value.split(",").map((articleNumber) => articleNumber.trim()) : []) })
    @IsArray()
    @IsString({ each: true })
    articleNumbers?: string[] = [];

    @CsvColumn("dimensions")
    @IsOptional()
    dimensions?: ProductDimensions = undefined;

    @CsvColumn("colors")
    colors = new Collection<ProductColor>(this);
}
