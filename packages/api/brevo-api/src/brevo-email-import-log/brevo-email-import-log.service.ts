import { EntityClass, EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_EMAIL_IMPORT_LOG_ENTITY, BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { hashEmail } from "../util/hash.util";
import { BrevoEmailImportLogInterface, ContactSource } from "./entity/brevo-email-import-log.entity.factory";

@Injectable()
export class BrevoEmailImportLogService {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        private readonly entityManager: EntityManager,
        @Inject(BREVO_EMAIL_IMPORT_LOG_ENTITY) private readonly BrevoEmailImportLog: EntityClass<BrevoEmailImportLogInterface>,
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
        const log = this.entityManager.create(this.BrevoEmailImportLog, {
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
