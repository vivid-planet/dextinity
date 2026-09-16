import { OffsetBasedPaginationArgs, ScopeInterface } from "@dextinity/cms-api";
import { Type } from "@nestjs/common";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

export class BrevoContactsArgsFactory {
    static create({ Scope }: { Scope: Type<ScopeInterface> }) {
        @ArgsType()
        class BrevoContactsArgs extends OffsetBasedPaginationArgs {
            @Field(() => ID, { nullable: true })
            @IsString()
            @IsOptional()
            targetGroupId?: string;

            @Field(() => String, { nullable: true })
            @IsOptional()
            email?: string;

            @Field(() => Scope)
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: ScopeInterface;
        }

        return BrevoContactsArgs;
    }
}
