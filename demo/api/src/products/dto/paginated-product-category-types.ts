import { PaginatedResponseFactory } from "@dextinity/cms-api";
import { ObjectType } from "@nestjs/graphql";

import { ProductCategoryType } from "../entities/product-category-type.entity.js";

@ObjectType()
export class PaginatedProductCategoryTypes extends PaginatedResponseFactory.create(ProductCategoryType) {}
