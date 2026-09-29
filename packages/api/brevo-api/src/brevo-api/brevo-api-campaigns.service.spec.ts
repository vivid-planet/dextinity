import { Brevo } from "@getbrevo/brevo";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";

import { SendingState } from "../email-campaign/sending-state.enum";
import { BrevoApiCampaignsService } from "./brevo-api-campaigns.service";
import { BrevoApiClientFactory } from "./brevo-api-client.factory";
import type { BrevoApiCampaign } from "./dto/brevo-api-campaign";

function campaignWithStatus(status: Brevo.GetEmailCampaignResponse.Status): BrevoApiCampaign {
    return { status } as unknown as BrevoApiCampaign;
}

describe("BrevoApiCampaignsService", () => {
    let service: BrevoApiCampaignsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BrevoApiCampaignsService,
                { provide: BrevoApiClientFactory, useValue: { getClient: () => ({}) } },
                { provide: CACHE_MANAGER, useValue: {} },
            ],
        }).compile();

        service = module.get(BrevoApiCampaignsService);
    });

    describe("getSendingInformationFromBrevoCampaign", () => {
        it("maps the Brevo campaign status to the sending state", () => {
            expect(service.getSendingInformationFromBrevoCampaign(campaignWithStatus(Brevo.GetEmailCampaignResponse.Status.Sent))).toBe(
                SendingState.SENT,
            );
            expect(service.getSendingInformationFromBrevoCampaign(campaignWithStatus(Brevo.GetEmailCampaignResponse.Status.Queued))).toBe(
                SendingState.SCHEDULED,
            );
            expect(service.getSendingInformationFromBrevoCampaign(campaignWithStatus(Brevo.GetEmailCampaignResponse.Status.InProcess))).toBe(
                SendingState.SCHEDULED,
            );
            expect(service.getSendingInformationFromBrevoCampaign(campaignWithStatus(Brevo.GetEmailCampaignResponse.Status.Draft))).toBe(
                SendingState.DRAFT,
            );
        });
    });
});
