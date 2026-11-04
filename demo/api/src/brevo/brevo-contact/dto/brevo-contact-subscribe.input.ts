import { IsValidRedirectURL } from "@dextinity/brevo-api";
import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsUrl, ValidateNested } from "class-validator";

import { BrevoContactAttributes } from "./brevo-contact-attributes";
import { EmailContactSubscribeScope } from "./brevo-contact-subscribe.scope";

export class BrevoContactSubscribeInput {
    @IsEmail()
    email: string;

    @IsUrl({ require_tld: process.env.NODE_ENV === "production" })
    @IsValidRedirectURL(EmailContactSubscribeScope)
    redirectionUrl: string;

    @ValidateNested()
    @Type(() => EmailContactSubscribeScope)
    @IsNotEmpty()
    scope: EmailContactSubscribeScope;

    @ValidateNested()
    @Type(() => BrevoContactAttributes)
    @IsNotEmpty()
    attributes: BrevoContactAttributes;
}
