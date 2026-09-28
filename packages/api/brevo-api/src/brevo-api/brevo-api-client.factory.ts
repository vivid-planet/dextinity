import { BrevoClient } from "@getbrevo/brevo";
import { Inject, Injectable } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { handleBrevoError } from "./brevo-api.utils";

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
