import { ObjectType } from "@nestjs/graphql";

import { PaginatedResponseFactory } from "../../common/pagination/paginated-response.factory";
import { EntityInfoObject } from "../../entity-info/entity-info.object";

@ObjectType()
export class PaginatedEntityInfo extends PaginatedResponseFactory.create(EntityInfoObject) {}
