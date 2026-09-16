import { OffsetBasedPaginationArgs, ScopeInterface } from "@dextinity/cms-api";
import { Type } from "@nestjs/common";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { TargetGroupFilter } from "./target-group.filter";
import { TargetGroupSort } from "./target-group.sort";

export class TargetGroupArgsFactory {
    static create({ Scope }: { Scope: Type<ScopeInterface> }) {
        @ArgsType()
        class TargetGroupArgs extends OffsetBasedPaginationArgs {
            @Field(() => Scope)
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: ScopeInterface;

            @Field({ nullable: true })
            @IsOptional()
            @IsString()
            search?: string;

            @Field(() => TargetGroupFilter, { nullable: true })
            @ValidateNested()
            @TransformerType(() => TargetGroupFilter)
            @IsOptional()
            filter?: TargetGroupFilter;

            @Field(() => [TargetGroupSort], { nullable: true })
            @ValidateNested({ each: true })
            @TransformerType(() => TargetGroupSort)
            @IsOptional()
            sort?: TargetGroupSort[];
        }

        return TargetGroupArgs;
    }
}
