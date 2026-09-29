import type { Brevo } from "@getbrevo/brevo";

interface BrevoStatistics {
    uniqueClicks: number;
    clickers: number;
    complaints: number;
    delivered: number;
    sent: number;
    softBounces: number;
    hardBounces: number;
    uniqueViews: number;
    trackableViews: number;
    estimatedViews?: number;
    unsubscriptions: number;
    viewed: number;
}

export interface BrevoApiCampaign {
    id: number;
    name: string;
    subject?: string;
    type: Brevo.GetEmailCampaignResponse.Type;
    status: Brevo.GetEmailCampaignResponse.Status;
    statistics: {
        globalStats: BrevoStatistics; // Overall statistics of the campaign
        campaignStats: BrevoStatistics[]; // List-wise statistics of the campaign.
    };
    sentDate?: string;
    scheduledAt?: string;
}
