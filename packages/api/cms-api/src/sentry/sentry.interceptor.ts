import { type CallHandler, type ExecutionContext, Inject, Injectable, type NestInterceptor, Optional } from "@nestjs/common";
import { type GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { type Observable, tap } from "rxjs";

import { SENTRY_CONFIG } from "./sentry.constants.js";
import type { SentryConfig } from "./sentry.module.js";

@Injectable()
export class SentryInterceptor implements NestInterceptor {
    constructor(@Optional() @Inject(SENTRY_CONFIG) private readonly config?: SentryConfig) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(
            tap({
                error: async (error) => {
                    const shouldReport = this.config?.shouldReportException?.(error) ?? true;

                    if (shouldReport) {
                        const Sentry = await import("@sentry/node");

                        await this.configureSentryScopeBasedOnContext(context);

                        Sentry.captureException(error);
                    }
                },
            }),
        );
    }

    private async configureSentryScopeBasedOnContext(context: ExecutionContext) {
        const Sentry = await import("@sentry/node");

        const type = context.getType<GqlContextType>();
        const scope = Sentry.getCurrentScope();

        if (type === "http") {
            const request = context.switchToHttp().getRequest();

            if (request.user) {
                scope.setExtra("user", request.user);
            }

            scope.setExtra("method", request.method);
            scope.setExtra("url", request.url);
            scope.setExtra("body", request.body);
            scope.setExtra("query", request.query);
            scope.setExtra("params", request.params);
            scope.setExtra("headers", request.headers);
        } else if (type === "graphql") {
            const gqlContext = GqlExecutionContext.create(context);
            const request = gqlContext.getContext().req;

            if (request.user) {
                scope.setExtra("user", request.user);
            }

            scope.setExtra("args", gqlContext.getArgs());
            scope.setExtra("root", gqlContext.getRoot());
            scope.setExtra("context", gqlContext.getContext());
            scope.setExtra("info", gqlContext.getInfo());
        }
    }
}
