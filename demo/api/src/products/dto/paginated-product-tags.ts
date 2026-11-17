import { PaginatedResponseFactory } from "@dextinity/cms-api";
import { ObjectType } from "@nestjs/graphql";
import { ProductTag } from "@src/products/entities/product-tag.entity.js";

@ObjectType()
export class PaginatedProductTags extends PaginatedResponseFactory.create(ProductTag) {}
