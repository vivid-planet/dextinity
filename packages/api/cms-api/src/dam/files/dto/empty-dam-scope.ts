import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { IsUndefinable } from "../../../common/validators/is-undefinable.js";
import type { DamScopeInterface } from "../../types.js";

@ObjectType("DamScope")
@InputType("DamScopeInput")
export class EmptyDamScope implements DamScopeInterface {
    [key: string]: unknown;
    // empty scope
    @Field({ nullable: true })
    @IsUndefinable()
    thisScopeHasNoFields____?: string; // just anything so this class has at least one field and can be interpreted as a gql-object/input type
}
