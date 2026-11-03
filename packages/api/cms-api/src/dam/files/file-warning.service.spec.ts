import type { EntityManager } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import type { DamConfig } from "../dam.config";
import type { FileInterface } from "./entities/file.entity";
import { LicenseType } from "./entities/license.embeddable";
import { FileWarningService } from "./file-warning.service";

const service = new FileWarningService({ enableLicenseFeature: true } as DamConfig, {} as EntityManager);

const yesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
};

describe("FileWarningService", () => {
    it("warns about a rights-managed license that has expired", async () => {
        const file = { altText: "Alt", license: { type: LicenseType.RIGHTS_MANAGED, durationTo: yesterday() } } as FileInterface;

        expect(await service.createWarnings(file)).toEqual([{ severity: "high", message: "fileLicenseExpired" }]);
    });

    it("doesn't warn about a royalty-free license whose duration has ended", async () => {
        const file = { altText: "Alt", license: { type: LicenseType.ROYALTY_FREE, durationTo: yesterday() } } as FileInterface;

        expect(await service.createWarnings(file)).toEqual([]);
    });
});
