import { resolveEntityClass } from "@dextinity/cms-api";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { hashEmail } from "../util/hash.util";
import { BlacklistedContactsInterface } from "./entity/blacklisted-contacts.entity.factory";

@Injectable()
export class BlacklistedContactsService {
    private readonly secretKey?: string;

    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        private readonly entityManager: EntityManager,
    ) {
        this.secretKey = this.config.contactsWithoutDoi?.emailHashKey;
    }

    private get repository(): EntityRepository<BlacklistedContactsInterface> {
        return this.entityManager.getRepository(resolveEntityClass<BlacklistedContactsInterface>("BrevoBlacklistedContacts"));
    }

    public async addBlacklistedContacts(emails: string[], scope: EmailCampaignScopeInterface): Promise<BlacklistedContactsInterface[]> {
        const blacklistedContacts: BlacklistedContactsInterface[] = [];

        if (!this.secretKey) {
            throw new Error("There is no `emailHashKey` defined in the environment variables.");
        }

        for (const email of emails) {
            const hashedEmail = hashEmail(email, this.secretKey);

            const blacklistedContact = this.repository.create({
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
