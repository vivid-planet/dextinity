import { PaginatedResponseFactory } from "@dextinity/cms-api";
import { ObjectType } from "@nestjs/graphql";

import { Manufacturer } from "../entities/manufacturer.entity.js";

@ObjectType()
export class PaginatedManufacturers extends PaginatedResponseFactory.create(Manufacturer) {}
