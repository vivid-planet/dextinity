import { add, isAfter, isBefore } from "date-fns";

import type { License } from "./entities/license.embeddable";

// if durationTo = '2023-02-27T00:00:00.000Z' then the license is still valid on 27.02.2023
// and expires at '2023-02-28T00:00:00.000Z'
export function getLicenseExpirationDate(license: License): Date | undefined {
    if (license.durationTo) {
        return add(license.durationTo, { days: 1 });
    }
    return undefined;
}

export function hasLicenseExpired(license: License, now: Date = new Date()): boolean {
    const expirationDate = getLicenseExpirationDate(license);

    return expirationDate !== undefined && isAfter(now, expirationDate);
}

export function isLicenseNotValidYet(license: License, now: Date = new Date()): boolean {
    if (!license.durationFrom) {
        return false;
    }

    return isBefore(now, license.durationFrom);
}

export function isLicenseValid(license: License, now: Date = new Date()): boolean {
    return !isLicenseNotValidYet(license, now) && !hasLicenseExpired(license, now);
}
