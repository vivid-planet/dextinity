import { Injectable } from "@nestjs/common";
import { isURL, registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

import { RedirectValidationArguments } from "../dto/redirect-input.factory";
import { RedirectSourceType } from "../redirects.enum";

export const IsValidRedirectSource = (validationOptions?: ValidationOptions) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (object: Record<string, any>, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidRedirectSourceConstraint,
        });
    };
};

@Injectable()
@ValidatorConstraint({ name: "IsValidRedirectSource", async: true })
export class IsValidRedirectSourceConstraint implements ValidatorConstraintInterface {
    async validate(value: string, validationArguments: RedirectValidationArguments): Promise<boolean> {
        const sourceType = validationArguments.object.sourceType;

        if (sourceType === RedirectSourceType.path) {
            return /^\/([a-zA-Z0-9-._~/:?=&]|%[0-9a-fA-F]{2})+$/.test(value);
        } else {
            return isURL(value);
        }
    }
}
