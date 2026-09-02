import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { RedirectScopeInterface } from "../types";

@ObjectType("RedirectScope")
@InputType("RedirectScopeInput")
export class EmptyRedirectScope implements RedirectScopeInterface {
    [key: string]: string | number | null | undefined;
    // empty scope
    @Field({ nullable: true })
    thisScopeHasNoFields____?: string; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}
