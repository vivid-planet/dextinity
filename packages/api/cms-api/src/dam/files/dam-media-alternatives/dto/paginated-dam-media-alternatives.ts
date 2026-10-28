import { ObjectType } from "@nestjs/graphql";

import { PaginatedResponseFactory } from "../../../../common/pagination/paginated-response.factory.js";
import { DamMediaAlternative } from "../entities/dam-media-alternative.entity.js";

@ObjectType()
export class PaginatedDamMediaAlternatives extends PaginatedResponseFactory.create(DamMediaAlternative) {}
