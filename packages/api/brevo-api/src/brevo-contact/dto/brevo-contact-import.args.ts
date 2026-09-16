import { IsUndefinable, ScopeInterface } from "@dextinity/cms-api";
import { Type } from "@nestjs/common";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsBoolean, IsUUID, ValidateNested } from "class-validator";

export class BrevoContactImportArgsFactory {
    static create({ Scope }: { Scope: Type<ScopeInterface> }) {
        @ArgsType()
        class BrevoContactImportArgs {
            @Field(() => ID)
            @IsUUID()
            fileId: string;

            @Field(() => [ID], { nullable: true })
            @IsUndefinable()
            targetGroupIds?: Array<string>;

            @Field(() => Scope)
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: ScopeInterface;

            @Field()
            @IsBoolean()
            sendDoubleOptIn: boolean;
        }

        return BrevoContactImportArgs;
    }
}
