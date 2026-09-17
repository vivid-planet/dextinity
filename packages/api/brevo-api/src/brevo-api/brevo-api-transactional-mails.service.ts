import { resolveEntityClass } from "@dextinity/cms-api";
import { Brevo } from "@getbrevo/brevo";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { EmailCampaignScopeInterface } from "src/types";

import { handleBrevoError } from "./brevo-api.utils";
import { BrevoApiClientFactory } from "./brevo-api-client.factory";
import { BrevoApiEmailTemplateList } from "./dto/brevo-api-email-templates-list";

@Injectable()
export class BrevoTransactionalMailsService {
    constructor(
        private readonly clientFactory: BrevoApiClientFactory,
        private readonly entityManager: EntityManager,
    ) {}

    // The concrete BrevoConfig entity is created by the application, so it cannot be injected via
    // `@InjectRepository()`, which resolves its injection token while this class is being defined.
    private get brevoConfigRepository(): EntityRepository<BrevoConfigInterface> {
        return this.entityManager.getRepository(resolveEntityClass<BrevoConfigInterface>("BrevoConfig"));
    }

    async send(options: Omit<Brevo.SendTransacEmailRequest, "sender">, scope: EmailCampaignScopeInterface): Promise<Brevo.SendTransacEmailResponse> {
        try {
            const brevoConfig = await this.brevoConfigRepository.findOneOrFail({ scope });

            return this.clientFactory.getClient(scope).transactionalEmails.sendTransacEmail({
                ...options,
                sender: { name: brevoConfig.senderName, email: brevoConfig.senderMail },
            });
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async getEmailTemplates(scope: EmailCampaignScopeInterface): Promise<BrevoApiEmailTemplateList> {
        try {
            const templates = await this.clientFactory.getClient(scope).transactionalEmails.getSmtpTemplates({ templateStatus: true });

            return templates as BrevoApiEmailTemplateList;
        } catch (error) {
            handleBrevoError(error);
        }
    }
}
