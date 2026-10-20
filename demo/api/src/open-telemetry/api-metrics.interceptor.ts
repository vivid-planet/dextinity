import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { Counter, Histogram } from "@opentelemetry/api";
import type { GraphQLResolveInfo } from "graphql";
import { type Observable, tap } from "rxjs";

import { getOrCreateCounter, getOrCreateHistogram } from "./metrics.js";

@Injectable()
export class ApiMetricsInterceptor implements NestInterceptor {
    private gqlResolverCount: Counter;
    private resolverDuration: Histogram;

    constructor() {
        this.gqlResolverCount = getOrCreateCounter("gql.resolver.count", {
            description: "Total number of Root GraphQL resolver calls",
            unit: "requests",
        });
        this.resolverDuration = getOrCreateHistogram("gql.resolver.duration", {
            description: "The duration Root GraphQL resolver calls",
            unit: "ms",
        });
    }

    private isResolvingGraphQLField(gqlInfo: GraphQLResolveInfo): boolean {
        const parentType = gqlInfo.parentType.name;
        return parentType !== "Query" && parentType !== "Mutation";
    }
    public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const requestType = context.getType().toString();
        let gqlInfo: GraphQLResolveInfo;
        if (requestType === "graphql") {
            const graphqlExecutionContext = GqlExecutionContext.create(context);
            gqlInfo = graphqlExecutionContext.getInfo<GraphQLResolveInfo>();

            if (this.isResolvingGraphQLField(gqlInfo)) {
                return next.handle();
            }
        } else {
            return next.handle();
        }

        const startTime = performance.now();

        return next.handle().pipe(
            tap(async () => {
                const endTime = performance.now();
                const finalTime = endTime - startTime;
                if (gqlInfo) {
                    this.gqlResolverCount.add(1);
                    this.resolverDuration.record(finalTime, {
                        fieldName: gqlInfo.fieldName,
                        type: String(gqlInfo.parentType),
                    });
                }
            }),
        );
    }
}
