import { Field, InputType } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";

import type { ContentScope } from "../../user-permissions/interfaces/content-scope.interface.js";
import { IsNullable } from "../validators/is-nullable.js";
import { IsUndefinable } from "../validators/is-undefinable.js";

@InputType({ isAbstract: true })
export class ScopeFilter {
    @Field(() => [GraphQLJSONObject], { nullable: true })
    @IsNullable()
    @IsUndefinable()
    isAnyOf?: ContentScope[] | null;

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsNullable()
    @IsUndefinable()
    equal?: ContentScope | null;

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsNullable()
    @IsUndefinable()
    notEqual?: ContentScope | null;
}
