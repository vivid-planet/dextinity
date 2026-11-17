import { PaginatedResponseFactory } from "@dextinity/cms-api";
import { ObjectType } from "@nestjs/graphql";
import { Product } from "@src/products/entities/product.entity.js";

@ObjectType()
export class PaginatedProducts extends PaginatedResponseFactory.create(Product) {}
