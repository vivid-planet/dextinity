import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Injectable, Type } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../../config/brevo-module.constants";

export const IsValidRedirectURL = (scope: Type<EmailCampaignScopeInterface>, validationOptions?: ValidationOptions) => {
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
        @InjectRepository("BrevoConfig") private readonly brevoConfigRepository: EntityRepository<BrevoConfigInterface>,
    ) {}

    async validate(urlToValidate: string, args: ValidationArguments): Promise<boolean> {
        const [scope] = args.constraints;
        const configForScope = await this.brevoConfigRepository.findOneOrFail({ scope });

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
