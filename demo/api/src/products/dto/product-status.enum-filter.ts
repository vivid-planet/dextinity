import { createEnumFilter } from "@dextinity/cms-api";
import { InputType } from "@nestjs/graphql";

import { ProductStatus } from "../entities/product.entity.js";

@InputType()
export class ProductStatusEnumFilter extends createEnumFilter(ProductStatus) {}
