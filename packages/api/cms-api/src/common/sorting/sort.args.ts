import { ArgsType, Field } from "@nestjs/graphql";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { SortDirection } from "./sort-direction.enum.js";

@ArgsType()
export class SortArgs {
    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    sortColumnName?: string;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    sortDirection?: SortDirection = SortDirection.ASC;
}
