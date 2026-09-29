import {
    ExternalLinkBlock,
    ExtractBlockData,
    InternalLinkBlock,
    PageTreeReadApiService,
    RedirectsLinkBlock,
    RedirectTargetUrlServiceInterface,
} from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { Config } from "@src/config/config";
import { CONFIG } from "@src/config/config.module";
import { PredefinedPageType } from "@src/documents/predefined-pages/entities/predefined-page.entity";
import { PredefinedPagesService } from "@src/documents/predefined-pages/predefined-pages.service";
import { NewsLinkBlock } from "@src/news/blocks/news-link.block";
import { News } from "@src/news/entities/news.entity";
import type { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";

@Injectable({ scope: Scope.REQUEST })
export class RedirectTargetUrlService implements RedirectTargetUrlServiceInterface {
    constructor(
        @Inject(CONFIG) private readonly config: Config,
        private readonly entityManager: EntityManager,
        private readonly pageTreeReadApi: PageTreeReadApiService,
        private readonly predefinedPagesService: PredefinedPagesService,
    ) {}

    async resolveTargetUrl(target: ExtractBlockData<RedirectsLinkBlock>["attachedBlocks"][number]): Promise<string | undefined> {
        if (target.type === "internal") {
            const targetPageId = (target.props as ExtractBlockData<typeof InternalLinkBlock>).targetPageId;
            if (targetPageId) {
                const targetPageNode = await this.pageTreeReadApi.getNode(targetPageId);

                if (!targetPageNode) {
                    return undefined;
                }

                const scope = targetPageNode.scope as PageTreeNodeScope;
                const baseUrl = this.getSiteUrl(scope);
                const path = await this.pageTreeReadApi.nodePath(targetPageNode);

                return `${baseUrl}/${scope.language}${path}`;
            }
        } else if (target.type === "external") {
            return (target.props as ExtractBlockData<typeof ExternalLinkBlock>).targetUrl;
        } else {
            const newsId = (target.props as ExtractBlockData<typeof NewsLinkBlock>).id;
            if (newsId) {
                const news = await this.entityManager.findOne(News, newsId);

                if (!news) {
                    return undefined;
                }

                const scope = news.scope;
                const baseUrl = this.getSiteUrl(scope);
                const path = `${await this.predefinedPagesService.predefinedPagePath(PredefinedPageType.news, scope)}/${news.slug}`;

                return `${baseUrl}/${scope.language}${path}`;
            }
        }
    }

    private getSiteUrl(scope: { domain: string }): string {
        const siteConfig = this.config.siteConfigs.find((siteConfig) => siteConfig.scope.domain === scope.domain);

        if (!siteConfig) {
            throw new Error(`Site config not found for domain: ${scope.domain}`);
        }

        return siteConfig.url;
    }
}
