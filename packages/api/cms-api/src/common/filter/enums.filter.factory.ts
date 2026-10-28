import type { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsOptional } from "class-validator";

export interface EnumsFilterInterface<TEnum> {
    contains?: TEnum;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEnumsFilter(filter: any): filter is EnumsFilterInterface<unknown> {
    return filter.type && filter.type() === "EnumsFilter";
}

export function createEnumsFilter<TEnum extends { [key: string]: string }>(Enum: TEnum): Type {
    // TODO better typing of return value
    @InputType({ isAbstract: true })
    class EnumsFilter implements EnumsFilterInterface<TEnum> {
        public type(): string {
            return "EnumsFilter";
        }

        @Field(() => [Enum] as [{ [key: string]: string }], { nullable: true })
        @IsOptional()
        @IsEnum(Enum, { each: true })
        contains?: TEnum;
    }
    return EnumsFilter;
}
