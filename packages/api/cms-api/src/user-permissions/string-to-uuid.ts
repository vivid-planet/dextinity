import { createHash } from "node:crypto";

// Name-based UUID v5 without namespace, identical to the output of the `uuid-by-string` package (previously used to
// generate permission IDs), so existing IDs stay stable.
export function stringToUuid(value: string): string {
    const hash = createHash("sha1").update(value, "utf8").digest();
    hash[6] = (hash[6] & 0x0f) | 0x50;
    hash[8] = (hash[8] & 0x3f) | 0x80;
    const hex = hash.subarray(0, 16).toString("hex");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
