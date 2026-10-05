import { Brevo } from "@getbrevo/brevo";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { EmailCampaignScopeInterface } from "src/types";

import { handleBrevoError } from "./brevo-api.utils";
import { BrevoApiClientFactory } from "./brevo-api-client.factory";
import { BrevoApiEmailTemplateList } from "./dto/brevo-api-email-templates-list";

@Injectable()
export class BrevoTransactionalMailsService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly clientFactory: BrevoApiClientFactory,
    ) {}

    async send(options: Omit<Brevo.SendTransacEmailRequest, "sender">, scope: EmailCampaignScopeInterface): Promise<Brevo.SendTransacEmailResponse> {
        try {
            const brevoConfig = await this.entityManager.findOneOrFail<BrevoConfigInterface>("BrevoConfig", { scope });

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
