import { Inject, Injectable } from "@nestjs/common";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { CONTEXT } from "@nestjs/graphql";

import { getRequestContextHeadersFromRequest } from "../common/decorators/request-context.decorator.js";
import type { BlockContext, BlockDataInterface } from "./block.js";
import { transformToPlain } from "./blocks-transformer.js";

@Injectable()
export class BlocksTransformerService {
    private blockContext: BlockContext;

    constructor(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @Inject(CONTEXT) private readonly context: any,
        private readonly moduleRef: ModuleRef,
    ) {
        let includeInvisibleBlocks: boolean | undefined = false;
        let previewDamUrls = false;
        if (context) {
            let headers;
            if (context.req) {
                headers = context.req.headers;
            } else if (context.headers) {
                headers = context.headers;
            } else {
                throw new Error("Can't extract request headers from context");
            }
            const ctx = getRequestContextHeadersFromRequest({ headers });

            includeInvisibleBlocks = ctx.includeInvisibleBlocks;
            previewDamUrls = ctx.previewDamUrls;
        }

        this.blockContext = { includeInvisibleContent: includeInvisibleBlocks, previewDamUrls };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async transformToPlain(block: BlockDataInterface, context?: BlockContext): Promise<any> {
        const contextId = ContextIdFactory.getByRequest(this.context);
        return transformToPlain(block, context ?? this.blockContext, this.moduleRef, contextId);
    }
}
