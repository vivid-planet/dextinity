import { type ContextId, ContextIdFactory, type ModuleRef } from "@nestjs/core";
import { REQUEST_CONTEXT_ID } from "@nestjs/core/router/request/request-constants";
import type { FieldMiddleware, MiddlewareContext, NextFn } from "@nestjs/graphql";

import { getRequestContextHeadersFromRequest } from "../common/decorators/request-context.decorator";
import { isBlockDataInterface } from "./block";
import { transformToPlain } from "./blocks-transformer";

export class BlocksTransformerMiddlewareFactory {
    static create(moduleRef: ModuleRef): FieldMiddleware {
        return async ({ context }: MiddlewareContext, next: NextFn) => {
            const fieldValue = await next();

            if (isBlockDataInterface(fieldValue)) {
                const { includeInvisibleBlocks, previewDamUrls } = getRequestContextHeadersFromRequest(context.req);

                let contextId: ContextId;

                if (context[REQUEST_CONTEXT_ID]) {
                    /**
                     * The request is already registered by either using
                     * a request-scoped service or the request provider
                     * (`CONTEXT`) in the root GraphQL resolver. We can
                     * reuse the context ID.
                     */
                    contextId = ContextIdFactory.getByRequest(context);
                } else {
                    /**
                     * We need to generate a context ID and register the
                     * middleware context as "request" to be able to
                     * resolve request-scoped services.
                     */
                    contextId = ContextIdFactory.create();
                    moduleRef.registerRequestByContextId(context, contextId);
                }

                return transformToPlain(fieldValue, { includeInvisibleContent: includeInvisibleBlocks, previewDamUrls }, moduleRef, contextId);
            } else {
                return fieldValue;
            }
        };
    }
}
