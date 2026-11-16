import { BlocksTransformerService, filtersToMikroOrmQuery, resolveEntityClass, searchToMikroOrmQuery } from "@dextinity/cms-api";
import { Brevo } from "@getbrevo/brevo";
import { EntityManager, type ObjectQuery, wrap } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";

import { BrevoApiCampaignsService } from "../brevo-api/brevo-api-campaigns.service.js";
import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service.js";
import type { BrevoConfigInterface } from "../brevo-config/entities/brevo-config-entity.factory.js";
import { EcgRtrListService } from "../brevo-contact/ecg-rtr-list/ecg-rtr-list.service.js";
import type { BrevoModuleConfig } from "../config/brevo-module.config.js";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants.js";
import type { EmailCampaignScopeInterface } from "../types.js";
import type { EmailCampaignFilter } from "./dto/email-campaign.filter.js";
import type { EmailCampaignInterface } from "./entities/email-campaign-entity.factory.js";
import { getScheduledCampaignSendingState } from "./scheduled-sending-state.js";
import { SendingState } from "./sending-state.enum.js";

const CAMPAIGN_CONTENT_REQUEST_TIMEOUT = 5000;

export type SendEmailCampaignNowResult = "sent" | "notSent" | "cancelled";

@Injectable()
export class EmailCampaignsService {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        private readonly brevoApiCampaignService: BrevoApiCampaignsService,
        private readonly brevoApiContactsService: BrevoApiContactsService,
        private readonly entityManager: EntityManager,
        private readonly ecgRtrListService: EcgRtrListService,
        private readonly blockTransformerService: BlocksTransformerService,
    ) {}

    getFindCondition(options: { search?: string; filter?: EmailCampaignFilter }): ObjectQuery<EmailCampaignInterface> {
        const andFilters = [];

        if (options.search) {
            andFilters.push(searchToMikroOrmQuery(options.search, ["title", "subject"]));
        }

        if (options.filter) {
            andFilters.push(filtersToMikroOrmQuery(options.filter));
        }

        return andFilters.length > 0 ? { $and: andFilters } : {};
    }

    async saveEmailCampaignInBrevo(campaignId: string, scheduledAt?: Date): Promise<EmailCampaignInterface> {
        const entityManager = this.entityManager.fork();
        const campaign = await entityManager.findOneOrFail(resolveEntityClass<EmailCampaignInterface>("BrevoEmailCampaign"), campaignId);

        const content = await this.blockTransformerService.transformToPlain(campaign.content, { previewDamUrls: false });

        const brevoConfig = await entityManager.findOneOrFail(resolveEntityClass<BrevoConfigInterface>("BrevoConfig"), {
            scope: campaign.scope,
        });
        let campaignConfig;
        if (typeof this.config.emailCampaigns.frontend === "function") {
            campaignConfig = this.config.emailCampaigns.frontend(campaign.scope);
        } else {
            campaignConfig = this.config.emailCampaigns.frontend;
        }

        const basicAuth = Buffer.from(`${campaignConfig.basicAuth.username}:${campaignConfig.basicAuth.password}`).toString("base64");

        const response = await fetch(campaignConfig.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${basicAuth}`,
            },
            body: JSON.stringify({ id: campaign.id, title: campaign.title, content, scope: campaign.scope }),
            signal: AbortSignal.timeout(CAMPAIGN_CONTENT_REQUEST_TIMEOUT),
        });

        if (!response.ok) {
            throw new Error(`Could not generate campaign content: request failed with status code ${response.status}`);
        }

        const htmlContent = await response.text();

        if (!htmlContent) {
            throw new Error("Could not generate campaign content");
        }

        let brevoId = campaign.brevoId;
        if (!brevoId) {
            brevoId = await this.brevoApiCampaignService.createBrevoCampaign({
                campaign,
                htmlContent,
                sender: { name: brevoConfig.senderName, mail: brevoConfig.senderMail },
                scheduledAt,
                unsubscriptionPageId: brevoConfig.unsubscriptionPageId,
            });

            wrap(campaign).assign({ brevoId });

            await entityManager.flush();
        } else {
            await this.brevoApiCampaignService.updateBrevoCampaign({
                id: brevoId,
                campaign,
                htmlContent,
                sender: { name: brevoConfig.senderName, mail: brevoConfig.senderMail },
                scheduledAt,
            });
        }

        return campaign;
    }

    async suspendEmailCampaign(campaign: EmailCampaignInterface): Promise<boolean> {
        return this.brevoApiCampaignService.updateBrevoCampaignStatus(campaign, Brevo.UpdateCampaignStatus.Status.Suspended);
    }

    public async loadEmailCampaignSendingStatesForEmailCampaigns(
        campaigns: EmailCampaignInterface[],
        scope: EmailCampaignScopeInterface,
    ): Promise<EmailCampaignInterface[]> {
        const now = new Date();
        const pastScheduledCampaigns = campaigns.filter(
            (campaign): campaign is EmailCampaignInterface & { scheduledAt: Date } =>
                campaign.sendingState === SendingState.SCHEDULED && !!campaign.scheduledAt && campaign.scheduledAt < now,
        );

        if (pastScheduledCampaigns.length === 0) {
            return campaigns;
        }

        const brevoIds = pastScheduledCampaigns.map((campaign) => campaign.brevoId).filter((brevoId): brevoId is number => !!brevoId);
        const brevoCampaigns = brevoIds.length > 0 ? await this.brevoApiCampaignService.loadBrevoCampaignsByIds(brevoIds, scope) : [];

        for (const campaign of pastScheduledCampaigns) {
            const brevoCampaign = brevoCampaigns.find((brevoCampaign) => brevoCampaign.id === campaign.brevoId);

            // The batch lookup can miss existing campaigns; the sendingState field resolver loads them by ID instead
            if (campaign.brevoId && !brevoCampaign) {
                continue;
            }

            const brevoSendingState = brevoCampaign ? this.brevoApiCampaignService.getSendingInformationFromBrevoCampaign(brevoCampaign) : undefined;

            wrap(campaign).assign({ sendingState: getScheduledCampaignSendingState({ scheduledAt: campaign.scheduledAt, brevoSendingState, now }) });
        }

        await this.entityManager.flush();

        return campaigns;
    }

    public async sendEmailCampaignNow(campaignId: string): Promise<SendEmailCampaignNowResult> {
        const brevoCampaign = await this.saveEmailCampaignInBrevo(campaignId);

        const targetGroups = await brevoCampaign.targetGroups.loadItems();

        for (const targetGroup of targetGroups) {
            if (targetGroup?.brevoId) {
                let currentOffset = 0;
                let totalContacts = 0;
                const limit = 50;
                do {
                    const [contacts, total] = await this.brevoApiContactsService.findContactsByListId(
                        targetGroup.brevoId,
                        limit,
                        currentOffset,
                        brevoCampaign.scope,
                    );
                    const emails = contacts.map((contact) => contact.email).filter((email): email is string => email !== undefined);
                    const containedEmails = await this.ecgRtrListService.getContainedEcgRtrListEmails(emails);

                    if (containedEmails.length > 0) {
                        await this.brevoApiContactsService.blacklistMultipleContacts(containedEmails, brevoCampaign.scope);
                    }

                    currentOffset += limit;
                    totalContacts = total;
                } while (currentOffset < totalContacts);

                if (brevoCampaign.brevoId) {
                    if (!(await this.isStillScheduledForSending(brevoCampaign))) {
                        return "cancelled";
                    }

                    await this.brevoApiCampaignService.sendBrevoCampaign(brevoCampaign);
                    return "sent";
                }
            }
        }

        return "notSent";
    }

    private async isStillScheduledForSending(campaign: EmailCampaignInterface): Promise<boolean> {
        const currentCampaign = await this.entityManager
            .fork()
            .findOne(resolveEntityClass<EmailCampaignInterface>("BrevoEmailCampaign"), campaign.id);

        return currentCampaign?.sendingState === SendingState.SCHEDULED && currentCampaign.brevoId === campaign.brevoId;
    }
}
