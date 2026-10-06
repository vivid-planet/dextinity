import { ObjectType } from "@nestjs/graphql";

import { PaginatedResponseFactory } from "../../common/pagination/paginated-response.factory.js";
import { Dependency } from "./dependency.js";

@ObjectType()
export class PaginatedDependencies extends PaginatedResponseFactory.create(Dependency) {}
