import { ScopeInterface } from "@dextinity/cms-api";
import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsUrl } from "class-validator";

import { BrevoContactAttributesInterface } from "../../types";
import { IsValidRedirectURL } from "../validator/redirect-url.validator";

export interface SubscribeInputInterface {
    email: string;
    redirectionUrl: string;
    attributes?: BrevoContactAttributesInterface;
}

export class SubscribeInputFactory {
    static create({
        BrevoContactAttributes,
        Scope,
    }: {
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
        Scope: Type<ScopeInterface>;
    }): Type<SubscribeInputInterface> {
        @InputType({ isAbstract: true })
        class SubscribeInputBase implements SubscribeInputInterface {
            @Field()
            @IsEmail()
            email: string;

            @Field()
            @IsUrl({ require_tld: process.env.NODE_ENV === "production" })
            @IsValidRedirectURL(Scope)
            redirectionUrl: string;
        }

        if (BrevoContactAttributes) {
            @InputType()
            class SubscribeInput extends SubscribeInputBase {
                @Field(() => BrevoContactAttributes)
                attributes?: BrevoContactAttributesInterface;
            }

            return SubscribeInput;
        }

        @InputType()
        class SubscribeInput extends SubscribeInputBase {}

        return SubscribeInput;
    }
}
