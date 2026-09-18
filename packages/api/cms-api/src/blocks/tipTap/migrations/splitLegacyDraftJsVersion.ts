import type { VersionDataInterface } from "../../migrations/types";

// Before the DraftJS migration moved into the vendor chain, it was version 1 of the block's own chain
// and the block's migrations continued from 2. Data saved back then counts both chains in `$$version`,
// so it is split into the two counters the migrations read today.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function splitLegacyDraftJsVersion<T = any>(rawData: T): T {
    if (typeof rawData !== "object" || rawData === null) {
        return rawData;
    }

    const versionData = rawData as VersionDataInterface;
    if (versionData.$$vendorVersion !== undefined) {
        return rawData;
    }

    const legacyVersion = versionData.$$version ?? 0;

    return {
        ...versionData,
        $$vendorVersion: legacyVersion > 0 ? 1 : 0,
        $$version: Math.max(legacyVersion - 1, 0),
    } as T;
}
