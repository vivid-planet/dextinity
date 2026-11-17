import { createEnumFilter } from "@dextinity/cms-api";
import { InputType } from "@nestjs/graphql";

import { NewsCategory } from "../entities/news.entity.js";

@InputType()
export class NewsCategoryEnumFilter extends createEnumFilter(NewsCategory) {}
