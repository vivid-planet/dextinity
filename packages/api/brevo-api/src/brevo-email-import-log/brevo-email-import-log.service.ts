import { resolveEntityClass } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";

import type { BrevoModuleConfig } from "../config/brevo-module.config.js";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants.js";
import type { EmailCampaignScopeInterface } from "../types.js";
import { hashEmail } from "../util/hash.util.js";
import type { BrevoEmailImportLogInterface, ContactSource } from "./entity/brevo-email-import-log.entity.factory.js";

@Injectable()
export class BrevoEmailImportLogService {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        private readonly entityManager: EntityManager,
    ) {}
    public async addContactToLogs(
        email: string,
        responsibleUserId: string,
        scope: EmailCampaignScopeInterface,
        contactSource: ContactSource,
        importId?: string,
    ): Promise<BrevoEmailImportLogInterface> {
        if (!this.config.contactsWithoutDoi?.emailHashKey) {
            throw new Error("There is no `emailHashKey` defined in the environment variables.");
        }
        const log = this.entityManager.create(resolveEntityClass<BrevoEmailImportLogInterface>("BrevoEmailImportLog"), {
            importedEmail: hashEmail(email, this.config.contactsWithoutDoi.emailHashKey),
            responsibleUserId,
            scope,
            createdAt: new Date(),
            updatedAt: new Date(),
            contactSource,
            importId,
        });
        await this.entityManager.flush();
        return log;
    }
}
