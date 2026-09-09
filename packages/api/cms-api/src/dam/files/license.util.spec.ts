import { describe, expect, it } from "vitest";

import type { DamConfig } from "../dam.config";
import type { FileInterface } from "./entities/file.entity";
import type { License } from "./entities/license.embeddable";
import { createPublicCacheControlHeader, hasLicenseExpired, isFileBlockedByExpiredLicense, isLicenseValid } from "./license.util";

const now = new Date("2024-06-15T12:00:00.000Z");

function createFile(license?: Partial<License>): FileInterface {
    return { license: license as License | undefined } as FileInterface;
}

function createConfig(config: Partial<DamConfig>): DamConfig {
    return config as DamConfig;
}

const licenseFeatureWithBlocking = createConfig({ enableLicenseFeature: true, blockFilesWithExpiredLicense: true });

describe("hasLicenseExpired", () => {
    it("returns false without a durationTo", () => {
        expect(hasLicenseExpired({} as License, now)).toBe(false);
    });

    it("returns false on the last day of the license", () => {
        expect(hasLicenseExpired({ durationTo: new Date("2024-06-15T00:00:00.000Z") } as License, now)).toBe(false);
    });

    it("returns true after durationTo + 1 day", () => {
        expect(hasLicenseExpired({ durationTo: new Date("2024-06-13T00:00:00.000Z") } as License, now)).toBe(true);
    });
});

describe("isLicenseValid", () => {
    it("returns false for a license that hasn't started yet", () => {
        expect(isLicenseValid({ durationFrom: new Date("2024-07-01T00:00:00.000Z") } as License, now)).toBe(false);
    });

    it("returns true within the license duration", () => {
        const license = { durationFrom: new Date("2024-06-01T00:00:00.000Z"), durationTo: new Date("2024-06-30T00:00:00.000Z") } as License;

        expect(isLicenseValid(license, now)).toBe(true);
    });
});

describe("isFileBlockedByExpiredLicense", () => {
    const expiredFile = createFile({ durationTo: new Date("2024-06-01T00:00:00.000Z") });

    it("doesn't block by default", () => {
        expect(isFileBlockedByExpiredLicense({ file: expiredFile, config: createConfig({ enableLicenseFeature: true }), currentDate: now })).toBe(
            false,
        );
    });

    it("doesn't block when the license feature is disabled", () => {
        expect(
            isFileBlockedByExpiredLicense({ file: expiredFile, config: createConfig({ blockFilesWithExpiredLicense: true }), currentDate: now }),
        ).toBe(false);
    });

    it("blocks a file with an expired license", () => {
        expect(isFileBlockedByExpiredLicense({ file: expiredFile, config: licenseFeatureWithBlocking, currentDate: now })).toBe(true);
    });

    it("doesn't block a file with a valid license", () => {
        const file = createFile({ durationTo: new Date("2024-06-30T00:00:00.000Z") });

        expect(isFileBlockedByExpiredLicense({ file, config: licenseFeatureWithBlocking, currentDate: now })).toBe(false);
    });

    it("doesn't block a file without a license", () => {
        expect(isFileBlockedByExpiredLicense({ file: createFile(), config: licenseFeatureWithBlocking, currentDate: now })).toBe(false);
    });

    it("doesn't block a file whose license has no end date", () => {
        expect(
            isFileBlockedByExpiredLicense({ file: createFile({ durationTo: undefined }), config: licenseFeatureWithBlocking, currentDate: now }),
        ).toBe(false);
    });
});

describe("createPublicCacheControlHeader", () => {
    const defaultHeader = "max-age=31536000, s-maxage=86400, public";

    it("caches for a year by default", () => {
        const file = createFile({ durationTo: new Date("2024-06-16T00:00:00.000Z") });

        expect(createPublicCacheControlHeader({ file, config: createConfig({ enableLicenseFeature: true }), currentDate: now })).toBe(defaultHeader);
    });

    it("caches for a year when the file has no license end date", () => {
        expect(createPublicCacheControlHeader({ file: createFile(), config: licenseFeatureWithBlocking, currentDate: now })).toBe(defaultHeader);
    });

    it("caps the cache lifetime at the license's expiration date", () => {
        // license expires 2024-06-16T00:00:00.000Z (durationTo + 1 day), which is 12 hours after now
        const file = createFile({ durationTo: new Date("2024-06-15T00:00:00.000Z") });

        expect(createPublicCacheControlHeader({ file, config: licenseFeatureWithBlocking, currentDate: now })).toBe(
            `max-age=43200, s-maxage=43200, public`,
        );
    });

    it("only caps the shared max age if the license outlives it", () => {
        // license expires in 2 days, which is longer than the default s-maxage of 1 day
        const file = createFile({ durationTo: new Date("2024-06-16T12:00:00.000Z") });

        expect(createPublicCacheControlHeader({ file, config: licenseFeatureWithBlocking, currentDate: now })).toBe(
            `max-age=172800, s-maxage=86400, public`,
        );
    });

    it("prevents caching of an expired license", () => {
        const file = createFile({ durationTo: new Date("2024-06-01T00:00:00.000Z") });

        expect(createPublicCacheControlHeader({ file, config: licenseFeatureWithBlocking, currentDate: now })).toBe("max-age=0, s-maxage=0, public");
    });
});
