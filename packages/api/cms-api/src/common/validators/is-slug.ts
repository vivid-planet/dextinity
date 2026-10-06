import { registerDecorator, type ValidationOptions, ValidatorConstraint, type ValidatorConstraintInterface } from "class-validator";

export const IsSlug = (validationOptions?: ValidationOptions) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (object: Record<string, any>, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsSlugConstraint,
        });
    };
};

@ValidatorConstraint({ name: "IsSlug", async: true })
export class IsSlugConstraint implements ValidatorConstraintInterface {
    async validate(value: string): Promise<boolean> {
        // Regex matches unreserved characters
        return /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/.test(value);
    }

    defaultMessage(): string {
        return "slug contains forbidden symbols";
    }
}
