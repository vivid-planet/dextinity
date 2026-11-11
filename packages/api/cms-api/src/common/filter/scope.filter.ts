import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";

import { ContentScope } from "../../user-permissions/interfaces/content-scope.interface";

@InputType({ isAbstract: true })
export class ScopeFilter {
    @Field(() => [GraphQLJSONObject], { nullable: true })
    @IsOptional()
    isAnyOf?: ContentScope[] | null;

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsOptional()
    equal?: ContentScope | null;

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsOptional()
    notEqual?: ContentScope | null;
}
