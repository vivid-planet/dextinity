import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { News } from "./entities/news.entity.js";
import { NewsComment } from "./entities/news-comment.entity.js";

@Resolver(() => News)
export class NewsFieldResolver {
    @ResolveField(() => [NewsComment])
    async comments(@Parent() news: News): Promise<NewsComment[]> {
        return news.comments.loadItems();
    }
}
