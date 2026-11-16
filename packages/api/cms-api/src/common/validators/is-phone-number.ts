import { Injectable } from "@nestjs/common";
import { isString, registerDecorator, ValidatorConstraint, type ValidatorConstraintInterface } from "class-validator";

const PHONE_NUMBER_REGEX = /^\+?[0-9\s]+$/;

export const isPhoneNumber = (value: string): boolean => {
    return PHONE_NUMBER_REGEX.test(value);
};

export const IsPhoneNumber = () => {
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    return (object: Object, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            validator: IsPhoneNumberConstraint,
        });
    };
};

@ValidatorConstraint({ name: "IsPhoneNumber" })
@Injectable()
class IsPhoneNumberConstraint implements ValidatorConstraintInterface {
    validate(value: unknown): boolean {
        if (!isString(value)) {
            return false;
        }
        return isPhoneNumber(value);
    }

    defaultMessage(): string {
        return "Invalid phone number";
    }
}
