import { Injectable } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { handleBrevoError } from "./brevo-api.utils";
import { BrevoApiClientFactory } from "./brevo-api-client.factory";
import { BrevoApiFolder } from "./dto/brevo-api-folder";

@Injectable()
export class BrevoApiFoldersService {
    constructor(private readonly clientFactory: BrevoApiClientFactory) {}

    async *getAllBrevoFolders(scope: EmailCampaignScopeInterface): AsyncGenerator<BrevoApiFolder, void, undefined> {
        // Limit set by Brevo
        const limit = 50;
        let offset = 0;

        while (true) {
            try {
                const { folders } = await this.clientFactory.getClient(scope).contacts.getFolders({ limit, offset });

                if (!folders || folders.length === 0) {
                    break;
                }

                yield* folders;

                offset += limit;
            } catch (error) {
                handleBrevoError(error);
            }
        }
    }
}
