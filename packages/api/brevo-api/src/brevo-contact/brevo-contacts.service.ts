import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Injectable, Optional } from "@nestjs/common";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";

import { BlacklistedContactsInterface } from "../blacklisted-contacts/entity/blacklisted-contacts.entity.factory";
import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { BrevoEmailImportLogService } from "../brevo-email-import-log/brevo-email-import-log.service";
import { ContactSource } from "../brevo-email-import-log/entity/brevo-email-import-log.entity.factory";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { TargetGroupsService } from "../target-group/target-groups.service";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "../types";
import { hashEmail } from "../util/hash.util";
import { BrevoContactInterface } from "./dto/brevo-contact.factory";
import { SubscribeInputInterface } from "./dto/subscribe-input.factory";
import { SubscribeResponse } from "./dto/subscribe-response.enum";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";

@Injectable()
export class BrevoContactsService {
    private readonly secretKey?: string;
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        @InjectRepository("BrevoConfig") private readonly brevoConfigRepository: EntityRepository<BrevoConfigInterface>,
        @Optional()
        @InjectRepository("BrevoBlacklistedContacts")
        @Optional()
        private readonly blacklistedContactsRepository: EntityRepository<BlacklistedContactsInterface>,
        private readonly brevoContactsApiService: BrevoApiContactsService,
        private readonly ecgRtrListService: EcgRtrListService,
        private readonly targetGroupService: TargetGroupsService,
        @Optional() private readonly brevoEmailImportLogService: BrevoEmailImportLogService,
    ) {
        this.secretKey = this.config.contactsWithoutDoi?.emailHashKey;
    }

    public async createContact({
        email,
        attributes,
        redirectionUrl,
        scope,
        templateId,
        listIds,
        sendDoubleOptIn,
        responsibleUserId,
        contactSource,
    }: {
        email: string;
        attributes?: BrevoContactAttributesInterface;
        redirectionUrl?: string;
        scope: EmailCampaignScopeInterface;
        templateId: number;
        listIds?: number[];
        sendDoubleOptIn: boolean;
        responsibleUserId?: string;
        contactSource?: ContactSource;
    }): Promise<SubscribeResponse> {
        const existingContact = await this.brevoContactsApiService.getContactInfoByEmail(email, scope);
        if (existingContact) {
            return SubscribeResponse.ERROR_CONTACT_ALREADY_EXISTS;
        }

        const mainTargetGroupForScope = await this.targetGroupService.createIfNotExistMainTargetGroupForScope(scope);
        const targetGroupIds = await this.getTargetGroupIdsForNewContact({ scope, contactAttributes: attributes });
        const brevoIds = [mainTargetGroupForScope.brevoId, ...targetGroupIds];

        if (listIds) {
            brevoIds.push(...listIds);
        }

        if (!sendDoubleOptIn && responsibleUserId) {
            if (!this.secretKey) {
                throw new Error("There is no `emailHashKey` defined in the environment variables.");
            }

            const hashedEmail = hashEmail(email, this.secretKey);
            const blacklistedContactAvailable = await this.blacklistedContactsRepository.findOne({ hashedEmail: hashedEmail });

            if (blacklistedContactAvailable) {
                return SubscribeResponse.ERROR_CONTACT_IS_BLACKLISTED;
            }

            if (contactSource) {
                const created = await this.brevoContactsApiService.createBrevoContactWithoutDoubleOptIn({ email, attributes }, brevoIds, scope);
                if (created) {
                    await this.brevoEmailImportLogService.addContactToLogs(email, responsibleUserId, scope, contactSource);
                    return SubscribeResponse.SUCCESSFUL;
                } else {
                    return SubscribeResponse.ERROR_UNKNOWN;
                }
            }
        } else {
            const created = await this.brevoContactsApiService.createDoubleOptInBrevoContact(
                { email, redirectionUrl, attributes },
                brevoIds,
                templateId,
                scope,
            );
            if (created) {
                return SubscribeResponse.SUCCESSFUL;
            } else {
                return SubscribeResponse.ERROR_UNKNOWN;
            }
        }

        return SubscribeResponse.ERROR_UNKNOWN;
    }

    public async createTestContact({
        email,
        attributes,
        scope,
    }: {
        email: string;
        attributes?: BrevoContactAttributesInterface;
        scope: EmailCampaignScopeInterface;
    }): Promise<boolean> {
        const testTargetGroupForScope = await this.targetGroupService.createIfNotExistTestTargetGroupForScope(scope);

        const created = await this.brevoContactsApiService.createTestContact({ email, attributes }, [testTargetGroupForScope.brevoId], scope);
        return created;
    }

    public async getTargetGroupIdsForNewContact({
        contactAttributes,
        scope,
    }: {
        contactAttributes?: BrevoContactAttributesInterface;
        scope?: EmailCampaignScopeInterface;
    }): Promise<number[]> {
        let offset = 0;
        let totalCount = 0;
        const targetGroupIds: number[] = [];
        const limit = 50;
        const where = { isMainList: false, scope };

        do {
            const [targetGroups, totalContactLists] = await this.targetGroupService.findTargetGroups({ offset, limit, where });
            totalCount = totalContactLists;
            offset += targetGroups.length;

            for (const targetGroup of targetGroups) {
                const contactIsInTargetGroup = this.targetGroupService.checkIfContactIsInTargetGroupByAttributes(
                    contactAttributes,
                    targetGroup.filters,
                );

                if (contactIsInTargetGroup) {
                    targetGroupIds.push(targetGroup.brevoId);
                }
            }
        } while (offset < totalCount);

        return targetGroupIds;
    }

    public async subscribeBrevoContact(data: SubscribeInputInterface, scope: EmailCampaignScopeInterface): Promise<SubscribeResponse> {
        if ((await this.ecgRtrListService.getContainedEcgRtrListEmails([data.email])).length > 0) {
            return SubscribeResponse.ERROR_CONTAINED_IN_ECG_RTR_LIST;
        }

        const brevoConfig = await this.brevoConfigRepository.findOneOrFail({ scope });

        const created = await this.createContact({
            ...data,
            scope,
            templateId: brevoConfig.doubleOptInTemplateId,
            sendDoubleOptIn: true,
        });

        if (created) {
            return SubscribeResponse.SUCCESSFUL;
        }

        return SubscribeResponse.ERROR_UNKNOWN;
    }

    public async getTargetGroupIdsForExistingContact({ contact }: { contact?: BrevoContactInterface }): Promise<number[]> {
        let offset = 0;
        let totalCount = 0;
        const targetGroupIds: number[] = [];
        const limit = 50;
        const where = { isMainList: false };

        do {
            const [targetGroups, totalContactLists] = await this.targetGroupService.findTargetGroups({ offset, limit, where });
            totalCount = totalContactLists;
            offset += targetGroups.length;

            for (const targetGroup of targetGroups) {
                const contactIsInTargetGroupByAttributes = this.targetGroupService.checkIfContactIsInTargetGroupByAttributes(
                    contact?.attributes,
                    targetGroup.filters,
                );

                if (contactIsInTargetGroupByAttributes) {
                    targetGroupIds.push(targetGroup.brevoId);
                }

                if (targetGroup.assignedContactsTargetGroupBrevoId && contact?.listIds.includes(targetGroup.assignedContactsTargetGroupBrevoId)) {
                    targetGroupIds.push(targetGroup.brevoId, targetGroup.assignedContactsTargetGroupBrevoId);
                }
            }
        } while (offset < totalCount);

        return targetGroupIds;
    }
}
