import { Field, ObjectType } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";

import { ContentScope } from "../../user-permissions/interfaces/content-scope.interface";
import { BaseDependencyInterface } from "./base-dependency.interface";

@ObjectType()
export class Dependency implements BaseDependencyInterface {
    @Field()
    rootId: string;

    rootEntityName: string;

    rootTableName: string;

    rootPrimaryKey: string;

    @Field()
    rootGraphqlObjectType: string;

    @Field()
    rootColumnName: string;

    blockname: string;

    @Field()
    jsonPath: string;

    @Field(() => Boolean)
    visible: boolean;

    targetEntityName: string;

    @Field()
    targetGraphqlObjectType: string;

    targetTableName: string;

    targetPrimaryKey: string;

    @Field()
    targetId: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    secondaryInformation?: string;

    /**
     * Content scope of the dependent (root) resp. depended-on (target) entity. Undefined for entities without a scope
     * and for entities whose scope cannot be resolved. Entities with multiple scopes report their first scope.
     */
    @Field(() => GraphQLJSONObject, { nullable: true })
    scope?: ContentScope;
}
