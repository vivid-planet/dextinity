import { PaginatedResponseFactory } from "@dextinity/cms-api";
import { ObjectType } from "@nestjs/graphql";

import { ProductCategory } from "../entities/product-category.entity.js";

@ObjectType()
export class PaginatedProductCategories extends PaginatedResponseFactory.create(ProductCategory) {}
