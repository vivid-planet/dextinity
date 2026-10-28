import { resolveEntityClass } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";

import type { BrevoModuleConfig } from "../config/brevo-module.config.js";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants.js";
import type { EmailCampaignScopeInterface } from "../types.js";
import { hashEmail } from "../util/hash.util.js";
import type { BlacklistedContactsInterface } from "./entity/blacklisted-contacts.entity.factory.js";

@Injectable()
export class BlacklistedContactsService {
    private readonly secretKey?: string;

    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        private readonly entityManager: EntityManager,
    ) {
        this.secretKey = this.config.contactsWithoutDoi?.emailHashKey;
    }

    public async addBlacklistedContacts(emails: string[], scope: EmailCampaignScopeInterface): Promise<BlacklistedContactsInterface[]> {
        const blacklistedContacts: BlacklistedContactsInterface[] = [];

        if (!this.secretKey) {
            throw new Error("There is no `emailHashKey` defined in the environment variables.");
        }

        for (const email of emails) {
            const hashedEmail = hashEmail(email, this.secretKey);

            const blacklistedContact = this.entityManager.create(resolveEntityClass<BlacklistedContactsInterface>("BrevoBlacklistedContacts"), {
                hashedEmail,
                scope,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            blacklistedContacts.push(blacklistedContact);
        }

        await this.entityManager.flush();

        return blacklistedContacts;
    }
}
