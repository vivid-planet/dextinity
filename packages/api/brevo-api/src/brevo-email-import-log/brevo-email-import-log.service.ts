import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { EmailCampaignScopeInterface } from "../types";
import { hashEmail } from "../util/hash.util";
import { BrevoEmailImportLogInterface, ContactSource } from "./entity/brevo-email-import-log.entity.factory";

@Injectable()
export class BrevoEmailImportLogService {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        @InjectRepository("BrevoEmailImportLog") private readonly repository: EntityRepository<BrevoEmailImportLogInterface>,
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
        const log = this.repository.create({
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
