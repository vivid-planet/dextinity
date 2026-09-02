import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { ScopeInterface } from "../types";

@ObjectType("PageTreeNodeScope")
@InputType("PageTreeNodeScopeInput")
export class EmptyPageTreeNodeScope implements ScopeInterface {
    [key: string]: string | number | null | undefined;
    // empty scope
    @Field({ nullable: true })
    thisScopeHasNoFields____?: string; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}
