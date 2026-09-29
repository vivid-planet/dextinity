import { Brevo } from "@getbrevo/brevo";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { EmailCampaignScopeInterface } from "src/types";

import { EmailCampaignInterface } from "../email-campaign/entities/email-campaign-entity.factory";
import { SendingState } from "../email-campaign/sending-state.enum";
import { handleBrevoError } from "./brevo-api.utils";
import { BrevoApiClientFactory } from "./brevo-api-client.factory";
import { BrevoApiCampaign } from "./dto/brevo-api-campaign";
import { BrevoApiCampaignStatistics } from "./dto/brevo-api-campaign-statistics";

@Injectable()
export class BrevoApiCampaignsService {
    constructor(
        private readonly clientFactory: BrevoApiClientFactory,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    public getSendingInformationFromBrevoCampaign(campaign: BrevoApiCampaign): SendingState {
        if (campaign.status === Brevo.GetEmailCampaignResponse.Status.Sent) {
            return SendingState.SENT;
        } else if (
            campaign.status === Brevo.GetEmailCampaignResponse.Status.Queued ||
            campaign.status === Brevo.GetEmailCampaignResponse.Status.InProcess
        ) {
            return SendingState.SCHEDULED;
        }

        return SendingState.DRAFT;
    }

    public async createBrevoCampaign({
        campaign,
        htmlContent,
        sender,
        scheduledAt,
        unsubscriptionPageId,
    }: {
        campaign: EmailCampaignInterface;
        htmlContent: string;
        sender: { name: string; mail: string };
        scheduledAt?: Date;
        unsubscriptionPageId?: string;
    }): Promise<number> {
        try {
            const targetGroups = await campaign.targetGroups.loadItems();

            const data = await this.clientFactory.getClient(campaign.scope).emailCampaigns.createEmailCampaign({
                name: campaign.title,
                subject: campaign.subject,
                sender: { name: sender.name, email: sender.mail },
                recipients: { listIds: targetGroups.map((targetGroup) => targetGroup.brevoId) },
                htmlContent,
                scheduledAt: scheduledAt?.toISOString(),
                unsubscriptionPageId,
            });
            return data.id;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async updateBrevoCampaign({
        id,
        campaign,
        htmlContent,
        sender,
        scheduledAt,
    }: {
        id: number;
        campaign: EmailCampaignInterface;
        htmlContent: string;
        sender: { name: string; mail: string };
        scheduledAt?: Date;
    }): Promise<boolean> {
        try {
            const targetGroups = await campaign.targetGroups.loadItems();

            await this.clientFactory.getClient(campaign.scope).emailCampaigns.updateEmailCampaign({
                campaignId: id,
                name: campaign.title,
                subject: campaign.subject,
                sender: { name: sender.name, email: sender.mail },
                recipients: { listIds: targetGroups.map((targetGroup) => targetGroup.brevoId) },
                htmlContent,
                scheduledAt: scheduledAt?.toISOString(),
            });
            return true;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async sendBrevoCampaign(campaign: EmailCampaignInterface): Promise<boolean> {
        try {
            if (!campaign.brevoId) {
                throw new Error("Campaign has no brevoId");
            }

            await this.clientFactory.getClient(campaign.scope).emailCampaigns.sendEmailCampaignNow({ campaignId: campaign.brevoId });
            return true;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async updateBrevoCampaignStatus(campaign: EmailCampaignInterface, updatedStatus: Brevo.UpdateCampaignStatus.Status): Promise<boolean> {
        try {
            if (!campaign.brevoId) {
                throw new Error("Campaign has no brevoId");
            }

            await this.clientFactory
                .getClient(campaign.scope)
                .emailCampaigns.updateCampaignStatus({ campaignId: campaign.brevoId, body: { status: updatedStatus } });
            return true;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async sendTestEmail(campaign: EmailCampaignInterface, emails: string[]): Promise<boolean> {
        try {
            if (!campaign.brevoId) {
                throw new Error("Campaign has no brevoId");
            }

            await this.clientFactory
                .getClient(campaign.scope)
                .emailCampaigns.sendTestEmail({ campaignId: campaign.brevoId, body: { emailTo: emails } });
            return true;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async loadBrevoCampaignsByIds(ids: number[], scope: EmailCampaignScopeInterface): Promise<BrevoApiCampaign[]> {
        try {
            const brevoCampaigns = [];
            const nonCachedIds = [];

            for (const brevoId of ids) {
                const cachedCampaign: BrevoApiCampaign | undefined = await this.cacheManager.get(`brevo-campaign-${brevoId}`);
                if (cachedCampaign) {
                    brevoCampaigns.push(cachedCampaign);
                } else {
                    nonCachedIds.push(brevoId);
                }
            }

            for await (const campaign of this.getCampaignsResponse(nonCachedIds, scope)) {
                brevoCampaigns.push(campaign);
                await this.cacheManager.set(`brevo-campaign-${campaign.id}`, campaign);
            }

            return brevoCampaigns;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async loadBrevoCampaignById(campaign: EmailCampaignInterface): Promise<BrevoApiCampaign> {
        try {
            const brevoId = campaign.brevoId;
            if (brevoId == undefined) {
                throw new Error("Campaign has no brevoId");
            }

            return this.cacheManager.wrap<BrevoApiCampaign>(`brevo-campaign-${campaign.id}`, async () => {
                return this.clientFactory.getClient(campaign.scope).emailCampaigns.getEmailCampaign({ campaignId: brevoId });
            });
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async loadBrevoCampaignStatisticsById(campaign: EmailCampaignInterface): Promise<BrevoApiCampaignStatistics> {
        try {
            if (!campaign.brevoId) {
                throw new Error("Campaign has no brevoId");
            }

            const brevoCampaign = await this.loadBrevoCampaignById(campaign);

            // The property globalStats seems to be right here according to the docs: https://developers.brevo.com/reference/getemailcampaign
            // Unforunately, the API returns only 0 values for the globalStats property.
            // That's why we return the first element of the campaignStats array, which contains the correct values.
            return brevoCampaign.statistics.campaignStats[0];
        } catch (error) {
            handleBrevoError(error);
        }
    }

    private async *getCampaignsResponse(
        ids: number[],
        scope: EmailCampaignScopeInterface,
        status?: "suspended" | "archive" | "sent" | "queued" | "draft" | "inProcess",
    ): AsyncGenerator<BrevoApiCampaign, void, undefined> {
        let offset = 0;
        const limit = 100;

        while (true) {
            try {
                const campaignsResponse = await this.clientFactory.getClient(scope).emailCampaigns.getEmailCampaigns({ status, limit, offset });
                const campaignArray = (campaignsResponse.campaigns ?? []).filter((item) => ids.includes(item.id));

                if (campaignArray.length === 0) {
                    break;
                }
                yield* campaignArray;

                offset += limit;
            } catch (error) {
                handleBrevoError(error);
            }
        }
    }
}
