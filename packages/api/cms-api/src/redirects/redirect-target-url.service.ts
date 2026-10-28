import { Injectable, Scope } from "@nestjs/common";

import type { ExtractBlockData } from "../blocks/block.js";
import type { ExternalLinkBlock } from "../blocks/externalLink/external-link.block.js";
import type { InternalLinkBlock } from "../page-tree/blocks/internal-link.block.js";
import { PageTreeReadApiService } from "../page-tree/page-tree-read-api.service.js";
import type { RedirectsLinkBlock } from "./redirects.module.js";

export type RedirectTargetUrlServiceInterface = {
    resolveTargetUrl(target: ExtractBlockData<RedirectsLinkBlock>["attachedBlocks"][number]): Promise<string | undefined>;
};

@Injectable({ scope: Scope.REQUEST })
export class DefaultRedirectTargetUrlService implements RedirectTargetUrlServiceInterface {
    constructor(private readonly pageTreeReadApi: PageTreeReadApiService) {}

    async resolveTargetUrl(target: ExtractBlockData<RedirectsLinkBlock>["attachedBlocks"][number]): Promise<string | undefined> {
        if (target.type === "internal") {
            const targetPageId = (target.props as ExtractBlockData<typeof InternalLinkBlock>).targetPageId;
            if (targetPageId) {
                const targetPageNode = await this.pageTreeReadApi.getNode(targetPageId);

                if (!targetPageNode) {
                    return undefined;
                }

                return this.pageTreeReadApi.nodePath(targetPageNode);
            }
        } else if (target.type === "external") {
            return (target.props as ExtractBlockData<typeof ExternalLinkBlock>).targetUrl;
        } else {
            if (process.env.NODE_ENV === "development") {
                throw new Error(`Unsupported custom redirect target: ${target.type}. You need to implement a custom target URL service`);
            }

            return undefined;
        }
    }
}
