import { Brevo } from "@getbrevo/brevo";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EmailCampaignInterface } from "../email-campaign/entities/email-campaign-entity.factory";
import { SendingState } from "../email-campaign/sending-state.enum";
import { BrevoApiCampaignsService } from "./brevo-api-campaigns.service";
import { BrevoApiClientFactory } from "./brevo-api-client.factory";
import type { BrevoApiCampaign } from "./dto/brevo-api-campaign";

function campaignWithId(id: number): BrevoApiCampaign {
    return { id } as unknown as BrevoApiCampaign;
}

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
            expect(service.getSendingInformationFromBrevoCampaign(campaignWithStatus(Brevo.GetEmailCampaignResponse.Status.Draft))).toBeUndefined();
            expect(service.getSendingInformationFromBrevoCampaign(campaignWithStatus(Brevo.GetEmailCampaignResponse.Status.Suspended))).toBe(
                SendingState.DRAFT,
            );
            expect(service.getSendingInformationFromBrevoCampaign(campaignWithStatus(Brevo.GetEmailCampaignResponse.Status.Archive))).toBe(
                SendingState.DRAFT,
            );
        });
    });

    describe("loadBrevoCampaignsByIds", () => {
        const scope = { domain: "main", language: "en" };

        async function createService(campaignPages: BrevoApiCampaign[][]) {
            const getEmailCampaigns = vi.fn(async ({ offset }: { offset: number }) => ({ campaigns: campaignPages[offset / 100] ?? [] }));
            const getEmailCampaign = vi.fn(async ({ campaignId }: { campaignId: number }) => campaignWithId(campaignId));
            const cache = new Map<string, unknown>();
            const cacheManager = {
                get: vi.fn(async (key: string) => cache.get(key)),
                set: vi.fn(async (key: string, value: unknown) => {
                    cache.set(key, value);
                }),
                wrap: vi.fn(async (key: string, fn: () => Promise<unknown>) => {
                    if (!cache.has(key)) {
                        cache.set(key, await fn());
                    }
                    return cache.get(key);
                }),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    BrevoApiCampaignsService,
                    { provide: BrevoApiClientFactory, useValue: { getClient: () => ({ emailCampaigns: { getEmailCampaigns, getEmailCampaign } }) } },
                    { provide: CACHE_MANAGER, useValue: cacheManager },
                ],
            }).compile();

            return { service: module.get(BrevoApiCampaignsService), getEmailCampaigns, getEmailCampaign, cacheManager };
        }

        function page(firstId: number, size = 100): BrevoApiCampaign[] {
            return Array.from({ length: size }, (_, index) => campaignWithId(firstId + index));
        }

        it("returns a requested campaign on a later page after a page without matches", async () => {
            const { service, getEmailCampaigns, cacheManager } = await createService([page(1000), page(2000, 10)]);

            const campaigns = await service.loadBrevoCampaignsByIds([2005], scope);

            expect(campaigns.map((campaign) => campaign.id)).toEqual([2005]);
            expect(getEmailCampaigns).toHaveBeenCalledTimes(2);
            expect(cacheManager.set).toHaveBeenCalledWith("brevo-campaign-2005", campaignWithId(2005));
        });

        it("stops paging once all requested campaigns are found", async () => {
            const { service, getEmailCampaigns } = await createService([page(1000), page(2000), page(3000)]);

            const campaigns = await service.loadBrevoCampaignsByIds([1050, 2050], scope);

            expect(campaigns.map((campaign) => campaign.id)).toEqual([1050, 2050]);
            expect(getEmailCampaigns).toHaveBeenCalledTimes(2);
        });

        it("stops paging on a short page when a requested campaign doesn't exist", async () => {
            const { service, getEmailCampaigns } = await createService([page(1000), page(2000, 10)]);

            const campaigns = await service.loadBrevoCampaignsByIds([1050, 9999], scope);

            expect(campaigns.map((campaign) => campaign.id)).toEqual([1050]);
            expect(getEmailCampaigns).toHaveBeenCalledTimes(2);
        });

        it("doesn't request campaigns from Brevo that are cached", async () => {
            const { service, getEmailCampaigns, cacheManager } = await createService([page(1000)]);
            await cacheManager.set("brevo-campaign-1050", campaignWithId(1050));

            const campaigns = await service.loadBrevoCampaignsByIds([1050], scope);

            expect(campaigns.map((campaign) => campaign.id)).toEqual([1050]);
            expect(getEmailCampaigns).not.toHaveBeenCalled();
        });

        it("shares cached campaigns with loadBrevoCampaignById", async () => {
            const { service, getEmailCampaign } = await createService([page(1000)]);
            await service.loadBrevoCampaignsByIds([1050], scope);

            const campaign = await service.loadBrevoCampaignById({
                id: "a1b2c3d4-0000-4000-8000-000000000000",
                brevoId: 1050,
                scope,
            } as unknown as EmailCampaignInterface);

            expect(campaign.id).toBe(1050);
            expect(getEmailCampaign).not.toHaveBeenCalled();
        });
    });
});
