import { Injectable } from "@nestjs/common";
import {
    registerDecorator,
    type ValidationArguments,
    type ValidationOptions,
    ValidatorConstraint,
    type ValidatorConstraintInterface,
} from "class-validator";

import { PageTreeService } from "../page-tree.service.js";

export const PageExists = (validationOptions?: ValidationOptions) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (object: Record<string, any>, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: PageExistsConstraint,
        });
    };
};

@ValidatorConstraint({ name: "PageExists", async: true })
@Injectable()
export class PageExistsConstraint implements ValidatorConstraintInterface {
    constructor(private readonly pageTreeService: PageTreeService) {}

    async validate(id: string): Promise<boolean> {
        const node = await this.pageTreeService.createReadApi({ visibility: "all" }).getNode(id);

        return node !== null;
    }

    defaultMessage({ value: id }: ValidationArguments): string {
        return `Target page with ID '${id}' doesn't exist`;
    }
}
