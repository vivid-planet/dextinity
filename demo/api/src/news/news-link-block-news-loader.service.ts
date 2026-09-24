import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { NewsLinkBlockNewsLoader } from "./blocks/news-link-block-news-loader";
import { News } from "./entities/news.entity";

@Injectable()
export class NewsLinkBlockNewsLoaderService extends NewsLinkBlockNewsLoader {
    constructor(private readonly entityManager: EntityManager) {
        super();
    }

    load(id: string): Promise<News> {
        return this.entityManager.findOneOrFail(News, id);
    }
}
