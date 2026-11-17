import { PaginatedResponseFactory } from "@dextinity/cms-api";
import { ObjectType } from "@nestjs/graphql";

import { ManufacturerCountry } from "../entities/manufacturer-country.entity.js";

@ObjectType()
export class PaginatedManufacturerCountries extends PaginatedResponseFactory.create(ManufacturerCountry) {}
