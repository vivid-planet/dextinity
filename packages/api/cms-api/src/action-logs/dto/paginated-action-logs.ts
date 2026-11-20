import { ObjectType } from "@nestjs/graphql";

import { PaginatedResponseFactory } from "../../common/pagination/paginated-response.factory.js";
import { ActionLog } from "../entities/action-log.entity.js";

@ObjectType()
export class PaginatedActionLogs extends PaginatedResponseFactory.create(ActionLog) {}
