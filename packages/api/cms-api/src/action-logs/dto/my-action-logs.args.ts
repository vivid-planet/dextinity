import { ArgsType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

import { OffsetBasedPaginationArgs } from "../../common/pagination/offset-based.args.js";
import { IsUndefinable } from "../../common/validators/is-undefinable.js";
import { ActionLogFilter } from "./action-log.filter.js";
import { ActionLogSort } from "./action-log.sort.js";

@ArgsType()
export class MyActionLogsArgs extends OffsetBasedPaginationArgs {
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
