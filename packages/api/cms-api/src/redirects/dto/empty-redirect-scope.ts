import { Field, InputType, ObjectType } from "@nestjs/graphql";

import type { RedirectScopeInterface } from "../types.js";

@ObjectType("RedirectScope")
@InputType("RedirectScopeInput")
export class EmptyRedirectScope implements RedirectScopeInterface {
    [key: string]: unknown;
    // empty scope
    @Field({ nullable: true })
    thisScopeHasNoFields____?: string; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}
