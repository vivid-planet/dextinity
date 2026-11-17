import { PaginatedResponseFactory } from "@dextinity/cms-api";
import { ObjectType } from "@nestjs/graphql";
import { ProductVariant } from "@src/products/entities/product-variant.entity.js";

@ObjectType()
export class PaginatedProductVariants extends PaginatedResponseFactory.create(ProductVariant) {}
