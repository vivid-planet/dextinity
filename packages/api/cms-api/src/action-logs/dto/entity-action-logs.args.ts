import { ArgsType, Field } from "@nestjs/graphql";
import { IsObject } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";

import { ContentScope } from "../../user-permissions/interfaces/content-scope.interface";
import { ActionLogsArgs } from "./action-logs.args";

@ArgsType()
export class EntityActionLogsArgs extends ActionLogsArgs {
    @Field(() => GraphQLJSONObject)
    @IsObject()
    scope: ContentScope;
}
