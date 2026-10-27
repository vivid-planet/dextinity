import { timingSafeEqual } from "node:crypto";

export function contentDisposition(type: "inline" | "attachment", filename: string): string {
    const asciiFilename = filename.replace(/[^\x20-\x7e]|["\\]/g, "_");
    return `${type}; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export function isValidHash(hash: string, expectedHash: string): boolean {
    const hashBuffer = Buffer.from(hash);
    const expectedHashBuffer = Buffer.from(expectedHash);
    return hashBuffer.length === expectedHashBuffer.length && timingSafeEqual(hashBuffer, expectedHashBuffer);
}
