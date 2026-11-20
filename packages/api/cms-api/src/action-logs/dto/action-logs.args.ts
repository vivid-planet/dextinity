import { ArgsType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsObject, IsString, ValidateNested } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";

import { OffsetBasedPaginationArgs } from "../../common/pagination/offset-based.args.js";
import { IsUndefinable } from "../../common/validators/is-undefinable.js";
import type { ContentScope } from "../../user-permissions/interfaces/content-scope.interface.js";
import { ActionLogFilter } from "./action-log.filter.js";
import { ActionLogSort } from "./action-log.sort.js";

@ArgsType()
export class ActionLogsArgs extends OffsetBasedPaginationArgs {
    /**
     * Class name of an entity decorated with `@ActionLogs()`, for instance `News`. Not an enum,
     * because the set of entities differs per project while cms-admin types its queries against
     * the library schema.
     */
    @Field()
    @IsString()
    entity: string;

    @Field(() => GraphQLJSONObject)
    @IsObject()
    scope: ContentScope;

    @Field(() => ActionLogFilter, { nullable: true })
    @ValidateNested()
    @Type(() => ActionLogFilter)
    @IsUndefinable()
    filter?: ActionLogFilter;

    @Field(() => [ActionLogSort], { nullable: true })
    @ValidateNested({ each: true })
    @Type(() => ActionLogSort)
    @IsUndefinable()
    sort?: ActionLogSort[];
}
