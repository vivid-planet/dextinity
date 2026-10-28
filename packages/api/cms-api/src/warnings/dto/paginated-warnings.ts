import { ObjectType } from "@nestjs/graphql";

import { PaginatedResponseFactory } from "../../common/pagination/paginated-response.factory.js";
import { Warning } from "../entities/warning.entity.js";

@ObjectType()
export class PaginatedWarnings extends PaginatedResponseFactory.create(Warning) {}
