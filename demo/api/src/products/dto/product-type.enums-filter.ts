import { createEnumsFilter } from "@dextinity/cms-api";
import { InputType } from "@nestjs/graphql";
import { ProductType } from "@src/products/entities/product-type.enum.js";

@InputType()
export class ProductTypeEnumsFilter extends createEnumsFilter(ProductType) {}
