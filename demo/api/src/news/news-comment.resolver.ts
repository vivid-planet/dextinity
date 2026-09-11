import { AffectedEntity } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Args, ID, Mutation, Resolver } from "@nestjs/graphql";

import { NewsCommentInput } from "./dto/news-comment.input";
import { News } from "./entities/news.entity";
import { NewsComment } from "./entities/news-comment.entity";

@Resolver(() => NewsComment)
export class NewsCommentResolver {
    constructor(private readonly entityManager: EntityManager) {}

    @Mutation(() => NewsComment)
    @AffectedEntity(News, { idArg: "newsId" })
    async createNewsComment(
        @Args("newsId", { type: () => ID }) newsId: string,
        @Args("input", { type: () => NewsCommentInput }) input: NewsCommentInput,
    ): Promise<NewsComment> {
        const news = await this.entityManager.findOneOrFail(News, newsId);

        const newsComment = this.entityManager.create(NewsComment, {
            ...input,
            news,
        });

        await this.entityManager.persistAndFlush(newsComment);
        return newsComment;
    }

    @Mutation(() => NewsComment)
    @AffectedEntity(NewsComment)
    async updateNewsComment(
        @Args("id", { type: () => ID }) id: string,
        @Args("input", { type: () => NewsCommentInput }) input: NewsCommentInput,
    ): Promise<NewsComment> {
        const newsComment = await this.entityManager.findOneOrFail(NewsComment, id);
        newsComment.assign({
            ...input,
        });

        await this.entityManager.flush();

        return newsComment;
    }

    @Mutation(() => Boolean)
    @AffectedEntity(NewsComment)
    async deleteNewsComment(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        await this.entityManager.removeAndFlush({ id });

        return true;
    }
}
