import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";

import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { DependencyScopeLoaderService } from "./dependency-scope-loader.service";
import { Dependency } from "./dto/dependency";

@Resolver(() => Dependency)
export class DependencyResolver {
    constructor(private readonly dependencyScopeLoaderService: DependencyScopeLoaderService) {}

    /**
     * Content scope of the dependent (root) resp. depended-on (target) entity. Undefined for entities without a scope
     * and for entities whose scope cannot be resolved. Entities with multiple scopes report their first scope.
     */
    @ResolveField(() => GraphQLJSONObject, { nullable: true })
    async scope(@Parent() dependency: Dependency): Promise<ContentScope | undefined> {
        return this.dependencyScopeLoaderService.load({ entityName: dependency.scopeEntityName, id: dependency.scopeId });
    }
}
