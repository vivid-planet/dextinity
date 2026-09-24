import { EntityClass, EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../../config/brevo-module.config";
import { BREVO_CONFIG_ENTITY, BREVO_MODULE_CONFIG } from "../../config/brevo-module.constants";

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
        @Inject(BREVO_CONFIG_ENTITY) private readonly BrevoConfig: EntityClass<BrevoConfigInterface>,
    ) {}

    async validate(urlToValidate: string, args: ValidationArguments): Promise<boolean> {
        const [scope] = args.constraints;
        const configForScope = await this.entityManager.findOneOrFail(this.BrevoConfig, { scope });

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
