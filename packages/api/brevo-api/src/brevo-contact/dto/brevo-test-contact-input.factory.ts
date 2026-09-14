import { IsUndefinable } from "@dextinity/cms-api";
import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { Type as TypeTransformer } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsString, ValidateNested } from "class-validator";

import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "../../types";

export interface BrevoTestContactInputInterface {
    email: string;
    blocked?: boolean;
    attributes?: BrevoContactAttributesInterface;
}

export class BrevoTestContactInputFactory {
    static create({
        BrevoContactAttributes,
        Scope,
    }: {
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
        Scope: Type<EmailCampaignScopeInterface>;
    }): [Type<BrevoTestContactInputInterface>] {
        @InputType({
            isAbstract: true,
        })
        class BrevoTestContactInputBase implements BrevoTestContactInputInterface {
            @IsNotEmpty()
            @IsString()
            @Field()
            email: string;

            @IsBoolean()
            @Field()
            @IsUndefinable()
            blocked?: boolean;
        }

        if (BrevoContactAttributes) {
            @InputType()
            class BrevoTestContactInput extends BrevoTestContactInputBase {
                @Field(() => BrevoContactAttributes, { nullable: true })
                @TypeTransformer(() => BrevoContactAttributes)
                @ValidateNested()
                @IsUndefinable()
                attributes?: BrevoContactAttributesInterface;
            }

            return [BrevoTestContactInput];
        }

        @InputType()
        class BrevoTestContactInput extends BrevoTestContactInputBase {}

        return [BrevoTestContactInput];
    }
}
