import { getRepositoryToken } from "@mikro-orm/nestjs";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { BrevoEmailImportLogService } from "../brevo-email-import-log/brevo-email-import-log.service";
import { ContactSource } from "../brevo-email-import-log/entity/brevo-email-import-log.entity.factory";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { TargetGroupsService } from "../target-group/target-groups.service";
import { BrevoContactsService } from "./brevo-contacts.service";
import { SubscribeResponse } from "./dto/subscribe-response.enum";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";

const scope = { domain: "at" };
const mainListIdOfScope = 10;
const mainListIdOfOtherScope = 20;
const targetGroupListIdOfOtherScope = 21;

describe("BrevoContactsService", () => {
    let service: BrevoContactsService;
    const brevoContactsApiService = {
        getContactInfoByEmail: vi.fn(),
        createBrevoContactWithoutDoubleOptIn: vi.fn(),
        createDoubleOptInBrevoContact: vi.fn(),
        updateContact: vi.fn(),
    };
    const targetGroupService = {
        createIfNotExistMainTargetGroupForScope: vi.fn(),
        findTargetGroups: vi.fn(),
        checkIfContactIsInTargetGroupByAttributes: vi.fn(),
    };
    const blacklistedContactsRepository = { findOne: vi.fn() };
    const brevoEmailImportLogService = { addContactToLogs: vi.fn() };

    beforeEach(async () => {
        vi.clearAllMocks();
        targetGroupService.createIfNotExistMainTargetGroupForScope.mockResolvedValue({ brevoId: mainListIdOfScope, scope, isMainList: true });
        targetGroupService.findTargetGroups.mockResolvedValue([[], 0]);
        blacklistedContactsRepository.findOne.mockResolvedValue(null);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BrevoContactsService,
                { provide: BREVO_MODULE_CONFIG, useValue: { brevo: {}, contactsWithoutDoi: { emailHashKey: "secret" } } },
                { provide: getRepositoryToken("BrevoConfig"), useValue: {} },
                { provide: getRepositoryToken("BrevoBlacklistedContacts"), useValue: blacklistedContactsRepository },
                { provide: BrevoApiContactsService, useValue: brevoContactsApiService },
                { provide: EcgRtrListService, useValue: {} },
                { provide: TargetGroupsService, useValue: targetGroupService },
                { provide: BrevoEmailImportLogService, useValue: brevoEmailImportLogService },
            ],
        }).compile();

        service = module.get(BrevoContactsService);
    });

    describe("createContact", () => {
        const withoutDoubleOptIn = {
            email: "jane@example.com",
            scope,
            templateId: 1,
            sendDoubleOptIn: false,
            responsibleUserId: "user",
            contactSource: ContactSource.manualCreation,
        };
        const withDoubleOptIn = {
            email: "jane@example.com",
            redirectionUrl: "https://example.com",
            scope,
            templateId: 1,
            sendDoubleOptIn: true,
        };

        it("returns an error when the contact is already in the main list of the scope", async () => {
            brevoContactsApiService.getContactInfoByEmail.mockResolvedValue({ id: 5, listIds: [mainListIdOfScope] });

            await expect(service.createContact(withoutDoubleOptIn)).resolves.toBe(SubscribeResponse.ERROR_CONTACT_ALREADY_EXISTS);
            expect(brevoContactsApiService.updateContact).not.toHaveBeenCalled();
        });

        it("adds a contact of another scope to the lists of the scope without removing its other lists", async () => {
            brevoContactsApiService.getContactInfoByEmail.mockResolvedValue({
                id: 5,
                listIds: [mainListIdOfOtherScope, targetGroupListIdOfOtherScope],
            });
            brevoContactsApiService.updateContact.mockResolvedValue({ id: 5 });

            await expect(service.createContact(withoutDoubleOptIn)).resolves.toBe(SubscribeResponse.SUCCESSFUL);
            expect(brevoContactsApiService.updateContact).toHaveBeenCalledWith(5, { attributes: undefined, listIds: [mainListIdOfScope] }, scope);
            expect(brevoContactsApiService.createBrevoContactWithoutDoubleOptIn).not.toHaveBeenCalled();
            expect(brevoEmailImportLogService.addContactToLogs).toHaveBeenCalledWith("jane@example.com", "user", scope, ContactSource.manualCreation);
        });

        it("assigns target groups based on the attributes the contact of another scope already has", async () => {
            const existingAttributes = { BRANCH: ["products"] };
            brevoContactsApiService.getContactInfoByEmail.mockResolvedValue({
                id: 5,
                listIds: [mainListIdOfOtherScope],
                attributes: existingAttributes,
            });
            brevoContactsApiService.updateContact.mockResolvedValue({ id: 5 });
            targetGroupService.findTargetGroups.mockResolvedValue([[{ brevoId: 11, filters: { BRANCH: ["products"] } }], 1]);
            targetGroupService.checkIfContactIsInTargetGroupByAttributes.mockReturnValue(true);

            await expect(service.createContact(withoutDoubleOptIn)).resolves.toBe(SubscribeResponse.SUCCESSFUL);
            expect(targetGroupService.checkIfContactIsInTargetGroupByAttributes).toHaveBeenCalledWith(existingAttributes, { BRANCH: ["products"] });
            expect(brevoContactsApiService.updateContact).toHaveBeenCalledWith(5, { attributes: undefined, listIds: [mainListIdOfScope, 11] }, scope);
        });

        it("does not add a blacklisted contact of another scope without double opt-in", async () => {
            brevoContactsApiService.getContactInfoByEmail.mockResolvedValue({ id: 5, listIds: [mainListIdOfOtherScope] });
            blacklistedContactsRepository.findOne.mockResolvedValue({ hashedEmail: "hash" });

            await expect(service.createContact(withoutDoubleOptIn)).resolves.toBe(SubscribeResponse.ERROR_CONTACT_IS_BLACKLISTED);
            expect(brevoContactsApiService.updateContact).not.toHaveBeenCalled();
        });

        it("sends the double opt-in for the scope to a contact of another scope", async () => {
            brevoContactsApiService.getContactInfoByEmail.mockResolvedValue({ id: 5, listIds: [mainListIdOfOtherScope] });
            brevoContactsApiService.createDoubleOptInBrevoContact.mockResolvedValue(true);

            await expect(service.createContact(withDoubleOptIn)).resolves.toBe(SubscribeResponse.SUCCESSFUL);
            expect(brevoContactsApiService.createDoubleOptInBrevoContact).toHaveBeenCalledWith(
                { email: "jane@example.com", redirectionUrl: "https://example.com", attributes: undefined },
                [mainListIdOfScope],
                1,
                scope,
            );
            expect(brevoContactsApiService.updateContact).not.toHaveBeenCalled();
        });

        it("creates a new contact when it doesn't exist in the Brevo account", async () => {
            brevoContactsApiService.getContactInfoByEmail.mockResolvedValue(null);
            brevoContactsApiService.createBrevoContactWithoutDoubleOptIn.mockResolvedValue(true);

            await expect(service.createContact(withoutDoubleOptIn)).resolves.toBe(SubscribeResponse.SUCCESSFUL);
            expect(brevoContactsApiService.createBrevoContactWithoutDoubleOptIn).toHaveBeenCalledWith(
                { email: "jane@example.com", attributes: undefined },
                [mainListIdOfScope],
                scope,
            );
        });
    });

    describe("getTargetGroupIdsForExistingContact", () => {
        it("only evaluates the target groups of the given scope", async () => {
            await service.getTargetGroupIdsForExistingContact({ contact: { id: 5, listIds: [] } as never, scope });

            expect(targetGroupService.findTargetGroups).toHaveBeenCalledWith({ offset: 0, limit: 50, where: { isMainList: false, scope } });
        });
    });
});
