import type { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsOptional } from "class-validator";

export interface EnumFilterInterface<TEnum> {
    isAnyOf?: TEnum[];
    equal?: TEnum;
    notEqual?: TEnum;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEnumFilter(filter: any): filter is EnumFilterInterface<unknown> {
    return filter.type && filter.type() === "EnumFilter";
}

export function createEnumFilter<TEnum extends { [key: string]: string }>(Enum: TEnum): Type {
    // TODO better typing of return value
    @InputType({ isAbstract: true })
    class EnumFilter implements EnumFilterInterface<TEnum> {
        public type(): string {
            return "EnumFilter";
        }

        @Field(() => [Enum] as [{ [key: string]: string }], { nullable: true })
        @IsOptional()
        @IsEnum(Enum, { each: true })
        isAnyOf?: TEnum[];

        @Field(() => Enum as { [key: string]: string }, { nullable: true })
        @IsOptional()
        @IsEnum(Enum)
        equal?: TEnum;

        @Field(() => Enum as { [key: string]: string }, { nullable: true })
        @IsOptional()
        @IsEnum(Enum)
        notEqual?: TEnum;
    }
    return EnumFilter;
}
