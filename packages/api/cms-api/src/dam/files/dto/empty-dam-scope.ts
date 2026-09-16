import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { IsUndefinable } from "../../../common/validators/is-undefinable";
import { ScopeInterface } from "../../../user-permissions/interfaces/scope.interface";

@ObjectType("DamScope")
@InputType("DamScopeInput")
export class EmptyDamScope implements ScopeInterface {
    [key: string]: unknown;
    // empty scope
    @Field({ nullable: true })
    @IsUndefinable()
    thisScopeHasNoFields____?: string; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}
