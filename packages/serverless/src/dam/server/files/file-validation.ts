import mimeDb from "mime-db";

import type { ResolvedDamConfig } from "../dam.config.js";

export interface UploadedFile {
    name: string;
    type: string;
    size: number;
    bytes: Uint8Array<ArrayBuffer>;
}

function getValidExtensionsForMimetype(mimetype: string): readonly string[] | undefined {
    if (mimetype === "application/x-zip-compressed") {
        // Zip files on Windows, not supported by mime-db, see https://github.com/jshttp/mime-db/issues/245
        return ["zip"];
    }
    return mimeDb[mimetype]?.extensions;
}

export function validateFileMetadata(file: Pick<UploadedFile, "name" | "type">, config: ResolvedDamConfig): string | undefined {
    if (file.name.length > 255) {
        return "Filename is too long";
    }

    if (!config.acceptedMimeTypes.includes(file.type)) {
        return "Unsupported mime type";
    }

    const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : undefined;
    if (extension === undefined) {
        return "Invalid file name: Missing file extension";
    }

    const supportedExtensions = getValidExtensionsForMimetype(file.type);
    if (supportedExtensions === undefined || !supportedExtensions.includes(extension)) {
        return `File type and extension mismatch: ${extension} and ${file.type} are incompatible`;
    }

    return undefined;
}

export async function validateFileContents(file: UploadedFile, config: ResolvedDamConfig): Promise<string | undefined> {
    if (file.type === "image/svg+xml") {
        if (!config.isValidSvg) {
            return "SVG uploads require an SVG validator (isValidSvg in the DAM config)";
        }
        if (!(await config.isValidSvg(new TextDecoder().decode(file.bytes)))) {
            return "SVG contains forbidden content (e.g., JavaScript, security-relevant tags or attributes)";
        }
    }
    return undefined;
}

export async function toUploadedFile(file: File): Promise<UploadedFile> {
    return { name: file.name, type: file.type, size: file.size, bytes: new Uint8Array(await file.arrayBuffer()) };
}
