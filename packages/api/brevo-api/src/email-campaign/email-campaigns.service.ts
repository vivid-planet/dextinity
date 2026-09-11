import { BlocksTransformerService, filtersToMikroOrmQuery, searchToMikroOrmQuery } from "@dextinity/cms-api";
import { Brevo } from "@getbrevo/brevo";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository, ObjectQuery, wrap } from "@mikro-orm/postgresql";
import { HttpService } from "@nestjs/axios";
import { Inject, Injectable } from "@nestjs/common";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoApiCampaignsService } from "../brevo-api/brevo-api-campaigns.service";
import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { EcgRtrListService } from "../brevo-contact/ecg-rtr-list/ecg-rtr-list.service";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { EmailCampaignFilter } from "./dto/email-campaign.filter";
import { EmailCampaignInterface } from "./entities/email-campaign-entity.factory";
import { SendingState } from "./sending-state.enum";

@Injectable()
export class EmailCampaignsService {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        @InjectRepository("BrevoEmailCampaign") private readonly repository: EntityRepository<EmailCampaignInterface>,
        @InjectRepository("BrevoConfig") private readonly brevoConfigRepository: EntityRepository<BrevoConfigInterface>,
        private readonly httpService: HttpService,
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

    async saveEmailCampaignInBrevo(campaign: EmailCampaignInterface, scheduledAt?: Date): Promise<EmailCampaignInterface> {
        const content = await this.blockTransformerService.transformToPlain(campaign.content, { previewDamUrls: false });

        const brevoConfig = await this.brevoConfigRepository.findOneOrFail({ scope: campaign.scope });
        let campaignConfig;
        if (typeof this.config.emailCampaigns.frontend === "function") {
            campaignConfig = this.config.emailCampaigns.frontend(campaign.scope);
        } else {
            campaignConfig = this.config.emailCampaigns.frontend;
        }

        const { data: htmlContent, status } = await this.httpService.axiosRef.post(
            campaignConfig.url,
            { id: campaign.id, title: campaign.title, content, scope: campaign.scope },
            {
                headers: { "Content-Type": "application/json" },
                auth: {
                    username: campaignConfig.basicAuth.username,
                    password: campaignConfig.basicAuth.password,
                },
            },
        );

        if (!htmlContent || status !== 200) {
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

            await this.entityManager.flush();
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
        const potentiallySentCampaigns = campaigns.filter(
            (campaign) => campaign.sendingState === SendingState.SCHEDULED && campaign.scheduledAt && campaign.scheduledAt < new Date(),
        );

        const brevoIds = potentiallySentCampaigns.map((campaign) => campaign?.brevoId).filter((campaign) => campaign) as number[];

        if (brevoIds.length > 0) {
            const brevoCampaigns = await this.brevoApiCampaignService.loadBrevoCampaignsByIds(brevoIds, scope);

            for (const brevoCampaign of brevoCampaigns) {
                const sendingState = this.brevoApiCampaignService.getSendingInformationFromBrevoCampaign(brevoCampaign);

                const campaign = campaigns.find((campaign) => campaign.brevoId === brevoCampaign.id);
                if (campaign) {
                    wrap(campaign).assign({ sendingState });
                }
            }
            this.entityManager.flush();
        }

        return campaigns;
    }

    public async sendEmailCampaignNow(campaign: EmailCampaignInterface): Promise<boolean> {
        const brevoCampaign = await this.saveEmailCampaignInBrevo(campaign);

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
                        campaign.scope,
                    );
                    const emails = contacts.map((contact) => contact.email).filter((email): email is string => email !== undefined);
                    const containedEmails = await this.ecgRtrListService.getContainedEcgRtrListEmails(emails);

                    if (containedEmails.length > 0) {
                        await this.brevoApiContactsService.blacklistMultipleContacts(containedEmails, campaign.scope);
                    }

                    currentOffset += limit;
                    totalContacts = total;
                } while (currentOffset < totalContacts);

                if (brevoCampaign.brevoId) {
                    return this.brevoApiCampaignService.sendBrevoCampaign(brevoCampaign);
                }
            }
        }

        return false;
    }
}
