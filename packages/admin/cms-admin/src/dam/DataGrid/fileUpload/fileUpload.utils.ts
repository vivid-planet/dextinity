import { fromEvent } from "file-selector";
import { COMMON_MIME_TYPES } from "file-selector/mime";
import * as mimedb from "mime-db";
import type { Accept, DropzoneOptions } from "react-dropzone";

// Browsers leave the MIME type empty for some files, e.g. Firefox for files in an uploaded folder, and the API rejects
// files without a supported MIME type. react-dropzone's default only derives the type for a few common extensions.
export const getFilesWithMimeTypeFromEvent: NonNullable<DropzoneOptions["getFilesFromEvent"]> = (event) =>
    fromEvent(event, { mimeTypes: COMMON_MIME_TYPES });

export function convertMimetypesToDropzoneAccept(acceptedMimetypes: string[]): Accept {
    const acceptObj: Accept = {};

    acceptedMimetypes.forEach((mimetype) => {
        let extensions: readonly string[] | undefined;
        if (mimetype === "application/x-zip-compressed") {
            // zip files in Windows, not supported by mime-db
            // see https://github.com/jshttp/mime-db/issues/245
            extensions = ["zip"];
        } else {
            extensions = mimedb[mimetype]?.extensions;
        }

        if (extensions) {
            acceptObj[mimetype] = extensions.map((extension) => `.${extension}`);
        }
    });

    return acceptObj;
}
