import { createEnumFilter } from "@dextinity/cms-api";
import { InputType } from "@nestjs/graphql";

import { NewsStatus } from "../entities/news.entity.js";

@InputType()
export class NewsStatusEnumFilter extends createEnumFilter(NewsStatus) {}
