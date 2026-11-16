import { ObjectType } from "@nestjs/graphql";

import { PaginatedResponseFactory } from "../../common/pagination/paginated-response.factory.js";
import { EntityInfoObject } from "../../entity-info/entity-info.object.js";

@ObjectType()
export class PaginatedEntityInfo extends PaginatedResponseFactory.create(EntityInfoObject) {}
