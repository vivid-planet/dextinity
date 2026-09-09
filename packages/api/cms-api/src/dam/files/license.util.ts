import { add, differenceInCalendarDays, isAfter, isBefore } from "date-fns";

import type { DamConfig } from "../dam.config";
import type { FileInterface } from "./entities/file.entity";
import type { License } from "./entities/license.embeddable";

// if durationTo = '2023-02-27T00:00:00.000Z' then the license is still valid on 27.02.2023
// and expires at '2023-02-28T00:00:00.000Z'
export function getLicenseExpirationDate(license: License): Date | undefined {
    if (license.durationTo) {
        return add(license.durationTo, { days: 1 });
    }
    return undefined;
}

export function isLicenseNotValidYet(license: License, currentDate = new Date()): boolean {
    return license.durationFrom !== undefined && isBefore(currentDate, license.durationFrom);
}

export function licenseExpiresWithinThirtyDays(license: License, currentDate = new Date()): boolean {
    const expirationDate = getLicenseExpirationDate(license);

    return expirationDate !== undefined && isBefore(currentDate, expirationDate) && differenceInCalendarDays(expirationDate, currentDate) <= 30;
}

export function hasLicenseExpired(license: License, currentDate = new Date()): boolean {
    const expirationDate = getLicenseExpirationDate(license);

    return expirationDate !== undefined && isAfter(currentDate, expirationDate);
}

export function isLicenseValid(license: License, currentDate = new Date()): boolean {
    return !(isLicenseNotValidYet(license, currentDate) || hasLicenseExpired(license, currentDate));
}

function isExpiredLicenseBlockingEnabled(config: DamConfig): boolean {
    return Boolean(config.enableLicenseFeature && config.blockFilesWithExpiredLicense);
}

/**
 * Whether a file must not be delivered by the public DAM routes because its license has expired.
 * Requires both `enableLicenseFeature` and `blockFilesWithExpiredLicense` to be enabled.
 */
export function isFileBlockedByExpiredLicense({
    file,
    config,
    currentDate = new Date(),
}: {
    file: FileInterface;
    config: DamConfig;
    currentDate?: Date;
}): boolean {
    if (!isExpiredLicenseBlockingEnabled(config)) {
        return false;
    }

    return file.license !== undefined && hasLicenseExpired(file.license, currentDate);
}

const publicMaxAge = 31536000; // 1 year for browsers
const publicSharedMaxAge = 86400; // 1 day for proxies/cdn's

/**
 * Cache-control header for the public DAM routes.
 *
 * When delivery of expired files is blocked, the cache lifetime is capped at the license's expiration date.
 * Otherwise browsers and CDNs would keep serving the file long after its license has expired.
 */
export function createPublicCacheControlHeader({
    file,
    config,
    currentDate = new Date(),
}: {
    file: FileInterface;
    config: DamConfig;
    currentDate?: Date;
}): string {
    let maxAge = publicMaxAge;
    let sharedMaxAge = publicSharedMaxAge;

    const expirationDate = isExpiredLicenseBlockingEnabled(config) && file.license ? getLicenseExpirationDate(file.license) : undefined;
    if (expirationDate) {
        const secondsUntilExpiration = Math.max(0, Math.floor((expirationDate.getTime() - currentDate.getTime()) / 1000));
        maxAge = Math.min(maxAge, secondsUntilExpiration);
        sharedMaxAge = Math.min(sharedMaxAge, secondsUntilExpiration);
    }

    return `max-age=${maxAge}, s-maxage=${sharedMaxAge}, public`;
}
