import { BrevoClient } from "@getbrevo/brevo";
import { Inject, Injectable } from "@nestjs/common";

import type { BrevoModuleConfig } from "../config/brevo-module.config.js";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants.js";
import type { EmailCampaignScopeInterface } from "../types.js";
import { handleBrevoError } from "./brevo-api.utils.js";

@Injectable()
export class BrevoApiClientFactory {
    private readonly clients = new Map<string, BrevoClient>();

    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig) {}

    getClient(scope: EmailCampaignScopeInterface): BrevoClient {
        try {
            const key = JSON.stringify(scope);
            const existingClient = this.clients.get(key);

            if (existingClient) {
                return existingClient;
            }

            const { apiKey } = this.config.brevo.resolveConfig(scope);
            const client = new BrevoClient({ apiKey });

            this.clients.set(key, client);

            return client;
        } catch (error) {
            handleBrevoError(error);
        }
    }
}
