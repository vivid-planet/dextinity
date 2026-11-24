import { readFile } from "node:fs/promises";
import { basename, extname, resolve, sep } from "node:path";

import mime from "mime";

import type { MailImage } from "./mail-image";

/** `null` for a path outside `directory` or a file that doesn't exist. */
export async function fetchStaticMailImage(directory: string, src: string): Promise<MailImage | null> {
    const root = resolve(directory);
    const filePath = resolve(root, src.split(/[?#]/)[0]);
    if (!filePath.startsWith(root + sep)) {
        return null;
    }

    let content: Buffer;
    try {
        content = await readFile(filePath);
    } catch {
        return null;
    }

    return { buffer: content, filename: basename(filePath), contentType: mime.getType(extname(filePath)) ?? "application/octet-stream" };
}
