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

const scope = { domain: "main" };
const otherScopeMainListId = 2;
const mainListId = 1;

describe("BrevoContactsService", () => {
    let service: BrevoContactsService;

    const brevoApiContactsService = {
        getContactInfoByEmail: vi.fn(),
        createDoubleOptInBrevoContact: vi.fn().mockResolvedValue(true),
        createBrevoContactWithoutDoubleOptIn: vi.fn().mockResolvedValue(true),
        updateContact: vi.fn().mockResolvedValue({ id: 10 }),
    };
    const targetGroupsService = {
        createIfNotExistMainTargetGroupForScope: vi.fn().mockResolvedValue({ brevoId: mainListId }),
        findTargetGroups: vi.fn().mockResolvedValue([[], 0]),
        checkIfContactIsInTargetGroupByAttributes: vi.fn().mockReturnValue(false),
    };
    const blacklistedContactsRepository = { findOne: vi.fn().mockResolvedValue(null) };
    const brevoEmailImportLogService = { addContactToLogs: vi.fn() };

    beforeEach(async () => {
        vi.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BrevoContactsService,
                { provide: BREVO_MODULE_CONFIG, useValue: { brevo: {}, contactsWithoutDoi: { emailHashKey: "hash-key" } } },
                { provide: getRepositoryToken("BrevoConfig"), useValue: {} },
                { provide: getRepositoryToken("BrevoBlacklistedContacts"), useValue: blacklistedContactsRepository },
                { provide: BrevoApiContactsService, useValue: brevoApiContactsService },
                { provide: EcgRtrListService, useValue: {} },
                { provide: TargetGroupsService, useValue: targetGroupsService },
                { provide: BrevoEmailImportLogService, useValue: brevoEmailImportLogService },
            ],
        }).compile();

        service = module.get(BrevoContactsService);
    });

    describe("createContact", () => {
        it("rejects the contact when it is already in the main list of the scope", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({ id: 10, listIds: [mainListId] });

            await expect(service.createContact({ email: "jane@example.com", scope, templateId: 1, sendDoubleOptIn: true })).resolves.toBe(
                SubscribeResponse.ERROR_CONTACT_ALREADY_EXISTS,
            );
        });

        it("sends a double opt-in mail when the contact only exists in another scope", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({ id: 10, listIds: [otherScopeMainListId] });

            await expect(
                service.createContact({
                    email: "jane@example.com",
                    redirectionUrl: "https://example.com",
                    scope,
                    templateId: 1,
                    sendDoubleOptIn: true,
                }),
            ).resolves.toBe(SubscribeResponse.SUCCESSFUL);
            expect(brevoApiContactsService.createDoubleOptInBrevoContact).toHaveBeenCalledWith(
                expect.objectContaining({ email: "jane@example.com" }),
                [mainListId],
                1,
                scope,
            );
        });

        it("adds the lists of the scope to a contact of another scope when created without double opt-in", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue({ id: 10, listIds: [otherScopeMainListId] });

            await expect(
                service.createContact({
                    email: "jane@example.com",
                    scope,
                    templateId: 1,
                    sendDoubleOptIn: false,
                    responsibleUserId: "user-id",
                    contactSource: ContactSource.manualCreation,
                }),
            ).resolves.toBe(SubscribeResponse.SUCCESSFUL);
            expect(brevoApiContactsService.createBrevoContactWithoutDoubleOptIn).not.toHaveBeenCalled();
            expect(brevoApiContactsService.updateContact).toHaveBeenCalledWith(
                10,
                { attributes: undefined, listIds: [mainListId] },
                scope,
                false,
                "user-id",
                ContactSource.manualCreation,
            );
        });

        it("only takes contacts blacklisted in the same scope into account", async () => {
            brevoApiContactsService.getContactInfoByEmail.mockResolvedValue(null);

            await service.createContact({
                email: "jane@example.com",
                scope,
                templateId: 1,
                sendDoubleOptIn: false,
                responsibleUserId: "user-id",
                contactSource: ContactSource.manualCreation,
            });

            expect(blacklistedContactsRepository.findOne).toHaveBeenCalledWith(expect.objectContaining({ scope }));
        });
    });
});
