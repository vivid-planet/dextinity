import { createEnumFilter } from "@dextinity/cms-api";
import { InputType } from "@nestjs/graphql";

import { ProductType } from "../entities/product-type.enum.js";

@InputType()
export class ProductTypeEnumFilter extends createEnumFilter(ProductType) {}
