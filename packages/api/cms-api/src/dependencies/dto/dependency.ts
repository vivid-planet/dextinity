import { Field, ObjectType } from "@nestjs/graphql";

import type { BaseDependencyInterface } from "./base-dependency.interface.js";

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
}
