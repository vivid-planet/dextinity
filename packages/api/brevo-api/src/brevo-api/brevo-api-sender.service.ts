import { Injectable } from "@nestjs/common";

import type { EmailCampaignScopeInterface } from "../types.js";
import { handleBrevoError } from "./brevo-api.utils.js";
import { BrevoApiClientFactory } from "./brevo-api-client.factory.js";
import type { BrevoApiSender } from "./dto/brevo-api-sender.js";

@Injectable()
export class BrevoApiSenderService {
    constructor(private readonly clientFactory: BrevoApiClientFactory) {}

    public async getSenders(scope: EmailCampaignScopeInterface): Promise<BrevoApiSender[] | undefined> {
        try {
            const { senders } = await this.clientFactory.getClient(scope).senders.getSenders();

            return senders as BrevoApiSender[] | undefined;
        } catch (error) {
            handleBrevoError(error);
        }
    }
}
