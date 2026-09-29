import { BrevoClient } from "@getbrevo/brevo";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { BrevoApiClientFactory } from "./brevo-api-client.factory";

describe("BrevoApiClientFactory", () => {
    let factory: BrevoApiClientFactory;
    const resolveConfig = vi.fn((scope: { domain: string }) => ({ apiKey: `key-${scope.domain}`, redirectUrlForImport: "" }));

    beforeEach(async () => {
        resolveConfig.mockClear();
        const module: TestingModule = await Test.createTestingModule({
            providers: [BrevoApiClientFactory, { provide: BREVO_MODULE_CONFIG, useValue: { brevo: { resolveConfig } } }],
        }).compile();

        factory = module.get(BrevoApiClientFactory);
    });

    it("creates a BrevoClient with the api key resolved for the scope", () => {
        const scope = { domain: "main" };

        const client = factory.getClient(scope);

        expect(client).toBeInstanceOf(BrevoClient);
        expect(resolveConfig).toHaveBeenCalledWith(scope);
    });

    it("caches one client per scope", () => {
        const first = factory.getClient({ domain: "main" });
        const second = factory.getClient({ domain: "main" });

        expect(second).toBe(first);
        expect(resolveConfig).toHaveBeenCalledTimes(1);
    });

    it("creates separate clients for different scopes", () => {
        const main = factory.getClient({ domain: "main" });
        const secondary = factory.getClient({ domain: "secondary" });

        expect(secondary).not.toBe(main);
        expect(resolveConfig).toHaveBeenCalledTimes(2);
    });
});
