import { PaginatedResponseFactory } from "@dextinity/cms-api";
import { ObjectType } from "@nestjs/graphql";

import { ProductTag } from "../entities/product-tag.entity.js";

@ObjectType()
export class PaginatedProductTags extends PaginatedResponseFactory.create(ProductTag) {}
