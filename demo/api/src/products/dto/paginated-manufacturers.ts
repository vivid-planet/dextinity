import { PaginatedResponseFactory } from "@dextinity/cms-api";
import { ObjectType } from "@nestjs/graphql";
import { Manufacturer } from "@src/products/entities/manufacturer.entity.js";

@ObjectType()
export class PaginatedManufacturers extends PaginatedResponseFactory.create(Manufacturer) {}
