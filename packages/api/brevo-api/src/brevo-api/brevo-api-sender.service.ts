import { Injectable } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { handleBrevoError } from "./brevo-api.utils";
import { BrevoApiClientFactory } from "./brevo-api-client.factory";
import { BrevoApiSender } from "./dto/brevo-api-sender";

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
