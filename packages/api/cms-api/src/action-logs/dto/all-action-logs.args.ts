import { ArgsType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

import { OffsetBasedPaginationArgs } from "../../common/pagination/offset-based.args";
import { IsUndefinable } from "../../common/validators/is-undefinable";
import { ActionLogFilter } from "./action-log.filter";
import { ActionLogSort } from "./action-log.sort";

@ArgsType()
export class AllActionLogsArgs extends OffsetBasedPaginationArgs {
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
