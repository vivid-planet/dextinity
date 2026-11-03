import { add, isAfter, isBefore } from "date-fns";

import { type License, LicenseType } from "./entities/license.embeddable.js";

function isDurationApplicable(license: License): boolean {
    return license.type !== LicenseType.ROYALTY_FREE;
}

// if durationTo = '2023-02-27T00:00:00.000Z' then the license is still valid on 27.02.2023
// and expires at '2023-02-28T00:00:00.000Z'
export function getLicenseExpirationDate(license: License): Date | undefined {
    if (isDurationApplicable(license) && license.durationTo) {
        return add(license.durationTo, { days: 1 });
    }
    return undefined;
}

export function hasLicenseExpired(license: License, now: Date = new Date()): boolean {
    const expirationDate = getLicenseExpirationDate(license);

    return expirationDate !== undefined && isAfter(now, expirationDate);
}

export function isLicenseNotValidYet(license: License, now: Date = new Date()): boolean {
    if (!isDurationApplicable(license) || !license.durationFrom) {
        return false;
    }

    return isBefore(now, license.durationFrom);
}

export function isLicenseValid(license: License, now: Date = new Date()): boolean {
    return !isLicenseNotValidYet(license, now) && !hasLicenseExpired(license, now);
}
