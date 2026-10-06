import { Field, InputType } from "@nestjs/graphql";
import { IsArray, IsObject } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";

import type { ContentScope } from "../interfaces/content-scope.interface.js";

@InputType()
export class UserContentScopesInput {
    @Field(() => [GraphQLJSONObject], { defaultValue: [] })
    @IsArray()
    @IsObject({ each: true })
    contentScopes: ContentScope[] = [];
}
