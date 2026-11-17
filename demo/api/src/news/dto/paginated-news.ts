import { PaginatedResponseFactory } from "@dextinity/cms-api";
import { ObjectType } from "@nestjs/graphql";

import { News } from "../entities/news.entity.js";

@ObjectType()
export class PaginatedNews extends PaginatedResponseFactory.create(News) {}
