import type createDOMPurify from "dompurify";
import fs from "fs";
import { unlink } from "fs/promises";
import * as mimedb from "mime-db";
import os from "os";
import { basename, extname } from "path";
import slugify from "slugify";
import stream from "stream";
import { promisify } from "util";
import { v4 as uuid } from "uuid";

import type { FileUploadInput } from "./file-upload.input";
import { FILE_UPLOAD_FIELD } from "./files.constants";

const pipeline = promisify(stream.pipeline);

export function slugifyFilename(filename: string, extension: string): string {
    const extensionWithDot = extension.startsWith(".") ? extension : `.${extension}`;
    return `${slugify(filename)}${extensionWithDot}`;
}

export const calculatePartialRanges = (size: number, range: string): { start: number; end: number; contentLength: number } => {
    let [start, end] = range.replace(/bytes=/, "").split("-") as Array<string | number>;
    start = parseInt(start as string, 10);
    end = end ? parseInt(end as string, 10) : size - 1;

    if (!isNaN(start) && isNaN(end)) {
        // eslint-disable-next-line no-self-assign
        start = start;
        end = size - 1;
    }
    if (isNaN(start) && !isNaN(end)) {
        start = size - end;
        end = size - 1;
    }

    return {
        start,
        end,
        contentLength: end - start + 1,
    };
};

let domPurify: ReturnType<typeof createDOMPurify> | undefined;

// jsdom is heavy (~90 MB resident). It and dompurify are only used for SVG validation, so they're
// loaded lazily — importing @dextinity/cms-api doesn't pull them into memory unless an SVG is validated.
async function getDomPurify(): Promise<ReturnType<typeof createDOMPurify>> {
    if (!domPurify) {
        const [{ JSDOM }, { default: createDOMPurify }] = await Promise.all([import("jsdom"), import("dompurify")]);
        const { window } = new JSDOM("");
        domPurify = createDOMPurify(window);

        // `<use>` is forbidden by DOMPurify's svg profile because it can pull in external or
        // attacker-controlled content (XSS/SSRF). Allow it only for same-document fragment references
        // (e.g. href="#id"); any other reference is dropped, which makes the SVG fail validation below.
        domPurify.addHook("uponSanitizeAttribute", (node, data) => {
            if ((node as unknown as { nodeName: string }).nodeName.toLowerCase() !== "use") {
                return;
            }
            if ((data.attrName === "href" || data.attrName === "xlink:href") && !data.attrValue.startsWith("#")) {
                data.keepAttr = false;
            }
        });
    }
    return domPurify;
}

export const isValidSvg = async (svg: string): Promise<boolean> => {
    const domPurify = await getDomPurify();

    // `role` and `<use>` aren't part of DOMPurify's svg profile, so they're allowed explicitly.
    // `<use>` is additionally constrained to same-document references by the hook above.
    domPurify.sanitize(svg, {
        USE_PROFILES: { svg: true, svgFilters: true },
        WHOLE_DOCUMENT: true,
        ADD_TAGS: ["use"],
        ADD_ATTR: ["role", "href", "xlink:href"],
    });

    // DOMPurify strips forbidden tags (e.g. <script>) and attributes (e.g. event handlers, javascript: URLs).
    // If it had to remove anything, the SVG contained content we don't consider safe.
    return domPurify.removed.length === 0;
};

export const removeMulterTempFile = async (file: FileUploadInput) => {
    // https://github.com/expressjs/multer/blob/master/storage/disk.js#L54-L62
    const path = file.path;

    delete (file as Partial<FileUploadInput>).destination;
    delete (file as Partial<FileUploadInput>).filename;
    delete (file as Partial<FileUploadInput>).path;

    await unlink(path);
};

export const getValidExtensionsForMimetype = (mimetype: string) => {
    let supportedExtensions: readonly string[] | undefined;
    if (mimetype === "application/x-zip-compressed") {
        // zip files in Windows, not supported by mime-db
        // see https://github.com/jshttp/mime-db/issues/245
        supportedExtensions = ["zip"];
    } else {
        supportedExtensions = mimedb[mimetype]?.extensions;
    }

    return supportedExtensions;
};

export async function createFileUploadInputFromUrl(url: string): Promise<FileUploadInput> {
    const tempDir = fs.mkdtempSync(`${os.tmpdir()}/download`);
    const fakeName = uuid();
    const tempFile = `${tempDir}/${fakeName}`;

    if (url.substring(0, 4) === "http") {
        const response = await fetch(url);
        if (!response.ok || !response.body) {
            throw new Error(`Failed to fetch file from URL: ${url}`);
        }
        const fileStream = fs.createWriteStream(tempFile);
        await pipeline(response.body, fileStream);
        //TODO when downloading the file from http use mime type from response header
    } else {
        fs.copyFileSync(url, tempFile);
    }

    const { fileTypeFromFile } = await import("file-type");
    const fileType = await fileTypeFromFile(tempFile);
    const stats = fs.statSync(tempFile); // TODO don't use sync
    const filenameWithoutExtension = basename(url, extname(url));

    return {
        fieldname: FILE_UPLOAD_FIELD,
        originalname: `${filenameWithoutExtension}.${fileType?.ext}`,
        encoding: "utf8",
        mimetype: fileType?.mime as string,
        size: stats.size,
        destination: tempDir,
        filename: fakeName,
        path: tempFile,
    };
}
