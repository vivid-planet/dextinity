import type { EntityRepository } from "@mikro-orm/postgresql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BlacklistedContactsInterface } from "../blacklisted-contacts/entity/blacklisted-contacts.entity.factory";
import type { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import type { BrevoConfigInterface } from "../brevo-config/entities/brevo-config-entity.factory";
import type { BrevoEmailImportLogService } from "../brevo-email-import-log/brevo-email-import-log.service";
import { ContactSource } from "../brevo-email-import-log/entity/brevo-email-import-log.entity.factory";
import type { BrevoModuleConfig } from "../config/brevo-module.config";
import type { TargetGroupsService } from "../target-group/target-groups.service";
import { BrevoContactsService } from "./brevo-contacts.service";
import { SubscribeResponse } from "./dto/subscribe-response.enum";
import type { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";

const scope = { domain: "main" };
const email = "jane@example.com";
const attributes = { SALUTATION: "MRS" };
const templateId = 7;
const redirectionUrl = "https://example.com/confirm";
const mainListBrevoId = 10;
const attributeTargetGroupBrevoId = 20;
const otherScope = { domain: "secondary" };
const otherScopeMainListBrevoId = 99;

describe("BrevoContactsService", () => {
    const brevoApiContactsService = {
        getContactInfoByEmail: vi.fn(),
        createDoubleOptInBrevoContact: vi.fn(),
        createBrevoContactWithoutDoubleOptIn: vi.fn(),
        updateContact: vi.fn(),
    };
    const targetGroupsService = {
        createIfNotExistMainTargetGroupForScope: vi.fn(),
        findTargetGroups: vi.fn(),
        checkIfContactIsInTargetGroupByAttributes: vi.fn(),
    };
    const blacklistedContactsRepository = { findOne: vi.fn() };
    const brevoEmailImportLogService = { addContactToLogs: vi.fn() };
    const brevoConfigRepository = { findOneOrFail: vi.fn() };
    const ecgRtrListService = { getContainedEcgRtrListEmails: vi.fn() };

    let service: BrevoContactsService;

    beforeEach(() => {
        vi.clearAllMocks();

        targetGroupsService.createIfNotExistMainTargetGroupForScope.mockResolvedValue({ brevoId: mainListBrevoId });
        targetGroupsService.findTargetGroups.mockResolvedValue([[{ brevoId: attributeTargetGroupBrevoId, filters: { SALUTATION: ["MRS"] } }], 1]);
        targetGroupsService.checkIfContactIsInTargetGroupByAttributes.mockReturnValue(true);
        brevoApiContactsService.createDoubleOptInBrevoContact.mockResolvedValue(true);
        brevoApiContactsService.createBrevoContactWithoutDoubleOptIn.mockResolvedValue(true);
        blacklistedContactsRepository.findOne.mockResolvedValue(null);
        brevoConfigRepository.findOneOrFail.mockResolvedValue({ doubleOptInTemplateId: templateId });
        ecgRtrListService.getContainedEcgRtrListEmails.mockResolvedValue([]);

        service = new BrevoContactsService(
            { brevo: {}, contactsWithoutDoi: { emailHashKey: "abcdef" } } as unknown as BrevoModuleConfig,
            brevoConfigRepository as unknown as EntityRepository<BrevoConfigInterface>,
            blacklistedContactsRepository as unknown as EntityRepository<BlacklistedContactsInterface>,
            brevoApiContactsService as unknown as BrevoApiContactsService,
            ecgRtrListService as unknown as EcgRtrListService,
            targetGroupsService as unknown as TargetGroupsService,
            brevoEmailImportLogService as unknown as BrevoEmailImportLogService,
        );
    });

    describe("createContact", () => {
        it("creates a new contact with double opt-in in the scope's lists", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue(null);

            const response = await service.createContact({ email, attributes, redirectionUrl, scope, templateId, sendDoubleOptIn: true });

            expect(response).toBe(SubscribeResponse.SUCCESSFUL);
            expect(brevoApiContactsService.createDoubleOptInBrevoContact).toHaveBeenCalledWith(
                { email, redirectionUrl, attributes },
                [mainListBrevoId, attributeTargetGroupBrevoId],
                templateId,
                scope,
            );
        });

        it("returns ERROR_CONTACT_ALREADY_EXISTS when the contact is already in the scope's main list", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({ id: 1, email, listIds: [mainListBrevoId] });

            const response = await service.createContact({ email, attributes, redirectionUrl, scope, templateId, sendDoubleOptIn: true });

            expect(response).toBe(SubscribeResponse.ERROR_CONTACT_ALREADY_EXISTS);
            expect(brevoApiContactsService.createDoubleOptInBrevoContact).not.toHaveBeenCalled();
            expect(brevoApiContactsService.createBrevoContactWithoutDoubleOptIn).not.toHaveBeenCalled();
            expect(brevoApiContactsService.updateContact).not.toHaveBeenCalled();
        });

        it("sends the double opt-in for a contact that exists in another scope", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({ id: 1, email, listIds: [otherScopeMainListBrevoId] });

            const response = await service.createContact({ email, attributes, redirectionUrl, scope, templateId, sendDoubleOptIn: true });

            expect(response).toBe(SubscribeResponse.SUCCESSFUL);
            expect(brevoApiContactsService.createDoubleOptInBrevoContact).toHaveBeenCalledWith(
                { email, redirectionUrl, attributes },
                [mainListBrevoId, attributeTargetGroupBrevoId],
                templateId,
                scope,
            );
            expect(brevoApiContactsService.updateContact).not.toHaveBeenCalled();
        });

        it("adds a contact that exists in another scope to the scope's lists without double opt-in", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({ id: 1, email, listIds: [otherScopeMainListBrevoId] });
            brevoApiContactsService.updateContact.mockResolvedValue({
                id: 1,
                email,
                listIds: [otherScopeMainListBrevoId, mainListBrevoId, attributeTargetGroupBrevoId],
                attributes,
            });

            const response = await service.createContact({
                email,
                attributes,
                scope,
                templateId,
                sendDoubleOptIn: false,
                responsibleUserId: "user-1",
                contactSource: ContactSource.manualCreation,
            });

            expect(response).toBe(SubscribeResponse.SUCCESSFUL);
            expect(brevoApiContactsService.updateContact).toHaveBeenCalledWith(
                1,
                { listIds: [mainListBrevoId, attributeTargetGroupBrevoId], attributes },
                scope,
            );
            expect(brevoApiContactsService.createBrevoContactWithoutDoubleOptIn).not.toHaveBeenCalled();
            expect(brevoApiContactsService.createDoubleOptInBrevoContact).not.toHaveBeenCalled();
            expect(brevoEmailImportLogService.addContactToLogs).toHaveBeenCalledWith(email, "user-1", scope, ContactSource.manualCreation);
        });

        it("updates the target groups of the other subscribed scopes to the new attributes without double opt-in", async () => {
            const newAttributes = { SALUTATION: "MR" };
            const otherScopeMrsTargetGroupBrevoId = 98;
            const otherScopeMrTargetGroupBrevoId = 97;
            const otherScopeManuallyAssignedTargetGroupBrevoId = 96;
            const otherScopeManuallyAssignedContactsBrevoId = 95;
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({
                id: 1,
                email,
                listIds: [
                    otherScopeMainListBrevoId,
                    otherScopeMrsTargetGroupBrevoId,
                    otherScopeManuallyAssignedTargetGroupBrevoId,
                    otherScopeManuallyAssignedContactsBrevoId,
                ],
            });
            brevoApiContactsService.updateContact.mockResolvedValueOnce({
                id: 1,
                email,
                listIds: [
                    otherScopeMainListBrevoId,
                    otherScopeMrsTargetGroupBrevoId,
                    otherScopeManuallyAssignedTargetGroupBrevoId,
                    otherScopeManuallyAssignedContactsBrevoId,
                    mainListBrevoId,
                    attributeTargetGroupBrevoId,
                ],
                attributes: newAttributes,
            });
            const mrTargetGroup = { brevoId: attributeTargetGroupBrevoId, scope, filters: { SALUTATION: ["MR"] } };
            targetGroupsService.findTargetGroups
                .mockResolvedValueOnce([[mrTargetGroup], 1])
                .mockResolvedValueOnce([
                    [
                        { brevoId: mainListBrevoId, scope },
                        { brevoId: otherScopeMainListBrevoId, scope: otherScope },
                    ],
                    2,
                ])
                .mockResolvedValueOnce([
                    [
                        mrTargetGroup,
                        { brevoId: otherScopeMrsTargetGroupBrevoId, scope: otherScope, filters: { SALUTATION: ["MRS"] } },
                        { brevoId: otherScopeMrTargetGroupBrevoId, scope: otherScope, filters: { SALUTATION: ["MR"] } },
                        {
                            brevoId: otherScopeManuallyAssignedTargetGroupBrevoId,
                            scope: otherScope,
                            filters: { SALUTATION: ["MRS"] },
                            assignedContactsTargetGroupBrevoId: otherScopeManuallyAssignedContactsBrevoId,
                        },
                    ],
                    4,
                ]);
            targetGroupsService.checkIfContactIsInTargetGroupByAttributes.mockImplementation(
                (contactAttributes?: Record<string, string>, filters?: Record<string, string[]>) =>
                    filters?.SALUTATION?.includes(contactAttributes?.SALUTATION ?? "") ?? false,
            );

            const response = await service.createContact({
                email,
                attributes: newAttributes,
                scope,
                templateId,
                sendDoubleOptIn: false,
                responsibleUserId: "user-1",
                contactSource: ContactSource.manualCreation,
            });

            expect(response).toBe(SubscribeResponse.SUCCESSFUL);
            expect(targetGroupsService.findTargetGroups).toHaveBeenLastCalledWith({
                offset: 0,
                limit: 50,
                where: { isMainList: false, isTestList: false, $or: [{ scope }, { scope: otherScope }] },
            });
            expect(brevoApiContactsService.updateContact).toHaveBeenLastCalledWith(
                1,
                { listIds: [otherScopeMrTargetGroupBrevoId], unlinkListIds: [otherScopeMrsTargetGroupBrevoId] },
                scope,
            );
        });

        it("returns ERROR_CONTACT_IS_BLACKLISTED for a blacklisted existing contact without double opt-in", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({ id: 1, email, listIds: [otherScopeMainListBrevoId] });
            blacklistedContactsRepository.findOne.mockResolvedValue({ hashedEmail: "hash" });

            const response = await service.createContact({
                email,
                attributes,
                scope,
                templateId,
                sendDoubleOptIn: false,
                responsibleUserId: "user-1",
                contactSource: ContactSource.manualCreation,
            });

            expect(response).toBe(SubscribeResponse.ERROR_CONTACT_IS_BLACKLISTED);
            expect(brevoApiContactsService.updateContact).not.toHaveBeenCalled();
            expect(brevoEmailImportLogService.addContactToLogs).not.toHaveBeenCalled();
        });

        it("does not re-add a contact that unsubscribed from the scope's main list without double opt-in", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({ id: 1, email, listIds: [], listUnsubscribed: [mainListBrevoId] });

            const response = await service.createContact({
                email,
                attributes,
                scope,
                templateId,
                sendDoubleOptIn: false,
                responsibleUserId: "user-1",
                contactSource: ContactSource.manualCreation,
            });

            expect(response).toBe(SubscribeResponse.ERROR_CONTACT_IS_BLACKLISTED);
            expect(brevoApiContactsService.updateContact).not.toHaveBeenCalled();
            expect(brevoEmailImportLogService.addContactToLogs).not.toHaveBeenCalled();
        });

        it("does not re-add a contact that is blacklisted in Brevo without double opt-in", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({ id: 1, email, listIds: [], emailBlacklisted: true });

            const response = await service.createContact({
                email,
                attributes,
                scope,
                templateId,
                sendDoubleOptIn: false,
                responsibleUserId: "user-1",
                contactSource: ContactSource.manualCreation,
            });

            expect(response).toBe(SubscribeResponse.ERROR_CONTACT_IS_BLACKLISTED);
            expect(brevoApiContactsService.updateContact).not.toHaveBeenCalled();
        });

        it("sends the double opt-in to a contact that unsubscribed from the scope's main list", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({ id: 1, email, listIds: [], listUnsubscribed: [mainListBrevoId] });

            const response = await service.createContact({ email, attributes, redirectionUrl, scope, templateId, sendDoubleOptIn: true });

            expect(response).toBe(SubscribeResponse.SUCCESSFUL);
            expect(brevoApiContactsService.createDoubleOptInBrevoContact).toHaveBeenCalled();
        });
    });

    describe("subscribeBrevoContact", () => {
        it("sends the double opt-in with the scope's template", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue(null);

            const response = await service.subscribeBrevoContact({ email, attributes, redirectionUrl }, scope);

            expect(response).toBe(SubscribeResponse.SUCCESSFUL);
            expect(brevoApiContactsService.createDoubleOptInBrevoContact).toHaveBeenCalledWith(
                { email, redirectionUrl, attributes },
                [mainListBrevoId, attributeTargetGroupBrevoId],
                templateId,
                scope,
            );
        });

        it("reports success for an already subscribed contact so the public endpoint does not reveal subscriptions", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({ id: 1, email, listIds: [mainListBrevoId] });

            const response = await service.subscribeBrevoContact({ email, attributes, redirectionUrl }, scope);

            expect(response).toBe(SubscribeResponse.SUCCESSFUL);
            expect(brevoApiContactsService.createDoubleOptInBrevoContact).not.toHaveBeenCalled();
        });

        it("returns ERROR_CONTAINED_IN_ECG_RTR_LIST without contacting Brevo", async () => {
            ecgRtrListService.getContainedEcgRtrListEmails.mockResolvedValue([email]);

            const response = await service.subscribeBrevoContact({ email, attributes, redirectionUrl }, scope);

            expect(response).toBe(SubscribeResponse.ERROR_CONTAINED_IN_ECG_RTR_LIST);
            expect(brevoApiContactsService.getContactInfoByEmail).not.toHaveBeenCalled();
        });
    });
});
