import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { GraphQLResolveInfo } from "graphql";
import type { Observable } from "rxjs";

import { ContentScopeService } from "../user-permissions/content-scope.service.js";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface.js";
import { BuildsService } from "./builds.service.js";
import { SKIP_BUILD_METADATA_KEY } from "./skip-build.decorator.js";

@Injectable()
export class ChangesCheckerInterceptor implements NestInterceptor {
    constructor(
        private reflector: Reflector,
        private readonly buildsService: BuildsService,
        private readonly contentScopeService: ContentScopeService,
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        if (context.getType().toString() === "graphql") {
            const gqlContext = GqlExecutionContext.create(context);
            const { operation, parentType } = gqlContext.getInfo<GraphQLResolveInfo>();

            if (parentType.name === "Mutation") {
                const skipBuild =
                    this.reflector.get<string[]>(SKIP_BUILD_METADATA_KEY, context.getHandler()) ||
                    this.reflector.get<string[]>(SKIP_BUILD_METADATA_KEY, context.getClass());

                if (!skipBuild) {
                    let scopes: ContentScope[] | null;
                    try {
                        scopes = await this.contentScopeService.inferScopesFromExecutionContext(context);
                    } catch {
                        // We might land here when an @AffectedEntity does not have a @ScopedEntity decorator
                        // (this was formerly ignored but now throws an error because it's essential for the scope check)
                        scopes = null;
                    }
                    if (scopes) {
                        for (const scope of scopes) {
                            if (process.env.NODE_ENV === "development" && this.changeAffectsAllScopes(scope)) {
                                if (operation.name) {
                                    console.warn(`Mutation "${operation.name.value}" affects all scopes. Are you sure this is correct?`);
                                } else {
                                    console.warn(`Unknown mutation affects all scopes. Are you sure this is correct?`);
                                }
                            }

                            await this.buildsService.setChangesSinceLastBuild(scope);
                        }
                    } else {
                        if (process.env.NODE_ENV === "development") {
                            if (operation.name) {
                                console.warn(`Mutation "${operation.name.value}" affects all scopes. Are you sure this is correct?`);
                            } else {
                                console.warn(`Unknown mutation affects all scopes. Are you sure this is correct?`);
                            }
                        }

                        await this.buildsService.setChangesSinceLastBuild("all");
                    }
                }
            }
        }

        return next.handle();
    }

    private changeAffectsAllScopes(scope: ContentScope | undefined): boolean {
        return !scope || Object.keys(scope).length === 0; // Caused by features with optional scoping, e.g. redirects
    }
}
