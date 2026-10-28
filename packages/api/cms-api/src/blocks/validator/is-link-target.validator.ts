import { Injectable } from "@nestjs/common";
import { isEmail, isString, isURL, registerDecorator, ValidatorConstraint, type ValidatorConstraintInterface } from "class-validator";

import { isPhoneNumber } from "./is-phone-number.validator.js";

export const IsLinkTarget = () => {
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    return (object: Object, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            validator: IsLinkTargetConstraint,
        });
    };
};

@ValidatorConstraint({ name: "IsLinkTarget" })
@Injectable()
class IsLinkTargetConstraint implements ValidatorConstraintInterface {
    validate(value: unknown): boolean {
        if (!isString(value)) {
            return false;
        }

        if (value.toLowerCase().includes("javascript:")) {
            return false;
        } else if (value.toLowerCase().includes("data:")) {
            return false;
        } else if (value.startsWith("mailto:")) {
            return isEmail(value.slice(7));
        } else if (value.startsWith("tel:")) {
            return isPhoneNumber(value.slice(4));
        } else {
            return isURL(value, { require_protocol: true, require_valid_protocol: false });
        }
    }

    defaultMessage(): string {
        return "Invalid link target";
    }
}
