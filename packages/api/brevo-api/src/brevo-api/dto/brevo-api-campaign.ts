import type { Brevo } from "@getbrevo/brevo";

interface BrevoStatistics {
    uniqueClicks: number | null;
    clickers: number | null;
    complaints: number | null;
    delivered: number | null;
    sent: number | null;
    softBounces: number | null;
    hardBounces: number | null;
    uniqueViews: number | null;
    trackableViews: number | null;
    estimatedViews?: number;
    unsubscriptions: number | null;
    viewed: number | null;
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
