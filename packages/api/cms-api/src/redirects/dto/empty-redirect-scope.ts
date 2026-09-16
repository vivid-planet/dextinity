import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { ScopeInterface } from "../../user-permissions/interfaces/scope.interface";

@ObjectType("RedirectScope")
@InputType("RedirectScopeInput")
export class EmptyRedirectScope implements ScopeInterface {
    [key: string]: unknown;
    // empty scope
    @Field({ nullable: true })
    thisScopeHasNoFields____?: string; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}
