import { Brevo, BrevoError } from "@getbrevo/brevo";
import { getRepositoryToken } from "@mikro-orm/nestjs";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { BrevoApiClientFactory } from "./brevo-api-client.factory";
import { BrevoApiContactsService } from "./brevo-api-contact.service";

const scope = { domain: "main" };

describe("BrevoApiContactsService", () => {
    let service: BrevoApiContactsService;
    const contactsApi = {
        getContactInfo: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BrevoApiContactsService,
                { provide: BREVO_MODULE_CONFIG, useValue: { brevo: {} } },
                { provide: getRepositoryToken("BrevoConfig"), useValue: {} },
                { provide: BrevoApiClientFactory, useValue: { getClient: () => ({ contacts: contactsApi }) } },
            ],
        }).compile();

        service = module.get(BrevoApiContactsService);
    });

    describe("findContact", () => {
        it("returns the contact when found", async () => {
            const contact = { id: 5, email: "jane@example.com" };
            contactsApi.getContactInfo.mockResolvedValue(contact);

            await expect(service.findContact(5, scope)).resolves.toBe(contact);
            expect(contactsApi.getContactInfo).toHaveBeenCalledWith({ identifier: 5 });
        });

        it("returns null when the contact does not exist (404)", async () => {
            contactsApi.getContactInfo.mockRejectedValue(new Brevo.NotFoundError({ code: "not_found", message: "not found" }));

            await expect(service.findContact(5, scope)).resolves.toBeNull();
        });

        it("returns null when the identifier is invalid (400)", async () => {
            contactsApi.getContactInfo.mockRejectedValue(new Brevo.BadRequestError({ code: "invalid_parameter", message: "bad" }));

            await expect(service.findContact("not-an-email", scope)).resolves.toBeNull();
        });

        it("rethrows other Brevo errors", async () => {
            contactsApi.getContactInfo.mockRejectedValue(new BrevoError({ message: "x", statusCode: 500, body: { message: "Server error" } }));

            await expect(service.findContact(5, scope)).rejects.toThrowError("Server error");
        });
    });

    describe("getContactInfoByEmail", () => {
        it("looks the contact up by email and returns null on 404", async () => {
            contactsApi.getContactInfo.mockRejectedValue(new Brevo.NotFoundError({ code: "not_found", message: "not found" }));

            await expect(service.getContactInfoByEmail("ghost@example.com", scope)).resolves.toBeNull();
            expect(contactsApi.getContactInfo).toHaveBeenCalledWith({ identifier: "ghost@example.com" });
        });
    });
});
