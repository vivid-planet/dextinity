import { resolveEntityClass } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";
import {
    registerDecorator,
    type ValidationArguments,
    type ValidationOptions,
    ValidatorConstraint,
    type ValidatorConstraintInterface,
} from "class-validator";

import type { BrevoConfigInterface } from "../../brevo-config/entities/brevo-config-entity.factory.js";
import type { BrevoModuleConfig } from "../../config/brevo-module.config.js";
import { BREVO_MODULE_CONFIG } from "../../config/brevo-module.constants.js";
import type { EmailCampaignScopeInterface } from "../../types.js";

export const IsValidRedirectURL = (scope: EmailCampaignScopeInterface, validationOptions?: ValidationOptions) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (object: Record<string, any>, propertyName: string): void => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsValidRedirectURLConstraint,
            constraints: [scope],
        });
    };
};

@ValidatorConstraint({ name: "IsValidRedirectURL", async: true })
@Injectable()
export class IsValidRedirectURLConstraint implements ValidatorConstraintInterface {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        private readonly entityManager: EntityManager,
    ) {}

    async validate(urlToValidate: string, args: ValidationArguments): Promise<boolean> {
        const [scope] = args.constraints;
        const configForScope = await this.entityManager.findOneOrFail(resolveEntityClass<BrevoConfigInterface>("BrevoConfig"), { scope });

        if (!configForScope) {
            throw Error("Scope does not exist");
        }

        if (urlToValidate?.startsWith(configForScope.allowedRedirectionUrl)) {
            return true;
        }

        return false;
    }

    defaultMessage(): string {
        return `URL is not supported`;
    }
}
